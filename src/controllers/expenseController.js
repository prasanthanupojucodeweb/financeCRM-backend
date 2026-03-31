const Expense = require('../models/Expense')
const { isValidId, getOwnedProject } = require('../utils/ownership')

const createExpense = async (req, res) => {
  try {
    const { title, category, amount, date, projectId } = req.body

    if (!title || !category || amount === undefined || amount === null || !date) {
      return res.status(400).json({
        message: 'title, category, amount, and date are required',
      })
    }

    const numAmount = Number(amount)
    if (Number.isNaN(numAmount) || numAmount < 0) {
      return res.status(400).json({ message: 'Invalid amount' })
    }

    let projectRef = null
    if (projectId) {
      const project = await getOwnedProject(req.user._id, projectId)
      if (!project) {
        return res.status(404).json({ message: 'Project not found or not authorized' })
      }
      projectRef = projectId
    }

    const expense = await Expense.create({
      user: req.user._id,
      title,
      category,
      amount: numAmount,
      date: new Date(date),
      project: projectRef,
    })

    const populated = await Expense.findById(expense._id).populate('project', 'name')
    return res.status(201).json(populated)
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id })
      .populate('project', 'name')
      .sort({ date: -1, createdAt: -1 })
    return res.status(200).json(expenses)
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid expense id' })
    }

    const expense = await Expense.findById(id)
    if (!expense || expense.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Expense not found or not authorized' })
    }

    if (typeof req.body.title !== 'undefined') expense.title = req.body.title
    if (typeof req.body.category !== 'undefined') expense.category = req.body.category
    if (typeof req.body.amount !== 'undefined') {
      const numAmount = Number(req.body.amount)
      if (Number.isNaN(numAmount) || numAmount < 0) {
        return res.status(400).json({ message: 'Invalid amount' })
      }
      expense.amount = numAmount
    }
    if (typeof req.body.date !== 'undefined') {
      expense.date = new Date(req.body.date)
    }
    if (typeof req.body.projectId !== 'undefined') {
      if (!req.body.projectId) {
        expense.project = null
      } else {
        const project = await getOwnedProject(req.user._id, req.body.projectId)
        if (!project) {
          return res.status(404).json({ message: 'Project not found or not authorized' })
        }
        expense.project = req.body.projectId
      }
    }

    if (!expense.title || !expense.category) {
      return res.status(400).json({ message: 'title and category are required' })
    }

    await expense.save()
    const populated = await Expense.findById(expense._id).populate('project', 'name')
    return res.status(200).json(populated)
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid expense id' })
    }

    const expense = await Expense.findById(id)
    if (!expense || expense.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Expense not found or not authorized' })
    }

    await expense.deleteOne()
    return res.status(200).json({ message: 'Expense deleted successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
}

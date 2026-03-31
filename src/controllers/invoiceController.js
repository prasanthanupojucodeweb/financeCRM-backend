const Invoice = require('../models/Invoice')
const { isValidId, getOwnedClient, getOwnedProject } = require('../utils/ownership')

const ALLOWED_STATUS = ['Paid', 'Pending', 'Overdue']

const createInvoice = async (req, res) => {
  try {
    const { clientId, projectId, amount, currency, status, dueDate } = req.body

    if (!clientId || !projectId || amount === undefined || amount === null || !dueDate) {
      return res.status(400).json({
        message: 'clientId, projectId, amount, and dueDate are required',
      })
    }

    const numAmount = Number(amount)
    if (Number.isNaN(numAmount) || numAmount < 0) {
      return res.status(400).json({ message: 'Invalid amount' })
    }

    const client = await getOwnedClient(req.user._id, clientId)
    if (!client) {
      return res.status(404).json({ message: 'Client not found or not authorized' })
    }

    const project = await getOwnedProject(req.user._id, projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found or not authorized' })
    }

    if (project.client.toString() !== clientId.toString()) {
      return res.status(400).json({ message: 'Project does not belong to this client' })
    }

    const invStatus = status && ALLOWED_STATUS.includes(status) ? status : 'Pending'

    const invoice = await Invoice.create({
      user: req.user._id,
      client: clientId,
      project: projectId,
      amount: numAmount,
      currency: (currency || 'INR').toString().toUpperCase(),
      status: invStatus,
      dueDate: new Date(dueDate),
    })

    const populated = await Invoice.findById(invoice._id)
      .populate('client', 'name company email')
      .populate('project', 'name description')

    return res.status(201).json(populated)
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id })
      .populate('client', 'name company email')
      .populate('project', 'name description')
      .sort({ createdAt: -1 })
    return res.status(200).json(invoices)
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid invoice id' })
    }

    const invoice = await Invoice.findById(id)
    if (!invoice || invoice.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Invoice not found or not authorized' })
    }

    let nextClientId = invoice.client.toString()
    let nextProjectId = invoice.project.toString()

    if (typeof req.body.clientId !== 'undefined') {
      const client = await getOwnedClient(req.user._id, req.body.clientId)
      if (!client) {
        return res.status(404).json({ message: 'Client not found or not authorized' })
      }
      nextClientId = req.body.clientId.toString()
      invoice.client = req.body.clientId
    }

    if (typeof req.body.projectId !== 'undefined') {
      const project = await getOwnedProject(req.user._id, req.body.projectId)
      if (!project) {
        return res.status(404).json({ message: 'Project not found or not authorized' })
      }
      if (project.client.toString() !== nextClientId) {
        return res.status(400).json({ message: 'Project does not belong to this client' })
      }
      nextProjectId = req.body.projectId.toString()
      invoice.project = req.body.projectId
    }

    if (typeof req.body.amount !== 'undefined') {
      const numAmount = Number(req.body.amount)
      if (Number.isNaN(numAmount) || numAmount < 0) {
        return res.status(400).json({ message: 'Invalid amount' })
      }
      invoice.amount = numAmount
    }
    if (typeof req.body.currency !== 'undefined') {
      invoice.currency = req.body.currency.toString().toUpperCase()
    }
    if (typeof req.body.status !== 'undefined') {
      if (!ALLOWED_STATUS.includes(req.body.status)) {
        return res.status(400).json({ message: 'Invalid status' })
      }
      invoice.status = req.body.status
    }
    if (typeof req.body.dueDate !== 'undefined') {
      invoice.dueDate = new Date(req.body.dueDate)
    }

    await invoice.save()
    const populated = await Invoice.findById(invoice._id)
      .populate('client', 'name company email')
      .populate('project', 'name description')

    return res.status(200).json(populated)
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid invoice id' })
    }

    const invoice = await Invoice.findById(id)
    if (!invoice || invoice.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Invoice not found or not authorized' })
    }

    await invoice.deleteOne()
    return res.status(200).json({ message: 'Invoice deleted successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  createInvoice,
  getInvoices,
  updateInvoice,
  deleteInvoice,
}

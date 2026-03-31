const mongoose = require('mongoose')
const Invoice = require('../models/Invoice')
const Expense = require('../models/Expense')
const Project = require('../models/Project')

const UNPAID_STATUSES = ['Pending', 'Overdue']

function sumMap(rows) {
  const m = new Map()
  for (const row of rows) {
    const key = row._id == null ? null : row._id.toString()
    m.set(key, (m.get(key) || 0) + row.total)
  }
  return m
}

/**
 * GET /api/dashboard — totals and per-project breakdown for the logged-in user.
 */
const getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user._id

    const [revenueAgg, pendingAgg, expenseAgg, revenueByProj, pendingByProj, expenseByProj, projects] =
      await Promise.all([
        Invoice.aggregate([
          { $match: { user: userId, status: 'Paid' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Invoice.aggregate([
          { $match: { user: userId, status: { $in: UNPAID_STATUSES } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Expense.aggregate([{ $match: { user: userId } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Invoice.aggregate([
          { $match: { user: userId, status: 'Paid' } },
          { $group: { _id: '$project', total: { $sum: '$amount' } } },
        ]),
        Invoice.aggregate([
          { $match: { user: userId, status: { $in: UNPAID_STATUSES } } },
          { $group: { _id: '$project', total: { $sum: '$amount' } } },
        ]),
        Expense.aggregate([{ $match: { user: userId } }, { $group: { _id: '$project', total: { $sum: '$amount' } } }]),
        Project.find({ user: userId })
          .populate('client', 'name company')
          .sort({ name: 1 })
          .lean(),
      ])

    const totalRevenue = revenueAgg[0]?.total ?? 0
    const pendingPayments = pendingAgg[0]?.total ?? 0
    const totalExpenses = expenseAgg[0]?.total ?? 0
    const netProfit = totalRevenue - totalExpenses

    const paidMap = sumMap(revenueByProj)
    const pendingMap = sumMap(pendingByProj)
    const expenseMap = sumMap(expenseByProj)

    const unlinkedExpenseTotal = expenseMap.get(null) ?? 0

    const byProject = projects.map((p) => {
      const pid = p._id.toString()
      const revenue = paidMap.get(pid) ?? 0
      const pending = pendingMap.get(pid) ?? 0
      const expenses = expenseMap.get(pid) ?? 0
      return {
        projectId: pid,
        projectName: p.name,
        clientName: p.client?.name || '—',
        clientCompany: p.client?.company || '',
        revenue,
        expenses,
        net: revenue - expenses,
        pending,
      }
    })

    // Invoices exist for deleted projects still show in aggregates but not in list —
    // add orphan rows so numbers stay reconciled with totals.
    const listed = new Set(projects.map((p) => p._id.toString()))
    const allProjectKeys = new Set([...paidMap.keys(), ...pendingMap.keys(), ...expenseMap.keys()])
    allProjectKeys.delete(null)
    const orphans = [...allProjectKeys].filter((id) => !listed.has(id) && mongoose.Types.ObjectId.isValid(id))
    const orphanDocs = await Project.find({ _id: { $in: orphans } })
      .populate('client', 'name company')
      .lean()
    const orphanById = new Map(orphanDocs.map((p) => [p._id.toString(), p]))
    const orphanRows = orphans.map((pid) => {
      const proj = orphanById.get(pid)
      const revenue = paidMap.get(pid) ?? 0
      const pending = pendingMap.get(pid) ?? 0
      const expenses = expenseMap.get(pid) ?? 0
      return {
        projectId: pid,
        projectName: proj?.name || '(removed project)',
        clientName: proj?.client?.name || '—',
        clientCompany: proj?.client?.company || '',
        revenue,
        expenses,
        net: revenue - expenses,
        pending,
        orphan: !proj,
      }
    })

    const currencySample = await Invoice.findOne({ user: userId }).select('currency').lean()
    const currency = currencySample?.currency || 'INR'

    return res.status(200).json({
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit,
        pendingPayments,
        unlinkedExpenseTotal,
        currency,
      },
      byProject: [...byProject, ...orphanRows],
    })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  getDashboardMetrics,
}

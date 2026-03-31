const mongoose = require('mongoose')

const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      trim: true,
      default: 'INR',
      uppercase: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Paid', 'Pending', 'Overdue'],
      default: 'Pending',
    },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Invoice', invoiceSchema)

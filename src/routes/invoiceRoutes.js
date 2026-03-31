const express = require('express')
const { protect } = require('../middleware/authMiddleware')
const {
  createInvoice,
  getInvoices,
  updateInvoice,
  deleteInvoice,
} = require('../controllers/invoiceController')

const router = express.Router()

router.use(protect)

router.route('/').post(createInvoice).get(getInvoices)
router.route('/:id').put(updateInvoice).delete(deleteInvoice)

module.exports = router

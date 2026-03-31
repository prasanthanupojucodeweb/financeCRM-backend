const express = require('express')
const { protect } = require('../middleware/authMiddleware')
const { getDashboardMetrics } = require('../controllers/dashboardController')

const router = express.Router()

router.use(protect)
router.get('/', getDashboardMetrics)

module.exports = router

const express = require('express')
const { protect } = require('../middleware/authMiddleware')
const {
  createClient,
  getClients,
  updateClient,
  deleteClient,
} = require('../controllers/clientController')

const router = express.Router()

router.use(protect)

router.route('/').post(createClient).get(getClients)
router.route('/:id').put(updateClient).delete(deleteClient)

module.exports = router


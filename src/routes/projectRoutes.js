const express = require('express')
const { protect } = require('../middleware/authMiddleware')
const {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} = require('../controllers/projectController')

const router = express.Router()

router.use(protect)

router.route('/').post(createProject).get(getProjects)
router.route('/:id').put(updateProject).delete(deleteProject)

module.exports = router

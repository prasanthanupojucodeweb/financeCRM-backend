const Project = require('../models/Project')
const { isValidId, getOwnedClient, getOwnedProject } = require('../utils/ownership')

const createProject = async (req, res) => {
  try {
    const { clientId, name, description } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' })
    }
    if (!clientId) {
      return res.status(400).json({ message: 'clientId is required' })
    }

    const client = await getOwnedClient(req.user._id, clientId)
    if (!client) {
      return res.status(404).json({ message: 'Client not found or not authorized' })
    }

    const project = await Project.create({
      user: req.user._id,
      client: clientId,
      name,
      description: description ?? '',
    })

    const populated = await Project.findById(project._id).populate('client', 'name company')
    return res.status(201).json(populated)
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id })
      .populate('client', 'name company')
      .sort({ createdAt: -1 })
    return res.status(200).json(projects)
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateProject = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid project id' })
    }

    const project = await getOwnedProject(req.user._id, id)
    if (!project) {
      return res.status(404).json({ message: 'Project not found or not authorized' })
    }

    if (typeof req.body.clientId !== 'undefined') {
      const client = await getOwnedClient(req.user._id, req.body.clientId)
      if (!client) {
        return res.status(404).json({ message: 'Client not found or not authorized' })
      }
      project.client = req.body.clientId
    }
    if (typeof req.body.name !== 'undefined') project.name = req.body.name
    if (typeof req.body.description !== 'undefined') project.description = req.body.description

    if (!project.name) {
      return res.status(400).json({ message: 'Project name is required' })
    }

    await project.save()
    const populated = await Project.findById(project._id).populate('client', 'name company')
    return res.status(200).json(populated)
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid project id' })
    }

    const project = await getOwnedProject(req.user._id, id)
    if (!project) {
      return res.status(404).json({ message: 'Project not found or not authorized' })
    }

    await project.deleteOne()
    return res.status(200).json({ message: 'Project deleted successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
}

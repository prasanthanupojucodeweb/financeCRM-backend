const mongoose = require('mongoose')
const Client = require('../models/Client')
const Project = require('../models/Project')

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

const getOwnedClient = async (userId, clientId) => {
  if (!isValidId(clientId)) return null
  const client = await Client.findById(clientId)
  if (!client || client.user.toString() !== userId.toString()) return null
  return client
}

const getOwnedProject = async (userId, projectId) => {
  if (!isValidId(projectId)) return null
  const project = await Project.findById(projectId)
  if (!project || project.user.toString() !== userId.toString()) return null
  return project
}

module.exports = {
  isValidId,
  getOwnedClient,
  getOwnedProject,
}

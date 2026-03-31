const mongoose = require('mongoose')
const Client = require('../models/Client')

const createClient = async (req, res) => {
  try {
    const { name, company, email, phone, notes } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Client name is required' })
    }

    const client = await Client.create({
      name,
      company,
      email,
      phone,
      notes,
      user: req.user._id,
    })

    return res.status(201).json(client)
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getClients = async (req, res) => {
  try {
    const clients = await Client.find({ user: req.user._id }).sort({ createdAt: -1 })
    return res.status(200).json(clients)
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateClient = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid client id' })
    }

    const client = await Client.findById(id)
    if (!client) {
      return res.status(404).json({ message: 'Client not found' })
    }

    if (client.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const updatableFields = ['name', 'company', 'email', 'phone', 'notes']
    updatableFields.forEach((field) => {
      if (typeof req.body[field] !== 'undefined') {
        client[field] = req.body[field]
      }
    })

    if (!client.name) {
      return res.status(400).json({ message: 'Client name is required' })
    }

    const updated = await client.save()
    return res.status(200).json(updated)
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteClient = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid client id' })
    }

    const client = await Client.findById(id)
    if (!client) {
      return res.status(404).json({ message: 'Client not found' })
    }

    if (client.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    await client.deleteOne()
    return res.status(200).json({ message: 'Client deleted successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  createClient,
  getClients,
  updateClient,
  deleteClient,
}


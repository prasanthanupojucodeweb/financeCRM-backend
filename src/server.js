const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const { protect } = require('./middleware/authMiddleware')
const clientRoutes = require('./routes/clientRoutes')
const projectRoutes = require('./routes/projectRoutes')
const invoiceRoutes = require('./routes/invoiceRoutes')
const expenseRoutes = require('./routes/expenseRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')

dotenv.config()
connectDB()

const app = express()

app.use(
  cors({
    origin: 'https://financecrm-i5c0.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)


app.use(express.json())

app.get('/', (req, res) => {
  res.send('API Running...')
})

app.use('/api/auth', authRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.get('/api/protected', protect, (req, res) => {
  res.json({ message: 'Protected route accessed', user: req.user })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

/*
How to run the server:
1. Open terminal in backend folder
2. Install dependencies: npm install
3. Start server: node src/server.js

Sample Postman request for registration:
POST http://localhost:5000/api/auth/register
Body (JSON):
{
  "name": "Test User",
  "email": "test@gmail.com",
  "password": "123456"
}

Clients Module (Postman examples):

POST http://localhost:5000/api/clients
Headers:
Authorization: Bearer <token>
Body (JSON):
{
  "name": "Ramesh",
  "company": "ABC Pvt Ltd",
  "email": "abc@gmail.com",
  "phone": "9876543210",
  "notes": "Important client"
}

GET http://localhost:5000/api/clients
Headers:
Authorization: Bearer <token>
*/


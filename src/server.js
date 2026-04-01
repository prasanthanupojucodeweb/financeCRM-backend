const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

dotenv.config()
connectDB()

const app = express()

// ✅ SIMPLE & STRONG CORS (FINAL)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // frontend URL
    credentials: true,
  })
)

// ✅ IMPORTANT
app.use(express.json())

// Test route
app.get('/', (req, res) => {
  res.send('API Running...')
})

// Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/clients', require('./routes/clientRoutes'))
app.use('/api/projects', require('./routes/projectRoutes'))
app.use('/api/invoices', require('./routes/invoiceRoutes'))
app.use('/api/expenses', require('./routes/expenseRoutes'))
app.use('/api/dashboard', require('./routes/dashboardRoutes'))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

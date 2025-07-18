const express = require('express')
require('dotenv').config()
const rateLimit = require('express-rate-limit')
const authRoutes = require('./routes/auth')
const itemsRoutes = require('./routes/items')

const app = express()
app.use(express.json())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
})
app.use(limiter)

app.use('/auth', authRoutes)
app.use('/items', itemsRoutes)

app.get('/', (req, res) => res.send('Lost and Found API'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

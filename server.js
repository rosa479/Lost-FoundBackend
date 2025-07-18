const express = require('express')
require('dotenv').config()
const authRoutes = require('./routes/auth')
const itemsRoutes = require('./routes/items')

const app = express()
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/items', itemsRoutes)

app.get('/', (req, res) => res.send('Lost and Found API'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

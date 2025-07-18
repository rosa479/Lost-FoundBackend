const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db')
require('dotenv').config()

const router = express.Router()

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body
  try {
    const hashed = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, role',
      [username, hashed]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username])
  if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' })

  const user = result.rows[0]
  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET)
  res.json({ token })
})

module.exports = router

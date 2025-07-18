const express = require('express')
const pool = require('../db')
const { authenticate, authorizeAdmin } = require('../middleware/auth')

const router = express.Router()

router.get('/', async (req, res) => {
  const { status, category, location, date } = req.query
  let query = 'SELECT * FROM items WHERE 1=1'
  const values = []

  if (status) {
    values.push(status)
    query += ` AND status = $${values.length}`
  }
  if (category) {
    values.push(category)
    query += ` AND category = $${values.length}`
  }
  if (location) {
    values.push(location)
    query += ` AND location = $${values.length}`
  }
  if (date) {
    values.push(date)
    query += ` AND date = $${values.length}`
  }

  try {
    const result = await pool.query(query, values)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/', authenticate, async (req, res) => {
  const { title, description, status, category, location, date, contactInfo, imageUrl } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO items (title, description, status, category, location, date, contact_info, image_url, created_at, posted_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),$9) RETURNING *`,
      [title, description, status, category, location, date, contactInfo, imageUrl, req.user.id]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(400).json({ error: err })
  }
})

router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params
  const { title, description, status, category, location, date, contactInfo, imageUrl } = req.body

  try {
    const existing = await pool.query('SELECT * FROM items WHERE id = $1', [id])
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Not found' })

    const item = existing.rows[0]
    if (req.user.role !== 'admin' && req.user.id !== item.posted_by)
      return res.status(403).json({ error: 'Unauthorized' })

    const result = await pool.query(
      `UPDATE items SET title=$1, description=$2, status=$3, category=$4,
       location=$5, date=$6, contact_info=$7, image_url=$8 WHERE id=$9 RETURNING *`,
      [title, description, status, category, location, date, contactInfo, imageUrl, id]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(400).json({ error: 'Invalid input' })
  }
})

router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router

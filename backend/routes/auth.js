const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, authenticateToken } = require('../models/database');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

router.post('/register', async (req, res) => {
  try {
    const { companyName, industryType, email, phone, location, password } = req.body;
    if (!companyName || !email || !password)
      return res.status(400).json({ error: 'Company name, email and password are required' });

    const existing = await pool.query('SELECT id FROM industries WHERE contact_email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO industries (company_name, industry_type, location, contact_email, contact_phone, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, company_name, industry_type, contact_email, location`,
      [companyName, industryType, location, email, phone, hashedPassword]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.contact_email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true, token,
      user: { id: user.id, companyName: user.company_name, industryType: user.industry_type, email: user.contact_email, location: user.location }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const result = await pool.query('SELECT * FROM industries WHERE contact_email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.contact_email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      success: true, token,
      user: { id: user.id, companyName: user.company_name, industryType: user.industry_type, email: user.contact_email, location: user.location }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, company_name, industry_type, contact_email, contact_phone,
              location, transport_radius_km, website, sustainability_score
       FROM industries WHERE id = $1`, [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const u = result.rows[0];
    res.json({ success: true, user: { id: u.id, companyName: u.company_name, industryType: u.industry_type, email: u.contact_email, phone: u.contact_phone, location: u.location, transportRadius: u.transport_radius_km, website: u.website, sustainabilityScore: u.sustainability_score } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { companyName, industryType, phone, location, transportRadius, website } = req.body;
    const result = await pool.query(
      `UPDATE industries SET
        company_name = COALESCE($1, company_name),
        industry_type = COALESCE($2, industry_type),
        contact_phone = COALESCE($3, contact_phone),
        location = COALESCE($4, location),
        transport_radius_km = COALESCE($5, transport_radius_km),
        website = COALESCE($6, website),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, company_name, industry_type, contact_email, contact_phone, location`,
      [companyName, industryType, phone, location, transportRadius, website, req.user.id]
    );
    const u = result.rows[0];
    res.json({ success: true, user: { id: u.id, companyName: u.company_name, industryType: u.industry_type, email: u.contact_email, phone: u.contact_phone, location: u.location } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/logout', (req, res) => res.json({ success: true, message: 'Logged out successfully' }));

module.exports = router;

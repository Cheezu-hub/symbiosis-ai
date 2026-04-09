const express = require('express');
const router = express.Router();
const { pool, authenticateToken } = require('../models/database');
const { runMatching } = require('../utils/matchingRunner');

router.get('/', async (req, res) => {
  try {
    const { status, materialType, limit = 50 } = req.query;
    let query = `SELECT wl.*, wl.industry_id as wl_industry_id, i.company_name as provider_name, i.industry_type
                 FROM waste_listings wl JOIN industries i ON wl.industry_id = i.id WHERE 1=1`;
    const params = [];
    let c = 1;
    if (status)       { query += ` AND wl.status = $${c++}`;                    params.push(status); }
    if (materialType) { query += ` AND wl.material_type ILIKE $${c++}`;         params.push(`%${materialType}%`); }
    query += ` ORDER BY wl.created_at DESC LIMIT $${c}`;
    params.push(parseInt(limit));
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows.map(r => ({ id: r.id, materialType: r.material_type, description: r.description, quantity: parseFloat(r.quantity), unit: r.unit, location: r.location, availableFrom: r.available_from, status: r.status, pricePerUnit: parseFloat(r.price_per_unit) || 0, category: r.category || '', industryId: r.wl_industry_id, providerName: r.provider_name, industryType: r.industry_type, createdAt: r.created_at })) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch waste listings' }); }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });
    const result = await pool.query(
      `SELECT wl.*, i.company_name as provider_name FROM waste_listings wl JOIN industries i ON wl.industry_id = i.id
       WHERE wl.material_type ILIKE $1 OR wl.description ILIKE $1 ORDER BY wl.created_at DESC LIMIT 50`, [`%${q}%`]
    );
    res.json({ success: true, data: result.rows.map(r => ({ id: r.id, materialType: r.material_type, description: r.description, quantity: parseFloat(r.quantity), unit: r.unit, location: r.location, status: r.status, industryId: r.industry_id, providerName: r.provider_name })) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Search failed' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT wl.*, i.company_name as provider_name, i.contact_email, i.contact_phone
       FROM waste_listings wl JOIN industries i ON wl.industry_id = i.id WHERE wl.id = $1`, [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const r = result.rows[0];
    res.json({ success: true, data: { id: r.id, materialType: r.material_type, description: r.description, quantity: parseFloat(r.quantity), unit: r.unit, location: r.location, availableFrom: r.available_from, status: r.status, pricePerUnit: parseFloat(r.price_per_unit) || 0, category: r.category || '', providerName: r.provider_name, contactEmail: r.contact_email, contactPhone: r.contact_phone, createdAt: r.created_at } });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch listing' }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { materialType, description, quantity, unit, location, availableFrom, pricePerUnit, category } = req.body;
    if (!materialType || !quantity || !unit) return res.status(400).json({ error: 'materialType, quantity and unit required' });
    const result = await pool.query(
      `INSERT INTO waste_listings (industry_id, material_type, description, quantity, unit, location, available_from, price_per_unit, category)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.user.id, materialType, description, quantity, unit, location, availableFrom, pricePerUnit || 0, category || null]
    );
    const r = result.rows[0];
    res.status(201).json({ success: true, data: { id: r.id, materialType: r.material_type, description: r.description, quantity: parseFloat(r.quantity), unit: r.unit, location: r.location, availableFrom: r.available_from, status: r.status, pricePerUnit: parseFloat(r.price_per_unit) || 0, category: r.category || '', createdAt: r.created_at } });
    // Fire-and-forget: generate matches for the new listing
    runMatching().catch(e => console.error('[waste] post-create matching error:', e));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create listing' }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { materialType, description, quantity, unit, location, availableFrom, status, pricePerUnit, category } = req.body;
    const check = await pool.query('SELECT industry_id FROM waste_listings WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    if (check.rows[0].industry_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
    const result = await pool.query(
      `UPDATE waste_listings SET material_type=COALESCE($1,material_type), description=COALESCE($2,description),
       quantity=COALESCE($3,quantity), unit=COALESCE($4,unit), location=COALESCE($5,location),
       available_from=COALESCE($6,available_from), status=COALESCE($7,status),
       price_per_unit=COALESCE($8,price_per_unit), category=COALESCE($9,category),
       updated_at=CURRENT_TIMESTAMP
       WHERE id=$10 RETURNING *`,
      [materialType, description, quantity, unit, location, availableFrom, status, pricePerUnit, category, id]
    );
    const r = result.rows[0];
    res.json({ success: true, data: { id: r.id, materialType: r.material_type, quantity: parseFloat(r.quantity), unit: r.unit, status: r.status, pricePerUnit: parseFloat(r.price_per_unit) || 0, category: r.category || '' } });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to update listing' }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const check = await pool.query('SELECT industry_id FROM waste_listings WHERE id = $1', [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    if (check.rows[0].industry_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
    await pool.query('DELETE FROM waste_listings WHERE id = $1', [id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to delete' }); }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool, authenticateToken } = require('../models/database');
const { runMatching } = require('../utils/matchingRunner');

router.get('/', async (req, res) => {
    try {
        const { status, materialNeeded, limit = 50 } = req.query;
        let query = `SELECT rr.*, rr.industry_id as rr_industry_id, i.company_name as requester_name, i.industry_type FROM resource_requests rr JOIN industries i ON rr.industry_id = i.id WHERE 1=1`;
        const params = [];
        let c = 1;
        if (status) { 
            query += ` AND rr.status = $${c++}`; 
            params.push(status); 
        }
        if (materialNeeded) { 
            query += ` AND rr.material_needed ILIKE $${c++}`; 
            params.push(`%${materialNeeded}%`); 
        }
        query += ` ORDER BY rr.created_at DESC LIMIT $${c}`;
        params.push(parseInt(limit));
        const result = await pool.query(query, params);
        res.json({ 
            success: true, 
            data: result.rows.map(r => ({ 
                id: r.id, 
                materialNeeded: r.material_needed, 
                description: r.description, 
                quantity: parseFloat(r.quantity), 
                unit: r.unit, 
                industrySector: r.industry_sector, 
                location: r.location, 
                requiredBy: r.required_by, 
                status: r.status, 
                pricePerUnit: parseFloat(r.price_per_unit) || 0,
                category: r.category || '',
                requesterName: r.requester_name, 
                industryType: r.industry_type, 
                industryId: r.rr_industry_id,
                createdAt: r.created_at 
            })) 
        });
    } catch (err) { 
        console.error(err); 
        res.status(500).json({ error: 'Failed to fetch resource requests' }); 
    }
});

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { materialNeeded, description, quantity, unit, industrySector, location, requiredBy, pricePerUnit, category } = req.body;
        if (!materialNeeded || !quantity || !unit) return res.status(400).json({ error: 'materialNeeded, quantity and unit required' });
        const result = await pool.query(
            `INSERT INTO resource_requests (industry_id, material_needed, description, quantity, unit, industry_sector, location, required_by, price_per_unit, category) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [req.user.id, materialNeeded, description, quantity, unit, industrySector, location, requiredBy, pricePerUnit || 0, category || null]
        );
        const r = result.rows[0];
        res.status(201).json({ 
            success: true, 
            data: { 
                id: r.id, 
                materialNeeded: r.material_needed, 
                description: r.description, 
                quantity: parseFloat(r.quantity), 
                unit: r.unit, 
                industrySector: r.industry_sector, 
                location: r.location, 
                requiredBy: r.required_by, 
                status: r.status, 
                pricePerUnit: parseFloat(r.price_per_unit) || 0,
                category: r.category || '',
                createdAt: r.created_at 
            } 
        });
        // Fire-and-forget: generate matches for the new request
        runMatching().catch(e => console.error('[resource] post-create matching error:', e));
    } catch (err) { 
        console.error(err); 
        res.status(500).json({ error: 'Failed to create request' }); 
    }
});

router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { materialNeeded, description, quantity, unit, industrySector, location, requiredBy, status, pricePerUnit, category } = req.body;
        const check = await pool.query('SELECT industry_id FROM resource_requests WHERE id = $1', [id]);
        if (check.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        if (check.rows[0].industry_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
        const result = await pool.query(
            `UPDATE resource_requests SET material_needed=COALESCE($1,material_needed), description=COALESCE($2,description), quantity=COALESCE($3,quantity), unit=COALESCE($4,unit), industry_sector=COALESCE($5,industry_sector), location=COALESCE($6,location), required_by=COALESCE($7,required_by), status=COALESCE($8,status), price_per_unit=COALESCE($9,price_per_unit), category=COALESCE($10,category), updated_at=CURRENT_TIMESTAMP WHERE id=$11 RETURNING *`,
            [materialNeeded, description, quantity, unit, industrySector, location, requiredBy, status, pricePerUnit, category, id]
        );
        const r = result.rows[0];
        res.json({ 
            success: true, 
            data: { 
                id: r.id, 
                materialNeeded: r.material_needed, 
                quantity: parseFloat(r.quantity), 
                unit: r.unit, 
                status: r.status,
                pricePerUnit: parseFloat(r.price_per_unit) || 0,
                category: r.category || ''
            } 
        });
    } catch (err) { 
        console.error(err); 
        res.status(500).json({ error: 'Failed to update request' }); 
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const check = await pool.query('SELECT industry_id FROM resource_requests WHERE id = $1', [id]);
        if (check.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        if (check.rows[0].industry_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
        await pool.query('DELETE FROM resource_requests WHERE id = $1', [id]);
        res.json({ success: true, message: 'Deleted' });
    } catch (err) { 
        console.error(err); 
        res.status(500).json({ error: 'Failed to delete' }); 
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { pool, authenticateToken } = require('../models/database');

router.use(authenticateToken);

// helper
const safeFloat = (val) => parseFloat(val) || 0;

// Fetch matches
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const userId = req.user.id;

        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const offset = parseInt(req.query.offset) || 0;

        let query = `
            SELECT m.*, 
                   wl.material_type as waste_type, wl.quantity as waste_quantity, wl.unit as waste_unit, wl.location as waste_location, 
                   rr.material_needed as resource_type, rr.location as resource_location, 
                   i1.company_name as waste_provider, i1.industry_type as waste_provider_type, 
                   i2.company_name as resource_seeker, i2.industry_type as resource_seeker_type 
            FROM matches m 
            JOIN waste_listings wl ON m.waste_listing_id = wl.id 
            JOIN resource_requests rr ON m.resource_request_id = rr.id 
            JOIN industries i1 ON wl.industry_id = i1.id 
            JOIN industries i2 ON rr.industry_id = i2.id 
            WHERE (wl.industry_id = $1 OR rr.industry_id = $1)
        `;

        const params = [userId];
        let c = 2;

        if (status) {
            query += ` AND m.status = $${c++}`;
            params.push(status);
        }

        query += ` ORDER BY m.match_score DESC, m.created_at DESC LIMIT $${c++} OFFSET $${c}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // ✅ FIXED COUNT QUERY
        let countQuery = `
            SELECT COUNT(*) as total FROM matches m 
            JOIN waste_listings wl ON m.waste_listing_id=wl.id 
            JOIN resource_requests rr ON m.resource_request_id=rr.id 
            WHERE (wl.industry_id=$1 OR rr.industry_id=$1)
        `;
        const countParams = [userId];

        if (status) {
            countQuery += ` AND m.status = $2`;
            countParams.push(status);
        }

        const count = await pool.query(countQuery, countParams);

        res.json({
            success: true,
            data: {
                matches: result.rows.map(r => ({
                    id: r.id,
                    wasteType: r.waste_type,
                    resourceType: r.resource_type,
                    wasteProvider: r.waste_provider,
                    resourceSeeker: r.resource_seeker,
                    wasteProviderType: r.waste_provider_type,
                    resourceSeekerType: r.resource_seeker_type,
                    quantity: `${r.waste_quantity} ${r.waste_unit}`,
                    wasteLocation: r.waste_location,
                    resourceLocation: r.resource_location,
                    matchScore: r.match_score,
                    status: r.status,
                    co2Reduction: safeFloat(r.co2_reduction_tons),
                    costSavings: safeFloat(r.cost_savings),
                    logisticsCost: safeFloat(r.logistics_cost),
                    createdAt: r.created_at,
                    acceptedAt: r.accepted_at
                })),
                pagination: {
                    total: parseInt(count.rows[0].total),
                    limit,
                    offset
                }
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to fetch matches' });
    }
});

// Recommendations
router.get('/recommendations', async (req, res) => {
    try {
        const rows = await pool.query(
            `SELECT m.*, wl.material_type as waste_type, rr.material_needed as resource_type, 
                    i1.company_name as waste_provider, i2.company_name as resource_seeker 
             FROM matches m 
             JOIN waste_listings wl ON m.waste_listing_id=wl.id 
             JOIN resource_requests rr ON m.resource_request_id=rr.id 
             JOIN industries i1 ON wl.industry_id=i1.id 
             JOIN industries i2 ON rr.industry_id=i2.id 
             WHERE m.status='pending' AND (wl.industry_id=$1 OR rr.industry_id=$1) 
             ORDER BY m.match_score DESC LIMIT 10`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: rows.rows.map(r => ({
                id: r.id,
                wasteType: r.waste_type,
                resourceType: r.resource_type,
                wasteProvider: r.waste_provider,
                resourceSeeker: r.resource_seeker,
                matchScore: r.match_score,
                co2Reduction: safeFloat(r.co2_reduction_tons)
            }))
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
    }
});

// Get single match
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, error: 'Invalid ID' });

        const result = await pool.query(
            `SELECT m.*, wl.material_type as waste_type, wl.description as waste_description, 
                    wl.quantity as waste_quantity, wl.unit as waste_unit, wl.location as waste_location, 
                    rr.material_needed as resource_type, rr.description as resource_description, 
                    rr.location as resource_location, i1.company_name as waste_provider, 
                    i1.contact_email as waste_provider_email, i1.contact_phone as waste_provider_phone, 
                    i1.location as waste_provider_location, i2.company_name as resource_seeker, 
                    i2.contact_email as resource_seeker_email, i2.contact_phone as resource_seeker_phone, 
                    i2.location as resource_seeker_location 
             FROM matches m 
             JOIN waste_listings wl ON m.waste_listing_id=wl.id 
             JOIN resource_requests rr ON m.resource_request_id=rr.id 
             JOIN industries i1 ON wl.industry_id=i1.id 
             JOIN industries i2 ON rr.industry_id=i2.id 
             WHERE m.id=$1 AND (wl.industry_id=$2 OR rr.industry_id=$2)`,
            [id, req.user.id]
        );

        if (!result.rows.length)
            return res.status(404).json({ success: false, error: 'Match not found' });

        const r = result.rows[0];

        res.json({
            success: true,
            data: {
                id: r.id,
                wasteType: r.waste_type,
                wasteDescription: r.waste_description,
                resourceType: r.resource_type,
                resourceDescription: r.resource_description,
                wasteProvider: {
                    name: r.waste_provider,
                    email: r.waste_provider_email,
                    phone: r.waste_provider_phone,
                    location: r.waste_provider_location
                },
                resourceSeeker: {
                    name: r.resource_seeker,
                    email: r.resource_seeker_email,
                    phone: r.resource_seeker_phone,
                    location: r.resource_seeker_location
                },
                quantity: `${r.waste_quantity} ${r.waste_unit}`,
                matchScore: r.match_score,
                status: r.status,
                co2Reduction: safeFloat(r.co2_reduction_tons),
                costSavings: safeFloat(r.cost_savings),
                logisticsCost: safeFloat(r.logistics_cost),
                createdAt: r.created_at,
                acceptedAt: r.accepted_at
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to fetch match' });
    }
});

// Accept match (FIXED TRANSACTION)
router.post('/:id/accept', async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await client.query('BEGIN');

        const check = await client.query(
            `SELECT m.*, wl.industry_id as waste_owner, rr.industry_id as resource_owner, 
                    wl.quantity as waste_quantity, wl.id as wl_id, rr.id as rr_id
             FROM matches m 
             JOIN waste_listings wl ON m.waste_listing_id=wl.id 
             JOIN resource_requests rr ON m.resource_request_id=rr.id 
             WHERE m.id=$1`,
            [id]
        );

        if (!check.rows.length)
            return res.status(404).json({ success: false, error: 'Match not found' });

        const match = check.rows[0];

        if (match.waste_owner !== userId && match.resource_owner !== userId)
            return res.status(403).json({ success: false, error: 'Unauthorized' });

        if (match.status === 'accepted')
            return res.status(400).json({ success: false, error: 'Already accepted' });

        await client.query(`UPDATE matches SET status='accepted', accepted_at=CURRENT_TIMESTAMP WHERE id=$1`, [id]);
        await client.query(`UPDATE waste_listings SET status='reserved' WHERE id=$1`, [match.wl_id]);
        await client.query(`UPDATE resource_requests SET status='fulfilled' WHERE id=$1`, [match.rr_id]);

        await client.query('COMMIT');

        res.json({ success: true, message: 'Match accepted successfully' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to accept match' });
    } finally {
        client.release();
    }
});

// Reject match
router.post('/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;

        const check = await pool.query(
            `SELECT m.status, wl.industry_id as waste_owner, rr.industry_id as resource_owner 
             FROM matches m 
             JOIN waste_listings wl ON m.waste_listing_id=wl.id 
             JOIN resource_requests rr ON m.resource_request_id=rr.id 
             WHERE m.id=$1`,
            [id]
        );

        if (!check.rows.length)
            return res.status(404).json({ success: false, error: 'Not found' });

        const match = check.rows[0];

        if (match.waste_owner !== req.user.id && match.resource_owner !== req.user.id)
            return res.status(403).json({ success: false, error: 'Unauthorized' });

        if (match.status === 'accepted')
            return res.status(400).json({ success: false, error: 'Cannot reject accepted match' });

        if (match.status === 'rejected')
            return res.status(400).json({ success: false, error: 'Already rejected' });

        await pool.query(`UPDATE matches SET status='rejected' WHERE id=$1`, [id]);

        res.json({ success: true, message: 'Match rejected' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to reject match' });
    }
});

module.exports = router;
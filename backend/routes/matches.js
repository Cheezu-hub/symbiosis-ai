const express = require('express');
const router = express.Router();
const { pool, authenticateToken } = require('../models/database');

router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;
        const userId = req.user.id;
        let query = `SELECT m.*, wl.material_type as waste_type, wl.quantity as waste_quantity, wl.unit as waste_unit, wl.location as waste_location, rr.material_needed as resource_type, rr.location as resource_location, i1.company_name as waste_provider, i1.industry_type as waste_provider_type, i2.company_name as resource_seeker, i2.industry_type as resource_seeker_type FROM matches m JOIN waste_listings wl ON m.waste_listing_id = wl.id JOIN resource_requests rr ON m.resource_request_id = rr.id JOIN industries i1 ON wl.industry_id = i1.id JOIN industries i2 ON rr.industry_id = i2.id WHERE (wl.industry_id = $1 OR rr.industry_id = $1)`;
        const params = [userId];
        let c = 2;
        if (status) { 
            query += ` AND m.status = $${c++}`; 
            params.push(status); 
        }
        query += ` ORDER BY m.match_score DESC, m.created_at DESC LIMIT $${c} OFFSET $${c+1}`;
        params.push(parseInt(limit), parseInt(offset));
        const result = await pool.query(query, params);
        const count = await pool.query(
            `SELECT COUNT(*) as total FROM matches m JOIN waste_listings wl ON m.waste_listing_id=wl.id JOIN resource_requests rr ON m.resource_request_id=rr.id WHERE wl.industry_id=$1 OR rr.industry_id=$1`,
            [userId]
        );
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
                    co2Reduction: parseFloat(r.co2_reduction_tons)||0, 
                    costSavings: parseFloat(r.cost_savings)||0, 
                    logisticsCost: parseFloat(r.logistics_cost)||0, 
                    createdAt: r.created_at, 
                    acceptedAt: r.accepted_at 
                })), 
                pagination: { 
                    total: parseInt(count.rows[0].total), 
                    limit: parseInt(limit), 
                    offset: parseInt(offset) 
                } 
            } 
        });
    } catch (err) { 
        console.error(err); 
        res.status(500).json({ success: false, error: 'Failed to fetch matches' }); 
    } 
});

router.get('/recommendations', async (req, res) => {
    try {
        const rows = await pool.query(
            `SELECT m.*, wl.material_type as waste_type, wl.quantity as waste_quantity, wl.unit as waste_unit, rr.material_needed as resource_type, i1.company_name as waste_provider, i2.company_name as resource_seeker FROM matches m JOIN waste_listings wl ON m.waste_listing_id=wl.id JOIN resource_requests rr ON m.resource_request_id=rr.id JOIN industries i1 ON wl.industry_id=i1.id JOIN industries i2 ON rr.industry_id=i2.id WHERE m.status='pending' AND (wl.industry_id=$1 OR rr.industry_id=$1) ORDER BY m.match_score DESC LIMIT 10`,
            [req.user.id]
        );
        res.json({ success: true, data: rows.rows });
    } catch (err) { 
        res.json({ success: true, data: [] }); 
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT m.*, wl.material_type as waste_type, wl.description as waste_description, wl.quantity as waste_quantity, wl.unit as waste_unit, wl.location as waste_location, rr.material_needed as resource_type, rr.description as resource_description, rr.location as resource_location, i1.company_name as waste_provider, i1.contact_email as waste_provider_email, i1.contact_phone as waste_provider_phone, i1.location as waste_provider_location, i2.company_name as resource_seeker, i2.contact_email as resource_seeker_email, i2.contact_phone as resource_seeker_phone, i2.location as resource_seeker_location FROM matches m JOIN waste_listings wl ON m.waste_listing_id=wl.id JOIN resource_requests rr ON m.resource_request_id=rr.id JOIN industries i1 ON wl.industry_id=i1.id JOIN industries i2 ON rr.industry_id=i2.id WHERE m.id=$1 AND (wl.industry_id=$2 OR rr.industry_id=$2)`,
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Match not found' });
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
                co2Reduction: parseFloat(r.co2_reduction_tons)||0, 
                costSavings: parseFloat(r.cost_savings)||0, 
                logisticsCost: parseFloat(r.logistics_cost)||0, 
                createdAt: r.created_at, 
                acceptedAt: r.accepted_at 
            } 
        });
    } catch (err) { 
        console.error(err); 
        res.status(500).json({ success: false, error: 'Failed to fetch match' }); 
    }
});

router.post('/:id/accept', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const check = await pool.query(
            `SELECT m.*, wl.industry_id as waste_owner, rr.industry_id as resource_owner, wl.quantity as waste_quantity FROM matches m JOIN waste_listings wl ON m.waste_listing_id=wl.id JOIN resource_requests rr ON m.resource_request_id=rr.id WHERE m.id=$1`, 
            [id]
        );
        if (check.rows.length === 0) return res.status(404).json({ success: false, error: 'Match not found' });
        const match = check.rows[0];
        if (match.waste_owner !== userId && match.resource_owner !== userId) return res.status(403).json({ success: false, error: 'Unauthorized' });
        if (match.status === 'accepted') return res.status(400).json({ success: false, error: 'Already accepted' });
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(`UPDATE matches SET status='accepted', accepted_at=CURRENT_TIMESTAMP WHERE id=$1`, [id]);
            await client.query(`UPDATE waste_listings SET status='reserved' WHERE id=$1`, [match.waste_listing_id]);
            await client.query(`UPDATE resource_requests SET status='fulfilled' WHERE id=$1`, [match.resource_request_id]);
            if (match.co2_reduction_tons) {
                await client.query(
                    `INSERT INTO impact_metrics (industry_id, co2_reduced_tons, waste_diverted_tons, recorded_date) VALUES ($1,$2,$3,CURRENT_DATE)
                     ON CONFLICT (industry_id, recorded_date) DO UPDATE SET co2_reduced_tons=impact_metrics.co2_reduced_tons+EXCLUDED.co2_reduced_tons, waste_diverted_tons=impact_metrics.waste_diverted_tons+EXCLUDED.waste_diverted_tons`,
                    [match.waste_owner, match.co2_reduction_tons, match.waste_quantity]
                );
            }
            await client.query(`UPDATE industries SET sustainability_score=LEAST(100,sustainability_score+5), updated_at=CURRENT_TIMESTAMP WHERE id=$1 OR id=$2`, [match.waste_owner, match.resource_owner]);
            await client.query('COMMIT');
            res.json({ success: true, message: 'Match accepted successfully' });
        } catch (err) { 
            await client.query('ROLLBACK'); 
            throw err; 
        } finally { 
            client.release(); 
        }
    } catch (err) { 
        console.error(err); 
        res.status(500).json({ success: false, error: 'Failed to accept match' }); 
    }
});

router.post('/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const check = await pool.query(
            `SELECT wl.industry_id as waste_owner, rr.industry_id as resource_owner FROM matches m JOIN waste_listings wl ON m.waste_listing_id=wl.id JOIN resource_requests rr ON m.resource_request_id=rr.id WHERE m.id=$1`, 
            [id]
        );
        if (check.rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
        const match = check.rows[0];
        if (match.waste_owner !== req.user.id && match.resource_owner !== req.user.id) return res.status(403).json({ success: false, error: 'Unauthorized' });
        await pool.query(`UPDATE matches SET status='rejected' WHERE id=$1`, [id]);
        res.json({ success: true, message: 'Match rejected' });
    } catch (err) { 
        console.error(err); 
        res.status(500).json({ success: false, error: 'Failed to reject match' }); 
    }
});

module.exports = router;
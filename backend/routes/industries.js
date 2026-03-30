const express = require('express');
const router = express.Router();
const { pool } = require('../models/database');

router.get('/', async (req, res) => {
  try {
    const { industryType, location, limit = 100 } = req.query;
    let query = `SELECT id, company_name, industry_type, location, transport_radius_km, sustainability_score 
                 FROM industries WHERE 1=1`;
    const params = [];
    let c = 1;

    if (industryType) { 
        query += ` AND industry_type = $${c++}`; 
        params.push(industryType); 
    }
    if (location) { 
        query += ` AND location ILIKE $${c++}`; 
        params.push(`%${location}%`); 
    }

    query += ` ORDER BY sustainability_score DESC LIMIT $${c}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);
    res.json({ 
        success: true, 
        data: result.rows.map(r => ({ 
            id: r.id, 
            companyName: r.company_name, 
            industryType: r.industry_type, 
            location: r.location, 
            transportRadius: r.transport_radius_km, 
            sustainabilityScore: r.sustainability_score 
        })) 
    });
  } catch (err) { 
      console.error(err); 
      res.status(500).json({ error: 'Failed to fetch industries' }); 
  }
});

router.get('/network', async (req, res) => {
  try {
    // Optimization: Only fetch required fields for the network graph
    const industries = await pool.query('SELECT id, company_name, industry_type, location FROM industries');
    
    const matches = await pool.query(
      `SELECT m.id, wl.industry_id as source_id, rr.industry_id as target_id, wl.material_type as material, wl.quantity as value
       FROM matches m 
       JOIN waste_listings wl ON m.waste_listing_id = wl.id 
       JOIN resource_requests rr ON m.resource_request_id = rr.id
       WHERE m.status = 'accepted'`
    );

    res.json({ 
        success: true, 
        data: {
            nodes: industries.rows.map(r => ({ 
                id: r.id, 
                label: r.company_name, 
                type: (r.industry_type || 'other').toLowerCase(), 
                location: r.location 
            })),
            links: matches.rows.map(r => ({ 
                source: r.source_id, 
                target: r.target_id, 
                material: r.material, 
                value: parseFloat(r.value) || 0 
            }))
        }
    });
  } catch (err) { 
      console.error(err); 
      res.status(500).json({ error: 'Failed to fetch network' }); 
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, company_name, industry_type, contact_email, contact_phone, 
              location, transport_radius_km, website, sustainability_score, created_at 
       FROM industries WHERE id = $1`, [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Industry not found' });
    
    const r = result.rows[0];
    res.json({ 
        success: true, 
        data: { 
            id: r.id, 
            companyName: r.company_name, 
            industryType: r.industry_type, 
            email: r.contact_email, 
            phone: r.contact_phone, 
            location: r.location, 
            transportRadius: r.transport_radius_km, 
            website: r.website, 
            sustainabilityScore: r.sustainability_score, 
            createdAt: r.created_at 
        } 
    });
  } catch (err) { 
      console.error(err); 
      res.status(500).json({ error: 'Failed to fetch industry' }); 
  }
});

module.exports = router;
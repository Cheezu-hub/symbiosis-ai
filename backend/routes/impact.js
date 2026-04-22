const express = require('express');
const router = express.Router();
const { pool, authenticateToken } = require('../models/database');

router.use(authenticateToken);

router.get('/metrics', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        SUM(co2_reduced_tons) as co2, 
        SUM(waste_diverted_tons) as waste,
        SUM(water_saved_liters) as water, 
        SUM(energy_saved_mwh) as energy,
        SUM(raw_material_saved_tons) as raw 
       FROM impact_metrics WHERE industry_id=$1`, [req.user.id]
    );
    const r = result.rows[0];
    res.json({ 
        success: true, 
        data: { 
            co2Reduced: parseFloat(r.co2) || 0, 
            wasteDiverted: parseFloat(r.waste) || 0, 
            waterSaved: parseFloat(r.water) || 0, 
            energySaved: parseFloat(r.energy) || 0, 
            rawMaterialSaved: parseFloat(r.raw) || 0 
        } 
    });
  } catch (err) { 
      console.error(err); 
      res.status(500).json({ error: 'Failed to fetch metrics' }); 
  }
});

router.get('/report', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const validPeriods = ['weekly', 'monthly', 'yearly'];
    if (!validPeriods.includes(period))
      return res.status(400).json({ error: 'Invalid period. Must be weekly, monthly, or yearly.' });
    const fmt = { 
        weekly: "DATE_TRUNC('week', recorded_date)", 
        monthly: "DATE_TRUNC('month', recorded_date)", 
        yearly: "DATE_TRUNC('year', recorded_date)" 
    };
    const dateFn = fmt[period];
    
    const result = await pool.query(
      `SELECT ${dateFn} as period, 
              SUM(co2_reduced_tons) as co2, 
              SUM(waste_diverted_tons) as waste,
              SUM(water_saved_liters) as water, 
              SUM(energy_saved_mwh) as energy
       FROM impact_metrics 
       WHERE industry_id=$1 
       GROUP BY period 
       ORDER BY period DESC LIMIT 12`, [req.user.id]
    );
    
    res.json({ 
        success: true, 
        data: result.rows.map(r => ({ 
            period: r.period, 
            co2Reduced: parseFloat(r.co2) || 0, 
            wasteDiverted: parseFloat(r.waste) || 0, 
            waterSaved: parseFloat(r.water) || 0, 
            energySaved: parseFloat(r.energy) || 0 
        })) 
    });
  } catch (err) { 
      console.error(err); 
      res.status(500).json({ error: 'Failed to fetch report' }); 
  }
});

router.post('/calculate', async (req, res) => {
  try {
    const { wasteTons, materialType } = req.body;
    if (!wasteTons || isNaN(wasteTons)) return res.status(400).json({ error: 'Valid wasteTons required' });
    
    const factors = { 'fly ash': 0.8, 'steel slag': 0.6, 'waste heat': 1.2, 'chemical byproduct': 0.5 };
    const factor = factors[(materialType || '').toLowerCase()] || 0.5;
    
    res.json({ 
        success: true, 
        data: { 
            co2ReducedTons: wasteTons * factor, 
            landfillDivertedTons: wasteTons, 
            rawMaterialSavedTons: wasteTons * 0.8, 
            waterSavedLiters: wasteTons * 1000, 
            energySavedMwh: wasteTons * 0.3 
        } 
    });
  } catch (err) { 
      console.error(err); 
      res.status(500).json({ error: 'Calculation failed' }); 
  }
});

router.get('/sustainability-score', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const ind = await pool.query('SELECT sustainability_score FROM industries WHERE id=$1', [userId]);
    const impact = await pool.query(
        `SELECT SUM(co2_reduced_tons) as co2, SUM(waste_diverted_tons) as waste 
         FROM impact_metrics WHERE industry_id=$1`, [userId]
    );
    const matches = await pool.query(
        `SELECT COUNT(*) as cnt FROM matches m 
         JOIN waste_listings wl ON m.waste_listing_id=wl.id 
         WHERE wl.industry_id=$1 AND m.status='accepted'`, [userId]
    );

    const score = ind.rows[0]?.sustainability_score || 0;
    const imp = impact.rows[0];
    const cnt = parseInt(matches.rows[0]?.cnt || 0);

    res.json({ 
        success: true, 
        data: { 
            overallScore: score, 
            breakdown: { 
                wasteDiversion: Math.min(100, Math.round((parseFloat(imp?.waste) || 0) / 10)), 
                carbonReduction: Math.min(100, Math.round((parseFloat(imp?.co2) || 0) / 5)), 
                collaboration: Math.min(100, cnt * 5), 
                resourceEfficiency: Math.min(100, Math.round(score * 0.8)) 
            } 
        } 
    });
  } catch (err) { 
      console.error(err); 
      res.status(500).json({ error: 'Failed to fetch score' }); 
  }
});

// ── GET /api/impact  (global stats — no auth required) ──────────────────────
// Used by the public dashboard to display platform-wide numbers.
router.get('/', async (req, res) => {
  try {
    const [companies, matches, co2, waste] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM industries'),
      pool.query(`SELECT COUNT(*) as total,
                         COUNT(*) FILTER (WHERE status='accepted') as accepted
                  FROM matches`),
      pool.query(`SELECT COALESCE(SUM(co2_reduction_tons),0) as total
                  FROM matches WHERE status='accepted'`),
      pool.query(`SELECT COALESCE(SUM(wl.quantity),0) as total
                  FROM matches m
                  JOIN waste_listings wl ON m.waste_listing_id = wl.id
                  WHERE m.status='accepted'`)
    ]);

    res.json({
      success: true,
      data: {
        totalCompanies:      parseInt(companies.rows[0].total),
        totalMatches:        parseInt(matches.rows[0].total),
        acceptedMatches:     parseInt(matches.rows[0].accepted),
        carbonReductionTons: parseFloat(co2.rows[0].total)   || 0,
        wasteDivertedTons:   parseFloat(waste.rows[0].total) || 0
      }
    });
  } catch (err) {
    console.error('[impact/]', err);
    res.status(500).json({ error: 'Failed to fetch impact stats' });
  }
});

module.exports = router;
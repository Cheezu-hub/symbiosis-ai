const express = require('express');
const router = express.Router();
const { pool, authenticateToken } = require('../models/database');
const recommendationService = require('../services/recommendationService');
const scoringService = require('../services/scoringService');

// ─── GET /api/ai/recommend/:wasteType (public) ─────────────────────────────
router.get('/recommend/:wasteType', (req, res) => {
  try {
    const result = recommendationService.getWasteRecommendations(decodeURIComponent(req.params.wasteType));
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('AI recommend error:', err);
    res.status(500).json({ success: false, error: 'Recommendation failed' });
  }
});

// ─── GET /api/ai/smart-match/:wasteId (auth required) ───────────────────────
router.get('/smart-match/:wasteId', authenticateToken, async (req, res) => {
  try {
    const wasteRes = await pool.query(
      `SELECT wl.*, i.company_name as provider_name FROM waste_listings wl
       JOIN industries i ON wl.industry_id = i.id WHERE wl.id = $1`, [req.params.wasteId]
    );
    if (!wasteRes.rows.length) return res.status(404).json({ success: false, error: 'Waste listing not found' });
    const waste = wasteRes.rows[0];

    const resourceRes = await pool.query(
      `SELECT rr.*, i.company_name as requester_name, i.industry_type
       FROM resource_requests rr JOIN industries i ON rr.industry_id = i.id WHERE rr.status = 'active'`
    );

    const matches = scoringService.findSmartMatches(waste.material_type, waste.quantity, waste.location, resourceRes.rows);
    res.json({
      success: true,
      data: {
        waste: { id: waste.id, materialType: waste.material_type, quantity: parseFloat(waste.quantity), unit: waste.unit, location: waste.location, provider: waste.provider_name },
        matches: matches.map(m => ({
          resourceId: m.resourceRequest.id,
          materialNeeded: m.resourceRequest.material_needed,
          requester: m.resourceRequest.requester_name,
          requesterType: m.resourceRequest.industry_type,
          quantity: `${m.resourceRequest.quantity} ${m.resourceRequest.unit}`,
          location: m.resourceRequest.location,
          materialSimilarity: m.materialSimilarity,
          symbiosisScore: m.symbiosisScore,
          scoreBreakdown: m.scoreBreakdown,
          matchReason: m.matchReason
        }))
      }
    });
  } catch (err) {
    console.error('AI smart-match error:', err);
    res.status(500).json({ success: false, error: 'Smart matching failed' });
  }
});

// ─── GET /api/ai/match-score/:wasteId/:resourceId (auth required) ───────────
router.get('/match-score/:wasteId/:resourceId', authenticateToken, async (req, res) => {
  try {
    const [wasteRes, resourceRes] = await Promise.all([
      pool.query(`SELECT wl.*, i.company_name as provider_name FROM waste_listings wl JOIN industries i ON wl.industry_id = i.id WHERE wl.id = $1`, [req.params.wasteId]),
      pool.query(`SELECT rr.*, i.company_name as requester_name FROM resource_requests rr JOIN industries i ON rr.industry_id = i.id WHERE rr.id = $1`, [req.params.resourceId])
    ]);

    if (!wasteRes.rows.length) return res.status(404).json({ success: false, error: 'Waste listing not found' });
    if (!resourceRes.rows.length) return res.status(404).json({ success: false, error: 'Resource request not found' });

    const w = wasteRes.rows[0], r = resourceRes.rows[0];
    const score = scoringService.computeSymbiosisScore(
      { materialType: w.material_type, quantity: w.quantity, location: w.location },
      { materialNeeded: r.material_needed, quantity: r.quantity, location: r.location, industrySector: r.industry_sector }
    );

    const impact = scoringService.estimateEnvironmentalImpact(w.material_type, parseFloat(w.quantity));

    res.json({
      success: true,
      data: {
        wasteProvider: w.provider_name, resourceSeeker: r.requester_name,
        wasteType: w.material_type, resourceType: r.material_needed,
        score: score.totalScore, breakdown: score.breakdown, details: score.details,
        impact
      }
    });
  } catch (err) {
    console.error('AI match-score error:', err);
    res.status(500).json({ success: false, error: 'Score computation failed' });
  }
});

// ─── GET /api/ai/opportunities (auth required) ─────────────────────────────
router.get('/opportunities', authenticateToken, async (req, res) => {
  try {
    const [wasteRes, resourceRes] = await Promise.all([
      pool.query(`SELECT wl.*, i.company_name as provider_name FROM waste_listings wl JOIN industries i ON wl.industry_id = i.id WHERE wl.status = 'available'`),
      pool.query(`SELECT rr.*, i.company_name as requester_name FROM resource_requests rr JOIN industries i ON rr.industry_id = i.id WHERE rr.status = 'active'`)
    ]);

    const topN = parseInt(req.query.limit) || 10;
    const opportunities = recommendationService.detectOpportunities(wasteRes.rows, resourceRes.rows, topN);

    res.json({ success: true, data: { opportunities, totalWaste: wasteRes.rows.length, totalResources: resourceRes.rows.length } });
  } catch (err) {
    console.error('AI opportunities error:', err);
    res.status(500).json({ success: false, error: 'Opportunity detection failed' });
  }
});

// ─── POST /api/ai/impact-estimate (public) ──────────────────────────────────
router.post('/impact-estimate', (req, res) => {
  try {
    const { materialType, quantityTons } = req.body;
    if (!materialType) return res.status(400).json({ success: false, error: 'materialType is required' });
    const result = scoringService.estimateEnvironmentalImpact(materialType, quantityTons || 0);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('AI impact error:', err);
    res.status(500).json({ success: false, error: 'Impact estimation failed' });
  }
});

module.exports = router;

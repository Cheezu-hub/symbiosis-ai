const express = require('express');
const router = express.Router();
const { pool, authenticateToken } = require('../models/database');
const recommendationService = require('../services/recommendationService');
const scoringService = require('../services/scoringService');
const { runMatching } = require('../utils/matchingRunner');

// ─── POST /api/ai/run-matching (auth required) ──────────────────────────────
router.post('/run-matching', authenticateToken, async (req, res) => {
  try {
    const result = await runMatching();
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('AI run-matching error:', err);
    res.status(500).json({ success: false, error: 'Matching run failed' });
  }
});

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
    const userId = req.user.id;
    // Fetch user industry type for context-aware recommendations
    const userRes = await pool.query('SELECT industry_type FROM industries WHERE id = $1', [userId]);
    const userIndustryType = userRes.rows[0]?.industry_type;

    const [myWaste, otherResources, otherWaste, myResources] = await Promise.all([
      pool.query(`SELECT wl.*, i.company_name as provider_name FROM waste_listings wl JOIN industries i ON wl.industry_id = i.id WHERE wl.status = 'available' AND wl.industry_id = $1`, [userId]),
      pool.query(`SELECT rr.*, i.company_name as requester_name FROM resource_requests rr JOIN industries i ON rr.industry_id = i.id WHERE rr.status = 'active' AND rr.industry_id != $1`, [userId]),
      pool.query(`SELECT wl.*, i.company_name as provider_name FROM waste_listings wl JOIN industries i ON wl.industry_id = i.id WHERE wl.status = 'available' AND wl.industry_id != $1`, [userId]),
      pool.query(`SELECT rr.*, i.company_name as requester_name FROM resource_requests rr JOIN industries i ON rr.industry_id = i.id WHERE rr.status = 'active' AND rr.industry_id = $1`, [userId])
    ]);

    const topN = parseInt(req.query.limit) || 10;
    const opps1 = recommendationService.detectOpportunities(myWaste.rows, otherResources.rows, topN, userIndustryType);
    const opps2 = recommendationService.detectOpportunities(otherWaste.rows, myResources.rows, topN, userIndustryType);
    
    const opportunities = [...opps1, ...opps2].sort((a,b) => b.matchScore - a.matchScore).slice(0, topN);

    res.json({ success: true, data: { opportunities, totalWaste: myWaste.rows.length + otherWaste.rows.length, totalResources: myResources.rows.length + otherResources.rows.length } });
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

// ─── GET /api/ai/trade-recommendations (auth required) ──────────────────────
// Returns ranked trade recommendations for the authenticated company.
// Query params:
//   role  = 'buyer' | 'seller' | 'both' (default: 'both')
//   limit = number of results (default: 20, max: 50)
router.get('/trade-recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const role   = ['buyer', 'seller', 'both'].includes(req.query.role) ? req.query.role : 'both';
    const topN   = Math.min(parseInt(req.query.limit) || 20, 50);

    // Fetch the authenticated company's details
    const companyRes = await pool.query(
      'SELECT id, company_name, industry_type, location FROM industries WHERE id = $1', [userId]
    );
    if (!companyRes.rows.length) return res.status(404).json({ success: false, error: 'Company not found' });
    const company = companyRes.rows[0];

    // Fetch all available waste listings with provider info + pricing
    const wasteRes = await pool.query(
      `SELECT wl.*, i.company_name as provider_name, i.industry_type, i.location as company_location
       FROM waste_listings wl
       JOIN industries i ON wl.industry_id = i.id
       WHERE wl.status = 'available'`
    );

    // Fetch all active resource requests with requester info + pricing
    const resourceRes = await pool.query(
      `SELECT rr.*, i.company_name as requester_name, i.industry_type, i.location as company_location
       FROM resource_requests rr
       JOIN industries i ON rr.industry_id = i.id
       WHERE rr.status = 'active'`
    );

    const recommendations = scoringService.generateTradeRecommendations(
      company, wasteRes.rows, resourceRes.rows, { role, topN }
    );

    // Compute summary stats
    const avgScore = recommendations.length > 0
      ? Math.round(recommendations.reduce((s, r) => s + r.compositeScore, 0) / recommendations.length)
      : 0;
    const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    recommendations.forEach(r => gradeDistribution[r.grade]++);
    const buyCount  = recommendations.filter(r => r.direction === 'buy').length;
    const sellCount = recommendations.filter(r => r.direction === 'sell').length;

    res.json({
      success: true,
      data: {
        company: { id: company.id, name: company.company_name, location: company.location },
        role,
        recommendations,
        summary: {
          totalRecommendations: recommendations.length,
          averageScore: avgScore,
          buyOpportunities: buyCount,
          sellOpportunities: sellCount,
          gradeDistribution,
          totalWasteListings: wasteRes.rows.length,
          totalResourceRequests: resourceRes.rows.length
        }
      }
    });
  } catch (err) {
    console.error('AI trade-recommendations error:', err);
    res.status(500).json({ success: false, error: 'Trade recommendation generation failed' });
  }
});

// ─── GET /api/ai/trade-score/:wasteId/:resourceId (auth required) ───────────
// Score a specific waste-listing ↔ resource-request pair using the
// trade recommendation algorithm (distance + material + price).
router.get('/trade-score/:wasteId/:resourceId', authenticateToken, async (req, res) => {
  try {
    const [wasteRes, resourceRes] = await Promise.all([
      pool.query(
        `SELECT wl.*, i.company_name as provider_name, i.industry_type as provider_type, i.location as provider_location
         FROM waste_listings wl JOIN industries i ON wl.industry_id = i.id WHERE wl.id = $1`,
        [req.params.wasteId]
      ),
      pool.query(
        `SELECT rr.*, i.company_name as requester_name, i.industry_type as requester_type, i.location as requester_location
         FROM resource_requests rr JOIN industries i ON rr.industry_id = i.id WHERE rr.id = $1`,
        [req.params.resourceId]
      )
    ]);

    if (!wasteRes.rows.length) return res.status(404).json({ success: false, error: 'Waste listing not found' });
    if (!resourceRes.rows.length) return res.status(404).json({ success: false, error: 'Resource request not found' });

    const w = wasteRes.rows[0], r = resourceRes.rows[0];

    const tradeScore = scoringService.computeTradeScore(w, r);
    const impact = scoringService.estimateEnvironmentalImpact(w.material_type, Math.min(parseFloat(w.quantity), parseFloat(r.quantity)) || 0);

    res.json({
      success: true,
      data: {
        wasteProvider: { name: w.provider_name, type: w.provider_type, location: w.location },
        resourceSeeker: { name: r.requester_name, type: r.requester_type, location: r.location },
        wasteMaterial: w.material_type,
        resourceNeeded: r.material_needed,
        wastePrice: parseFloat(w.price_per_unit) || 0,
        seekerBudget: parseFloat(r.price_per_unit) || 0,
        compositeScore: tradeScore.compositeScore,
        grade: tradeScore.grade,
        breakdown: tradeScore.breakdown,
        impact
      }
    });
  } catch (err) {
    console.error('AI trade-score error:', err);
    res.status(500).json({ success: false, error: 'Trade score computation failed' });
  }
});

// ─── POST /api/ai/match-preview (public) ────────────────────────────────────
// Quick scoring without touching the database. Useful for frontend previews.
// Body: { wasteMaterial, wasteLocation, wasteCategory, wastePrice,
//         seekerMaterial, seekerLocation, seekerCategory, seekerPrice, seekerIndustry }
router.post('/match-preview', (req, res) => {
  try {
    const { wasteMaterial, wasteLocation, wasteCategory, wastePrice,
            seekerMaterial, seekerLocation, seekerCategory, seekerPrice, seekerIndustry } = req.body;

    if (!wasteMaterial || !seekerMaterial) {
      return res.status(400).json({ success: false, error: 'wasteMaterial and seekerMaterial are required' });
    }

    const tradeScore = scoringService.computeTradeScore(
      { material_type: wasteMaterial, location: wasteLocation, category: wasteCategory, price_per_unit: wastePrice || 0 },
      { material_needed: seekerMaterial, location: seekerLocation, category: seekerCategory, price_per_unit: seekerPrice || 0, industry_sector: seekerIndustry }
    );

    res.json({
      success: true,
      data: {
        compositeScore: tradeScore.compositeScore,
        grade: tradeScore.grade,
        breakdown: tradeScore.breakdown
      }
    });
  } catch (err) {
    console.error('AI match-preview error:', err);
    res.status(500).json({ success: false, error: 'Match preview failed' });
  }
});

// ─── POST /api/ai/run-matching (auth required) ──────────────────────────────
// resource requests. Returns a summary of inserted/updated matches.
// Already moved to top.


// ─── GET /api/ai/personalized-recommendations (auth required) ───────────────
// Demand-driven personalised matching:
//   Supply  = all available waste listings from OTHER companies
//   Demand  = ONLY the current user's own active resource requests
//
// Query params:
//   topPerRequest = max results per request (default: 5)
//   minScore      = minimum composite score to include (default: 25)
router.get('/personalized-recommendations', authenticateToken, async (req, res) => {
  try {
    const userId         = req.user.id;
    const topPerRequest  = Math.min(parseInt(req.query.topPerRequest) || 5, 10);
    const minScore       = parseInt(req.query.minScore) || 25;

    // ── 1. The user's own active resource requests (demand) ──────────────────
    const userRequestsRes = await pool.query(
      `SELECT rr.*, i.company_name as requester_name, i.industry_type, i.location as company_location
       FROM resource_requests rr
       JOIN industries i ON rr.industry_id = i.id
       WHERE rr.industry_id = $1 AND rr.status = 'active'
       ORDER BY rr.created_at DESC`,
      [userId]
    );
    const userRequests = userRequestsRes.rows;

    // ── 2. All available waste listings from OTHER companies (supply) ─────────
    const wasteRes = await pool.query(
      `SELECT wl.*, i.company_name as provider_name, i.industry_type, i.location as company_location
       FROM waste_listings wl
       JOIN industries i ON wl.industry_id = i.id
       WHERE wl.status = 'available' AND wl.industry_id != $1`,
      [userId]
    );
    const wasteListings = wasteRes.rows;

    // Fetch user industry type for context-aware recommendations
    const userRes = await pool.query('SELECT industry_type FROM industries WHERE id = $1', [userId]);
    const userIndustryType = userRes.rows[0]?.industry_type;

    // ── 3. Run the personalised matching engine ───────────────────────────────
    const groups = scoringService.generatePersonalizedRecommendations(
      userRequests, wasteListings, { topPerRequest, minScore, userIndustryType }
    );

    // ── 4. Summary stats ─────────────────────────────────────────────────────
    const totalMatches   = groups.reduce((s, g) => s + g.totalMatches, 0);
    const requestsWithMatches = groups.filter(g => g.topMatches.length > 0).length;
    const allScores = groups.flatMap(g => g.topMatches.map(m => m.compositeScore));
    const avgScore  = allScores.length > 0
      ? Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length)
      : 0;

    res.json({
      success: true,
      data: {
        userId,
        totalUserRequests:    userRequests.length,
        totalWasteListings:   wasteListings.length,
        requestsWithMatches,
        totalMatchesFound:    totalMatches,
        averageMatchScore:    avgScore,
        recommendations:      groups
      }
    });
  } catch (err) {
    console.error('AI personalized-recommendations error:', err);
    res.status(500).json({ success: false, error: 'Personalized recommendation generation failed' });
  }
});


module.exports = router;


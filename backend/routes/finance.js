const express = require('express');
const router = express.Router();
const { pool, authenticateToken } = require('../models/database');

router.use(authenticateToken);

// ─── Market price reference (per ton in INR) ─────────────────────────────────
const MARKET_PRICES = {
  'fly ash':         5000,
  'slag':            4500,
  'copper scrap':   45000,
  'aluminum scrap': 38000,
  'plastic waste':   8000,
  'paper waste':     3500,
  'glass waste':     2800,
  'wood waste':      2200,
  'rubber waste':    6000,
  'textile waste':   4000,
  'chemical waste': 12000,
  'metal scrap':    20000,
  'organic waste':   1500,
  'default':         5000
};

function getMarketPrice(materialType) {
  if (!materialType) return MARKET_PRICES.default;
  const key = materialType.toLowerCase();
  for (const [k, v] of Object.entries(MARKET_PRICES)) {
    if (key.includes(k)) return v;
  }
  return MARKET_PRICES.default;
}

// ─── GET /api/finance/dashboard ───────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all buyer transactions
    const txRes = await pool.query(`
      SELECT t.*, wl.material_type, wl.unit, wl.category,
             seller.company_name as seller_name, seller.location as seller_location,
             buyer.company_name  as buyer_name,  buyer.location as buyer_location
      FROM transactions t
      JOIN waste_listings wl ON t.waste_listing_id = wl.id
      JOIN industries seller ON t.seller_id = seller.id
      JOIN industries buyer  ON t.buyer_id  = buyer.id
      WHERE t.buyer_id = $1
      ORDER BY t.completed_at DESC
    `, [userId]);

    const transactions = txRes.rows;

    let totalSaved = 0;
    let totalSpent = 0;
    let totalMarketValue = 0;
    let workingCapitalPreserved = 0;
    const monthlyMap = {};
    const categoryMap = {};

    const enriched = transactions.map(t => {
      const qty = parseFloat(t.quantity) || 1;
      const pricePaid = parseFloat(t.total_value) || 0;
      const pricePerUnit = qty > 0 ? pricePaid / qty : 0;
      const marketPrice = getMarketPrice(t.material_type);
      const marketTotal = marketPrice * qty;
      const saved = Math.max(0, marketTotal - pricePaid);
      const savingsPct = marketTotal > 0 ? ((saved / marketTotal) * 100).toFixed(1) : 0;

      // Credit period simulation: 30-day default
      const creditDays = 30;
      const capitalPreserved = pricePaid; // amount not paid upfront

      totalSaved += saved;
      totalSpent += pricePaid;
      totalMarketValue += marketTotal;
      workingCapitalPreserved += capitalPreserved;

      // Monthly aggregation
      const month = t.completed_at
        ? new Date(t.completed_at).toLocaleString('default', { month: 'short', year: '2-digit' })
        : 'N/A';
      if (!monthlyMap[month]) monthlyMap[month] = { month, saved: 0, spent: 0, transactions: 0 };
      monthlyMap[month].saved += saved;
      monthlyMap[month].spent += pricePaid;
      monthlyMap[month].transactions += 1;

      // Category breakdown
      const cat = t.category || 'Other';
      if (!categoryMap[cat]) categoryMap[cat] = { category: cat, saved: 0, count: 0 };
      categoryMap[cat].saved += saved;
      categoryMap[cat].count += 1;

      return {
        id: t.id,
        materialType: t.material_type,
        category: t.category,
        quantity: qty,
        unit: t.unit,
        pricePaid,
        pricePerUnit: pricePerUnit.toFixed(2),
        marketPricePerUnit: marketPrice,
        marketTotal,
        saved,
        savingsPct,
        creditDays,
        capitalPreserved,
        sellerName: t.seller_name,
        sellerLocation: t.seller_location,
        completedAt: t.completed_at
      };
    });

    const avgSavingsPct = totalMarketValue > 0
      ? ((totalSaved / totalMarketValue) * 100).toFixed(1)
      : 0;

    // Monthly trend (last 6)
    const monthlySavings = Object.values(monthlyMap).slice(-6);

    // AI suggestions based on data
    const suggestions = [];
    if (transactions.length > 0) {
      suggestions.push({ icon: '🎯', title: 'Bulk Purchase Discount', desc: 'Consolidate orders of same material to negotiate 8-12% additional discount from suppliers.' });
      suggestions.push({ icon: '📍', title: 'Source Locally', desc: 'Nearby suppliers can reduce logistics cost by up to ₹200-400/ton. Filter by location.' });
      suggestions.push({ icon: '⏰', title: 'Leverage Net-30 Terms', desc: 'Request Net-30 payment terms to preserve working capital worth ₹' + Math.round(totalSpent / 12).toLocaleString('en-IN') + ' monthly.' });
      suggestions.push({ icon: '♻️', title: 'Substitute Raw Materials', desc: 'Fly ash & slag can replace virgin cement additives saving 30-40% per ton.' });
    } else {
      suggestions.push({ icon: '🚀', title: 'Start Trading', desc: 'Complete your first trade to unlock personalized financial savings insights.' });
    }

    res.json({
      success: true,
      data: {
        kpis: {
          totalSaved: Math.round(totalSaved),
          totalSpent: Math.round(totalSpent),
          totalMarketValue: Math.round(totalMarketValue),
          avgSavingsPct: parseFloat(avgSavingsPct),
          workingCapitalPreserved: Math.round(workingCapitalPreserved),
          transactionCount: transactions.length,
          annualizedSavings: Math.round(totalSaved * 12),
        },
        monthlySavings,
        categoryBreakdown: Object.values(categoryMap),
        recentTransactions: enriched.slice(0, 10),
        suggestions
      }
    });
  } catch (err) {
    console.error('finance dashboard error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch financial data' });
  }
});

// ─── POST /api/finance/calculate ─────────────────────────────────────────────
// Smart savings calculator
router.post('/calculate', async (req, res) => {
  try {
    const {
      materialType,
      quantity,
      symbioPricePerUnit,
      logisticsCost = 0,
      handlingCost = 0,
      creditDays = 0
    } = req.body;

    const qty = parseFloat(quantity) || 1;
    const symbioPrice = parseFloat(symbioPricePerUnit) || 0;
    const logistics = parseFloat(logisticsCost) || 0;
    const handling = parseFloat(handlingCost) || 0;
    const marketPrice = getMarketPrice(materialType);

    const landedCostPerUnit = symbioPrice + (logistics / qty) + (handling / qty);
    const landedCostTotal = landedCostPerUnit * qty;
    const marketTotal = marketPrice * qty;
    const savedPerUnit = Math.max(0, marketPrice - landedCostPerUnit);
    const totalSaved = Math.max(0, marketTotal - landedCostTotal);
    const savingsPct = marketTotal > 0 ? ((totalSaved / marketTotal) * 100).toFixed(1) : 0;
    const annualizedSavings = totalSaved * 12;

    // Working capital: interest cost saved during credit period
    const interestRate = 0.12; // 12% annual
    const capitalBenefit = creditDays > 0
      ? (landedCostTotal * interestRate * creditDays) / 365
      : 0;

    res.json({
      success: true,
      data: {
        materialType,
        quantity: qty,
        marketPricePerUnit: marketPrice,
        marketTotal,
        symbioPricePerUnit: symbioPrice,
        logisticsCostTotal: logistics,
        handlingCostTotal: handling,
        landedCostPerUnit: parseFloat(landedCostPerUnit.toFixed(2)),
        landedCostTotal: parseFloat(landedCostTotal.toFixed(2)),
        savedPerUnit: parseFloat(savedPerUnit.toFixed(2)),
        totalSaved: parseFloat(totalSaved.toFixed(2)),
        savingsPct: parseFloat(savingsPct),
        annualizedSavings: parseFloat(annualizedSavings.toFixed(2)),
        creditDays,
        capitalBenefit: parseFloat(capitalBenefit.toFixed(2))
      }
    });
  } catch (err) {
    console.error('finance calculate error:', err);
    res.status(500).json({ success: false, error: 'Calculation failed' });
  }
});

// ─── GET /api/finance/vendor-comparison ──────────────────────────────────────
router.get('/vendor-comparison', async (req, res) => {
  try {
    const userId = req.user.id;

    const txRes = await pool.query(`
      SELECT t.total_value, t.quantity, wl.material_type, wl.category,
             seller.location, co2_reduction_tons
      FROM transactions t
      JOIN waste_listings wl ON t.waste_listing_id = wl.id
      JOIN industries seller ON t.seller_id = seller.id
      WHERE t.buyer_id = $1
      LIMIT 20
    `, [userId]);

    const comparisons = txRes.rows.map(t => {
      const qty = parseFloat(t.quantity) || 1;
      const pricePaid = parseFloat(t.total_value) || 0;
      const pricePerUnit = qty > 0 ? pricePaid / qty : 0;
      const marketPrice = getMarketPrice(t.material_type);
      const traditionalLogistics = 1500; // avg long-distance logistics per ton
      const symbioLogistics = 600;       // avg local logistics per ton
      const traditionalTotal = (marketPrice + traditionalLogistics) * qty;
      const symbioTotal = pricePaid + symbioLogistics * qty;
      return {
        materialType: t.material_type,
        category: t.category,
        quantity: qty,
        traditional: {
          materialCost: Math.round(marketPrice * qty),
          logistics: Math.round(traditionalLogistics * qty),
          total: Math.round(traditionalTotal)
        },
        symbiotech: {
          materialCost: Math.round(pricePaid),
          logistics: Math.round(symbioLogistics * qty),
          total: Math.round(symbioTotal)
        },
        saving: Math.round(traditionalTotal - symbioTotal),
        co2Saved: parseFloat(t.co2_reduction_tons) || 0
      };
    });

    res.json({ success: true, data: comparisons });
  } catch (err) {
    console.error('vendor-comparison error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch vendor comparison' });
  }
});

// ─── GET /api/finance/platform-stats (admin overview) ────────────────────────
router.get('/platform-stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(id) as total_transactions,
        SUM(total_value) as total_volume,
        SUM(co2_reduction_tons) as total_co2,
        SUM(waste_diverted_tons) as total_waste,
        COUNT(DISTINCT buyer_id) as unique_buyers,
        COUNT(DISTINCT seller_id) as unique_sellers
      FROM transactions
    `);

    const r = result.rows[0];
    const totalVolume = parseFloat(r.total_volume) || 0;
    // Estimate platform savings as ~24% avg savings on transactions
    const estimatedSavings = totalVolume * 0.24;
    const carbonCreditValue = (parseFloat(r.total_co2) || 0) * 1500; // ₹1500/ton carbon credit

    res.json({
      success: true,
      data: {
        totalTransactions: parseInt(r.total_transactions) || 0,
        totalVolume: Math.round(totalVolume),
        estimatedSavings: Math.round(estimatedSavings),
        totalCo2Reduced: parseFloat(r.total_co2) || 0,
        totalWasteDiverted: parseFloat(r.total_waste) || 0,
        uniqueBuyers: parseInt(r.unique_buyers) || 0,
        uniqueSellers: parseInt(r.unique_sellers) || 0,
        carbonCreditValue: Math.round(carbonCreditValue),
        workingCapitalPreserved: Math.round(totalVolume * 0.3)
      }
    });
  } catch (err) {
    console.error('platform-stats error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch platform stats' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool, authenticateToken } = require('../models/database');

router.use(authenticateToken);

// ─── GET /api/transactions ───────────────────────────────────────────────────
// List all transactions where the user is either the buyer or the seller
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { role = 'all', limit = 50, offset = 0 } = req.query;

    let where = '';
    const params = [userId];
    let c = 2;

    if (role === 'buyer') {
      where = 'WHERE t.buyer_id = $1';
    } else if (role === 'seller') {
      where = 'WHERE t.seller_id = $1';
    } else {
      where = 'WHERE (t.buyer_id = $1 OR t.seller_id = $1)';
    }

    const query = `
      SELECT t.*,
             wl.material_type, wl.unit, wl.category,
             seller.company_name as seller_name, seller.industry_type as seller_type, seller.contact_phone as seller_phone, seller.contact_email as seller_email,
             buyer.company_name as buyer_name, buyer.industry_type as buyer_type, buyer.contact_phone as buyer_phone, buyer.contact_email as buyer_email
      FROM transactions t
      JOIN waste_listings wl ON t.waste_listing_id = wl.id
      JOIN industries seller ON t.seller_id = seller.id
      JOIN industries buyer  ON t.buyer_id  = buyer.id
      ${where}
      ORDER BY t.completed_at DESC
      LIMIT $${c++} OFFSET $${c}
    `;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows.map(r => ({
        id:              r.id,
        tradeRequestId:  r.trade_request_id,
        wasteListingId:  r.waste_listing_id,
        materialType:    r.material_type,
        category:        r.category,
        quantity:        parseFloat(r.quantity),
        unit:            r.unit,
        totalValue:      parseFloat(r.total_value),
        role:            r.buyer_id === userId ? 'buyer' : 'seller',
        seller: { id: r.seller_id, name: r.seller_name, type: r.seller_type, phone: r.seller_phone, email: r.seller_email },
        buyer:  { id: r.buyer_id,  name: r.buyer_name,  type: r.buyer_type, phone: r.buyer_phone, email: r.buyer_email },
        impact: {
          co2ReductionTons:  parseFloat(r.co2_reduction_tons),
          wasteDivertedTons: parseFloat(r.waste_diverted_tons),
          waterSavedLiters:  parseFloat(r.water_saved_liters),
          energySavedMwh:    parseFloat(r.energy_saved_mwh)
        },
        completedAt: r.completed_at
      }))
    });
  } catch (err) {
    console.error('transactions GET error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
});

// ─── GET /api/transactions/dashboard ─────────────────────────────────────────
// Aggregate earnings/spending statistics for the authenticated user
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;

    const statsRes = await pool.query(`
      SELECT
        COUNT(id) FILTER (WHERE seller_id = $1) as sales_count,
        SUM(total_value) FILTER (WHERE seller_id = $1) as total_earned,
        COUNT(id) FILTER (WHERE buyer_id = $1) as purchases_count,
        SUM(total_value) FILTER (WHERE buyer_id = $1) as total_spent,
        SUM(co2_reduction_tons) as total_co2_reduced,
        SUM(waste_diverted_tons) as total_waste_diverted
      FROM transactions
      WHERE seller_id = $1 OR buyer_id = $1
    `, [userId]);

    const r = statsRes.rows[0];

    // Fetch monthly breakdown for the last 6 months (as seller)
    const monthlySales = await pool.query(`
      SELECT DATE_TRUNC('month', completed_at) as month, SUM(total_value) as revenue
      FROM transactions
      WHERE seller_id = $1 AND completed_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY month
      ORDER BY month ASC
    `, [userId]);

    res.json({
      success: true,
      data: {
        sales: {
          count: parseInt(r.sales_count) || 0,
          totalEarned: parseFloat(r.total_earned) || 0,
          averageValue: parseInt(r.sales_count) > 0 ? (parseFloat(r.total_earned) / parseInt(r.sales_count)) : 0
        },
        purchases: {
          count: parseInt(r.purchases_count) || 0,
          totalSpent: parseFloat(r.total_spent) || 0,
          averageValue: parseInt(r.purchases_count) > 0 ? (parseFloat(r.total_spent) / parseInt(r.purchases_count)) : 0
        },
        impact: {
          co2Reduced: parseFloat(r.total_co2_reduced) || 0,
          wasteDiverted: parseFloat(r.total_waste_diverted) || 0
        },
        monthlyRevenue: monthlySales.rows.map(m => ({
          month: m.month,
          revenue: parseFloat(m.revenue) || 0
        }))
      }
    });

  } catch (err) {
    console.error('transactions dashboard GET error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch transaction dashboard data' });
  }
});

// ─── GET /api/transactions/:id ───────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT t.*,
              wl.material_type, wl.unit, wl.category, wl.description as listing_description,
              seller.company_name as seller_name, seller.contact_email as seller_email, seller.contact_phone as seller_phone, seller.location as seller_location,
              buyer.company_name  as buyer_name,  buyer.contact_email as buyer_email, buyer.contact_phone as buyer_phone, buyer.location as buyer_location
       FROM transactions t
       JOIN waste_listings wl ON t.waste_listing_id = wl.id
       JOIN industries seller ON t.seller_id = seller.id
       JOIN industries buyer  ON t.buyer_id  = buyer.id
       WHERE t.id = $1 AND (t.seller_id = $2 OR t.buyer_id = $2)`,
      [req.params.id, userId]
    );

    if (!result.rows.length)
      return res.status(404).json({ success: false, error: 'Transaction not found' });

    const r = result.rows[0];
    res.json({
      success: true,
      data: {
        id:              r.id,
        tradeRequestId:  r.trade_request_id,
        wasteListingId:  r.waste_listing_id,
        materialType:    r.material_type,
        category:        r.category,
        listingDescription: r.listing_description,
        quantity:        parseFloat(r.quantity),
        unit:            r.unit,
        totalValue:      parseFloat(r.total_value),
        role:            r.buyer_id === userId ? 'buyer' : 'seller',
        seller: { id: r.seller_id, name: r.seller_name, email: r.seller_email, phone: r.seller_phone, location: r.seller_location },
        buyer:  { id: r.buyer_id,  name: r.buyer_name,  email: r.buyer_email, phone: r.buyer_phone, location: r.buyer_location },
        impact: {
          co2ReductionTons:  parseFloat(r.co2_reduction_tons),
          wasteDivertedTons: parseFloat(r.waste_diverted_tons),
          waterSavedLiters:  parseFloat(r.water_saved_liters),
          energySavedMwh:    parseFloat(r.energy_saved_mwh)
        },
        completedAt: r.completed_at
      }
    });

  } catch (err) {
    console.error('transactions GET/:id error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch transaction details' });
  }
});

module.exports = router;

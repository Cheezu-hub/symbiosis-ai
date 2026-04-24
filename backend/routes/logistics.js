const express = require('express');
const router = express.Router();
const { pool, authenticateToken } = require('../models/database');

router.use(authenticateToken);

// Mock Vendors Data (simulating AI Vendor Recommendation)
const VENDORS = [
  { id: 'v1', name: 'FastTrack Freight', type: 'Express Delivery', costPerKm: 45, rating: 4.8, co2Rating: 'B', available: true },
  { id: 'v2', name: 'EcoLogistics', type: 'Green Transport', costPerKm: 50, rating: 4.6, co2Rating: 'A+', available: true },
  { id: 'v3', name: 'HeavyHaul Co.', type: 'Bulk Carrier', costPerKm: 38, rating: 4.3, co2Rating: 'C', available: true },
  { id: 'v4', name: 'Prime Transports', type: 'Standard Delivery', costPerKm: 42, rating: 4.5, co2Rating: 'B', available: false },
];

// ─── GET /api/logistics/dashboard ─────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch transactions needing logistics or with logistics (for now, fetch all transactions where user is buyer)
    const txRes = await pool.query(`
      SELECT t.*, wl.material_type, wl.unit, wl.category,
             seller.company_name as seller_name, seller.location as seller_location,
             buyer.company_name  as buyer_name,  buyer.location as buyer_location
      FROM transactions t
      JOIN waste_listings wl ON t.waste_listing_id = wl.id
      JOIN industries seller ON t.seller_id = seller.id
      JOIN industries buyer  ON t.buyer_id  = buyer.id
      WHERE t.buyer_id = $1 OR t.seller_id = $1
      ORDER BY t.completed_at DESC
    `, [userId]);

    const transactions = txRes.rows;

    let totalSpent = 0;
    let totalSaved = 0; // Simulated savings from route optimization
    let co2Reduced = 0;
    let onTimeDeliveries = 0;

    const shipments = transactions.map(t => {
      // Simulate logistics details per transaction
      const distance = Math.floor(Math.random() * 500) + 50; // 50 to 550 km
      const cost = distance * 40; // 40 INR per km avg
      const saved = distance * 5; // 5 INR per km saved by optimization
      const statusOptions = ['Delivered', 'In Transit', 'Booking Confirmed', 'Pending Booking'];
      const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      
      if (status === 'Delivered' && Math.random() > 0.1) onTimeDeliveries++;
      
      totalSpent += cost;
      totalSaved += saved;
      co2Reduced += (distance * 0.05); // Simulated CO2 reduction

      return {
        id: t.id,
        materialType: t.material_type,
        quantity: parseFloat(t.quantity),
        unit: t.unit,
        origin: t.seller_location,
        destination: t.buyer_location,
        distance,
        cost,
        saved,
        status,
        date: t.completed_at
      };
    });

    const deliveredCount = shipments.filter(s => s.status === 'Delivered').length;
    const onTimePct = deliveredCount > 0 ? ((onTimeDeliveries / deliveredCount) * 100).toFixed(1) : 0;

    // Suggestions
    const suggestions = [
      { icon: '🚚', title: 'Shared Load Opportunity', desc: 'Combine your upcoming steel scrap shipment with another local delivery to save 25% on freight.' },
      { icon: '🌿', title: 'Eco-Route Available', desc: 'Choose EcoLogistics for your next route to reduce transport emissions by 30%.' },
      { icon: '⏱️', title: 'Delay Alert', desc: 'Traffic congestion on Route 42. Suggesting alternate route for active shipment #1042.' }
    ];

    res.json({
      success: true,
      data: {
        kpis: {
          activeShipments: shipments.filter(s => s.status !== 'Delivered' && s.status !== 'Pending Booking').length,
          completedShipments: deliveredCount,
          totalLogisticsSpend: Math.round(totalSpent),
          avgFreightSavings: Math.round(totalSaved),
          onTimeDeliveryPct: parseFloat(onTimePct),
          co2ReducedRoutes: parseFloat(co2Reduced.toFixed(1))
        },
        recentShipments: shipments.slice(0, 8),
        suggestions
      }
    });

  } catch (err) {
    console.error('logistics dashboard error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch logistics data' });
  }
});

// ─── GET /api/logistics/recommend-vendors ──────────────────────────────────
router.get('/recommend-vendors', async (req, res) => {
  try {
    const { distance = 200, weight = 10 } = req.query;
    
    // Simple AI recommendation scoring logic based on distance and weight
    const recommended = VENDORS.filter(v => v.available).map(v => {
      const baseCost = v.costPerKm * parseFloat(distance);
      let totalCost = baseCost;
      let score = 100;
      let tag = '';

      if (v.id === 'v1') { totalCost *= 1.2; score -= 5; tag = 'Fastest'; } // Express is more expensive
      if (v.id === 'v2') { score += 10; tag = 'Lowest Carbon'; } // Eco gets points
      if (v.id === 'v3') { 
        if (parseFloat(weight) > 20) { totalCost *= 0.8; score += 15; tag = 'Best for Bulk'; } // Bulk is cheaper for heavy
        else { totalCost *= 1.5; score -= 20; }
      }

      // Add a slight randomness to score to simulate complex AI
      score += Math.random() * 5 - 2.5;

      return {
        ...v,
        totalCost: Math.round(totalCost),
        score: parseFloat(score.toFixed(1)),
        tag,
        estimatedDeliveryDays: v.id === 'v1' ? 1 : (v.id === 'v3' ? 4 : 2)
      };
    }).sort((a, b) => b.score - a.score);

    res.json({ success: true, data: recommended });
  } catch (err) {
    console.error('vendor recommendation error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
  }
});

// ─── POST /api/logistics/book ────────────────────────────────────────────────
router.post('/book', async (req, res) => {
  try {
    const { transactionId, vendorId, routeType } = req.body;
    // In a real app, update transaction record or create a shipment record
    res.json({ success: true, message: 'Shipment booked successfully', data: { transactionId, vendorId, status: 'Booking Confirmed' } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to book shipment' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool, authenticateToken } = require('../models/database');
const emailService = require('../services/emailService');
const scoringService = require('../services/scoringService');

router.use(authenticateToken);

// ─── GET /api/trade-requests ─────────────────────────────────────────────────
// List all trade requests for the authenticated user (incoming + outgoing)
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { direction = 'all', status } = req.query;

    let where = '';
    const params = [userId];
    let c = 2;

    if (direction === 'incoming') {
      where = 'WHERE tr.receiver_id = $1';
    } else if (direction === 'outgoing') {
      where = 'WHERE tr.sender_id = $1';
    } else {
      where = 'WHERE (tr.sender_id = $1 OR tr.receiver_id = $1)';
    }

    if (status) {
      where += ` AND tr.status = $${c++}`;
      params.push(status);
    }

    const result = await pool.query(
      `SELECT tr.*,
              wl.material_type, wl.quantity as listing_quantity, wl.unit, wl.location as listing_location,
              wl.price_per_unit, wl.category,
              sender.company_name   as sender_name,   sender.contact_email   as sender_email,   sender.location as sender_location,
              receiver.company_name as receiver_name, receiver.contact_email as receiver_email, receiver.location as receiver_location
       FROM trade_requests tr
       JOIN waste_listings wl ON tr.waste_listing_id = wl.id
       JOIN industries sender   ON tr.sender_id   = sender.id
       JOIN industries receiver ON tr.receiver_id = receiver.id
       ${where}
       ORDER BY tr.created_at DESC`,
      params
    );

    res.json({
      success: true,
      data: result.rows.map(r => ({
        id:                r.id,
        wasteListingId:    r.waste_listing_id,
        materialType:      r.material_type,
        listingQuantity:   parseFloat(r.listing_quantity),
        quantityRequested: parseFloat(r.quantity_requested),
        unit:              r.unit,
        listingLocation:   r.listing_location,
        pricePerUnit:      parseFloat(r.price_per_unit) || 0,
        category:          r.category,
        resourceRequestId: r.resource_request_id,
        resourceMaterial:  r.resource_material,
        message:           r.message,
        status:            r.status,
        aiMatchScore:      r.ai_match_score ? parseFloat(r.ai_match_score) : null,
        direction:         r.sender_id === userId ? 'outgoing' : 'incoming',
        sender:   { id: r.sender_id,   name: r.sender_name,   email: r.sender_email,   location: r.sender_location },
        receiver: { id: r.receiver_id, name: r.receiver_name, email: r.receiver_email, location: r.receiver_location },
        respondedAt: r.responded_at,
        createdAt:   r.created_at,
        updatedAt:   r.updated_at
      }))
    });
  } catch (err) {
    console.error('trade-requests GET error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch trade requests' });
  }
});

// ─── GET /api/trade-requests/:id ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT tr.*,
              wl.material_type, wl.description as listing_description,
              wl.quantity as listing_quantity, wl.unit, wl.location as listing_location,
              wl.price_per_unit, wl.category, wl.status as listing_status,
              sender.company_name   as sender_name,   sender.contact_email as sender_email,
              sender.industry_type  as sender_type,   sender.location      as sender_location,
              receiver.company_name as receiver_name, receiver.contact_email as receiver_email,
              receiver.industry_type as receiver_type, receiver.location   as receiver_location
       FROM trade_requests tr
       JOIN waste_listings wl ON tr.waste_listing_id = wl.id
       JOIN industries sender   ON tr.sender_id   = sender.id
       JOIN industries receiver ON tr.receiver_id = receiver.id
       WHERE tr.id = $1 AND (tr.sender_id = $2 OR tr.receiver_id = $2)`,
      [req.params.id, userId]
    );

    if (!result.rows.length)
      return res.status(404).json({ success: false, error: 'Trade request not found' });

    const r = result.rows[0];
    res.json({
      success: true,
      data: {
        id:                r.id,
        wasteListingId:    r.waste_listing_id,
        materialType:      r.material_type,
        listingDescription:r.listing_description,
        listingQuantity:   parseFloat(r.listing_quantity),
        quantityRequested: parseFloat(r.quantity_requested),
        unit:              r.unit,
        listingLocation:   r.listing_location,
        listingStatus:     r.listing_status,
        pricePerUnit:      parseFloat(r.price_per_unit) || 0,
        category:          r.category,
        message:           r.message,
        status:            r.status,
        aiMatchScore:      r.ai_match_score ? parseFloat(r.ai_match_score) : null,
        direction:         r.sender_id === userId ? 'outgoing' : 'incoming',
        sender:   { id: r.sender_id,   name: r.sender_name,   email: r.sender_email,   type: r.sender_type,   location: r.sender_location },
        receiver: { id: r.receiver_id, name: r.receiver_name, email: r.receiver_email, type: r.receiver_type, location: r.receiver_location },
        respondedAt: r.responded_at,
        createdAt:   r.created_at
      }
    });
  } catch (err) {
    console.error('trade-requests GET/:id error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch trade request' });
  }
});

// ─── POST /api/trade-requests ────────────────────────────────────────────────
// Create a new trade request (sender → listing owner)
router.post('/', async (req, res) => {
  try {
    const senderId = req.user.id;
    const { wasteListingId, quantityRequested, message, pricePerUnit } = req.body;

    if (!wasteListingId || !quantityRequested)
      return res.status(400).json({ success: false, error: 'wasteListingId and quantityRequested are required' });

    // Validate the listing exists and is available
    const listingRes = await pool.query(
      `SELECT wl.*, i.company_name as owner_name, i.contact_email as owner_email, i.location as owner_location
       FROM waste_listings wl JOIN industries i ON wl.industry_id = i.id
       WHERE wl.id = $1`,
      [wasteListingId]
    );
    if (!listingRes.rows.length)
      return res.status(404).json({ success: false, error: 'Waste listing not found' });

    const listing = listingRes.rows[0];

    if (listing.status !== 'available')
      return res.status(400).json({ success: false, error: 'Listing is no longer available' });

    if (listing.industry_id === senderId)
      return res.status(400).json({ success: false, error: 'Cannot request your own listing' });

    // Check for existing pending request from same sender for same listing
    const dupCheck = await pool.query(
      `SELECT id FROM trade_requests WHERE waste_listing_id = $1 AND sender_id = $2 AND status = 'pending'`,
      [wasteListingId, senderId]
    );
    if (dupCheck.rows.length > 0)
      return res.status(400).json({ success: false, error: 'You already have a pending request for this listing' });

    // Get sender info for AI scoring and notification
    const senderRes = await pool.query(
      'SELECT id, company_name, contact_email, location, industry_type FROM industries WHERE id = $1',
      [senderId]
    );
    const sender = senderRes.rows[0];

    // Compute AI match score for this trade pair
    let aiScore = null;
    try {
      const tradeScore = scoringService.computeTradeScore(listing, {
        material_needed: listing.material_type,
        location: sender.location,
        price_per_unit: listing.price_per_unit
      });
      aiScore = tradeScore.compositeScore;
    } catch (_) {}

    const receiverId = listing.industry_id;
    // Use negotiated price if provided, otherwise fall back to listing price
    const effectivePrice = (pricePerUnit !== undefined && pricePerUnit !== null && pricePerUnit !== '')
      ? parseFloat(pricePerUnit)
      : parseFloat(listing.price_per_unit) || 0;

    const result = await pool.query(
      `INSERT INTO trade_requests (waste_listing_id, sender_id, receiver_id, quantity_requested, message, ai_match_score, price_per_unit)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [wasteListingId, senderId, receiverId, quantityRequested, message || null, aiScore, effectivePrice]
    );
    const tradeRequest = result.rows[0];

    // Create in-app notification for receiver
    await pool.query(
      `INSERT INTO notifications (industry_id, type, title, message, reference_id)
       VALUES ($1, 'trade_request', $2, $3, $4)`,
      [
        receiverId,
        `New trade request from ${sender.company_name}`,
        `${sender.company_name} wants to trade ${quantityRequested} units of ${listing.material_type}${message ? ': ' + message : ''}`,
        tradeRequest.id
      ]
    );

    // Send email notification (non-blocking)
    emailService.sendTradeRequestEmail(
      listing.owner_email,
      sender.company_name,
      { materialType: listing.material_type, quantity: quantityRequested, id: wasteListingId },
      tradeRequest.id
    ).catch(err => console.error('Email send error:', err));

    res.status(201).json({
      success: true,
      message: 'Trade request sent successfully',
      data: {
        id:                tradeRequest.id,
        wasteListingId:    tradeRequest.waste_listing_id,
        status:            tradeRequest.status,
        quantityRequested: parseFloat(tradeRequest.quantity_requested),
        aiMatchScore:      aiScore,
        createdAt:         tradeRequest.created_at
      }
    });
  } catch (err) {
    console.error('trade-requests POST error:', err);
    res.status(500).json({ success: false, error: 'Failed to create trade request' });
  }
});

// ─── POST /api/trade-requests/:id/accept ─────────────────────────────────────
router.post('/:id/accept', async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await client.query('BEGIN');

    // Fetch request with full context
    const reqRes = await client.query(
      `SELECT tr.*,
              wl.material_type, wl.price_per_unit as listing_price_per_unit, wl.industry_id as listing_owner_id,
              sender.company_name as sender_name, sender.contact_email as sender_email,
              receiver.company_name as receiver_name
       FROM trade_requests tr
       JOIN waste_listings wl ON tr.waste_listing_id = wl.id
       JOIN industries sender   ON tr.sender_id   = sender.id
       JOIN industries receiver ON tr.receiver_id = receiver.id
       WHERE tr.id = $1`,
      [id]
    );

    if (!reqRes.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Trade request not found' });
    }

    const tr = reqRes.rows[0];

    if (tr.receiver_id !== userId)
      return res.status(403).json({ success: false, error: 'Only the receiver can accept this request' });

    if (tr.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: `Request is already ${tr.status}` });
    }

    // 1. Update request status
    await client.query(
      `UPDATE trade_requests SET status = 'accepted', responded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );

    // 2. Mark waste listing as reserved
    await client.query(
      `UPDATE waste_listings SET status = 'reserved', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [tr.waste_listing_id]
    );

    // 3. Reject all other pending requests for the same listing
    await client.query(
      `UPDATE trade_requests SET status = 'rejected', responded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE waste_listing_id = $1 AND id != $2 AND status = 'pending'`,
      [tr.waste_listing_id, id]
    );

    // 4. Compute environmental impact
    const impact = scoringService.estimateEnvironmentalImpact(tr.material_type, parseFloat(tr.quantity_requested) || 0);
    // Use the negotiated price from the trade request; fall back to listing price if zero
    const negotiatedPrice = parseFloat(tr.price_per_unit) || 0;
    const listingPrice   = parseFloat(tr.listing_price_per_unit) || 0;
    const unitPrice  = negotiatedPrice > 0 ? negotiatedPrice : listingPrice;
    const totalValue = unitPrice * parseFloat(tr.quantity_requested);

    // 5. Create transaction record
    const txRes = await client.query(
      `INSERT INTO transactions (trade_request_id, waste_listing_id, seller_id, buyer_id, quantity, total_value,
                                  co2_reduction_tons, water_saved_liters, energy_saved_mwh, waste_diverted_tons)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [
        id, tr.waste_listing_id, tr.receiver_id, tr.sender_id,
        tr.quantity_requested, totalValue,
        impact.co2ReductionTons, impact.waterSavedLiters, impact.energySavedMwh, impact.wasteDivertedTons
      ]
    );

    // 6. Record impact metrics for both companies
    const today = new Date().toISOString().split('T')[0];
    for (const industryId of [tr.sender_id, tr.receiver_id]) {
      await client.query(
        `INSERT INTO impact_metrics (industry_id, co2_reduced_tons, waste_diverted_tons, water_saved_liters, energy_saved_mwh, recorded_date)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (industry_id, recorded_date) DO UPDATE SET
           co2_reduced_tons    = impact_metrics.co2_reduced_tons    + EXCLUDED.co2_reduced_tons,
           waste_diverted_tons = impact_metrics.waste_diverted_tons + EXCLUDED.waste_diverted_tons,
           water_saved_liters  = impact_metrics.water_saved_liters  + EXCLUDED.water_saved_liters,
           energy_saved_mwh    = impact_metrics.energy_saved_mwh    + EXCLUDED.energy_saved_mwh`,
        [industryId, impact.co2ReductionTons, impact.wasteDivertedTons, impact.waterSavedLiters, impact.energySavedMwh, today]
      );
    }

    // 7. Notify sender
    await client.query(
      `INSERT INTO notifications (industry_id, type, title, message, reference_id)
       VALUES ($1, 'trade_accepted', $2, $3, $4)`,
      [
        tr.sender_id,
        `Trade accepted by ${tr.receiver_name}`,
        `Your request for ${tr.material_type} has been accepted. Transaction #${txRes.rows[0].id} has been created.`,
        id
      ]
    );

    await client.query('COMMIT');

    // Email sender (non-blocking)
    emailService.sendTradeAcceptedEmail(
      tr.sender_email, tr.receiver_name,
      { materialType: tr.material_type, quantity: tr.quantity_requested }
    ).catch(e => console.error('Email error:', e));

    res.json({
      success: true,
      message: 'Trade request accepted',
      data: { transactionId: txRes.rows[0].id, impact }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('trade-requests accept error:', err);
    res.status(500).json({ success: false, error: 'Failed to accept trade request' });
  } finally {
    client.release();
  }
});

// ─── POST /api/trade-requests/:id/reject ─────────────────────────────────────
router.post('/:id/reject', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    const reqRes = await pool.query(
      `SELECT tr.*, sender.company_name as sender_name, sender.contact_email as sender_email,
              receiver.company_name as receiver_name, wl.material_type
       FROM trade_requests tr
       JOIN industries sender   ON tr.sender_id   = sender.id
       JOIN industries receiver ON tr.receiver_id = receiver.id
       JOIN waste_listings wl ON tr.waste_listing_id = wl.id
       WHERE tr.id = $1`,
      [id]
    );

    if (!reqRes.rows.length)
      return res.status(404).json({ success: false, error: 'Trade request not found' });

    const tr = reqRes.rows[0];

    if (tr.receiver_id !== userId)
      return res.status(403).json({ success: false, error: 'Only the receiver can reject this request' });

    if (tr.status !== 'pending')
      return res.status(400).json({ success: false, error: `Request is already ${tr.status}` });

    await pool.query(
      `UPDATE trade_requests SET status = 'rejected', responded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );

    // Notify sender
    await pool.query(
      `INSERT INTO notifications (industry_id, type, title, message, reference_id)
       VALUES ($1, 'trade_rejected', $2, $3, $4)`,
      [
        tr.sender_id,
        `Trade request declined by ${tr.receiver_name}`,
        `Your request for ${tr.material_type} was not accepted${reason ? ': ' + reason : ''}.`,
        id
      ]
    );

    emailService.sendTradeRejectedEmail(
      tr.sender_email, tr.receiver_name,
      { materialType: tr.material_type, quantity: tr.quantity_requested }
    ).catch(e => console.error('Email error:', e));

    res.json({ success: true, message: 'Trade request rejected' });
  } catch (err) {
    console.error('trade-requests reject error:', err);
    res.status(500).json({ success: false, error: 'Failed to reject trade request' });
  }
});

module.exports = router;

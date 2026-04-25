require('dotenv').config();
const { pool } = require('./models/database');
const scoringService = require('./services/scoringService');

async function fixMissingTransactions() {
  const client = await pool.connect();
  try {
    console.log('Finding accepted trade requests without transactions...');
    
    const missingTxQuery = await client.query(`
      SELECT tr.id as trade_request_id, tr.waste_listing_id, tr.sender_id, tr.receiver_id, tr.quantity_requested, tr.price_per_unit,
             wl.material_type, wl.price_per_unit as listing_price
      FROM trade_requests tr
      JOIN waste_listings wl ON tr.waste_listing_id = wl.id
      LEFT JOIN transactions tx ON tr.id = tx.trade_request_id
      WHERE tr.status = 'accepted' AND tx.id IS NULL
    `);
    
    console.log(`Found ${missingTxQuery.rows.length} missing transactions.`);
    
    for (const tr of missingTxQuery.rows) {
      console.log(`Fixing TR #${tr.trade_request_id}...`);
      
      const impact = scoringService.estimateEnvironmentalImpact(tr.material_type, parseFloat(tr.quantity_requested) || 0);
      const negotiatedPrice = parseFloat(tr.price_per_unit) || 0;
      const listingPrice   = parseFloat(tr.listing_price) || 0;
      const unitPrice  = negotiatedPrice > 0 ? negotiatedPrice : listingPrice;
      const totalValue = unitPrice * parseFloat(tr.quantity_requested);

      await client.query('BEGIN');
      
      await client.query(
          `INSERT INTO transactions (trade_request_id, waste_listing_id, seller_id, buyer_id, quantity, total_value,
                                      co2_reduction_tons, water_saved_liters, energy_saved_mwh, waste_diverted_tons)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
              tr.trade_request_id, tr.waste_listing_id, tr.receiver_id, tr.sender_id,
              tr.quantity_requested, totalValue,
              impact.co2ReductionTons, impact.waterSavedLiters, impact.energySavedMwh, impact.wasteDivertedTons
          ]
      );

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
      
      await client.query('COMMIT');
    }
    
    console.log('Done!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
  } finally {
    client.release();
    process.exit(0);
  }
}

fixMissingTransactions();

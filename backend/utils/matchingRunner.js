/**
 * matchingRunner.js
 * Scans all available waste listings against all active resource requests,
 * scores them with the AI engine, and persists high-quality matches to the DB.
 *
 * Call this after any waste listing or resource request is created/updated
 * so that the matches table stays current.
 */

const { pool }    = require('../models/database');
const aiEngine    = require('./aiEngine');

const MIN_SCORE   = 30;   // Only persist matches with score >= 30
const BATCH_SIZE  = 50;   // Max pairs to process per invocation

/**
 * Run the AI matching pass.
 * @returns {{ inserted: number, updated: number, skipped: number }}
 */
async function runMatching() {
  // ── 1. Fetch source data ──────────────────────────────────────────────────
  const [wasteRes, resourceRes] = await Promise.all([
    pool.query(`
      SELECT wl.*, i.company_name AS provider_name, i.industry_type, i.location AS company_location
      FROM   waste_listings wl
      JOIN   industries i ON wl.industry_id = i.id
      WHERE  wl.status = 'available'
      LIMIT  $1
    `, [BATCH_SIZE]),

    pool.query(`
      SELECT rr.*, i.company_name AS requester_name, i.industry_type, i.location AS company_location
      FROM   resource_requests rr
      JOIN   industries i ON rr.industry_id = i.id
      WHERE  rr.status = 'active'
      LIMIT  $1
    `, [BATCH_SIZE]),
  ]);

  const wasteListings    = wasteRes.rows;
  const resourceRequests = resourceRes.rows;

  let inserted = 0, updated = 0, skipped = 0;

  // ── 2. Score every waste × resource pair ─────────────────────────────────
  for (const w of wasteListings) {
    for (const r of resourceRequests) {
      // Never match a company with itself
      if (w.industry_id === r.industry_id) { skipped++; continue; }

      // Run AI scoring
      const score = aiEngine.computeSymbiosisScore(
        { materialType: w.material_type, quantity: w.quantity, location: w.location },
        {
          materialNeeded:  r.material_needed,
          quantity:        r.quantity,
          location:        r.location,
          industrySector:  r.industry_sector,
        }
      );

      if (score.totalScore < MIN_SCORE) { skipped++; continue; }

      // Estimate environmental impact
      const impact = aiEngine.estimateEnvironmentalImpact(
        w.material_type,
        Math.min(parseFloat(w.quantity) || 0, parseFloat(r.quantity) || 0)
      );

      // ── 3. Upsert into matches table ────────────────────────────────────
      // If a pending/active match already exists for this pair, update score.
      // If it was already accepted/rejected, leave it alone.
      const existing = await pool.query(`
        SELECT id, status FROM matches
        WHERE waste_listing_id = $1 AND resource_request_id = $2
        LIMIT 1
      `, [w.id, r.id]);

      if (existing.rows.length > 0) {
        const m = existing.rows[0];
        if (m.status === 'pending') {
          await pool.query(`
            UPDATE matches
            SET match_score        = $1,
                co2_reduction_tons = $2,
                cost_savings       = $3
            WHERE id = $4
          `, [score.totalScore, impact.co2ReductionTons, impact.costSavingsINR, m.id]);
          updated++;
        } else {
          skipped++;  // accepted/rejected — don't touch
        }
      } else {
        await pool.query(`
          INSERT INTO matches
            (waste_listing_id, resource_request_id, match_score, co2_reduction_tons, cost_savings, status)
          VALUES ($1, $2, $3, $4, $5, 'pending')
        `, [w.id, r.id, score.totalScore, impact.co2ReductionTons, impact.costSavingsINR]);
        inserted++;
      }
    }
  }

  console.log(`[Matching] done — inserted=${inserted} updated=${updated} skipped=${skipped}`);
  return { inserted, updated, skipped };
}

module.exports = { runMatching };

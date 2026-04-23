/**
 * seed.js — Demo data seed for SymbioTech
 * Run:  node backend/seed.js
 *
 * Idempotent: skips rows whose contact_email already exists.
 * After inserting companies, it inserts matching waste listings + resource
 * requests, then runs the AI matching pass.
 */

require('dotenv').config();
const { pool } = require('./models/database');
const { runMatching } = require('./utils/matchingRunner');

// ─── 1. Demo companies ─────────────────────────────────────────────────────
const COMPANIES = [
  { company_name: 'Tata Steel Jamshedpur',      industry_type: 'Steel',           location: 'Jamshedpur, Jharkhand',   email: 'demo_tatasteel@symbio.dev',    score: 88 },
  { company_name: 'NTPC Dadri Power',            industry_type: 'Power',           location: 'Dadri, Uttar Pradesh',    email: 'demo_ntpc@symbio.dev',         score: 72 },
  { company_name: 'ACC Cement Works',            industry_type: 'Cement',          location: 'Wadi, Karnataka',         email: 'demo_acc@symbio.dev',          score: 81 },
  { company_name: 'Indian Oil Panipat',           industry_type: 'Petroleum',       location: 'Panipat, Haryana',        email: 'demo_ioc@symbio.dev',          score: 77 },
  { company_name: 'Vedanta Zinc Rajasthan',      industry_type: 'Mining',          location: 'Udaipur, Rajasthan',      email: 'demo_vedanta@symbio.dev',      score: 69 },
  { company_name: 'Godrej Agro Chemicals',       industry_type: 'Chemical',        location: 'Vapi, Gujarat',           email: 'demo_godrej@symbio.dev',       score: 83 },
  { company_name: 'Rathi TMT Steel',             industry_type: 'Steel',           location: 'Nagpur, Maharashtra',     email: 'demo_rathi@symbio.dev',        score: 65 },
  { company_name: 'Thermax Waste Energy',        industry_type: 'Energy',          location: 'Pune, Maharashtra',       email: 'demo_thermax@symbio.dev',      score: 91 },
  { company_name: 'Dalmia Bharat Cement',        industry_type: 'Cement',          location: 'Dalmiapuram, Tamil Nadu', email: 'demo_dalmia@symbio.dev',       score: 79 },
  { company_name: 'Reliance Petrochem',          industry_type: 'Petroleum',       location: 'Jamnagar, Gujarat',       email: 'demo_reliance@symbio.dev',     score: 85 },
  { company_name: 'JSPL Raigarh',               industry_type: 'Steel',           location: 'Raigarh, Chhattisgarh',  email: 'demo_jspl@symbio.dev',         score: 74 },
  { company_name: 'Hindalco Aluminium',          industry_type: 'Aluminium',       location: 'Renukoot, Uttar Pradesh', email: 'demo_hindalco@symbio.dev',     score: 80 },
  { company_name: 'GAIL Gas Vijaipur',           industry_type: 'Natural Gas',     location: 'Vijaipur, Madhya Pradesh',email: 'demo_gail@symbio.dev',         score: 70 },
  { company_name: 'UltraTech Cement Bhavnagar',  industry_type: 'Cement',          location: 'Bhavnagar, Gujarat',      email: 'demo_ultratech@symbio.dev',    score: 86 },
  { company_name: 'Rain Industries Hyderabad',   industry_type: 'Chemical',        location: 'Hyderabad, Telangana',    email: 'demo_rain@symbio.dev',         score: 76 },
];

// ─── 2. Waste listings per company (index matches COMPANIES array) ──────────
//   Each entry: { company_index, material_type, description, quantity, unit, price_per_unit, category }
const WASTE_LISTINGS = [
  { ci: 0,  material_type: 'Blast Furnace Slag',   description: 'Granulated BF slag, low sulphur',       quantity: 500,  unit: 'tons', price: 800,  category: 'slag' },
  { ci: 1,  material_type: 'Fly Ash',              description: 'Class F fly ash, low calcium',           quantity: 1200, unit: 'tons', price: 200,  category: 'ash' },
  { ci: 3,  material_type: 'Spent Catalyst',       description: 'Mo/Ni alumina spent catalyst from HDS',  quantity: 80,   unit: 'tons', price: 500,  category: 'chemical' },
  { ci: 4,  material_type: 'Zinc Slag',            description: 'Zinc-rich slag from smelting',           quantity: 150,  unit: 'tons', price: 600,  category: 'slag' },
  { ci: 5,  material_type: 'Sulphuric Acid',       description: 'Dilute sulphuric acid, 30% concentration',quantity: 200, unit: 'kL',   price: 400,  category: 'chemical' },
  { ci: 6,  material_type: 'Steel Slag',           description: 'Basic oxygen furnace (BOF) slag',        quantity: 300,  unit: 'tons', price: 700,  category: 'slag' },
  { ci: 7,  material_type: 'Waste Heat Steam',     description: 'Recovered steam at 150°C, 6 bar',        quantity: 5000, unit: 'GJ',   price: 100,  category: 'energy' },
  { ci: 9,  material_type: 'Petroleum Coke',       description: 'High-sulphur pet coke from coking unit', quantity: 600,  unit: 'tons', price: 2000, category: 'fuel' },
  { ci: 10, material_type: 'Steel Slag',           description: 'EAF slag from electric arc furnace',     quantity: 250,  unit: 'tons', price: 650,  category: 'slag' },
  { ci: 11, material_type: 'Bauxite Residue',      description: 'Red mud post-Bayer process',             quantity: 800,  unit: 'tons', price: 0,    category: 'residue' },
  { ci: 12, material_type: 'CO2 Off-gas',          description: 'Flue gas CO2 rich stream, 80% purity',   quantity: 3000, unit: 'tons', price: 150,  category: 'gas' },
  { ci: 13, material_type: 'Fly Ash',              description: 'High-calcium class C fly ash',           quantity: 900,  unit: 'tons', price: 180,  category: 'ash' },
  { ci: 14, material_type: 'Carbon Black',         description: 'Carbon black waste from carbon plants',   quantity: 120,  unit: 'tons', price: 1200, category: 'chemical' },
];

// ─── 3. Resource requests per company ──────────────────────────────────────
const RESOURCE_REQUESTS = [
  { ci: 2,  material_needed: 'Fly Ash',              description: 'Fly ash as clinker substitute',          quantity: 800,  unit: 'tons', price: 250,  sector: 'Cement' },
  { ci: 2,  material_needed: 'Blast Furnace Slag',   description: 'GGBS for blended cement production',     quantity: 400,  unit: 'tons', price: 900,  sector: 'Cement' },
  { ci: 7,  material_needed: 'Petroleum Coke',       description: 'Pet coke as supplementary fuel for boilers',quantity: 500, unit: 'tons', price: 2200, sector: 'Energy' },
  { ci: 8,  material_needed: 'Fly Ash',              description: 'SCM replacement for OPC',                quantity: 700,  unit: 'tons', price: 220,  sector: 'Cement' },
  { ci: 8,  material_needed: 'Steel Slag',           description: 'Ground granulated slag for cement blend', quantity: 200,  unit: 'tons', price: 750,  sector: 'Cement' },
  { ci: 11, material_needed: 'Fly Ash',              description: 'Fly ash for aluminium casting mold',     quantity: 100,  unit: 'tons', price: 300,  sector: 'Aluminium' },
  { ci: 13, material_needed: 'Steel Slag',           description: 'Aggregate replacement in concrete',       quantity: 350,  unit: 'tons', price: 700,  sector: 'Cement' },
  { ci: 5,  material_needed: 'Sulphuric Acid',       description: 'Dilute acid for fertiliser manufacture',  quantity: 180,  unit: 'kL',   price: 450,  sector: 'Chemical' },
  { ci: 14, material_needed: 'Spent Catalyst',       description: 'Metal recovery from spent catalysts',     quantity: 60,   unit: 'tons', price: 600,  sector: 'Chemical' },
  { ci: 0,  material_needed: 'Waste Heat Steam',     description: 'Process steam for pre-heating',          quantity: 4000, unit: 'GJ',   price: 120,  sector: 'Steel' },
  { ci: 6,  material_needed: 'Blast Furnace Slag',   description: 'BF slag for road ballast',               quantity: 200,  unit: 'tons', price: 850,  sector: 'Steel' },
  { ci: 4,  material_needed: 'Sulphuric Acid',       description: 'Acid for zinc leaching operations',      quantity: 150,  unit: 'kL',   price: 500,  sector: 'Mining' },
];

// ──────────────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Starting demo seed...\n');

  // Map company index → DB id
  const companyIds = [];

  for (const c of COMPANIES) {
    // Check if already exists
    const existing = await pool.query(
      'SELECT id FROM industries WHERE contact_email = $1', [c.email]
    );
    if (existing.rows.length > 0) {
      companyIds.push(existing.rows[0].id);
      console.log(`  ⏭  Skipped (exists):  ${c.company_name}`);
      continue;
    }

    const hashed = '$2b$10$demoHashNotUsedForLogin.placeholder'; // demo only, no login
    const r = await pool.query(
      `INSERT INTO industries
         (company_name, industry_type, location, contact_email, password_hash, sustainability_score)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id`,
      [c.company_name, c.industry_type, c.location, c.email, hashed, c.score]
    );
    companyIds.push(r.rows[0].id);
    console.log(`  ✅ Inserted company:   ${c.company_name}`);
  }

  // ─── Waste listings ─────────────────────────────────────────────────────
  console.log('\n📦 Inserting waste listings...');
  for (const w of WASTE_LISTINGS) {
    const industryId = companyIds[w.ci];

    // Idempotent: skip if listing already exists for this company/material
    const ex = await pool.query(
      'SELECT id FROM waste_listings WHERE industry_id=$1 AND material_type=$2 LIMIT 1',
      [industryId, w.material_type]
    );
    if (ex.rows.length > 0) { console.log(`  ⏭  Skip waste:  ${w.material_type}`); continue; }

    await pool.query(
      `INSERT INTO waste_listings
         (industry_id, material_type, description, quantity, unit, price_per_unit, category, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'available')`,
      [industryId, w.material_type, w.description, w.quantity, w.unit, w.price, w.category]
    );
    console.log(`  ✅ Waste listing:     ${w.material_type}  (${COMPANIES[w.ci].company_name})`);
  }

  // ─── Resource requests ───────────────────────────────────────────────────
  console.log('\n🔍 Inserting resource requests...');
  for (const rq of RESOURCE_REQUESTS) {
    const industryId = companyIds[rq.ci];

    const ex = await pool.query(
      'SELECT id FROM resource_requests WHERE industry_id=$1 AND material_needed=$2 LIMIT 1',
      [industryId, rq.material_needed]
    );
    if (ex.rows.length > 0) { console.log(`  ⏭  Skip request: ${rq.material_needed}`); continue; }

    await pool.query(
      `INSERT INTO resource_requests
         (industry_id, material_needed, description, quantity, unit, price_per_unit, industry_sector, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'active')`,
      [industryId, rq.material_needed, rq.description, rq.quantity, rq.unit, rq.price, rq.sector]
    );
    console.log(`  ✅ Resource request:  ${rq.material_needed}  (${COMPANIES[rq.ci].company_name})`);
  }

  // ─── Run AI matching ─────────────────────────────────────────────────────
  console.log('\n🤖 Running AI matching pass...');
  const result = await runMatching();
  console.log(`  ✅ Matching complete — inserted=${result.inserted} updated=${result.updated} skipped=${result.skipped}`);

  console.log('\n🎉 Seed complete!\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});

const scoringService = require('./backend/utils/aiEngine');
const { INDUSTRY_ACCEPTS } = require('./backend/utils/aiKnowledgeBase');

// Mock data
const cementCompany = { id: 1, company_name: 'Cement Corp', industry_type: 'Cement Industry', location: 'Mumbai' };
const textileCompany = { id: 2, company_name: 'Textile Hub', industry_type: 'Textile Industry', location: 'Mumbai' };

const wasteListings = [
  { id: 101, industry_id: 3, material_type: 'Fly Ash', status: 'available', location: 'Mumbai', provider_name: 'Power Plant' },
  { id: 102, industry_id: 4, material_type: 'Fabric Waste', status: 'available', location: 'Mumbai', provider_name: 'Garment Factory' }
];

const resourceReqs = [
  { id: 201, industry_id: 1, material_needed: 'Fly Ash', status: 'active', requester_name: 'Cement Corp', industry_sector: 'Cement Industry', location: 'Mumbai' },
  { id: 202, industry_id: 2, material_needed: 'Fabric Waste', status: 'active', requester_name: 'Textile Hub', industry_sector: 'Textile Industry', location: 'Mumbai' }
];

console.log('--- Testing Cement Company Recommendations ---');
const cementRecs = scoringService.generateTradeRecommendations(cementCompany, wasteListings, resourceReqs, { role: 'buyer' });
console.log(`Found ${cementRecs.length} recs for Cement Company.`);
cementRecs.forEach(r => console.log(`- ${r.wasteMaterial} from ${r.wasteProvider} (Score: ${r.compositeScore})`));

console.log('\n--- Testing Textile Company Recommendations ---');
const textileRecs = scoringService.generateTradeRecommendations(textileCompany, wasteListings, resourceReqs, { role: 'buyer' });
console.log(`Found ${textileRecs.length} recs for Textile Company.`);
textileRecs.forEach(r => console.log(`- ${r.wasteMaterial} from ${r.wasteProvider} (Score: ${r.compositeScore})`));

// Check if cross-industry matches are excluded
console.log('\n--- Cross-Industry Check ---');
const flyAshForTextile = scoringService.computeTradeScore(wasteListings[0], resourceReqs[1]);
console.log(`Fly Ash for Textile Score: ${flyAshForTextile.compositeScore} (Grade: ${flyAshForTextile.grade})`);

/**
 * SymbioNet AI Engine
 * Lightweight, rule-based AI logic for waste-to-resource intelligence.
 */

const {
  WASTE_REUSE_MAP, MATERIAL_ALIASES, MATERIAL_SIMILARITIES,
  IMPACT_COEFFICIENTS, DEFAULT_IMPACT, CITY_DISTANCES, INDUSTRY_ACCEPTS
} = require('./aiKnowledgeBase');

// ─── String Utilities ────────────────────────────────────────────────────────

function normalizeMaterial(name) {
  return (name || '').toLowerCase().trim().replace(/[\s_-]+/g, ' ');
}

function tokenize(str) {
  return normalizeMaterial(str).split(/\s+/).filter(Boolean);
}

function jaccardSimilarity(str1, str2) {
  const t1 = new Set(tokenize(str1));
  const t2 = new Set(tokenize(str2));
  if (t1.size === 0 && t2.size === 0) return 1;
  if (t1.size === 0 || t2.size === 0) return 0;
  const inter = new Set([...t1].filter(t => t2.has(t)));
  const union = new Set([...t1, ...t2]);
  return inter.size / union.size;
}

function containsAllTokens(str, query) {
  const sTokens = new Set(tokenize(str));
  return tokenize(query).every(t => [...sTokens].some(s => s.includes(t) || t.includes(s)));
}

// ─── Material Resolution ─────────────────────────────────────────────────────

function resolveMaterial(input) {
  const n = normalizeMaterial(input);
  if (WASTE_REUSE_MAP[n]) return { canonicalName: n, confidence: 1.0 };

  for (const [canonical, aliases] of Object.entries(MATERIAL_ALIASES)) {
    if (aliases.some(a => a === n || n.includes(a) || a.includes(n)))
      return { canonicalName: canonical, confidence: 0.92 };
  }

  let bestMatch = null, bestScore = 0;
  for (const key of Object.keys(WASTE_REUSE_MAP)) {
    let score = jaccardSimilarity(n, key);
    if (containsAllTokens(key, n) || containsAllTokens(n, key)) score = Math.max(score, 0.80);
    if (score > bestScore) { bestScore = score; bestMatch = key; }
  }
  for (const [canonical, aliases] of Object.entries(MATERIAL_ALIASES)) {
    for (const alias of aliases) {
      const score = jaccardSimilarity(n, alias);
      if (score > bestScore) { bestScore = score; bestMatch = canonical; }
    }
  }

  return bestMatch && bestScore >= 0.3
    ? { canonicalName: bestMatch, confidence: bestScore }
    : { canonicalName: null, confidence: 0 };
}

function getSimilarMaterials(materialName) {
  const n = normalizeMaterial(materialName);
  return MATERIAL_SIMILARITIES
    .filter(p => p.a === n || p.b === n)
    .map(p => ({ material: p.a === n ? p.b : p.a, similarity: p.similarity }))
    .sort((a, b) => b.similarity - a.similarity);
}

function computeMaterialSimilarity(m1, m2) {
  const r1 = resolveMaterial(m1), r2 = resolveMaterial(m2);
  if (!r1.canonicalName || !r2.canonicalName) return jaccardSimilarity(m1, m2);
  if (r1.canonicalName === r2.canonicalName) return 1.0;
  for (const p of MATERIAL_SIMILARITIES) {
    if ((p.a === r1.canonicalName && p.b === r2.canonicalName) ||
        (p.b === r1.canonicalName && p.a === r2.canonicalName)) return p.similarity;
  }
  const recs1 = WASTE_REUSE_MAP[r1.canonicalName] || [];
  const recs2 = WASTE_REUSE_MAP[r2.canonicalName] || [];
  const ind1 = new Set(recs1.map(r => r.industry));
  const shared = recs2.filter(r => ind1.has(r.industry)).length;
  return shared > 0 ? Math.min(0.4, shared * 0.1) : 0;
}

// ─── 1. Waste Reuse Recommendations ─────────────────────────────────────────

function getWasteRecommendations(wasteType) {
  const { canonicalName, confidence } = resolveMaterial(wasteType);
  if (!canonicalName || !WASTE_REUSE_MAP[canonicalName]) {
    return {
      wasteType, resolvedAs: null, confidence: 0, recommendations: [],
      message: `No recommendations found for "${wasteType}". Try: ${Object.keys(WASTE_REUSE_MAP).slice(0, 5).join(', ')}.`
    };
  }

  const recs = WASTE_REUSE_MAP[canonicalName].map(r => ({
    ...r, adjustedScore: Math.round(r.suitability * confidence)
  }));

  const similar = getSimilarMaterials(canonicalName);
  const extra = [];
  for (const { material, similarity } of similar.slice(0, 2)) {
    for (const rec of (WASTE_REUSE_MAP[material] || [])) {
      if (!recs.find(r => r.industry === rec.industry && r.application === rec.application)) {
        extra.push({ ...rec, adjustedScore: Math.round(rec.suitability * similarity * 0.7), fromSimilar: material });
      }
    }
  }

  return {
    wasteType, resolvedAs: canonicalName, confidence: Math.round(confidence * 100),
    recommendations: [...recs, ...extra].sort((a, b) => b.adjustedScore - a.adjustedScore).slice(0, 8),
    similarMaterials: similar.map(s => s.material)
  };
}

// ─── 2. Location Distance ───────────────────────────────────────────────────

function extractCity(loc) { return loc ? loc.split(',')[0].trim().toLowerCase() : ''; }

function estimateDistance(loc1, loc2) {
  const c1 = extractCity(loc1), c2 = extractCity(loc2);
  if (!c1 || !c2) return null;
  if (c1 === c2) return 0;
  return CITY_DISTANCES[`${c1}-${c2}`] || CITY_DISTANCES[`${c2}-${c1}`] || null;
}

// ─── 3. Symbiosis Score ─────────────────────────────────────────────────────

/**
 * Computes a composite symbiosis score between a waste listing and a resource request.
 * Weights: Material (40%), Quantity (25%), Location (20%), Reusability (15%)
 * 
 * @param {Object} waste - The waste listing object
 * @param {Object} resource - The resource request object
 * @returns {Object} Total score and detailed breakdown
 */
function computeSymbiosisScore(waste, resource) {
  const W = { material: 0.40, quantity: 0.25, location: 0.20, reusability: 0.15 };

  const matSim = computeMaterialSimilarity(waste.materialType || waste.material_type, resource.materialNeeded || resource.material_needed);
  const materialScore = Math.round(matSim * 100);

  const wq = parseFloat(waste.quantity) || 0, rq = parseFloat(resource.quantity) || 0;
  let quantityScore = 0;
  if (wq > 0 && rq > 0) {
    quantityScore = Math.round(Math.min(wq, rq) / Math.max(wq, rq) * 100);
    if (wq >= rq && wq <= rq * 1.5) quantityScore = Math.min(100, quantityScore + 15);
  }

  let locationScore = 50;
  const dist = estimateDistance(waste.location, resource.location);
  if (dist !== null) {
    if (dist === 0) locationScore = 100;
    else if (dist <= 50) locationScore = 95;
    else if (dist <= 100) locationScore = 85;
    else if (dist <= 200) locationScore = 70;
    else if (dist <= 500) locationScore = 50;
    else if (dist <= 1000) locationScore = 30;
    else locationScore = 15;
  }

  let reusabilityScore = 50;
  const resolved = resolveMaterial(waste.materialType || waste.material_type);
  if (resolved.canonicalName) {
    const recs = WASTE_REUSE_MAP[resolved.canonicalName] || [];
    const sector = normalizeMaterial(resource.industrySector || resource.industry_sector || '');
    for (const rec of recs) {
      const ri = normalizeMaterial(rec.industry);
      if (ri.includes(sector) || sector.includes(ri) || jaccardSimilarity(ri, sector) > 0.4) {
        reusabilityScore = rec.suitability; break;
      }
    }
    if (reusabilityScore === 50 && recs.length > 0)
      reusabilityScore = Math.round(recs.reduce((s, r) => s + r.suitability, 0) / recs.length);
  }

  const total = Math.min(100, Math.round(
    materialScore * W.material + quantityScore * W.quantity +
    locationScore * W.location + reusabilityScore * W.reusability
  ));

  return {
    totalScore: total,
    breakdown: { materialMatch: materialScore, quantityAlignment: quantityScore, locationProximity: locationScore, reusability: reusabilityScore },
    details: {
      materialSimilarity: `${materialScore}%`, estimatedDistance: dist !== null ? `${dist} km` : 'Unknown',
      quantityRatio: wq > 0 && rq > 0 ? `${(wq/rq*100).toFixed(0)}%` : 'N/A',
      reusabilityRating: reusabilityScore >= 80 ? 'Excellent' : reusabilityScore >= 60 ? 'Good' : reusabilityScore >= 40 ? 'Moderate' : 'Low'
    }
  };
}

// ─── 4. Smart Matching ──────────────────────────────────────────────────────

function findSmartMatches(wasteMaterial, wasteQty, wasteLoc, resourceRequests) {
  const matches = [];
  for (const res of resourceRequests) {
    const sim = computeMaterialSimilarity(wasteMaterial, res.material_needed || res.materialNeeded);
    if (sim < 0.2) continue;
    const score = computeSymbiosisScore(
      { materialType: wasteMaterial, quantity: wasteQty, location: wasteLoc },
      { materialNeeded: res.material_needed || res.materialNeeded, quantity: res.quantity, location: res.location, industrySector: res.industry_sector || res.industrySector }
    );
    matches.push({
      resourceRequest: res, materialSimilarity: Math.round(sim * 100),
      symbiosisScore: score.totalScore, scoreBreakdown: score.breakdown,
      matchReason: sim >= 0.8 ? 'Direct match' : sim >= 0.5 ? 'Similar material' : 'Cross-industry reuse'
    });
  }
  return matches.sort((a, b) => b.symbiosisScore - a.symbiosisScore).slice(0, 10);
}

// ─── 5. Opportunity Detection ───────────────────────────────────────────────

function detectOpportunities(wasteListings, resourceRequests, topN = 10, userIndustryType = null) {
  const opps = [];
  const normalizedUserIndustry = userIndustryType ? userIndustryType.toLowerCase().replace(/\s+industry$/i, '') : null;

  for (const w of wasteListings) {
    if (w.status !== 'available') continue;
    for (const r of resourceRequests) {
      if (r.status !== 'active') continue;
      
      const wm = w.material_type || w.materialType, rm = r.material_needed || r.materialNeeded;
      
      // Strict Industry Filtering if userIndustryType is provided
      if (normalizedUserIndustry) {
        const acceptedMaterials = INDUSTRY_ACCEPTS[normalizedUserIndustry] || [];
        const resolvedWM = resolveMaterial(wm);
        const resolvedRM = resolveMaterial(rm);
        
        const isMatchForUser = acceptedMaterials.some(m => 
          (resolvedWM.canonicalName && m === resolvedWM.canonicalName) || 
          (resolvedRM.canonicalName && m === resolvedRM.canonicalName)
        );

        if (!isMatchForUser) continue;
      }

      const sim = computeMaterialSimilarity(wm, rm);
      if (sim < 0.25) continue;
      const score = computeSymbiosisScore(
        { materialType: wm, quantity: w.quantity, location: w.location },
        { materialNeeded: rm, quantity: r.quantity, location: r.location, industrySector: r.industry_sector }
      );
      if (score.totalScore >= 40) {
        opps.push({
          wasteListingId: w.id, resourceRequestId: r.id, wasteType: wm, resourceType: rm,
          wasteProvider: w.provider_name || `Industry #${w.industry_id}`,
          resourceSeeker: r.requester_name || `Industry #${r.industry_id}`,
          wasteLocation: w.location, resourceLocation: r.location,
          wasteQuantity: `${w.quantity} ${w.unit}`, resourceQuantity: `${r.quantity} ${r.unit}`,
          matchScore: score.totalScore, scoreBreakdown: score.breakdown,
          materialSimilarity: Math.round(sim * 100),
          matchType: sim >= 0.8 ? 'direct' : sim >= 0.5 ? 'similar' : 'cross-industry',
          message: `${wm} → ${r.requester_name || 'Seeker'} (${score.totalScore}% match)`,
          impact: estimateEnvironmentalImpact(wm, parseFloat(w.quantity) || 0)
        });
      }
    }
  }
  return opps.sort((a, b) => b.matchScore - a.matchScore).slice(0, topN);
}

// ─── 6. Environmental Impact ────────────────────────────────────────────────

function estimateEnvironmentalImpact(materialType, quantityTons) {
  const resolved = resolveMaterial(materialType);
  const coeff = IMPACT_COEFFICIENTS[resolved.canonicalName] || DEFAULT_IMPACT;
  const qty = parseFloat(quantityTons) || 0;
  const co2 = +(qty * coeff.co2PerTon).toFixed(2);
  const water = +(qty * coeff.waterPerTon).toFixed(0);
  const energy = +(qty * coeff.energyPerTon).toFixed(2);
  const cost = +(qty * coeff.costPerTon).toFixed(0);
  const landfill = +(qty * coeff.landfillCostPerTon).toFixed(0);

  return {
    material: resolved.canonicalName || materialType, quantityTons: qty,
    co2ReductionTons: co2, co2ReductionKg: +(co2 * 1000).toFixed(0),
    waterSavedLiters: water, energySavedMwh: energy,
    costSavingsINR: cost, landfillCostAvoidedINR: landfill, totalSavingsINR: cost + landfill,
    wasteDivertedTons: qty,
    equivalencies: {
      treesPlanted: Math.round(co2 / 0.022),
      carsRemovedPerYear: +(co2 / 4.6).toFixed(1),
      homePoweredPerYear: +(energy / 10.5).toFixed(1)
    }
  };
}

// ─── 7. Trade Recommendation Scoring (Distance + Material + Price) ──────────

/**
 * Configurable weights for the composite trade score.
 * Sum must equal 1.0 for normalized output.
 */
const TRADE_SCORE_WEIGHTS = {
  distance: 0.35,   // closer companies prioritized
  material: 0.40,   // supply-demand compatibility (exact/partial category match)
  price:    0.25,   // competitive pricing
};

/**
 * Compute a 0-100 distance score.
 * Lower physical distance → higher score.
 * Falls back to 50 when distance is unknown.
 */
function computeDistanceScore(wasteLocation, seekerLocation) {
  const dist = estimateDistance(wasteLocation, seekerLocation);
  if (dist === null) return { score: 50, distance: null, label: 'Unknown' };
  if (dist === 0)    return { score: 100, distance: 0, label: 'Same City' };
  if (dist <= 50)    return { score: 95,  distance: dist, label: 'Very Close (<50 km)' };
  if (dist <= 100)   return { score: 85,  distance: dist, label: 'Close (50-100 km)' };
  if (dist <= 200)   return { score: 72,  distance: dist, label: 'Moderate (100-200 km)' };
  if (dist <= 500)   return { score: 50,  distance: dist, label: 'Distant (200-500 km)' };
  if (dist <= 1000)  return { score: 30,  distance: dist, label: 'Far (500-1000 km)' };
  return { score: 10, distance: dist, label: 'Very Far (>1000 km)' };
}

/**
 * Compute a 0-100 material matching score combining:
 *   - Fuzzy material name similarity (NLP-style via Jaccard + alias resolution)
 *   - Category exact/partial match bonus
 *   - Industry reusability check
 */
function computeMaterialMatchScore(wasteMaterial, wasteCategory, seekerMaterial, seekerCategory, seekerIndustrySector) {
  // 1. Base material similarity from the existing NLP engine
  const baseSimilarity = computeMaterialSimilarity(wasteMaterial, seekerMaterial);
  let score = Math.round(baseSimilarity * 100);

  // 2. Category bonus: exact match +15, partial (one contains the other) +8
  if (wasteCategory && seekerCategory) {
    const wCat = normalizeMaterial(wasteCategory);
    const sCat = normalizeMaterial(seekerCategory);
    if (wCat === sCat) {
      score = Math.min(100, score + 15);
    } else if (wCat.includes(sCat) || sCat.includes(wCat)) {
      score = Math.min(100, score + 8);
    } else if (jaccardSimilarity(wCat, sCat) > 0.4) {
      score = Math.min(100, score + 5);
    }
  }

  // 3. Reusability check via knowledge base
  const resolved = resolveMaterial(wasteMaterial);
  if (resolved.canonicalName) {
    // Check against INDUSTRY_ACCEPTS if seekerIndustrySector is provided
    if (seekerIndustrySector) {
      const normalizedSector = seekerIndustrySector.toLowerCase().replace(/\s+industry$/i, '');
      const accepted = INDUSTRY_ACCEPTS[normalizedSector] || [];
      if (accepted.includes(resolved.canonicalName)) {
        score = Math.min(100, score + 20); // Significant bonus for industry-aligned material
      } else {
        score = Math.max(0, score - 30); // Penalty for non-industry-aligned material
      }
    }

    const recs = WASTE_REUSE_MAP[resolved.canonicalName] || [];
    const sector = seekerIndustrySector ? normalizeMaterial(seekerIndustrySector) : '';
    if (sector) {
      const sectorMatch = recs.find(r => {
        const ri = normalizeMaterial(r.industry);
        return ri.includes(sector) || sector.includes(ri) || jaccardSimilarity(ri, sector) > 0.4;
      });
      if (sectorMatch) {
         score = Math.min(100, Math.round(score * 0.7 + sectorMatch.suitability * 0.3));
      }
    }
  }

  const matchType = score >= 85 ? 'Exact Match' : score >= 60 ? 'Strong Match' : score >= 40 ? 'Partial Match' : score >= 20 ? 'Weak Match' : 'No Match';

  return { score, matchType, baseSimilarity: Math.round(baseSimilarity * 100) };
}

/**
 * Compute a 0-100 price competitiveness score.
 *
 * Strategy:
 *   - A lower waste listing price relative to the resource request's
 *     willingness-to-pay (price_per_unit) yields a higher score.
 *   - If both are 0 or missing, return neutral 50.
 *   - Score = 100 × (1 − clamp((wastePrice − seekerPrice) / seekerPrice, −1, 1) × 0.5 + 0.5)
 *     simplified: the closer the waste price is to or below the seeker's price, the better.
 */
function computePriceScore(wastePrice, seekerPrice) {
  const wp = parseFloat(wastePrice) || 0;
  const sp = parseFloat(seekerPrice) || 0;

  // Both zero → neutral
  if (wp === 0 && sp === 0) return { score: 50, label: 'No Price Data', savings: 0 };

  // Waste is free → excellent deal for the buyer
  if (wp === 0 && sp > 0) return { score: 100, label: 'Free Resource', savings: sp };

  // Seeker has no price expectation → mild bonus for lower waste price
  if (sp === 0 && wp > 0) return { score: 40, label: 'Unpriced Demand', savings: 0 };

  // Both have prices → compute ratio
  const ratio = wp / sp;        // <1 means waste is cheaper than expected
  let score;
  if (ratio <= 0.3) score = 100;       // massive discount
  else if (ratio <= 0.6) score = 90;   // great deal
  else if (ratio <= 0.9) score = 80;   // good value
  else if (ratio <= 1.0) score = 70;   // at parity
  else if (ratio <= 1.2) score = 55;   // slightly above
  else if (ratio <= 1.5) score = 35;   // expensive
  else score = 15;                     // significantly overpriced

  const savings = Math.max(0, +(sp - wp).toFixed(2));
  const label = ratio <= 0.5 ? 'Excellent Value' : ratio <= 1.0 ? 'Good Value' : ratio <= 1.5 ? 'Above Market' : 'Premium Price';

  return { score, label, savings };
}

/**
 * Compute the final composite trade recommendation score.
 * Combines distance, material, and price into a single 0-100 score
 * with a detailed breakdown for transparency.
 */
function computeTradeScore(waste, seeker) {
  const distResult = computeDistanceScore(waste.location, seeker.location);
  const matResult  = computeMaterialMatchScore(
    waste.material_type  || waste.materialType,
    waste.category,
    seeker.material_needed || seeker.materialNeeded,
    seeker.category,
    seeker.industry_sector || seeker.industrySector
  );
  const priceResult = computePriceScore(waste.price_per_unit || waste.pricePerUnit, seeker.price_per_unit || seeker.pricePerUnit);

  const compositeScore = Math.min(100, Math.round(
    distResult.score  * TRADE_SCORE_WEIGHTS.distance +
    matResult.score   * TRADE_SCORE_WEIGHTS.material +
    priceResult.score * TRADE_SCORE_WEIGHTS.price
  ));

  return {
    compositeScore,
    grade: compositeScore >= 85 ? 'A' : compositeScore >= 70 ? 'B' : compositeScore >= 55 ? 'C' : compositeScore >= 40 ? 'D' : 'F',
    breakdown: {
      distance: { score: distResult.score, weight: TRADE_SCORE_WEIGHTS.distance, weighted: Math.round(distResult.score * TRADE_SCORE_WEIGHTS.distance), distanceKm: distResult.distance, label: distResult.label },
      material: { score: matResult.score,  weight: TRADE_SCORE_WEIGHTS.material, weighted: Math.round(matResult.score * TRADE_SCORE_WEIGHTS.material), matchType: matResult.matchType, baseSimilarity: matResult.baseSimilarity },
      price:    { score: priceResult.score, weight: TRADE_SCORE_WEIGHTS.price,    weighted: Math.round(priceResult.score * TRADE_SCORE_WEIGHTS.price),   label: priceResult.label, savings: priceResult.savings }
    }
  };
}

/**
 * Generate ranked trade recommendations for a specific company.
 *
 * @param {object} company       - The requesting company { id, location, industry_type }
 * @param {Array}  wasteListings - All available waste listings (with provider info)
 * @param {Array}  resourceReqs  - All active resource requests (with requester info)
 * @param {object} opts          - { role: 'buyer'|'seller'|'both', topN: 20 }
 *
 * If role = 'buyer':  finds waste listings from OTHER companies that match this company's needs.
 * If role = 'seller': finds resource requests from OTHER companies that could use this company's waste.
 * If role = 'both':   merges both directions and returns a unified ranked list.
 */
function generateTradeRecommendations(company, wasteListings, resourceReqs, opts = {}) {
  const { role = 'both', topN = 20 } = opts;
  const recommendations = [];
  const normalizedIndustry = company.industry_type ? company.industry_type.toLowerCase().replace(/\s+industry$/i, '') : null;
  const acceptedMaterials = normalizedIndustry ? (INDUSTRY_ACCEPTS[normalizedIndustry] || []) : [];

  // ─── As Buyer: find waste that matches company's resource requests ─────────
  if (role === 'buyer' || role === 'both') {
    const myRequests = resourceReqs.filter(r => (r.industry_id || r.industryId) === company.id);
    const otherWaste = wasteListings.filter(w => (w.industry_id || w.industryId) !== company.id && w.status === 'available');

    for (const req of myRequests) {
      for (const waste of otherWaste) {
        // Industry Filtering
        const wm = waste.material_type || waste.materialType;
        const resolvedWM = resolveMaterial(wm);
        if (normalizedIndustry && resolvedWM.canonicalName && !acceptedMaterials.includes(resolvedWM.canonicalName)) {
            continue; // Strict filter
        }

        const tradeScore = computeTradeScore(waste, req);
        if (tradeScore.compositeScore < 25) continue; // skip low-quality matches

        recommendations.push({
          direction: 'buy',
          wasteListingId: waste.id,
          resourceRequestId: req.id,
          wasteMaterial: wm,
          resourceNeeded: req.material_needed || req.materialNeeded,
          wasteProvider: waste.provider_name || waste.company_name || `Company #${waste.industry_id}`,
          wasteProviderType: waste.industry_type || waste.industryType,
          wasteLocation: waste.location,
          wasteQuantity: parseFloat(waste.quantity),
          wasteUnit: waste.unit,
          wastePrice: parseFloat(waste.price_per_unit) || 0,
          requestedQuantity: parseFloat(req.quantity),
          requestedUnit: req.unit,
          budgetPrice: parseFloat(req.price_per_unit) || 0,
          compositeScore: tradeScore.compositeScore,
          grade: tradeScore.grade,
          breakdown: tradeScore.breakdown,
          impact: estimateEnvironmentalImpact(wm, Math.min(parseFloat(waste.quantity), parseFloat(req.quantity)) || 0),
          reason: buildRecommendationReason(tradeScore, 'buy')
        });
      }
    }
  }

  // ─── As Seller: find resource requests that could use company's waste ──────
  if (role === 'seller' || role === 'both') {
    const myWaste = wasteListings.filter(w => (w.industry_id || w.industryId) === company.id && w.status === 'available');
    const otherRequests = resourceReqs.filter(r => (r.industry_id || r.industryId) !== company.id && r.status === 'active');

    for (const waste of myWaste) {
      for (const req of otherRequests) {
        // Avoid duplicate if already matched in buyer direction
        if (recommendations.find(r => r.wasteListingId === waste.id && r.resourceRequestId === req.id)) continue;

        // Industry Filtering for Seeker
        const seekerIndustry = req.industry_type ? req.industry_type.toLowerCase().replace(/\s+industry$/i, '') : null;
        const seekerAccepted = seekerIndustry ? (INDUSTRY_ACCEPTS[seekerIndustry] || []) : [];
        const wm = waste.material_type || waste.materialType;
        const resolvedWM = resolveMaterial(wm);
        
        if (seekerIndustry && resolvedWM.canonicalName && !seekerAccepted.includes(resolvedWM.canonicalName)) {
            continue; // Strict filter
        }

        const tradeScore = computeTradeScore(waste, req);
        if (tradeScore.compositeScore < 25) continue;

        recommendations.push({
          direction: 'sell',
          wasteListingId: waste.id,
          resourceRequestId: req.id,
          wasteMaterial: wm,
          resourceNeeded: req.material_needed || req.materialNeeded,
          resourceSeeker: req.requester_name || req.company_name || `Company #${req.industry_id}`,
          resourceSeekerType: req.industry_type || req.industryType,
          seekerLocation: req.location,
          wasteQuantity: parseFloat(waste.quantity),
          wasteUnit: waste.unit,
          wastePrice: parseFloat(waste.price_per_unit) || 0,
          requestedQuantity: parseFloat(req.quantity),
          requestedUnit: req.unit,
          budgetPrice: parseFloat(req.price_per_unit) || 0,
          compositeScore: tradeScore.compositeScore,
          grade: tradeScore.grade,
          breakdown: tradeScore.breakdown,
          impact: estimateEnvironmentalImpact(wm, Math.min(parseFloat(waste.quantity), parseFloat(req.quantity)) || 0),
          reason: buildRecommendationReason(tradeScore, 'sell')
        });
      }
    }
  }

  // Sort by composite score (highest first), then by material match as tiebreaker
  recommendations.sort((a, b) => {
    if (b.compositeScore !== a.compositeScore) return b.compositeScore - a.compositeScore;
    return b.breakdown.material.score - a.breakdown.material.score;
  });

  return recommendations.slice(0, topN);
}

/**
 * Build a human-readable recommendation reason from the score breakdown.
 */
function buildRecommendationReason(tradeScore, direction) {
  const { breakdown, compositeScore, grade } = tradeScore;
  const parts = [];

  // Material insight
  if (breakdown.material.score >= 80)      parts.push('Excellent material compatibility');
  else if (breakdown.material.score >= 60) parts.push('Good material match');
  else if (breakdown.material.score >= 40) parts.push('Partial material match');
  else                                     parts.push('Cross-industry reuse potential');

  // Distance insight
  if (breakdown.distance.distanceKm !== null) {
    if (breakdown.distance.distanceKm === 0)       parts.push('same city — minimal logistics');
    else if (breakdown.distance.distanceKm <= 100) parts.push(`only ${breakdown.distance.distanceKm} km away`);
    else if (breakdown.distance.distanceKm <= 500) parts.push(`${breakdown.distance.distanceKm} km — moderate transport`);
    else                                            parts.push(`${breakdown.distance.distanceKm} km — long-distance transport`);
  }

  // Price insight
  if (breakdown.price.label === 'Free Resource')        parts.push('free of charge');
  else if (breakdown.price.label === 'Excellent Value')  parts.push('excellent price');
  else if (breakdown.price.label === 'Good Value')       parts.push('competitive pricing');
  else if (breakdown.price.savings > 0)                  parts.push(`saves ₹${breakdown.price.savings}/unit`);

  return parts.join(' · ');
}

// ─── 8. Personalized Demand-Driven Recommendations ──────────────────────────

/**
 * Generate personalized waste-to-resource recommendations for a single user.
 *
 * Strategy:
 *   Supply = all available waste listings from OTHER companies (passed in)
 *   Demand = the current user's own active resource requests (passed in)
 *
 * For each user request, every waste listing is scored via computeTradeScore().
 * Results are grouped per request and ranked by compositeScore (desc).
 *
 * @param {Array}  userRequests  - The logged-in user's own resource_requests rows
 * @param {Array}  wasteListings - All available waste listings from other companies
 * @param {object} opts          - { topPerRequest: 5, minScore: 25 }
 * @returns {Array} Grouped recommendation objects, one entry per user request
 */
function generatePersonalizedRecommendations(userRequests, wasteListings, opts = {}) {
  const { topPerRequest = 5, minScore = 25, userIndustryType = null } = opts;
  const grouped = [];
  const normalizedIndustry = userIndustryType ? userIndustryType.toLowerCase().replace(/\s+industry$/i, '') : null;
  const acceptedMaterials = normalizedIndustry ? (INDUSTRY_ACCEPTS[normalizedIndustry] || []) : [];

  for (const req of userRequests) {
    const matches = [];

    for (const waste of wasteListings) {
      const wm = waste.material_type || waste.materialType;
      
      // Strict Industry Filtering
      if (normalizedIndustry) {
          const resolvedWM = resolveMaterial(wm);
          if (resolvedWM.canonicalName && !acceptedMaterials.includes(resolvedWM.canonicalName)) {
              continue;
          }
      }

      const tradeScore = computeTradeScore(waste, req);
      if (tradeScore.compositeScore < minScore) continue;

      matches.push({
        wasteListingId:    waste.id,
        wasteMaterial:     wm,
        wasteProvider:     waste.provider_name || waste.company_name || `Company #${waste.industry_id}`,
        wasteProviderType: waste.industry_type  || waste.industryType,
        wasteLocation:     waste.location,
        wasteQuantity:     parseFloat(waste.quantity),
        wasteUnit:         waste.unit,
        wastePrice:        parseFloat(waste.price_per_unit)  || 0,
        compositeScore:    tradeScore.compositeScore,
        grade:             tradeScore.grade,
        breakdown:         tradeScore.breakdown,
        reason:            buildRecommendationReason(tradeScore, 'buy'),
        impact:            estimateEnvironmentalImpact(
          wm,
          Math.min(parseFloat(waste.quantity) || 0, parseFloat(req.quantity) || 0)
        )
      });
    }

    // Sort by composite score descending, take top N
    matches.sort((a, b) => b.compositeScore - a.compositeScore);

    grouped.push({
      requestId:       req.id,
      materialNeeded:  req.material_needed   || req.materialNeeded,
      description:     req.description       || '',
      requestQuantity: parseFloat(req.quantity),
      requestUnit:     req.unit,
      requestLocation: req.location,
      requestBudget:   parseFloat(req.price_per_unit) || 0,
      requiredBy:      req.required_by       || null,
      status:          req.status,
      totalMatches:    matches.length,
      topMatches:      matches.slice(0, topPerRequest)
    });
  }

  // Sort groups: requests with most/highest matches first
  grouped.sort((a, b) => {
    if (b.topMatches.length !== a.topMatches.length)
      return b.topMatches.length - a.topMatches.length;
    const aTop = a.topMatches[0]?.compositeScore || 0;
    const bTop = b.topMatches[0]?.compositeScore || 0;
    return bTop - aTop;
  });

  return grouped;
}

module.exports = {
  getWasteRecommendations, findSmartMatches, computeSymbiosisScore,
  detectOpportunities, estimateEnvironmentalImpact,
  resolveMaterial, computeMaterialSimilarity, getSimilarMaterials,
  jaccardSimilarity, normalizeMaterial, estimateDistance,
  // ─── Trade Recommendation Exports ─────────────────────────────────────
  computeTradeScore, computeDistanceScore, computeMaterialMatchScore,
  computePriceScore, generateTradeRecommendations,
  // ─── Personalized Demand-Driven Recommendation Export ─────────────────
  generatePersonalizedRecommendations
};


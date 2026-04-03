/**
 * SymbioNet AI Engine
 * Lightweight, rule-based AI logic for waste-to-resource intelligence.
 */

const {
  WASTE_REUSE_MAP, MATERIAL_ALIASES, MATERIAL_SIMILARITIES,
  IMPACT_COEFFICIENTS, DEFAULT_IMPACT, CITY_DISTANCES
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

function detectOpportunities(wasteListings, resourceRequests, topN = 10) {
  const opps = [];
  for (const w of wasteListings) {
    if (w.status !== 'available') continue;
    for (const r of resourceRequests) {
      if (r.status !== 'active') continue;
      const wm = w.material_type || w.materialType, rm = r.material_needed || r.materialNeeded;
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

module.exports = {
  getWasteRecommendations, findSmartMatches, computeSymbiosisScore,
  detectOpportunities, estimateEnvironmentalImpact,
  resolveMaterial, computeMaterialSimilarity, getSimilarMaterials,
  jaccardSimilarity, normalizeMaterial, estimateDistance
};

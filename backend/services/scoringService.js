const aiEngine = require('../utils/aiEngine');

class ScoringService {
  /**
   * Go beyond exact matching. Generate similarities.
   */
  findSmartMatches(wasteMaterial, wasteQty, wasteLoc, resourceRequests) {
    return aiEngine.findSmartMatches(wasteMaterial, wasteQty, wasteLoc, resourceRequests);
  }

  /**
   * Assign a score to each match based on multiple factors.
   */
  computeSymbiosisScore(waste, resource) {
    return aiEngine.computeSymbiosisScore(waste, resource);
  }

  /**
   * Estimate impact of waste reuse.
   */
  estimateEnvironmentalImpact(materialType, quantityTons) {
    return aiEngine.estimateEnvironmentalImpact(materialType, quantityTons);
  }

  // ─── Trade Recommendation Scoring ───────────────────────────────────────

  /**
   * Compute composite trade score (distance + material + price).
   */
  computeTradeScore(waste, seeker) {
    return aiEngine.computeTradeScore(waste, seeker);
  }

  /**
   * Individual scoring dimensions.
   */
  computeDistanceScore(loc1, loc2) {
    return aiEngine.computeDistanceScore(loc1, loc2);
  }

  computeMaterialMatchScore(wasteMat, wasteCat, seekerMat, seekerCat, seekerSector) {
    return aiEngine.computeMaterialMatchScore(wasteMat, wasteCat, seekerMat, seekerCat, seekerSector);
  }

  computePriceScore(wastePrice, seekerPrice) {
    return aiEngine.computePriceScore(wastePrice, seekerPrice);
  }

  /**
   * Generate ranked trade recommendations for a company.
   */
  generateTradeRecommendations(company, wasteListings, resourceReqs, opts) {
    return aiEngine.generateTradeRecommendations(company, wasteListings, resourceReqs, opts);
  }

  /**
   * Generate personalized demand-driven recommendations.
   * Supply = all available waste from other companies.
   * Demand = only the current user's own resource requests.
   */
  generatePersonalizedRecommendations(userRequests, wasteListings, opts) {
    return aiEngine.generatePersonalizedRecommendations(userRequests, wasteListings, opts);
  }
}

module.exports = new ScoringService();



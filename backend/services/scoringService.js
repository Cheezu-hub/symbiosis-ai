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
}

module.exports = new ScoringService();

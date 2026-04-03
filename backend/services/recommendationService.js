const aiEngine = require('../utils/aiEngine');

class RecommendationService {
  /**
   * Suggest possible uses of a given waste material.
   * @param {string} wasteType 
   * @returns {object} Recommendations and confidence score
   */
  getWasteRecommendations(wasteType) {
    // We can extend this here with OpenAI API in the future if needed
    // For now, it delegates to the lightweight rule-based engine
    return aiEngine.getWasteRecommendations(wasteType);
  }

  /**
   * Automatically suggest new matches from database sets.
   * @param {Array} wasteListings 
   * @param {Array} resourceRequests 
   * @param {number} topN 
   * @returns {Array} List of high-priority opportunities
   */
  detectOpportunities(wasteListings, resourceRequests, topN = 10) {
    return aiEngine.detectOpportunities(wasteListings, resourceRequests, topN);
  }
}

module.exports = new RecommendationService();

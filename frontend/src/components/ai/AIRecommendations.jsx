/* AI Components - AIRecommendations */
import React from 'react';
import { Zap, Activity } from 'lucide-react';
import Badge from '../ui/Badge';

const AIRecommendations = ({ recommendations = [], loading = false }) => {
  if (loading) {
    return (
      <div className="ai-card p-4 rounded-lg flex items-center justify-center gap-2">
        <Activity className="spin text-primary" size={20} />
        <span className="text-secondary">Generating AI Insights...</span>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="ai-card p-4 rounded-lg" style={{ background: 'rgba(88, 224, 119, 0.05)', border: '1px solid rgba(88, 224, 119, 0.3)' }}>
      <div className="flex items-center gap-2 mb-3">
        <Zap size={18} className="text-primary" />
        <h4 className="ai-gradient-text" style={{ fontSize: '1rem', margin: 0 }}>AI Recommended Uses</h4>
      </div>
      <div className="flex" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        {recommendations.slice(0, 5).map((rec, idx) => (
          <Badge key={idx} variant="primary" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--primary)', color: 'var(--text-primary)' }}>
            {rec.industry} <span style={{ opacity: 0.7, fontSize: '0.8rem', marginLeft: '4px' }}>({rec.adjustedScore || rec.suitability}%)</span>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default AIRecommendations;

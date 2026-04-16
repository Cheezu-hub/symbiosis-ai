/* AI Components - AIOpportunities */
import React, { useEffect, useState, useCallback } from 'react';
import { aiAPI } from '../../services/api';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Zap, ArrowRight, Activity } from 'lucide-react';
import SymbiosisScoreBadge from './SymbiosisScoreBadge';

const AIOpportunities = ({ limit = 3 }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOpportunities = useCallback(async () => {
    try {
      const res = await aiAPI.getOpportunities(limit);
      setOpportunities(res.data.data.opportunities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  if (loading) {
    return (
      <Card style={{ padding: '2rem', textAlign: 'center', borderColor: 'var(--primary)', background: 'var(--bg-secondary)' }}>
        <Activity className="spin text-primary" size={24} style={{ margin: '0 auto', marginBottom: '1rem' }} />
        <p className="text-secondary">AI is scanning the network for hidden opportunities...</p>
      </Card>
    );
  }

  if (opportunities.length === 0) return null;

  return (
    <Card className="ai-card" style={{ borderColor: 'var(--primary)', background: 'linear-gradient(to bottom right, var(--bg-card), rgba(88, 224, 119, 0.05))' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="text-primary ai-pulse" size={20} />
          <h3 className="ai-gradient-text" style={{ fontSize: '1.2rem', margin: 0 }}>AI Smart Matches Found</h3>
        </div>
        <Badge variant="primary">{opportunities.length} New</Badge>
      </div>
      <div className="grid" style={{ gap: '1rem' }}>
        {opportunities.map((opp, idx) => (
          <div key={idx} className="p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-primary font-bold">{opp.wasteType}</span>
                  <ArrowRight size={16} className="text-secondary" />
                  <span className="text-accent font-bold">{opp.resourceSeeker}</span>
                </div>
                <div className="text-sm text-secondary flex gap-4">
                  <span>{opp.wasteQuantity} available</span>
                  <span>•</span>
                  <span>Match type: {opp.matchType}</span>
                </div>
              </div>
              <SymbiosisScoreBadge score={opp.matchScore} size={48} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AIOpportunities;

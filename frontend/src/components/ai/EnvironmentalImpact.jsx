/* AI Components - EnvironmentalImpact */
import React from 'react';
import Card from '../ui/Card';
import { Leaf, Droplets, Zap, TrendingDown } from 'lucide-react';

const EnvironmentalImpact = ({ impactData }) => {
  if (!impactData) return null;

  return (
    <Card className="ai-card" style={{ background: 'var(--glass-bg)', borderColor: 'var(--accent)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Leaf className="text-success" size={20} />
        <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>Estimated Environmental Impact</h3>
      </div>
      
      <div className="impact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        
        <div className="p-3 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', textAlign: 'center' }}>
          <TrendingDown size={24} className="text-success" style={{ margin: '0 auto 0.5rem' }} />
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{impactData.co2ReductionKg} kg</div>
          <div className="text-xs text-secondary mt-1">CO₂ AVOIDED</div>
        </div>
        
        <div className="p-3 rounded-lg" style={{ background: 'rgba(0, 218, 243, 0.1)', border: '1px solid var(--accent)', textAlign: 'center' }}>
          <Droplets size={24} className="text-accent" style={{ margin: '0 auto 0.5rem' }} />
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{impactData.waterSavedLiters} L</div>
          <div className="text-xs text-secondary mt-1">WATER SAVED</div>
        </div>

        <div className="p-3 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', textAlign: 'center' }}>
          <Zap size={24} className="text-warning" style={{ margin: '0 auto 0.5rem' }} />
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{impactData.energySavedMwh} MWh</div>
          <div className="text-xs text-secondary mt-1">ENERGY SAVED</div>
        </div>

        <div className="p-3 rounded-lg" style={{ background: 'rgba(88, 224, 119, 0.1)', border: '1px solid var(--primary)', textAlign: 'center' }}>
          <Leaf size={24} className="text-primary" style={{ margin: '0 auto 0.5rem' }} />
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>₹{impactData.totalSavingsINR}</div>
          <div className="text-xs text-secondary mt-1">EST. SAVINGS</div>
        </div>

      </div>
    </Card>
  );
};

export default EnvironmentalImpact;

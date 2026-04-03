import React, { useState } from 'react';
import { aiAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Zap, Search, Leaf, Loader, CheckCircle } from 'lucide-react';
import AIOpportunities from '../components/ai/AIOpportunities';
import EnvironmentalImpact from '../components/ai/EnvironmentalImpact';

const AIInsightsPage = () => {
  const [wasteQuery, setWasteQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [impactData, setImpactData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!wasteQuery) return;
    
    setIsSearching(true);
    try {
      const [recRes, impactRes] = await Promise.all([
        aiAPI.getRecommendations(wasteQuery),
        aiAPI.estimateImpact({ materialType: wasteQuery, quantityTons: 10 }) // Default 10 tons for estimation
      ]);
      setResults(recRes.data.data);
      setImpactData(impactRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="page-container fade-in-up">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="ai-gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={32} /> AI Insights
          </h1>
          <p className="text-secondary">Smart matchmaking and environmental intelligence</p>
        </div>
      </div>

      <div className="grid grid-cols-1" style={{ gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
        <AIOpportunities limit={3} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Explorer */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Search className="text-primary" />
            <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>Material Intelligence Explorer</h3>
          </div>
          <p className="text-secondary mb-4">Enter any waste material to get AI-driven reuse recommendations and lifecycle insights.</p>
          
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <input 
              type="text" 
              className="form-input flex-1" 
              placeholder="e.g. Fly Ash, Plastic Scrap, Steel Slag..." 
              value={wasteQuery} 
              onChange={(e) => setWasteQuery(e.target.value)}
            />
            <Button variant="primary" type="submit" disabled={isSearching}>
              {isSearching ? <Loader className="spin" size={20} /> : <Zap size={20} />} 
              Analyze
            </Button>
          </form>

          {results && (
            <div className="fade-in-up">
              <div className="mb-4">
                <span className="text-secondary text-sm">Resolved As:</span>
                <Badge variant="primary" style={{ marginLeft: '8px' }}>
                  {results.resolvedAs || 'Unknown Material'} <CheckCircle size={14} style={{ marginLeft: '4px', display: 'inline' }}/>
                </Badge>
                {results.confidence > 0 && <span className="text-xs text-muted ml-2">({results.confidence}% confidence)</span>}
              </div>

              {results.recommendations?.length > 0 ? (
                <div>
                  <h4 className="mb-3 text-primary">Top Reuse Pathways</h4>
                  <div className="grid gap-3">
                    {results.recommendations.map((rec, i) => (
                      <div key={i} className="p-3 bg-tertiary rounded border" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex justify-between mb-1">
                          <span className="font-bold text-white">{rec.industry}</span>
                          <span className="text-primary">{rec.adjustedScore || rec.suitability}% Suitability</span>
                        </div>
                        <p className="text-sm text-secondary m-0">{rec.description || rec.application}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-tertiary rounded text-center border" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-warning mb-0">{results.message || 'No known symbiosis pathways found for this material.'}</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Right Column: Impact */}
        <div>
          {impactData ? (
             <div className="fade-in-up">
               <div className="mb-4 text-sm text-secondary bg-tertiary p-3 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                 Showing estimated potential impact if <strong>10 tons</strong> of this material were successfully symbiosed instead of landfilled.
               </div>
               <EnvironmentalImpact impactData={impactData} />
             </div>
          ) : (
             <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.6 }}>
                <Leaf size={48} className="text-muted mb-4" />
                <p className="text-secondary text-center">Analyze a material to see its potential environmental and economic impact.</p>
             </Card>
          )}
        </div>

      </div>
    </div>
  );
};

export default AIInsightsPage;

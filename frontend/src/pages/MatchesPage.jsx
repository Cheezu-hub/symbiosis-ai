import React, { useState, useEffect } from 'react';
import { Zap, Check, X, Truck, Leaf, TrendingUp, MapPin, RefreshCw, Play } from 'lucide-react';
import { matchAPI, aiAPI } from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SymbiosisScoreBadge from '../components/ai/SymbiosisScoreBadge';

const MatchesPage = ({ user }) => {
  const [matches, setMatches] = useState([]);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [matchingMsg, setMatchingMsg] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setError('');
    try {
      const res = await matchAPI.getAll();
      setMatches(res.data.data?.matches || []);
    } catch (err) {
      setError('Failed to load matches. Make sure you are logged in.');
    } finally {
    }
  };

  const handleRunMatching = async () => {
    setIsRunning(true);
    setMatchingMsg('');
    try {
      const res = await aiAPI.runMatching();
      const { inserted, updated } = res.data.data;
      setMatchingMsg(`✅ Matching complete: ${inserted} new matches found, ${updated} updated.`);
      // Reload matches so freshly generated ones appear
      await fetchMatches();
    } catch (err) {
      setMatchingMsg('❌ Matching failed. Check backend logs.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleAccept = async (matchId) => {
    setActionId(matchId);
    try {
      await matchAPI.accept(matchId);
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: 'accepted' } : m));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept match.');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (matchId) => {
    if (!window.confirm('Reject this match?')) return;
    setActionId(matchId);
    try {
      await matchAPI.reject(matchId);
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: 'rejected' } : m));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject match.');
    } finally {
      setActionId(null);
    }
  };

  const pendingMatches = matches.filter(m => m.status === 'pending');
  const totalCO2 = matches.reduce((acc, m) => acc + (m.co2Reduction || 0), 0);
  const totalSavings = matches.reduce((acc, m) => acc + (m.costSavings || 0), 0);

return (
    <div className="page-container fade-in-up">
      {/* Page Header */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '2rem',
              marginBottom: '0.5rem',
              color: 'var(--text-primary, #e2e2e5)'
            }}
          >
            AI Match Recommendations
          </h1>
          <p style={{ color: 'var(--text-secondary, #a0a0a5)' }}>
            Intelligent waste-resource matching powered by semantic AI
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Button variant="primary" onClick={handleRunMatching} disabled={isRunning}>
            <Play size={18} /> {isRunning ? 'Running...' : 'Run AI Matching'}
          </Button>
          <Button variant="outline" onClick={fetchMatches}>
            <RefreshCw size={18} /> Refresh
          </Button>
        </div>
      </div>

      {/* Matching feedback message */}
      {matchingMsg && (
        <div
          style={{
            background: matchingMsg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${matchingMsg.startsWith('✅') ? 'var(--success, #10b981)' : 'var(--error, #ef4444)'}`,
            borderRadius: 'var(--radius, 8px)',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.5rem',
            color: matchingMsg.startsWith('✅') ? 'var(--success, #10b981)' : 'var(--error, #ef4444)',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {matchingMsg}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--error, #ef4444)',
            borderRadius: 'var(--radius, 8px)',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: 'var(--error, #ef4444)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Stats Grid */}
      <div
        className="dashboard-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        <Card
          style={{
            background: 'rgba(88, 224, 119, 0.1)',
            border: '1px solid var(--primary, #58e077)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius, 8px)',
                background: 'var(--primary, #58e077)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Zap size={24} color="var(--bg-primary, #121416)" />
            </div>
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--primary, #58e077)'
            }}
          >
            {pendingMatches.length}
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary, #a0a0a5)'
            }}
          >
            Pending Matches
          </div>
        </Card>

        <Card
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--success, #10b981)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius, 8px)',
                background: 'var(--success, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Leaf size={24} color="white" />
            </div>
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--success, #10b981)'
            }}
          >
            {totalCO2.toFixed(1)} tons
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary, #a0a0a5)'
            }}
          >
            Potential CO₂ Reduction
          </div>
        </Card>

        <Card
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid var(--warning, #f59e0b)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius, 8px)',
                background: 'var(--warning, #f59e0b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <TrendingUp size={24} color="white" />
            </div>
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--warning, #f59e0b)'
            }}
          >
            ₹{(totalSavings / 100000).toFixed(1)}L
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary, #a0a0a5)'
            }}
          >
            Potential Cost Savings
          </div>
        </Card>
      </div>

      {/* Matches List */}
      {matches.length === 0 ? (
        <Card
          style={{
            textAlign: 'center',
            padding: '4rem',
            background: 'var(--bg-card, rgba(51, 53, 55, 0.4))'
          }}
        >
          <Zap
            size={64}
            style={{
              color: 'var(--text-muted, #64748b)',
              marginBottom: '1rem',
              opacity: 0.5
            }}
          />
          <h3
            style={{
              marginBottom: '0.5rem',
              color: 'var(--text-primary, #e2e2e5)'
            }}
          >
            No Matches Yet
          </h3>
          <p style={{ color: 'var(--text-secondary, #a0a0a5)' }}>
            Add waste listings and resource requests to generate AI matches
          </p>
        </Card>
      ) : (
        matches.map((match) => (
          <Card
            key={match.id}
            style={{
              marginBottom: '1.5rem',
              opacity: match.status === 'rejected' ? 0.5 : 1
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '2rem'
              }}
            >
              {/* Match Info */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}
                >
                  <h3
                    style={{
                      color: 'var(--primary, #58e077)',
                      fontSize: '1.1rem'
                    }}
                  >
                    {match.wasteType}
                  </h3>
                  <SymbiosisScoreBadge score={match.matchScore || 0} size={72} />
                </div>
                {match.wasteLocation && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                      color: 'var(--text-secondary, #a0a0a5)'
                    }}
                  >
                    <MapPin size={16} />
                    <span>{match.wasteLocation}</span>
                  </div>
                )}
                {match.logisticsCost > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--text-secondary, #a0a0a5)'
                    }}
                  >
                    <Truck size={16} />
                    <span>Logistics: ₹{match.logisticsCost.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Parties */}
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary, #a0a0a5)',
                      marginBottom: '0.25rem'
                    }}
                  >
                    Waste Provider
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-primary, #e2e2e5)'
                    }}
                  >
                    {match.wasteProvider}
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary, #a0a0a5)',
                      marginBottom: '0.25rem'
                    }}
                  >
                    Resource Seeker
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-primary, #e2e2e5)'
                    }}
                  >
                    {match.resourceSeeker}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary, #a0a0a5)',
                      marginBottom: '0.25rem'
                    }}
                  >
                    Quantity
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-primary, #e2e2e5)'
                    }}
                  >
                    {match.quantity}
                  </div>
                </div>
              </div>

              {/* Impact + Actions */}
              <div>
                {match.co2Reduction > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <Leaf size={18} style={{ color: 'var(--success, #10b981)' }} />
                    <span
                      style={{
                        fontWeight: 600,
                        color: 'var(--text-primary, #e2e2e5)'
                      }}
                    >
                      CO₂ Reduction: {match.co2Reduction} tons
                    </span>
                  </div>
                )}
                {match.costSavings > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '1rem'
                    }}
                  >
                    <TrendingUp
                      size={18}
                      style={{ color: 'var(--accent, #00daf3)' }}
                    />
                    <span
                      style={{
                        fontWeight: 600,
                        color: 'var(--text-primary, #e2e2e5)'
                      }}
                    >
                      Savings: ₹{match.costSavings.toLocaleString()}
                    </span>
                  </div>
                )}

                {match.status === 'pending' && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem'
                    }}
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      style={{ flex: 1 }}
                      onClick={() => handleAccept(match.id)}
                      disabled={actionId === match.id}
                    >
                      <Check size={18} />
                      {actionId === match.id ? '...' : 'Accept'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      style={{
                        flex: 1,
                        color: 'var(--error, #ef4444)',
                        borderColor: 'var(--error, #ef4444)'
                      }}
                      onClick={() => handleReject(match.id)}
                      disabled={actionId === match.id}
                    >
                      <X size={18} /> Reject
                    </Button>
                  </div>
                )}
                {match.status === 'accepted' && (
                  <Badge variant="success">✓ Accepted</Badge>
                )}
                {match.status === 'rejected' && (
                  <Badge
                    variant="error"
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: 'var(--error, #ef4444)'
                    }}
                  >
                    Rejected
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default MatchesPage;
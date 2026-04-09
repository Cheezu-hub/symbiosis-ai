/**
 * PersonalizedRecommendations
 * ─────────────────────────────────────────────────────────────────────────────
 * Demand-driven AI matching:
 *   Supply  = all available waste listings from OTHER companies
 *   Demand  = ONLY the current logged-in user's active resource requests
 *
 * Groups matched waste listings under each of the user's requests,
 * ranked by composite score (material 40% + distance 35% + price 25%).
 */

import React, { useEffect, useState, useCallback } from 'react';
import { aiAPI } from '../../services/api';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import {
  Target, Zap, Loader, MapPin, Package, DollarSign,
  ChevronDown, ChevronUp, AlertCircle, RefreshCw, Leaf
} from 'lucide-react';

// ─── Grade colour helper ──────────────────────────────────────────────────────
const GRADE_STYLES = {
  A: { bg: 'rgba(88, 224, 119, 0.15)', border: '#58e077', color: '#58e077' },
  B: { bg: 'rgba(88, 179, 224, 0.15)', border: '#58b3e0', color: '#58b3e0' },
  C: { bg: 'rgba(224, 188, 88,  0.15)', border: '#e0bc58', color: '#e0bc58' },
  D: { bg: 'rgba(224, 130, 88,  0.15)', border: '#e08258', color: '#e08258' },
  F: { bg: 'rgba(224, 88,  88,  0.15)', border: '#e05858', color: '#e05858' },
};

// ─── Score pill ───────────────────────────────────────────────────────────────
const ScorePill = ({ score, grade }) => {
  const style = GRADE_STYLES[grade] || GRADE_STYLES.F;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      minWidth: '64px', padding: '6px 10px', borderRadius: '10px',
      background: style.bg, border: `1.5px solid ${style.border}`
    }}>
      <span style={{ fontSize: '1.3rem', fontWeight: 700, color: style.color, lineHeight: 1 }}>
        {grade}
      </span>
      <span style={{ fontSize: '0.7rem', color: style.color, opacity: 0.85 }}>{score}%</span>
    </div>
  );
};

// ─── Breakdown mini-badges ───────────────────────────────────────────────────
const BreakdownBadge = ({ icon: Icon, label, score }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    fontSize: '0.72rem', padding: '2px 8px', borderRadius: '20px',
    background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
    color: 'var(--text-secondary)'
  }}>
    <Icon size={11} />
    {label}: <strong style={{ color: 'var(--text-primary)' }}>{score}%</strong>
  </span>
);

// ─── Single waste match card ──────────────────────────────────────────────────
const MatchCard = ({ match }) => (
  <div style={{
    padding: '12px 14px', borderRadius: '10px',
    background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
    display: 'flex', gap: '14px', alignItems: 'flex-start'
  }}>
    <ScorePill score={match.compositeScore} grade={match.grade} />

    <div style={{ flex: 1, minWidth: 0 }}>
      {/* Material + provider */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
          {match.wasteMaterial}
        </span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
          by <strong>{match.wasteProvider}</strong>
          {match.wasteProviderType && (
            <span style={{ marginLeft: '4px', opacity: 0.7 }}>({match.wasteProviderType})</span>
          )}
        </span>
      </div>

      {/* Quantity · Price · Location */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '12px',
        fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Package size={12} />
          {match.wasteQuantity} {match.wasteUnit}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <DollarSign size={12} />
          {match.wastePrice > 0 ? `₹${match.wastePrice.toLocaleString()}/unit` : 'Free / Negotiable'}
        </span>
        {match.wasteLocation && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} /> {match.wasteLocation}
          </span>
        )}
      </div>

      {/* Score breakdown badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
        <BreakdownBadge icon={Zap}       label="Material"  score={match.breakdown.material.score} />
        <BreakdownBadge icon={MapPin}    label="Distance"  score={match.breakdown.distance.score} />
        <BreakdownBadge icon={DollarSign} label="Price"    score={match.breakdown.price.score} />
      </div>

      {/* Reason text */}
      {match.reason && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
          {match.reason}
        </p>
      )}
    </div>
  </div>
);

// ─── Request group card ───────────────────────────────────────────────────────
const RequestGroup = ({ group }) => {
  const [expanded, setExpanded] = useState(true);
  const hasMatches = group.topMatches.length > 0;

  return (
    <div style={{
      borderRadius: '14px', overflow: 'hidden',
      border: '1px solid var(--border)',
      background: 'linear-gradient(135deg, var(--bg-card), rgba(88,224,119,0.03))'
    }}>
      {/* ── Header ── */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '14px 18px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          borderBottom: expanded ? '1px solid var(--border)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <Target size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'block', fontSize: '1rem' }}>
              {group.materialNeeded}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {group.requestQuantity} {group.requestUnit}
              {group.requestLocation && ` · ${group.requestLocation}`}
              {group.requestBudget > 0 && ` · Budget ₹${group.requestBudget.toLocaleString()}/unit`}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {hasMatches ? (
            <Badge variant="primary" style={{ fontSize: '0.78rem' }}>
              {group.topMatches.length} match{group.topMatches.length !== 1 ? 'es' : ''}
              {group.totalMatches > group.topMatches.length && ` of ${group.totalMatches}`}
            </Badge>
          ) : (
            <Badge variant="warning" style={{ fontSize: '0.78rem' }}>No matches</Badge>
          )}
          {expanded
            ? <ChevronUp size={16} style={{ color: 'var(--text-secondary)' }} />
            : <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />
          }
        </div>
      </button>

      {/* ── Matches ── */}
      {expanded && (
        <div style={{ padding: hasMatches ? '14px' : '10px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {hasMatches ? (
            group.topMatches.map((match, i) => (
              <MatchCard key={match.wasteListingId ?? i} match={match} />
            ))
          ) : (
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No waste listings currently match this request. Try broadening your material or location.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PersonalizedRecommendations = ({ topPerRequest = 5 }) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiAPI.getPersonalizedRecommendations(topPerRequest);
      setData(res.data.data);
    } catch (err) {
      console.error('PersonalizedRecommendations fetch error:', err);
      setError('Failed to load personalized recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [topPerRequest]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card style={{ padding: '2.5rem', textAlign: 'center', borderColor: 'var(--primary)' }}>
        <Loader size={28} className="spin text-primary" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          AI is scanning waste listings for your resource requests…
        </p>
      </Card>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <Card style={{ padding: '2rem', borderColor: 'var(--danger)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--danger)', marginBottom: '12px' }}>
          <AlertCircle size={20} />
          <span style={{ fontWeight: 600 }}>{error}</span>
        </div>
        <button
          onClick={fetchRecommendations}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)',
            background: 'var(--bg-tertiary)', color: 'var(--text-primary)', cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      </Card>
    );
  }

  // ── No active requests ─────────────────────────────────────────────────────
  if (!data || data.totalUserRequests === 0) {
    return (
      <Card style={{
        padding: '3rem', textAlign: 'center',
        borderColor: 'var(--border)',
        background: 'linear-gradient(135deg, var(--bg-card), rgba(88,224,119,0.03))'
      }}>
        <Leaf size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          No Active Resource Requests
        </h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
          Create a resource request to let the AI find matching waste listings from other companies tailored specifically to your needs.
        </p>
      </Card>
    );
  }

  const { recommendations, totalUserRequests, totalWasteListings,
          requestsWithMatches, totalMatchesFound, averageMatchScore } = data;

  return (
    <div>
      {/* ── Header + summary stats ────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Target size={22} style={{ color: 'var(--primary)' }} />
            <h3 className="ai-gradient-text" style={{ fontSize: '1.25rem', margin: 0 }}>
              Matched For Your Requests
            </h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            AI scanned <strong style={{ color: 'var(--text-primary)' }}>{totalWasteListings}</strong> waste
            listing{totalWasteListings !== 1 ? 's' : ''} against your{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{totalUserRequests}</strong> active
            request{totalUserRequests !== 1 ? 's' : ''} and found{' '}
            <strong style={{ color: 'var(--primary)' }}>{totalMatchesFound}</strong> relevant match{totalMatchesFound !== 1 ? 'es' : ''}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            padding: '8px 16px', borderRadius: '10px', textAlign: 'center',
            background: 'rgba(88,224,119,0.1)', border: '1px solid rgba(88,224,119,0.3)'
          }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>
              {requestsWithMatches}/{totalUserRequests}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Requests matched
            </div>
          </div>
          <div style={{
            padding: '8px 16px', borderRadius: '10px', textAlign: 'center',
            background: 'rgba(88,179,224,0.1)', border: '1px solid rgba(88,179,224,0.3)'
          }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#58b3e0', lineHeight: 1 }}>
              {averageMatchScore}%
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Avg. score
            </div>
          </div>
          <button
            onClick={fetchRecommendations}
            title="Refresh recommendations"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '42px', height: '42px', borderRadius: '10px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              cursor: 'pointer', color: 'var(--text-secondary)'
            }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* ── Request groups ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {recommendations.map(group => (
          <RequestGroup key={group.requestId} group={group} />
        ))}
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;

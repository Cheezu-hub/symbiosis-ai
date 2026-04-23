import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft, Check, X, RefreshCw, Briefcase, MapPin, Package,
  Clock
} from 'lucide-react';
import { tradeAPI } from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import CoordinationPanel from '../components/ui/CoordinationPanel';

// Removed local ContactPanel in favor of reusable CoordinationPanel

const TradeRequestsPage = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchRequests(activeTab);
  }, [activeTab]);

  const fetchRequests = async (direction) => {
    setLoading(true);
    setError('');
    try {
      const res = await tradeAPI.getAll(direction);
      setRequests(res.data.data || []);
    } catch (err) {
      setError('Failed to load trade requests. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    setActionId(id);
    try {
      await tradeAPI.accept(id);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'accepted' } : r))
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept request.');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to decline this trade request?')) return;
    setActionId(id);
    try {
      await tradeAPI.reject(id, 'Declined by user');
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject request.');
    } finally {
      setActionId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="error">Declined</Badge>;
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  return (
    <div className="page-container fade-in-up">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-primary, #e2e2e5)' }}>
            Trade Requests
          </h1>
          <p style={{ color: 'var(--text-secondary, #a0a0a5)' }}>
            Manage incoming resource requests and track your outgoing proposals.
          </p>
        </div>
        <Button variant="outline" onClick={() => fetchRequests(activeTab)} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} /> Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'all' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'all' ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <ArrowRightLeft size={18} /> All Trades
        </button>
        <button
          onClick={() => setActiveTab('incoming')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'incoming' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'incoming' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'incoming' ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <ArrowRightLeft size={18} /> Incoming to Me
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'outgoing' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'outgoing' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'outgoing' ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Briefcase size={18} /> Sent by Me
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', borderRadius: '8px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {/* Request List */}
      {loading && requests.length === 0 ? (
        <div className="loading" style={{ height: '200px' }}><div className="spinner" /></div>
      ) : requests.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '4rem', opacity: 0.7 }}>
          <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', margin: '0 auto' }} />
          <h3>No {activeTab} requests found.</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {activeTab === 'incoming' 
              ? "When companies want to trade for your listings, they'll appear here." 
              : "Explore the network and send trade requests to acquire resources."}
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {requests.map((req) => (
            <Card key={req.id} style={{ opacity: req.status === 'rejected' ? 0.6 : 1, transition: 'all 0.3s' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                
                {/* Resource Info */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                        {req.materialType}
                      </h3>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {req.category && <Badge variant="outline">{req.category}</Badge>}
                        {activeTab === 'all' && (
                          <Badge variant={req.direction === 'incoming' ? "primary" : "secondary"}>
                            {req.direction === 'incoming' ? 'Incoming' : 'Sent'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Requested Qty</p>
                      <p style={{ fontWeight: 600 }}>{req.quantityRequested} {req.unit}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Price offered</p>
                      <p style={{ fontWeight: 600 }}>{req.pricePerUnit > 0 ? `₹${req.pricePerUnit}/${req.unit}` : 'Free'}</p>
                    </div>
                  </div>

                  {req.message && (
                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                      "{req.message}"
                    </div>
                  )}
                </div>

                {/* Counterparty Info */}
                <div>
                   <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {req.direction === 'incoming' ? 'Requested By' : 'Requested From'}
                  </h4>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                      {req.direction === 'incoming' ? req.sender?.name : req.receiver?.name}
                    </p>
                    {(req.direction === 'incoming' ? req.sender?.type : req.receiver?.type) && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        {req.direction === 'incoming' ? req.sender?.type : req.receiver?.type}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      <MapPin size={16} /> {req.direction === 'incoming' ? req.sender?.location : req.receiver?.location}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <Clock size={16} /> {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Actions (Only for incoming pending) */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {req.direction === 'incoming' && req.status === 'pending' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        Action Required
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => handleAccept(req.id)}
                        disabled={actionId !== null}
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <Check size={18} /> {actionId === req.id ? 'Processing...' : 'Accept Proposal'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleReject(req.id)}
                        disabled={actionId !== null}
                        style={{ width: '100%', justifyContent: 'center', color: 'var(--error)', borderColor: 'var(--error)' }}
                      >
                        <X size={18} /> Decline
                      </Button>
                    </div>
                  ) : (
                    req.status === 'accepted' ? (
                      <div>
                        {/* Success badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', marginBottom: '0', border: '1px solid rgba(16,185,129,0.25)' }}>
                          <Check size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--success)', fontSize: '0.95rem', margin: 0 }}>Trade Accepted</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>Transaction recorded · Contact details unlocked</p>
                          </div>
                        </div>
                        {/* Contact panel - revealed for both sender & receiver */}
                        <CoordinationPanel
                          acceptedAt={req.updatedAt}
                          role={req.direction === 'incoming' ? 'seller' : 'buyer'}
                          party={req.direction === 'incoming' ? req.sender : req.receiver}
                        />
                      </div>
                    ) : req.status === 'rejected' ? (
                      <div style={{ textAlign: 'center', color: 'var(--error)', padding: '1rem' }}>
                         <X size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.6 }} />
                         <p>Trade Declined</p>
                      </div>
                    ) : (
                       <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--warning)' }}>
                          <Clock size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.8 }} />
                          <p>Waiting for response...</p>
                       </div>
                    )
                  )}
                </div>

              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TradeRequestsPage;

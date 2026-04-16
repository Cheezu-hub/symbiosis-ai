import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, MapPin, Package, AlertCircle, Zap, Loader, Briefcase, Star } from 'lucide-react';
import { wasteAPI, aiAPI, tradeAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const emptyForm = {
  materialType: '',
  description: '',
  quantity: '',
  unit: 'tons',
  location: '',
  availableFrom: '',
  pricePerUnit: '',
  category: ''
};

import Skeleton from '../components/ui/Skeleton';

const WasteListingsSkeleton = () => (
  <div className="page-container">
    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
      <div>
        <Skeleton variant="text" width="250px" height="2.5rem" style={{ marginBottom: '0.5rem' }} />
        <Skeleton variant="text" width="400px" height="1rem" />
      </div>
      <Skeleton variant="rectangular" width="180px" height="45px" />
    </div>

    <Card style={{ marginBottom: '2rem', height: '80px' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Skeleton variant="rectangular" width="100%" height="40px" style={{ flex: 1 }} />
        <Skeleton variant="rectangular" width="100px" height="40px" />
      </div>
    </Card>

    <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <Card key={i} style={{ height: '350px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <Skeleton variant="text" width="150px" height="1.25rem" />
            <Skeleton variant="text" width="80px" />
          </div>
          <Skeleton variant="text" width="100%" height="3rem" style={{ marginBottom: '1.5rem' }} />
          <Skeleton variant="text" width="120px" style={{ marginBottom: '0.5rem' }} />
          <Skeleton variant="text" width="100px" style={{ marginBottom: '0.5rem' }} />
          <Skeleton variant="text" width="160px" style={{ marginBottom: '1.5rem' }} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Skeleton variant="rectangular" style={{ flex: 1 }} height="36px" />
            <Skeleton variant="rectangular" style={{ flex: 1 }} height="36px" />
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const WasteListingsPage = ({ user }) => {
  const [listings, setListings] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [loadingAi, setLoadingAi] = useState({});
  const [tradeModal, setTradeModal] = useState({ show: false, listing: null });
  const [tradeForm, setTradeForm] = useState({ quantity: '', price: '', message: '' });
  const [sendingTrade, setSendingTrade] = useState(false);

  const fetchAiSuggestions = async (wasteId, materialType) => {
    setLoadingAi(p => ({ ...p, [wasteId]: true }));
    try {
      const res = await aiAPI.getRecommendations(materialType);
      setAiSuggestions(p => ({ ...p, [wasteId]: res.data.data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(p => ({ ...p, [wasteId]: false }));
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await wasteAPI.getAll();
      setListings(res.data.data || []);
    } catch (err) {
      setError('Failed to load waste listings.');
    } finally {
      // Intentional delay for better UX (seeing the skeletons)
      setTimeout(() => setLoading(false), 900);
    }
  };

  if (loading && !error) {
    return <WasteListingsSkeleton />;
  }

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (listing) => {
    setEditingId(listing.id);
    setFormData({
      materialType: listing.materialType,
      description: listing.description || '',
      quantity: listing.quantity.toString(),
      unit: listing.unit,
      location: listing.location || '',
      availableFrom: listing.availableFrom ? listing.availableFrom.split('T')[0] : '',
      pricePerUnit: listing.pricePerUnit?.toString() || '',
      category: listing.category || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await wasteAPI.update(editingId, { ...formData, quantity: parseFloat(formData.quantity) });
      } else {
        await wasteAPI.create({ ...formData, quantity: parseFloat(formData.quantity) });
      }
      setShowModal(false);
      await fetchListings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save listing.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this waste listing?')) return;
    try {
      await wasteAPI.delete(id);
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete listing.');
    }
  };

  const openTradeModal = (listing) => {
    setTradeModal({ show: true, listing });
    setTradeForm({ quantity: listing.quantity || '', price: '', message: '' });
    setError('');
  };

  const submitTradeRequest = async (e) => {
    e.preventDefault();
    setSendingTrade(true);
    setError('');
    
    // We need to fetch the target industry_id, but the backend doesn't provide it in the GET /waste API.
    // However, the new tradeRequests.js backend API requires: receiverId, wasteListingId, quantityRequested, pricePerUnit.
    // Instead of receiverId, we rely on the backend automatically finding receiverId from wasteListingId if needed, 
    // OR we can make trade.create take wasteListingId and deduce receiverId.
    // Let's rely on api call:
    try {
      // Import the api inside component or at top. We already have `tradeAPI` not imported. Let's make sure it's imported.
      // Wait, we need to import tradeAPI at the top. We will do that in another chunk.
      await tradeAPI.create({
        wasteListingId: tradeModal.listing.id,
        quantityRequested: parseFloat(tradeForm.quantity),
        pricePerUnit: parseFloat(tradeForm.price) || 0,
        message: tradeForm.message
      });
      setTradeModal({ show: false, listing: null });
      alert('Trade request sent successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send trade request.');
    } finally {
      setSendingTrade(false);
    }
  };

  const filtered = listings.filter(l =>
    l.materialType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Waste Listings
          </h1>
          <p style={{ color: 'var(--text-secondary, #a0a0a5)' }}>
            Manage your available waste streams for industrial symbiosis
          </p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          <Plus size={20} /> Add Waste Stream
        </Button>
      </div>

      {/* Search & Filter */}
      <Card style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={20}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary, #a0a0a5)'
                }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Search waste materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  background: 'var(--bg-tertiary, #282a2c)',
                  border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                  borderRadius: 'var(--radius, 8px)',
                  color: 'var(--text-primary, #e2e2e5)',
                  outline: 'none'
                }}
              />
            </div>
          </div>
          <Button variant="outline">
            <Filter size={20} /> Filter
          </Button>
        </div>
      </Card>

      {/* Listings Grid */}
      {filtered.length === 0 ? (
        <Card
          style={{
            textAlign: 'center',
            padding: '4rem'
          }}
        >
          <Package
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
            No Waste Listings
          </h3>
          <p style={{ color: 'var(--text-secondary, #a0a0a5)' }}>
            Add your first waste stream to get started
          </p>
        </Card>
      ) : (
        <div
          className="dashboard-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {filtered.map((listing) => (
            <Card key={listing.id}>
              <div
                className="card-header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}
              >
                <h3
                  className="card-title"
                  style={{
                    fontSize: '1.1rem',
                    color: 'var(--text-primary, #e2e2e5)'
                  }}
                >
                  {listing.materialType}
                </h3>
                <Badge
                  variant={listing.status === 'available' ? 'success' : 'warning'}
                >
                  {listing.status}
                </Badge>
              </div>
              <p
                style={{
                  color: 'var(--text-secondary, #a0a0a5)',
                  marginBottom: '1rem',
                  fontSize: '0.9rem'
                }}
              >
                {listing.description || '—'}
              </p>
              {(listing.pricePerUnit > 0) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>₹{listing.pricePerUnit.toLocaleString()} / {listing.unit}</span>
                </div>
              )}
              {listing.category && (
                <div style={{ marginBottom: '0.5rem' }}><Badge variant="outline">{listing.category}</Badge></div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary, #a0a0a5)' }}>
                <Package size={16} />
                <span>{listing.quantity} {listing.unit}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  color: 'var(--text-secondary, #a0a0a5)'
                }}
              >
                <MapPin size={16} />
                <span>{listing.location || '—'}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ flex: 1, borderColor: 'var(--primary, #58e077)', color: 'var(--primary, #58e077)' }}
                  onClick={() => fetchAiSuggestions(listing.id, listing.materialType)}
                  disabled={loadingAi[listing.id]}
                >
                  {loadingAi[listing.id] ? <Loader size={16} className="spin" /> : <Zap size={16} />} 
                  {aiSuggestions[listing.id] ? 'Refresh AI Ideas' : 'AI Ideas'}
                </Button>
                
                {listing.industryId !== user?.id ? (
                  <Button
                    variant="primary"
                    size="sm"
                    style={{ flex: 1 }}
                    onClick={() => openTradeModal(listing)}
                  >
                    <Briefcase size={16} /> Request Trade
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ flex: 1 }}
                      onClick={() => openEditModal(listing)}
                    >
                      <Edit size={16} /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      style={{
                        flex: 1,
                        color: 'var(--error, #ef4444)',
                        borderColor: 'var(--error, #ef4444)'
                      }}
                      onClick={() => handleDelete(listing.id)}
                    >
                      <Trash2 size={16} /> Delete
                    </Button>
                  </>
                )}
              </div>

              {/* AI Ideas Panel */}
              {aiSuggestions[listing.id] && (() => {
                const allRecs = aiSuggestions[listing.id].recommendations || [];
                const userIndustry = (user?.industry_type || user?.industryType || '').toLowerCase();
                
                // Sort: user's industry match first
                const sorted = [...allRecs].sort((a, b) => {
                  const aMatch = userIndustry && a.industry?.toLowerCase().includes(userIndustry);
                  const bMatch = userIndustry && b.industry?.toLowerCase().includes(userIndustry);
                  if (aMatch && !bMatch) return -1;
                  if (!aMatch && bMatch) return 1;
                  return 0;
                });

                return (
                  <div style={{
                    padding: '1rem',
                    background: 'rgba(88, 224, 119, 0.05)',
                    border: '1px solid rgba(88, 224, 119, 0.3)',
                    borderRadius: 'var(--radius, 8px)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Zap size={16} style={{ color: 'var(--primary, #58e077)' }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary, #e2e2e5)', fontSize: '0.9rem' }}>
                        Recommended Uses
                      </span>
                      {userIndustry && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          <Star size={10} style={{ display: 'inline', marginRight: '2px', color: 'var(--primary)' }} />
                          = your industry
                        </span>
                      )}
                    </div>
                    {sorted.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {sorted.slice(0, 5).map((rec, i) => {
                          const isMyIndustry = userIndustry && rec.industry?.toLowerCase().includes(userIndustry);
                          return (
                            <Badge
                              key={i}
                              style={{
                                background: isMyIndustry ? 'rgba(88,224,119,0.15)' : 'var(--bg-secondary, #1a1c1e)',
                                border: `1px solid ${isMyIndustry ? 'rgba(88,224,119,0.5)' : 'var(--border, #37393b)'}`,
                                color: isMyIndustry ? 'var(--primary)' : 'var(--text-secondary, #a0a0a5)',
                                fontWeight: isMyIndustry ? 600 : 400,
                              }}
                            >
                              {isMyIndustry && <Star size={10} style={{ display: 'inline', marginRight: '3px' }} />}
                              {rec.industry} ({rec.application})
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #a0a0a5)' }}>No standard uses found.</span>
                    )}
                  </div>
                );
              })()}
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-content"
            style={{
              background: 'var(--bg-secondary, #1a1c1e)',
              border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '2rem',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}
            >
              <h3
                className="modal-title"
                style={{
                  fontSize: '1.25rem',
                  color: 'var(--text-primary, #e2e2e5)'
                }}
              >
                {editingId ? 'Edit Waste Listing' : 'Add Waste Stream'}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary, #a0a0a5)',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--error, #ef4444)',
                  borderRadius: 'var(--radius, 8px)',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  color: 'var(--error, #ef4444)'
                }}
              >
                <AlertCircle size={16} />
                <span style={{ fontSize: '0.9rem' }}>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label
                  className="form-label"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                    color: 'var(--text-primary, #e2e2e5)'
                  }}
                >
                  Material Type
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.materialType}
                  onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                  placeholder="e.g., Fly Ash, Steel Slag"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-tertiary, #282a2c)',
                    border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                    borderRadius: 'var(--radius, 8px)',
                    color: 'var(--text-primary, #e2e2e5)',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label
                  className="form-label"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                    color: 'var(--text-primary, #e2e2e5)'
                  }}
                >
                  Description
                </label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the material..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-tertiary, #282a2c)',
                    border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                    borderRadius: 'var(--radius, 8px)',
                    color: 'var(--text-primary, #e2e2e5)',
                    outline: 'none',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}
              >
                <div className="form-group">
                  <label
                    className="form-label"
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 500,
                      color: 'var(--text-primary, #e2e2e5)'
                    }}
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="100"
                    min="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-tertiary, #282a2c)',
                      border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                      borderRadius: 'var(--radius, 8px)',
                      color: 'var(--text-primary, #e2e2e5)',
                      outline: 'none'
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label
                    className="form-label"
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 500,
                      color: 'var(--text-primary, #e2e2e5)'
                    }}
                  >
                    Unit
                  </label>
                  <select
                    className="form-select"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-tertiary, #282a2c)',
                      border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                      borderRadius: 'var(--radius, 8px)',
                      color: 'var(--text-primary, #e2e2e5)',
                      outline: 'none'
                    }}
                  >
                    <option value="tons">Tons</option>
                    <option value="kg">Kilograms</option>
                    <option value="MWh">MWh</option>
                    <option value="liters">Liters</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label
                  className="form-label"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                    color: 'var(--text-primary, #e2e2e5)'
                  }}
                >
                  Location
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, State"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-tertiary, #282a2c)',
                    border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                    borderRadius: 'var(--radius, 8px)',
                    color: 'var(--text-primary, #e2e2e5)',
                    outline: 'none'
                  }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}
              >
                <div className="form-group">
                  <label
                    className="form-label"
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 500,
                      color: 'var(--text-primary, #e2e2e5)'
                    }}
                  >
                    Price Per Unit (Optional)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>₹</span>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.pricePerUnit}
                      onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                      placeholder="e.g. 150"
                      min="0"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2rem',
                        background: 'var(--bg-tertiary, #282a2c)',
                        border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                        borderRadius: 'var(--radius, 8px)',
                        color: 'var(--text-primary, #e2e2e5)',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label
                    className="form-label"
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: 500,
                      color: 'var(--text-primary, #e2e2e5)'
                    }}
                  >
                    Category (Optional)
                  </label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-tertiary, #282a2c)',
                      border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                      borderRadius: 'var(--radius, 8px)',
                      color: 'var(--text-primary, #e2e2e5)',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select Category</option>
                    <option value="Raw Material">Raw Material</option>
                    <option value="Byproduct">Byproduct</option>
                    <option value="Energy">Energy</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Water">Water</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label
                  className="form-label"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                    color: 'var(--text-primary, #e2e2e5)'
                  }}
                >
                  Available From
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.availableFrom}
                  onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-tertiary, #282a2c)',
                    border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                    borderRadius: 'var(--radius, 8px)',
                    color: 'var(--text-primary, #e2e2e5)',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button
                  type="button"
                  variant="outline"
                  style={{ flex: 1 }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  style={{ flex: 1 }}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Listing'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trade Request Modal */}
      {tradeModal.show && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
          }}
          onClick={() => setTradeModal({ show: false, listing: null })}
        >
          <div
            className="modal-content"
            style={{
              background: 'var(--bg-secondary, #1a1c1e)', border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
              borderRadius: 'var(--radius-lg, 12px)', padding: '2rem', width: '100%', maxWidth: '500px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                Request {tradeModal.listing.materialType}
              </h3>
              <button
                onClick={() => setTradeModal({ show: false, listing: null })}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}
              >
                ×
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Send a trade request to <strong>{tradeModal.listing.providerName}</strong>. 
            </p>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', color: 'var(--error)' }}>
                <AlertCircle size={16} /> <span>{error}</span>
              </div>
            )}

            <form onSubmit={submitTradeRequest}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Quantity Needed</label>
                  <input
                    type="number"
                    value={tradeForm.quantity}
                    onChange={(e) => setTradeForm({ ...tradeForm, quantity: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
                    required
                    max={tradeModal.listing.quantity}
                  />
                  <small style={{ color: 'var(--text-muted)' }}>Max: {tradeModal.listing.quantity} {tradeModal.listing.unit}</small>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Price Offer (per unit)</label>
                  <input
                    type="number"
                    value={tradeForm.price}
                    onChange={(e) => setTradeForm({ ...tradeForm, price: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }}
                    placeholder="e.g. 1500"
                  />
                  <small style={{ color: 'var(--text-muted)' }}>Leave blank for free</small>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Message / Proposal</label>
                <textarea
                  value={tradeForm.message}
                  onChange={(e) => setTradeForm({ ...tradeForm, message: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', minHeight: '80px', resize: 'vertical' }}
                  placeholder="Optional details about logistics or intended use..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button type="button" variant="outline" style={{ flex: 1 }} onClick={() => setTradeModal({ show: false, listing: null })}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" style={{ flex: 1 }} disabled={sendingTrade}>
                  {sendingTrade ? 'Sending...' : 'Send Proposal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteListingsPage;
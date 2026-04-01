import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, MapPin, Package, AlertCircle } from 'lucide-react';
import { wasteAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const emptyForm = {
  materialType: '',
  description: '',
  quantity: '',
  unit: 'tons',
  location: '',
  availableFrom: ''
};

const WasteListingsPage = ({ user }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await wasteAPI.getAll();
      setListings(res.data.data || []);
    } catch (err) {
      setError('Failed to load waste listings.');
    } finally {
      setLoading(false);
    }
  };

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
      availableFrom: listing.availableFrom ? listing.availableFrom.split('T')[0] : ''
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  color: 'var(--text-secondary, #a0a0a5)'
                }}
              >
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
              <div style={{ display: 'flex', gap: '0.5rem' }}>
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
              </div>
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
    </div>
  );
};

export default WasteListingsPage;
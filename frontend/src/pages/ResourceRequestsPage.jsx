import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, MapPin, Package, Building, AlertCircle } from 'lucide-react';
import { resourceAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const emptyForm = {
  materialNeeded: '',
  description: '',
  quantity: '',
  unit: 'tons',
  industrySector: '',
  location: '',
  requiredBy: '',
  pricePerUnit: '',
  category: ''
};

const ResourceRequestsPage = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await resourceAPI.getAll();
      setRequests(res.data.data || []);
    } catch (err) {
      setError('Failed to load resource requests.');
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

  const openEditModal = (req) => {
    setEditingId(req.id);
    setFormData({
      materialNeeded: req.materialNeeded,
      description: req.description || '',
      quantity: req.quantity.toString(),
      unit: req.unit,
      industrySector: req.industrySector || '',
      location: req.location || '',
      requiredBy: req.requiredBy ? req.requiredBy.split('T')[0] : '',
      pricePerUnit: req.pricePerUnit?.toString() || '',
      category: req.category || ''
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
        await resourceAPI.update(editingId, { ...formData, quantity: parseFloat(formData.quantity) });
      } else {
        await resourceAPI.create({ ...formData, quantity: parseFloat(formData.quantity) });
      }
      setShowModal(false);
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save request.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource request?')) return;
    try {
      await resourceAPI.delete(id);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete request.');
    }
  };

  const filtered = requests.filter(r =>
    r.materialNeeded.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = requests.filter(r => r.status === 'active').length;
  const fulfilledCount = requests.filter(r => r.status === 'fulfilled').length;

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
            Resource Requests
          </h1>
          <p style={{ color: 'var(--text-secondary, #a0a0a5)' }}>
            Find and request materials you need from other industries
          </p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          <Plus size={20} /> Create Request
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
                placeholder="Search materials needed..."
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
              <Package size={24} color="var(--bg-primary, #121416)" />
            </div>
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--primary, #58e077)'
            }}
          >
            {activeCount}
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary, #a0a0a5)'
            }}
          >
            Active Requests
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
              <Building size={24} color="white" />
            </div>
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--success, #10b981)'
            }}
          >
            {fulfilledCount}
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary, #a0a0a5)'
            }}
          >
            Fulfilled Requests
          </div>
        </Card>

        <Card
          style={{
            background: 'rgba(0, 218, 243, 0.1)',
            border: '1px solid var(--accent, #00daf3)'
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
                background: 'var(--accent, #00daf3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <MapPin size={24} color="var(--bg-primary, #121416)" />
            </div>
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--accent, #00daf3)'
            }}
          >
            {requests.length}
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary, #a0a0a5)'
            }}
          >
            Total Requests
          </div>
        </Card>
      </div>

      {/* Requests Grid */}
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
            No Resource Requests
          </h3>
          <p style={{ color: 'var(--text-secondary, #a0a0a5)' }}>
            Create your first request to find materials
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
          {filtered.map((req) => (
            <Card key={req.id}>
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
                  {req.materialNeeded}
                </h3>
                <Badge
                  variant={req.status === 'active' ? 'success' : 'primary'}
                >
                  {req.status}
                </Badge>
              </div>
              <p
                style={{
                  color: 'var(--text-secondary, #a0a0a5)',
                  marginBottom: '1rem',
                  fontSize: '0.9rem'
                }}
              >
                {req.description || '—'}
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
                <span>{req.quantity} {req.unit}</span>
              </div>
              {(req.pricePerUnit > 0) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Offering ₹{req.pricePerUnit.toLocaleString()} / {req.unit}</span>
                </div>
              )}
              {req.category && (
                <div style={{ marginBottom: '0.5rem' }}><Badge variant="outline">{req.category}</Badge></div>
              )}
              {req.industrySector && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: 'var(--text-secondary, #a0a0a5)'
                  }}
                >
                  <Building size={16} />
                  <span>{req.industrySector} Industry</span>
                </div>
              )}
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
                <span>{req.location || '—'}</span>
              </div>
              {req.industryId === user?.id && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{ flex: 1 }}
                    onClick={() => openEditModal(req)}
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
                    onClick={() => handleDelete(req.id)}
                  >
                    <Trash2 size={16} /> Delete
                  </Button>
                </div>
              )}
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
                {editingId ? 'Edit Request' : 'Create Resource Request'}
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
                  Material Needed
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.materialNeeded}
                  onChange={(e) => setFormData({ ...formData, materialNeeded: e.target.value })}
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
                  placeholder="Describe your requirements..."
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
                  Industry Sector
                </label>
                <select
                  className="form-select"
                  value={formData.industrySector}
                  onChange={(e) => setFormData({ ...formData, industrySector: e.target.value })}
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
                  <option value="">Select Sector</option>
                  <option value="Cement">Cement</option>
                  <option value="Construction">Construction</option>
                  <option value="Energy">Energy</option>
                  <option value="Chemical">Chemical</option>
                  <option value="Manufacturing">Manufacturing</option>
                </select>
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
                    Price Offering (per unit)
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
                  Required By
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.requiredBy}
                  onChange={(e) => setFormData({ ...formData, requiredBy: e.target.value })}
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
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceRequestsPage;
import React, { useState, useEffect } from 'react';
import { Truck, Map, Box, CheckCircle, Clock, Zap, AlertTriangle, ArrowRight, Shield, Leaf } from 'lucide-react';
import { logisticsAPI } from '../services/api';

const fmt = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

function KpiCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: `1px solid ${color}33`,
      borderRadius: 16, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
      transition: 'all 0.3s ease', cursor: 'default'
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ background: `${color}22`, borderRadius: 10, padding: '0.6rem', color }}>
          <Icon size={22} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
      </div>
      {sub && <div style={{ fontSize: '0.78rem', color, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

function VendorRecommendation() {
  const [distance, setDistance] = useState(250);
  const [weight, setWeight] = useState(15);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await logisticsAPI.getVendorRecommendations(distance, weight);
      setVendors(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (vendorId) => {
    setBooking(vendorId);
    try {
      await logisticsAPI.bookShipment({ transactionId: 'dummy-tx', vendorId, routeType: 'standard' });
      setTimeout(() => {
        alert('Shipment Booked Successfully!');
        setBooking(null);
      }, 800);
    } catch (e) {
      setBooking(null);
      alert('Booking failed');
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
        <Map size={20} color="#00daf3" />
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>AI Vendor Recommendation Engine</h3>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Distance (km)</label>
          <input type="number" value={distance} onChange={e => setDistance(e.target.value)}
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.55rem 0.75rem', color: 'var(--text-primary)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Weight (tons)</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.55rem 0.75rem', color: 'var(--text-primary)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', flex: 1, minWidth: 150 }}>
          <button onClick={fetchRecommendations} disabled={loading}
            style={{ width: '100%', background: 'linear-gradient(135deg, #00daf3, #00b4d8)', color: '#000', border: 'none', borderRadius: 8, padding: '0.65rem 1rem', fontWeight: 700, cursor: 'pointer' }}>
            {loading ? 'Analyzing Routes...' : 'Get AI Recommendations'}
          </button>
        </div>
      </div>

      {vendors.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {vendors.map(v => (
            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 12, border: `1px solid ${v.tag ? '#00daf355' : 'var(--border)'}` }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{v.name}</span>
                  {v.tag && <span style={{ background: 'rgba(0,218,243,0.15)', color: '#00daf3', padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600 }}>{v.tag}</span>}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: 16 }}>
                  <span>⭐ {v.rating}</span>
                  <span>🌱 CO2: {v.co2Rating}</span>
                  <span>⏱️ Est: {v.estimatedDeliveryDays} days</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#58e077' }}>{fmt(v.totalCost)}</div>
                </div>
                <button 
                  onClick={() => handleBook(v.id)}
                  disabled={booking === v.id}
                  style={{ background: 'transparent', border: '1px solid #58e077', color: '#58e077', padding: '0.5rem 1.5rem', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                  {booking === v.id ? 'Booking...' : 'Book Transport'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LogisticsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    logisticsAPI.getDashboard().then(res => setDashboard(res.data.data)).finally(() => setLoading(false));
  }, []);

  const kpis = dashboard?.kpis || {};
  const shipments = dashboard?.recentShipments || [];
  const suggestions = dashboard?.suggestions || [];

  const getStatusColor = (s) => {
    switch (s) {
      case 'Delivered': return '#58e077';
      case 'In Transit': return '#00daf3';
      case 'Booking Confirmed': return '#a78bfa';
      default: return '#f59e0b';
    }
  };

  return (
    <div className="page-container fade-in-up">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ background: 'rgba(0,218,243,0.15)', borderRadius: 12, padding: '0.6rem', color: '#00daf3' }}>
            <Truck size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #00daf3, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Smart Logistics & Execution
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              AI-powered transport matching · Route optimization · Live tracking
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: '2rem' }}>
        {['dashboard', 'book'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '0.5rem 1.1rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize',
              background: tab === t ? 'linear-gradient(135deg, #00daf3, #00b4d8)' : 'var(--bg-tertiary)',
              color: tab === t ? '#000' : 'var(--text-secondary)' }}>
            {t === 'dashboard' ? '📊 Dashboard' : '🚚 Book Transport'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
      ) : tab === 'dashboard' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <KpiCard icon={Box} label="Active Shipments" value={kpis.activeShipments} color="#f59e0b" />
            <KpiCard icon={CheckCircle} label="Completed Deliveries" value={kpis.completedShipments} color="#58e077" />
            <KpiCard icon={Truck} label="Total Logistics Spend" value={fmt(kpis.totalLogisticsSpend)} color="#a78bfa" />
            <KpiCard icon={Zap} label="Freight Savings (Opt.)" value={fmt(kpis.avgFreightSavings)} sub="Via AI Routes" color="#00daf3" />
            <KpiCard icon={Clock} label="On-Time Delivery" value={`${kpis.onTimeDeliveryPct}%`} color="#10b981" />
            <KpiCard icon={Leaf} label="CO2 Reduced (Routes)" value={`${kpis.co2ReducedRoutes}t`} color="#2ebd59" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Live Shipments</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr>
                    <th>Material</th><th>Route</th><th>Distance</th><th>Cost</th><th>Status</th>
                  </tr></thead>
                  <tbody>
                    {shipments.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.materialType} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({s.quantity}{s.unit})</span></td>
                        <td style={{ fontSize: '0.85rem' }}>{s.origin} <ArrowRight size={12} style={{ margin: '0 4px', verticalAlign: 'middle' }}/> {s.destination}</td>
                        <td style={{ fontSize: '0.85rem' }}>{s.distance} km</td>
                        <td style={{ fontWeight: 600 }}>{fmt(s.cost)}</td>
                        <td>
                          <span style={{ background: `${getStatusColor(s.status)}22`, color: getStatusColor(s.status), padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>AI Alerts & Suggestions</h3>
              {suggestions.map((s, i) => (
                <div key={i} style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', display: 'flex', gap: '0.8rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 2 }}>{s.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <VendorRecommendation />
      )}
    </div>
  );
}

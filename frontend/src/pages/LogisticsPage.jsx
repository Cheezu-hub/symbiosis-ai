import React, { useState } from 'react';
import { Truck, MapPin, Package, Clock, ShieldCheck, Zap, Navigation, DollarSign, Leaf, Award, Search, ChevronRight, Activity, Filter, FileText } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Mock Data for Prototype
const MOCK_SHIPMENTS = [
  { id: 'SHP-9021', origin: 'Mumbai, MH', destination: 'Pune, MH', status: 'In Transit', material: 'Scrap Metal', quantity: '5 Tons', eta: '2 Hours', vendor: 'EcoFreight Ltd.' },
  { id: 'SHP-9022', origin: 'Surat, GJ', destination: 'Ahmedabad, GJ', status: 'Driver Assigned', material: 'Textile Waste', quantity: '2.5 Tons', eta: 'Tomorrow', vendor: 'FastMove Logistics' },
  { id: 'SHP-9023', origin: 'Bengaluru, KA', destination: 'Chennai, TN', status: 'Delivered', material: 'E-Waste', quantity: '1.2 Tons', eta: 'Delivered', vendor: 'GreenTransit' }
];

const MOCK_VENDORS = [
  { id: 'V-01', name: 'EcoFreight Ltd.', rating: 4.9, cost: '₹12,500', speed: 'Fast', emissions: 'Low', features: ['Eco-friendly', 'Real-time Tracking'], highlight: 'Lowest Carbon' },
  { id: 'V-02', name: 'FastMove Logistics', rating: 4.8, cost: '₹14,200', speed: 'Same Day', emissions: 'Medium', features: ['Express', 'Insured'], highlight: 'Fastest Delivery' },
  { id: 'V-03', name: 'ValueTransport', rating: 4.5, cost: '₹9,800', speed: '2 Days', emissions: 'High', features: ['Budget', 'Heavy Load'], highlight: 'Lowest Cost' },
  { id: 'V-04', name: 'GreenTransit', rating: 4.9, cost: '₹13,000', speed: 'Next Day', emissions: 'Low', features: ['Electric Fleet', 'Verified'], highlight: 'Best Rated' }
];

const LogisticsPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, marketplace, tracking

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary, #f3f4f6)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Truck size={32} color="var(--primary, #58e077)" /> AI-Powered Logistics
          </h1>
          <p style={{ color: 'var(--text-secondary, #a0a0a5)', margin: '0.5rem 0 0' }}>
            Execute trades seamlessly with smart routing, vendor comparison, and live tracking.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="outline" onClick={() => setActiveTab('dashboard')} style={{ borderColor: activeTab === 'dashboard' ? 'var(--primary)' : '' }}>
            <Activity size={18} /> Overview
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('marketplace')} style={{ borderColor: activeTab === 'marketplace' ? 'var(--primary)' : '' }}>
            <Search size={18} /> Find Transport
          </Button>
          <Button variant="primary" onClick={() => setActiveTab('tracking')}>
            <MapPin size={18} /> Live Tracking
          </Button>
        </div>
      </div>

      {/* Tabs Content */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <Card style={{ padding: '1.5rem', background: 'linear-gradient(145deg, rgba(30, 32, 34, 0.8), rgba(40, 42, 44, 0.8))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(88, 224, 119, 0.1)', borderRadius: '12px' }}>
                  <Truck size={24} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Active Shipments</h3>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>12</div>
                </div>
              </div>
            </Card>
            <Card style={{ padding: '1.5rem', background: 'linear-gradient(145deg, rgba(30, 32, 34, 0.8), rgba(40, 42, 44, 0.8))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(0, 218, 243, 0.1)', borderRadius: '12px' }}>
                  <DollarSign size={24} color="var(--secondary)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Freight Savings</h3>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹45,200</div>
                </div>
              </div>
            </Card>
            <Card style={{ padding: '1.5rem', background: 'linear-gradient(145deg, rgba(30, 32, 34, 0.8), rgba(40, 42, 44, 0.8))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
                  <Clock size={24} color="#3b82f6" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>On-Time Delivery</h3>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>98.5%</div>
                </div>
              </div>
            </Card>
            <Card style={{ padding: '1.5rem', background: 'linear-gradient(145deg, rgba(30, 32, 34, 0.8), rgba(40, 42, 44, 0.8))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                  <Leaf size={24} color="#10b981" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>CO2 Saved (Routes)</h3>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>4.2 Tons</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Shipments Table */}
          <Card style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Recent Shipments</h2>
              <Button variant="outline" size="small">View All</Button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>ID</th>
                    <th style={{ padding: '1rem' }}>Route</th>
                    <th style={{ padding: '1rem' }}>Material</th>
                    <th style={{ padding: '1rem' }}>Vendor</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_SHIPMENTS.map((shipment) => (
                    <tr key={shipment.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{shipment.id}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{shipment.origin}</span>
                          <ChevronRight size={14} color="var(--text-secondary)" />
                          <span>{shipment.destination}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>{shipment.material} ({shipment.quantity})</td>
                      <td style={{ padding: '1rem' }}>{shipment.vendor}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '999px', 
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: shipment.status === 'Delivered' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                          color: shipment.status === 'Delivered' ? '#10b981' : '#3b82f6'
                        }}>
                          {shipment.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <Button variant="outline" size="small" onClick={() => setActiveTab('tracking')}>Track</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'marketplace' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* AI Recommendation Banner */}
          <Card style={{ padding: '2rem', background: 'linear-gradient(to right, rgba(88, 224, 119, 0.1), rgba(0, 218, 243, 0.1))', border: '1px solid rgba(88, 224, 119, 0.3)' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '1rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '16px', color: '#000' }}>
                <Zap size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>AI Smart Routing Enabled</h2>
                <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Based on your trade of <strong>5 Tons of Scrap Metal</strong> from Mumbai to Pune, our AI has analyzed 40+ vendors. We recommend a shared-load route to reduce costs by 18% and lower carbon emissions.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}><CheckCircleIcon color="var(--primary)" /> 12 Matches Found</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}><CheckCircleIcon color="var(--primary)" /> Route Optimized</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Vendor Comparison */}
          <h2 style={{ fontSize: '1.25rem', margin: '1rem 0 0 0' }}>Top Recommended Transport Vendors</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {MOCK_VENDORS.map(vendor => (
              <Card key={vendor.id} style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                {/* Highlight Badge */}
                <div style={{ 
                  position: 'absolute', top: '12px', right: '-30px', background: 'var(--primary)', color: '#000', 
                  padding: '4px 40px', transform: 'rotate(45deg)', fontSize: '0.75rem', fontWeight: 700 
                }}>
                  {vendor.highlight}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem' }}>{vendor.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <Award size={16} color="#fbbf24" /> {vendor.rating} / 5.0 Rating
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Estimated Cost:</span>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{vendor.cost}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Delivery Speed:</span>
                    <span>{vendor.speed}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Carbon Emissions:</span>
                    <span style={{ color: vendor.emissions === 'Low' ? '#10b981' : '#f59e0b' }}>{vendor.emissions}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {vendor.features.map(f => (
                    <span key={f} style={{ padding: '0.25rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {f}
                    </span>
                  ))}
                </div>

                <Button variant="primary" style={{ width: '100%' }}>Book Shipment</Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tracking' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          {/* Map/Route Area */}
          <Card style={{ padding: '1.5rem', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 1rem 0' }}>Live Route Tracking: SHP-9021</h2>
            <div style={{ 
              flex: 1, 
              background: 'url("https://www.transparenttextures.com/patterns/cubes.png") rgba(30,32,34,0.5)', 
              borderRadius: '12px',
              border: '1px solid var(--border)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {/* Mock Map Element */}
              <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(0,0,0,0.7)', padding: '1rem', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Navigation size={16} color="var(--primary)" />
                  <span style={{ fontWeight: 600 }}>Driver: Ramesh S.</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Vehicle: MH 12 AB 1234 (Heavy Truck)</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Speed: 65 km/h</div>
              </div>

              {/* Decorative Map Path */}
              <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                <path d="M 100,500 Q 300,400 400,200 T 700,100" fill="none" stroke="var(--primary)" strokeWidth="4" strokeDasharray="10, 10" />
                <circle cx="100" cy="500" r="8" fill="#fff" stroke="var(--primary)" strokeWidth="4" />
                <circle cx="700" cy="100" r="8" fill="#fff" stroke="var(--error, #ef4444)" strokeWidth="4" />
                {/* Truck icon on path */}
                <g transform="translate(400, 200)">
                  <circle cx="0" cy="0" r="15" fill="var(--secondary)" />
                  <Truck size={16} color="#000" x="-8" y="-8" />
                </g>
              </svg>
            </div>
          </Card>

          {/* Tracking Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>Shipment Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                {/* Vertical Line */}
                <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border)' }}></div>
                
                {[
                  { title: 'Booking Confirmed', time: 'Oct 24, 09:00 AM', active: true, done: true },
                  { title: 'Driver Assigned', time: 'Oct 24, 09:30 AM', active: true, done: true },
                  { title: 'Pickup Completed', time: 'Oct 24, 11:00 AM', active: true, done: true },
                  { title: 'In Transit', time: 'Currently Active', active: true, done: false },
                  { title: 'Near Destination', time: 'Est. 01:30 PM', active: false, done: false },
                  { title: 'Delivered', time: 'Est. 02:00 PM', active: false, done: false }
                ].map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      background: step.done ? 'var(--primary)' : (step.active ? 'var(--secondary)' : 'var(--bg-secondary)'),
                      border: `2px solid ${step.active || step.done ? 'transparent' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {step.done && <CheckCircleIcon size={12} color="#000" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: step.active ? 700 : 500, color: step.active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {step.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{step.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Documents</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Button variant="outline" style={{ justifyContent: 'flex-start' }}><FileText size={16} /> E-Way Bill</Button>
                <Button variant="outline" style={{ justifyContent: 'flex-start' }}><FileText size={16} /> Material Manifest</Button>
                <Button variant="outline" style={{ justifyContent: 'flex-start' }}><FileText size={16} /> Delivery Receipt (Pending)</Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component
const CheckCircleIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default LogisticsPage;

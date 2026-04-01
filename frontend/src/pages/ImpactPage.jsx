import React, { useState, useEffect } from 'react';
import { Leaf, TrendingUp, Package, Droplets, Wind, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { impactAPI } from '../services/api';
import Card from '../components/ui/Card';

const COLORS = ['#1F7A8C', '#10B981', '#F59E0B', '#00C9B1'];

const ImpactPage = ({ user }) => {
  const [metrics, setMetrics] = useState({});
  const [report, setReport] = useState([]);
  const [score, setScore] = useState({});
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll();
  }, [period]);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [metricsRes, reportRes, scoreRes] = await Promise.all([
        impactAPI.getMetrics(),
        impactAPI.getReport(period),
        impactAPI.getSustainabilityScore()
      ]);
      setMetrics(metricsRes.data.data || {});
      setReport(reportRes.data.data || []);
      setScore(scoreRes.data.data || {});
    } catch (err) {
      setError('Failed to load impact data.');
    } finally {
      setLoading(false);
    }
  };

  const impactCards = [
    { icon: Wind, title: 'CO₂ Reduced', value: (metrics.co2Reduced || 0).toLocaleString(), unit: 'tons', color: 'success' },
    { icon: Package, title: 'Waste Diverted', value: (metrics.wasteDiverted || 0).toLocaleString(), unit: 'tons', color: 'primary' },
    { icon: Droplets, title: 'Water Saved', value: (metrics.waterSaved || 0).toLocaleString(), unit: 'liters', color: 'accent' },
    { icon: TrendingUp, title: 'Energy Saved', value: (metrics.energySaved || 0).toLocaleString(), unit: 'MWh', color: 'warning' }
  ];

  const pieData = Object.entries(score.breakdown || {}).map(([key, val], i) => ({
    name: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
    value: val,
    color: COLORS[i % COLORS.length]
  }));

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
            Environmental Impact
          </h1>
          <p style={{ color: 'var(--text-secondary, #a0a0a5)' }}>
            Track your contribution to sustainability and circular economy
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button className="btn btn-outline" onClick={fetchAll}>
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </div>

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

      {/* Impact Summary Banners */}
      <div
        className="impact-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
              fontSize: '2.5rem',
              fontWeight: 700,
              color: 'var(--primary, #58e077)',
              marginBottom: '0.5rem'
            }}
          >
            {(metrics.co2Reduced || 0).toLocaleString()}
          </div>
          <div
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary, #a0a0a5)'
            }}
          >
            Tons CO₂ Reduced
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
              fontSize: '2.5rem',
              fontWeight: 700,
              color: 'var(--success, #10b981)',
              marginBottom: '0.5rem'
            }}
          >
            {(metrics.wasteDiverted || 0).toLocaleString()}
          </div>
          <div
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary, #a0a0a5)'
            }}
          >
            Tons Waste Diverted
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
              fontSize: '2.5rem',
              fontWeight: 700,
              color: 'var(--accent, #00daf3)',
              marginBottom: '0.5rem'
            }}
          >
            {((metrics.waterSaved || 0) / 1000).toFixed(1)}K
          </div>
          <div
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary, #a0a0a5)'
            }}
          >
            Liters Water Saved
          </div>
        </Card>
      </div>

      {/* Stat Cards */}
      <div
        className="dashboard-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem',
          marginBottom: '2rem'
        }}
      >
        {impactCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              style={{
                background: 'var(--bg-card, rgba(51, 53, 55, 0.4))',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--border, rgba(55, 57, 59, 0.5))'
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
                    background: `rgba(${card.color === 'primary' ? '88, 224, 119' : card.color === 'success' ? '16, 185, 129' : card.color === 'accent' ? '0, 218, 243' : '245, 158, 11'}, 0.2)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon
                    size={24}
                    color={card.color === 'primary' ? 'var(--primary, #58e077)' : card.color === 'success' ? 'var(--success, #10b981)' : card.color === 'accent' ? 'var(--accent, #00daf3)' : 'var(--warning, #f59e0b)'}
                  />
                </div>
              </div>
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: 'var(--text-primary, #e2e2e5)',
                  marginBottom: '0.25rem'
                }}
              >
                {card.value}
              </div>
              <div
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary, #a0a0a5)'
                }}
              >
                {card.title} {card.unit && <span style={{ marginLeft: '0.25rem' }}>({card.unit})</span>}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem',
          marginBottom: '2rem'
        }}
      >
        <Card>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3
              style={{
                fontSize: '1.1rem',
                color: 'var(--text-primary, #e2e2e5)'
              }}
            >
              Impact Over Time
            </h3>
          </div>
          {report.length === 0 ? (
            <p
              style={{
                color: 'var(--text-secondary, #a0a0a5)',
                padding: '2rem 0',
                textAlign: 'center'
              }}
            >
              No report data yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #37393b)" />
                <XAxis
                  dataKey="period"
                  stroke="var(--text-secondary, #a0a0a5)"
                  tickFormatter={v => new Date(v).toLocaleDateString('en-IN', { month: 'short' })}
                />
                <YAxis stroke="var(--text-secondary, #a0a0a5)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary, #1a1c1e)',
                    border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                    borderRadius: 'var(--radius, 8px)',
                    color: 'var(--text-primary, #e2e2e5)'
                  }}
                />
                <Bar dataKey="co2Reduced" fill="var(--primary, #58e077)" name="CO₂ (tons)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="wasteDiverted" fill="var(--success, #10b981)" name="Waste (tons)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3
              style={{
                fontSize: '1.1rem',
                color: 'var(--text-primary, #e2e2e5)'
              }}
            >
              Sustainability Score Breakdown
            </h3>
          </div>
          {pieData.length === 0 ? (
            <p
              style={{
                color: 'var(--text-secondary, #a0a0a5)',
                padding: '2rem 0',
                textAlign: 'center'
              }}
            >
              No score data yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary, #1a1c1e)',
                    border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                    borderRadius: 'var(--radius, 8px)',
                    color: 'var(--text-primary, #e2e2e5)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Raw Material Savings */}
      {metrics.rawMaterialSaved > 0 && (
        <Card style={{ marginTop: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3
              style={{
                fontSize: '1.1rem',
                color: 'var(--text-primary, #e2e2e5)'
              }}
            >
              Raw Material Savings
            </h3>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem'
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--primary, #58e077)',
                  marginBottom: '0.5rem'
                }}
              >
                {metrics.rawMaterialSaved} tons
              </div>
              <div style={{ color: 'var(--text-secondary, #a0a0a5)' }}>
                Total Raw Materials Saved
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--success, #10b981)',
                  marginBottom: '0.5rem'
                }}
              >
                ₹{(metrics.rawMaterialSaved * 2500 / 100000).toFixed(1)}L
              </div>
              <div style={{ color: 'var(--text-secondary, #a0a0a5)' }}>
                Equivalent Cost Savings
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ImpactPage;
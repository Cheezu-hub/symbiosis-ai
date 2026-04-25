import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Recycle,
  Factory,
  Zap,
  Leaf,
  TrendingUp,
  Plus,
  ArrowRight,
  Package,
  Wind,
  Globe2,
  Truck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { wasteAPI, resourceAPI, matchAPI, impactAPI, aiAPI } from '../services/api';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

import Skeleton from '../components/ui/Skeleton';

const DashboardSkeleton = () => (
  <div className="page-container">
    <div style={{ marginBottom: '2rem' }}>
      <Skeleton variant="text" width="300px" height="2.5rem" style={{ marginBottom: '0.5rem' }} />
      <Skeleton variant="text" width="450px" height="1rem" />
    </div>

    <div className="impact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      {[1, 2, 3].map(i => (
        <Card key={i} style={{ height: '180px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Skeleton variant="circular" width="48px" height="48px" />
            <Skeleton variant="text" width="100px" />
          </div>
          <Skeleton variant="text" width="140px" height="2.5rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton variant="text" width="60px" />
        </Card>
      ))}
    </div>

    <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      {[1, 2, 3, 4].map(i => (
        <Card key={i} style={{ height: '140px', padding: '1.5rem' }}>
          <Skeleton variant="circular" width="40px" height="40px" style={{ marginBottom: '1rem' }} />
          <Skeleton variant="text" width="80px" height="1.5rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton variant="text" width="120px" />
        </Card>
      ))}
    </div>

    <Card style={{ marginBottom: '2rem', height: '180px' }}>
      <Skeleton variant="text" width="200px" height="1.5rem" style={{ marginBottom: '2.5rem' }} />
      <div style={{ display: 'flex', gap: '2rem' }}>
        <Skeleton variant="circular" width="80px" height="80px" />
        <div style={{ flex: 1 }}>
          <Skeleton variant="text" width="150px" height="1.25rem" style={{ marginBottom: '1rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Skeleton variant="text" />
            <Skeleton variant="text" />
          </div>
        </div>
      </div>
    </Card>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      <Card style={{ height: '350px' }}>
        <Skeleton variant="text" width="180px" height="1.5rem" style={{ marginBottom: '2rem' }} />
        <Skeleton variant="rectangular" width="100%" height="240px" />
      </Card>
      <Card style={{ height: '350px' }}>
        <Skeleton variant="text" width="180px" height="1.5rem" style={{ marginBottom: '2rem' }} />
        <Skeleton variant="rectangular" width="100%" height="240px" />
      </Card>
    </div>
  </div>
);

const DashboardPage = ({ user }) => {
  const [stats, setStats] = useState({
    wasteListed: 0,
    resourceRequests: 0,
    activeMatches: 0,
    co2Reduced: 0,
    wasteDiverted: 0,
    costSavings: 0
  });
  const [recentMatches, setRecentMatches] = useState([]);
  const [sustainabilityScore, setSustainabilityScore] = useState(0);
  const [scoreBreakdown, setScoreBreakdown] = useState({});
  const [chartData, setChartData] = useState([]);
  const [aiOpportunities, setAiOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [wasteRes, resourceRes, matchRes, impactRes, scoreRes, oppsRes] = await Promise.all([
        wasteAPI.getAll(),
        resourceAPI.getAll(),
        matchAPI.getAll(),
        impactAPI.getMetrics(),
        impactAPI.getSustainabilityScore(),
        aiAPI.getOpportunities(3)
      ]);

      const wastes = wasteRes.data.data || [];
      const resources = resourceRes.data.data || [];
      const matchData = matchRes.data.data?.matches || [];
      const impact = impactRes.data.data || {};
      const scoreData = scoreRes.data.data || {};
      const oppsData = oppsRes.data.data?.opportunities || [];

      const activeMatches = matchData.filter(
        (m) => m.status === 'pending' || m.status === 'accepted'
      );
      const totalCostSavings = matchData.reduce(
        (acc, m) => acc + (m.costSavings || 0),
        0
      );

      setStats({
        wasteListed: wastes.length,
        resourceRequests: resources.length,
        activeMatches: activeMatches.length,
        co2Reduced: impact.co2Reduced || 0,
        wasteDiverted: impact.wasteDiverted || 0,
        costSavings: totalCostSavings
      });

      setRecentMatches(matchData.slice(0, 5));
      setSustainabilityScore(scoreData.overallScore || 0);
      setScoreBreakdown(scoreData.breakdown || {});
      setAiOpportunities(oppsData);

      const months = [
        'Month 1',
        'Month 2',
        'Month 3',
        'Month 4',
        'Month 5',
        'Month 6'
      ];
      setChartData(
        months.map((month, i) => ({
          month,
          waste: Math.round((wastes.length / 6) * (i + 1)),
          matches: Math.round((matchData.length / 6) * (i + 1))
        }))
      );
    } catch (err) {
      setError('Failed to load dashboard data. Make sure the backend is running.');
      console.error(err);
    } finally {
      // Small timeout to give the skeleton some "screen time"
      setTimeout(() => setLoading(false), 900);
    }
  };

  const statCards = [
    {
      icon: Recycle,
      title: 'Waste Listed',
      value: stats.wasteListed,
      unit: 'streams',
      color: 'primary'
    },
    {
      icon: Factory,
      title: 'Resource Requests',
      value: stats.resourceRequests,
      unit: 'active',
      color: 'accent'
    },
    {
      icon: Zap,
      title: 'AI Matches',
      value: stats.activeMatches,
      unit: 'active',
      color: 'success'
    },
    {
      icon: Leaf,
      title: 'CO₂ Reduced',
      value: `${(stats.co2Reduced || 0).toFixed(1)}`,
      unit: 'tons',
      color: 'success'
    }
  ];

  if (loading && !error) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="page-container fade-in-up">
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '2rem',
            marginBottom: '0.5rem',
            color: 'var(--text-primary, #e2e2e5)'
          }}
        >
          Welcome back, {user?.companyName || 'Industry Partner'}!
        </h1>
        <p style={{ color: 'var(--text-secondary, #a0a0a5)' }}>
          Track your industrial symbiosis performance and opportunities
        </p>
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

      {/* Impact Metrics - Hero Cards */}
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
            background:
              'linear-gradient(135deg, rgba(88, 224, 119, 0.1), rgba(46, 189, 89, 0.1))',
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
            <span
              style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #a0a0a5)' }}
            >
              Waste Diverted
            </span>
          </div>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: 'var(--primary, #58e077)'
            }}
          >
            {(stats.wasteDiverted || 0).toLocaleString()}
          </div>
          <div
            style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #a0a0a5)' }}
          >
            Tons
          </div>
        </Card>

        <Card
          style={{
            background:
              'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))'
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
              <Wind size={24} color="white" />
            </div>
            <span
              style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #a0a0a5)' }}
            >
              CO₂ Reduced
            </span>
          </div>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: 'var(--success, #10b981)'
            }}
          >
            {(stats.co2Reduced || 0).toLocaleString()}
          </div>
          <div
            style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #a0a0a5)' }}
          >
            Tons
          </div>
        </Card>

        <Card
          style={{
            background:
              'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))'
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
            <span
              style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #a0a0a5)' }}
            >
              Cost Savings
            </span>
          </div>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: 'var(--warning, #f59e0b)'
            }}
          >
            ₹{((stats.costSavings || 0) / 100000).toFixed(1)}L
          </div>
          <div
            style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #a0a0a5)' }}
          >
            Total Savings
          </div>
        </Card>
      </div>

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
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <StatCard
              key={index}
              icon={Icon}
              title={stat.title}
              value={stat.value}
              unit={stat.unit}
              color={stat.color}
            />
          );
        })}
      </div>

      {/* Sustainability Score */}
      <Card style={{ marginBottom: '2rem', marginTop: '2rem' }}>
        <div
          className="card-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}
        >
          <h3
            className="card-title"
            style={{ fontSize: '1.1rem', color: 'var(--text-primary, #e2e2e5)' }}
          >
            Sustainability Score
          </h3>
          <Link to="/impact">
            <Button variant="outline" size="sm">
              View Details <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            flexWrap: 'wrap'
          }}
        >
          <div
            className="score-circle"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: `conic-gradient(var(--primary, #58e077) ${sustainabilityScore}%, var(--border, rgba(55, 57, 59, 0.5)) ${sustainabilityScore}%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              className="score-inner"
              style={{
                width: '58px',
                height: '58px',
                borderRadius: '50%',
                background: 'var(--bg-secondary, #1a1c1e)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                className="score-value"
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: 'var(--text-primary, #e2e2e5)'
                }}
              >
                {sustainabilityScore}
              </div>
              <div
                className="score-label"
                style={{
                  fontSize: '0.6rem',
                  color: 'var(--text-secondary, #a0a0a5)',
                  textTransform: 'uppercase'
                }}
              >
                out of 100
              </div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h4
              style={{
                marginBottom: '1rem',
                color: 'var(--text-primary, #e2e2e5)'
              }}
            >
              Score Breakdown
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem'
              }}
            >
              {Object.entries(scoreBreakdown).map(([key, val]) => (
                <div key={key}>
                  <div
                    style={{
                      color: 'var(--text-secondary, #a0a0a5)',
                      fontSize: '0.9rem',
                      textTransform: 'capitalize'
                    }}
                  >
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div
                    style={{ fontWeight: 600, color: 'var(--primary, #58e077)' }}
                  >
                    {val}/100
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem',
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
              Waste Listings Over Time
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border, rgba(55, 57, 59, 0.5))" />
              <XAxis dataKey="month" stroke="var(--text-secondary, #a0a0a5)" />
              <YAxis stroke="var(--text-secondary, #a0a0a5)" />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary, #1a1c1e)',
                  border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                  borderRadius: 'var(--radius, 8px)',
                  color: 'var(--text-primary, #e2e2e5)'
                }}
              />
              <Bar
                dataKey="waste"
                fill="var(--primary, #58e077)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3
              style={{
                fontSize: '1.1rem',
                color: 'var(--text-primary, #e2e2e5)'
              }}
            >
              Match Activity
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border, rgba(55, 57, 59, 0.5))" />
              <XAxis dataKey="month" stroke="var(--text-secondary, #a0a0a5)" />
              <YAxis stroke="var(--text-secondary, #a0a0a5)" />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary, #1a1c1e)',
                  border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                  borderRadius: 'var(--radius, 8px)',
                  color: 'var(--text-primary, #e2e2e5)'
                }}
              />
              <Line
                type="monotone"
                dataKey="matches"
                stroke="var(--primary, #58e077)"
                strokeWidth={3}
                dot={{ fill: 'var(--primary, #58e077)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Matches Table */}
      <Card style={{ marginBottom: '2rem' }}>
        <div
          className="card-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}
        >
          <h3
            className="card-title"
            style={{ fontSize: '1.1rem', color: 'var(--text-primary, #e2e2e5)' }}
          >
            Recent AI Matches
          </h3>
          <Link to="/matches">
            <Button variant="outline" size="sm">
              View All <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        {recentMatches.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-secondary, #a0a0a5)'
            }}
          >
            <Zap
              size={48}
              style={{ marginBottom: '1rem', opacity: 0.5, color: 'var(--text-muted, #64748b)' }}
            />
            <p>No matches yet. Add waste listings or resource requests to get started.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr
                  style={{
                    background: 'var(--bg-tertiary, #282a2c)',
                    borderBottom: '1px solid var(--border, rgba(55, 57, 59, 0.5))'
                  }}
                >
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: 'var(--text-secondary, #a0a0a5)',
                      fontSize: '0.85rem'
                    }}
                  >
                    Waste Type
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: 'var(--text-secondary, #a0a0a5)',
                      fontSize: '0.85rem'
                    }}
                  >
                    Provider
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: 'var(--text-secondary, #a0a0a5)',
                      fontSize: '0.85rem'
                    }}
                  >
                    Seeker
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: 'var(--text-secondary, #a0a0a5)',
                      fontSize: '0.85rem'
                    }}
                  >
                    Quantity
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: 'var(--text-secondary, #a0a0a5)',
                      fontSize: '0.85rem'
                    }}
                  >
                    Score
                  </th>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      color: 'var(--text-secondary, #a0a0a5)',
                      fontSize: '0.85rem'
                    }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentMatches.map((match) => (
                  <tr
                    key={match.id}
                    style={{ borderBottom: '1px solid var(--border, rgba(55, 57, 59, 0.5))' }}
                  >
                    <td style={{ padding: '1rem', fontWeight: 500 }}>
                      {match.wasteType}
                    </td>
                    <td style={{ padding: '1rem' }}>{match.wasteProvider}</td>
                    <td style={{ padding: '1rem' }}>{match.resourceSeeker}</td>
                    <td style={{ padding: '1rem' }}>{match.quantity}</td>
                    <td style={{ padding: '1rem' }}>{match.matchScore}%</td>
                    <td style={{ padding: '1rem' }}>
                      <Badge
                        variant={match.status === 'accepted' ? 'success' : 'warning'}
                      >
                        {match.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* AI Suggested Matches (Opportunities) */}
      <Card style={{ marginBottom: '2rem', border: '1px solid var(--primary, #58e077)', background: 'rgba(88, 224, 119, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Zap size={24} color="var(--primary, #58e077)" />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary, #e2e2e5)', margin: 0 }}>AI Suggested Opportunities</h3>
        </div>
        {aiOpportunities.length === 0 ? (
          <p style={{ color: 'var(--text-secondary, #a0a0a5)' }}>No automated opportunities found at this time.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {aiOpportunities.map(opp => (
              <div key={opp.wasteListingId + '-' + opp.resourceRequestId} style={{ background: 'var(--bg-secondary, #1a1c1e)', padding: '1.5rem', borderRadius: 'var(--radius, 8px)', border: '1px solid var(--border, rgba(55,57,59,0.5))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                  <Badge variant="success" style={{ fontSize: '0.8rem' }}>{opp.matchScore}% Match</Badge>
                  <span style={{ color: 'var(--text-secondary, #a0a0a5)', fontSize: '0.8rem', textTransform: 'capitalize' }}>{opp.matchType}</span>
                </div>
                <div style={{ marginBottom: '1.5rem', color: 'var(--text-primary, #e2e2e5)' }}>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.25rem' }}>{opp.wasteType} &rarr; {opp.resourceType}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #a0a0a5)' }}>
                    {opp.wasteProvider} to {opp.resourceSeeker}
                  </div>
                </div>
                <Link to="/matches">
                  <Button variant="primary" size="sm" style={{ width: '100%' }}>Review Details</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}
      >
        <Link to="/waste-listings" style={{ textDecoration: 'none' }}>
          <Card style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 1rem',
                borderRadius: 'var(--radius, 8px)',
                background: 'rgba(88, 224, 119, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Plus size={28} color="var(--primary, #58e077)" />
            </div>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary, #e2e2e5)' }}>
              List Waste Stream
            </h4>
            <p
              style={{
                color: 'var(--text-secondary, #a0a0a5)',
                fontSize: '0.9rem'
              }}
            >
              Add new waste material
            </p>
          </Card>
        </Link>

        <Link to="/resource-requests" style={{ textDecoration: 'none' }}>
          <Card style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 1rem',
                borderRadius: 'var(--radius, 8px)',
                background: 'rgba(0, 218, 243, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Factory size={28} color="var(--secondary, #00daf3)" />
            </div>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary, #e2e2e5)' }}>
              Request Resources
            </h4>
            <p
              style={{
                color: 'var(--text-secondary, #a0a0a5)',
                fontSize: '0.9rem'
              }}
            >
              Find needed materials
            </p>
          </Card>
        </Link>

        <Link to="/network" style={{ textDecoration: 'none' }}>
          <Card style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 1rem',
                borderRadius: 'var(--radius, 8px)',
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Globe2 size={28} color="var(--success, #10b981)" />
            </div>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary, #e2e2e5)' }}>
              View Network
            </h4>
            <p
              style={{
                color: 'var(--text-secondary, #a0a0a5)',
                fontSize: '0.9rem'
              }}
            >
              Explore symbiosis links
            </p>
          </Card>
        </Link>

        <Link to="/impact" style={{ textDecoration: 'none' }}>
          <Card style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 1rem',
                borderRadius: 'var(--radius, 8px)',
                background: 'rgba(245, 158, 11, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Leaf size={28} color="var(--warning, #f59e0b)" />
            </div>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary, #e2e2e5)' }}>
              Impact Report
            </h4>
            <p
              style={{
                color: 'var(--text-secondary, #a0a0a5)',
                fontSize: '0.9rem'
              }}
            >
              View environmental data
            </p>
          </Card>
        </Link>

        <Link to="/logistics" style={{ textDecoration: 'none' }}>
          <Card style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 1rem',
                borderRadius: 'var(--radius, 8px)',
                background: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Truck size={28} color="#3b82f6" />
            </div>
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary, #e2e2e5)' }}>
              AI Logistics
            </h4>
            <p
              style={{
                color: 'var(--text-secondary, #a0a0a5)',
                fontSize: '0.9rem'
              }}
            >
              Track & route shipments
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
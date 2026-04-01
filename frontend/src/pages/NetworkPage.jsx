import React, { useState, useEffect } from 'react';
import { Globe, Users, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { industryAPI } from '../services/api';
import Card from '../components/ui/Card';

const NODE_COLORS = {
  steel: '#1F7A8C',
  cement: '#10B981',
  construction: '#F59E0B',
  energy: '#00C9B1',
  chemical: '#EF4444',
  textile: '#8B5CF6',
  manufacturing: '#F97316',
  default: '#64748B'
};

// Simple force-layout approximation using fixed positions spread in a circle
const layoutNodes = (nodes) => {
  const cx = 400, cy = 250, r = 180;
  return nodes.map((node, i) => ({
    ...node,
    x: cx + r * Math.cos((2 * Math.PI * i) / nodes.length),
    y: cy + r * Math.sin((2 * Math.PI * i) / nodes.length)
  }));
};

const NetworkPage = ({ user }) => {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    fetchNetwork();
  }, []);

  const fetchNetwork = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await industryAPI.getNetwork();
      const data = res.data.data || {};
      setNodes(layoutNodes(data.nodes || []));
      setLinks(data.links || []);
    } catch (err) {
      setError('Failed to load network data.');
    } finally {
      setLoading(false);
    }
  };

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
            Industrial Symbiosis Network
          </h1>
          <p style={{ color: 'var(--text-secondary, #a0a0a5)' }}>
            Visualize resource flow relationships between industries
          </p>
        </div>
        <button className="btn btn-outline" onClick={fetchNetwork}>
          <RefreshCw size={18} /> Refresh
        </button>
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
              <Users size={24} color="var(--bg-primary, #121416)" />
            </div>
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--primary, #58e077)'
            }}
          >
            {nodes.length}
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary, #a0a0a5)'
            }}
          >
            Connected Industries
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
              <LinkIcon size={24} color="var(--bg-primary, #121416)" />
            </div>
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--accent, #00daf3)'
            }}
          >
            {links.length}
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary, #a0a0a5)'
            }}
          >
            Active Symbiosis Links
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
              <Globe size={24} color="white" />
            </div>
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--success, #10b981)'
            }}
          >
            {new Set(nodes.map((n) => n.type)).size}
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary, #a0a0a5)'
            }}
          >
            Industry Types
          </div>
        </Card>
      </div>

      {/* Network Visualization */}
      {nodes.length === 0 ? (
        <Card
          style={{
            textAlign: 'center',
            padding: '4rem',
            background: 'var(--bg-card, rgba(51, 53, 55, 0.4))'
          }}
        >
          <Globe
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
            No Network Data
          </h3>
          <p style={{ color: 'var(--text-secondary, #a0a0a5)' }}>
            Accept matches to build the symbiosis network
          </p>
        </Card>
      ) : (
        <div
          className="network-container"
          style={{
            position: 'relative',
            background: 'var(--bg-card, rgba(51, 53, 55, 0.4))',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
            borderRadius: 'var(--radius-lg, 12px)',
            padding: '2rem',
            minHeight: '500px'
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 800 500">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#1F7A8C" opacity="0.6" />
              </marker>
            </defs>

            {/* Links */}
            {links.map((link, index) => {
              const source = nodes.find((n) => n.id === link.source);
              const target = nodes.find((n) => n.id === link.target);
              if (!source || !target) return null;
              const midX = (source.x + target.x) / 2;
              const midY = (source.y + target.y) / 2;
              return (
                <g key={index}>
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="#1F7A8C"
                    strokeWidth={Math.max(1, (link.value || 100) / 100)}
                    opacity={0.5}
                    markerEnd="url(#arrowhead)"
                  />
                  <text
                    x={midX}
                    y={midY - 6}
                    textAnchor="middle"
                    fontSize="10"
                    fill="var(--text-muted, #64748b)"
                  >
                    {link.material}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const color = NODE_COLORS[node.type] || NODE_COLORS.default;
              return (
                <g
                  key={node.id}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setTooltip(node)}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <circle cx={node.x} cy={node.y} r={32} fill={color} opacity={0.9} />
                  <circle cx={node.x} cy={node.y} r={26} fill="white" opacity={0.15} />
                  <text
                    x={node.x}
                    y={node.y + 48}
                    textAnchor="middle"
                    fontSize="11"
                    fill="var(--text-primary, #e2e2e5)"
                    fontWeight="600"
                  >
                    {node.label.length > 18 ? node.label.slice(0, 16) + '…' : node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'var(--bg-secondary, #1a1c1e)',
                border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                borderRadius: 'var(--radius, 8px)',
                padding: '1rem',
                minWidth: '160px',
                boxShadow: 'var(--shadow-lg, 0 12px 40px rgba(12, 14, 16, 0.4))'
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: '0.25rem',
                  color: 'var(--text-primary, #e2e2e5)'
                }}
              >
                {tooltip.label}
              </div>
              <div
                style={{
                  color: 'var(--text-secondary, #a0a0a5)',
                  fontSize: '0.85rem',
                  textTransform: 'capitalize'
                }}
              >
                {tooltip.type}
              </div>
              {tooltip.location && (
                <div
                  style={{
                    color: 'var(--text-secondary, #a0a0a5)',
                    fontSize: '0.85rem'
                  }}
                >
                  {tooltip.location}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <Card style={{ marginTop: '2rem' }}>
        <h3
          style={{
            marginBottom: '1rem',
            color: 'var(--text-primary, #e2e2e5)'
          }}
        >
          Industry Types
        </h3>
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}
        >
          {Object.entries(NODE_COLORS)
            .filter(([k]) => k !== 'default')
            .map(([type, color]) => (
              <div
                key={type}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: color
                  }}
                />
                <span
                  style={{
                    textTransform: 'capitalize',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary, #a0a0a5)'
                  }}
                >
                  {type}
                </span>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};

export default NetworkPage;
import React, { useState, useEffect } from 'react';
import { Globe, Users, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { industryAPI } from '../services/api';
import Card from '../components/ui/Card';
import ForceGraph2D from 'react-force-graph-2d';
import * as d3 from 'd3-force';

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

const NetworkGraph = ({ nodes, links, setTooltip }) => {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = React.useRef(null);
  const fgRef = React.useRef(null);
  const layoutDone = React.useRef(false);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset layout flag when nodes change so forces re-apply
  useEffect(() => {
    layoutDone.current = false;
  }, [nodes]);

  const handleEngineStop = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 60);
    }
  };

  const NODE_RADIUS = 8;

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={{ nodes, links }}
        nodeId="id"
        // Link Styling
        linkColor={() => 'rgba(64, 196, 255, 0.75)'}
        linkWidth={2}
        linkCurvature={0.2}
        // Let simulation run fully then freeze
        d3VelocityDecay={0.3}
        d3AlphaDecay={0.015}
        cooldownTime={4000}
        onEngineStop={handleEngineStop}
        enableNodeDrag={false}
        nodeRelSize={NODE_RADIUS}
        backgroundColor="transparent"
        onNodeHover={(node) => setTooltip(node || null)}
        // Set spread-out forces
        d3Force={(
          forceName,
          force
        ) => {
          if (forceName === 'charge') {
            return d3.forceManyBody().strength(-600).distanceMax(500);
          }
          if (forceName === 'link') {
            return d3.forceLink().id(d => d.id).distance(180).strength(0.4);
          }
          if (forceName === 'collision') {
            return d3.forceCollide(NODE_RADIUS * 4);
          }
          return force;
        }}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.label || 'Industry';
          const color = NODE_COLORS[node.type] || NODE_COLORS.default;
          const r = NODE_RADIUS;

          // 1. Outer glow ring
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 1.9, 0, 2 * Math.PI, false);
          ctx.fillStyle = `${color}20`;
          ctx.fill();

          // 2. Node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = 'rgba(255,255,255,0.6)';
          ctx.stroke();

          // 3. Always show label — pill background for readability
          const fontSize = Math.min(11, Math.max(8, 11 / globalScale));
          ctx.font = `600 ${fontSize}px "Inter", sans-serif`;
          const textWidth = ctx.measureText(label).width;
          const padding = 4;
          const bx = node.x - textWidth / 2 - padding;
          const by = node.y + r + 3;
          const bw = textWidth + padding * 2;
          const bh = fontSize + padding;

          // pill background
          ctx.fillStyle = 'rgba(15, 17, 20, 0.75)';
          ctx.beginPath();
          ctx.roundRect(bx, by, bw, bh, 3);
          ctx.fill();

          // label text
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.fillText(label, node.x, by + padding / 2);
        }}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, NODE_RADIUS + 8, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
      />
    </div>
  );
};


const NetworkPage = ({ user }) => {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [error, setError] = useState('');
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    fetchNetwork();
  }, []);

  const fetchNetwork = async () => {
    setError('');
    try {
      const res = await industryAPI.getNetwork();
      const data = res.data.data || {};
      
      setNodes(data.nodes || []);
      setLinks(data.links || []);
    } catch (err) {
      setError('Failed to load network data.');
    } finally {
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
            padding: '1rem',
            height: '600px',
            overflow: 'hidden'
          }}
        >
          <NetworkGraph nodes={nodes} links={links} setTooltip={setTooltip} />
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
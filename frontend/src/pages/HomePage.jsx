import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Recycle,
  Zap,
  Globe2,
  TrendingUp,
  Leaf,
  Factory,
  ArrowRight,
  CheckCircle,
  Users,
  Shield
} from 'lucide-react';

const HomePage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    companies: 0,
    wasteDiverted: 0,
    co2Reduced: 0,
    matches: 0
  });

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('symbiotech_user');
    const token = localStorage.getItem('symbiotech_token');
    if (savedUser && token) {
      navigate('/dashboard');
    }
    
    // Animate stats on mount
    animateStats();
  }, [navigate]);

  const animateStats = () => {
    const targetStats = {
      companies: 150,
      wasteDiverted: 12480,
      co2Reduced: 8640,
      matches: 320
    };

    const duration = 2000;
    const startTime = performance.now();

    const updateStats = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setStats({
        companies: Math.floor(easedProgress * targetStats.companies),
        wasteDiverted: Math.floor(easedProgress * targetStats.wasteDiverted),
        co2Reduced: Math.floor(easedProgress * targetStats.co2Reduced),
        matches: Math.floor(easedProgress * targetStats.matches)
      });

      if (progress < 1) {
        requestAnimationFrame(updateStats);
      }
    };

    requestAnimationFrame(updateStats);
  };

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Matching',
      description: 'Our proprietary algorithm identifies optimal waste-resource synergies across industries.',
      color: 'primary'
    },
    {
      icon: Globe2,
      title: 'Network Visualization',
      description: 'Real-time mapping of industrial symbiosis relationships and resource flows.',
      color: 'accent'
    },
    {
      icon: TrendingUp,
      title: 'Impact Tracking',
      description: 'Comprehensive metrics on CO₂ reduction, waste diversion, and cost savings.',
      color: 'success'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Enterprise-grade security with encrypted data and authenticated access.',
      color: 'warning'
    }
  ];

  const benefits = [
    'Reduce disposal costs by up to 40%',
    'Generate new revenue from waste streams',
    'Meet sustainability targets faster',
    'Access verified industrial partners',
    'Real-time compliance reporting',
    'Optimized logistics coordination'
  ];

  return (
    <div className="home-page" style={{ minHeight: '100vh', background: 'var(--bg-primary, #121416)' }}>
      {/* Navigation */}
      <nav
        className="glass-panel"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          borderBottom: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
          background: 'var(--glass-bg, rgba(51, 53, 55, 0.4))',
          backdropFilter: 'blur(20px)',
          zIndex: 1000
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.png" alt="SymbioTech Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--primary, #58e077), var(--secondary, #00daf3))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            SymbioTech
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to="/login"
            style={{
              color: 'var(--text-primary, #e2e2e5)',
              textDecoration: 'none',
              fontWeight: 500,
              padding: '0.5rem 1rem'
            }}
          >
            Sign In
          </Link>
          <Link to="/register">
            <button
              className="btn btn-primary"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, var(--primary, #58e077), var(--primary-dark, #2ebd59))',
                color: 'var(--bg-primary, #121416)',
                border: 'none',
                borderRadius: 'var(--radius, 8px)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          padding: '120px 2rem 80px',
          textAlign: 'center',
          background: 'radial-gradient(ellipse at top, rgba(88, 224, 119, 0.1), transparent 60%)'
        }}
      >
        <div
          className="fade-in-up"
          style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(88, 224, 119, 0.1)',
              border: '1px solid var(--primary, #58e077)',
              borderRadius: 'var(--radius, 8px)',
              padding: '0.5rem 1rem',
              marginBottom: '1.5rem'
            }}
          >
            <Zap size={16} color="var(--primary, #58e077)" />
            <span
              style={{
                fontSize: '0.85rem',
                color: 'var(--primary, #58e077)',
                fontWeight: 600
              }}
            >
              AI-Powered Industrial Symbiosis
            </span>
          </div>

          <h1
            style={{
              fontSize: '3.5rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              color: 'var(--text-primary, #e2e2e5)',
              lineHeight: 1.2
            }}
          >
            Transform Waste into{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--primary, #58e077), var(--secondary, #00daf3))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Value
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.25rem',
              color: 'var(--text-secondary, #a0a0a5)',
              marginBottom: '2.5rem',
              maxWidth: '700px',
              margin: '0 auto 2.5rem'
            }}
          >
            Connect with industries to exchange waste streams as valuable resources.
            Reduce costs, cut emissions, and build a circular economy together.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <Link to="/register">
              <button
                className="btn btn-primary"
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, var(--primary, #58e077), var(--primary-dark, #2ebd59))',
                  color: 'var(--bg-primary, #121416)',
                  border: 'none',
                  borderRadius: 'var(--radius, 8px)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                Start Free Trial <ArrowRight size={20} />
              </button>
            </Link>
            <Link to="/login">
              <button
                className="btn btn-outline"
                style={{
                  padding: '1rem 2rem',
                  background: 'transparent',
                  color: 'var(--primary, #58e077)',
                  border: '1px solid var(--primary, #58e077)',
                  borderRadius: 'var(--radius, 8px)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                View Demo
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        style={{
          padding: '4rem 2rem',
          background: 'var(--bg-secondary, #1a1c1e)',
          borderTop: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
          borderBottom: '1px solid var(--border, rgba(55, 57, 59, 0.5))'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem'
          }}
        >
          {[
            { label: 'Companies', value: stats.companies, suffix: '+', icon: Factory },
            { label: 'Waste Diverted', value: stats.wasteDiverted, suffix: ' tons', icon: Recycle },
            { label: 'CO₂ Reduced', value: stats.co2Reduced, suffix: ' tons', icon: Leaf },
            { label: 'Matches Made', value: stats.matches, suffix: '+', icon: Zap }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="fade-in-up"
                style={{
                  textAlign: 'center',
                  padding: '1.5rem',
                  background: 'var(--bg-card, rgba(51, 53, 55, 0.4))',
                  borderRadius: 'var(--radius-lg, 12px)',
                  border: '1px solid var(--border, rgba(55, 57, 59, 0.5))'
                }}
              >
                <Icon
                  size={32}
                  color="var(--primary, #58e077)"
                  style={{ marginBottom: '1rem' }}
                />
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    color: 'var(--text-primary, #e2e2e5)',
                    marginBottom: '0.5rem'
                  }}
                >
                  {stat.value.toLocaleString()}
                  {stat.suffix}
                </div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary, #a0a0a5)'
                  }}
                >
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: 'var(--text-primary, #e2e2e5)'
            }}
          >
            Why Choose SymbioTech?
          </h2>
          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary, #a0a0a5)',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            Our platform connects industries to create sustainable value chains
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorMap = {
              primary: 'var(--primary, #58e077)',
              accent: 'var(--accent, #00daf3)',
              success: 'var(--success, #10b981)',
              warning: 'var(--warning, #f59e0b)'
            };
            return (
              <div
                key={index}
                className="card card-hover fade-in-up"
                style={{
                  background: 'var(--bg-card, rgba(51, 53, 55, 0.4))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
                  borderRadius: 'var(--radius-lg, 12px)',
                  padding: '2rem',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg, 0 12px 40px rgba(12, 14, 16, 0.4))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: 'var(--radius, 8px)',
                    background: `${colorMap[feature.color]}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem'
                  }}
                >
                  <Icon size={28} color={colorMap[feature.color]} />
                </div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                    color: 'var(--text-primary, #e2e2e5)'
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    color: 'var(--text-secondary, #a0a0a5)',
                    lineHeight: 1.6
                  }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section
        style={{
          padding: '5rem 2rem',
          background: 'var(--bg-secondary, #1a1c1e)',
          borderTop: '1px solid var(--border, rgba(55, 57, 59, 0.5))'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
                color: 'var(--text-primary, #e2e2e5)'
              }}
            >
              Build a Sustainable Future
            </h2>
            <p
              style={{
                fontSize: '1.1rem',
                color: 'var(--text-secondary, #a0a0a5)',
                marginBottom: '2rem',
                lineHeight: 1.6
              }}
            >
              Join hundreds of industries already transforming their waste into
              valuable resources through our intelligent matching platform.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                >
                  <CheckCircle
                    size={20}
                    color="var(--success, #10b981)"
                  />
                  <span
                    style={{
                      color: 'var(--text-primary, #e2e2e5)',
                      fontWeight: 500
                    }}
                  >
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div
            className="card"
            style={{
              background: 'var(--bg-card, rgba(51, 53, 55, 0.4))',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '2.5rem'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius, 8px)',
                  background: 'linear-gradient(135deg, var(--primary, #58e077), var(--secondary, #00daf3))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Users size={24} color="var(--bg-primary, #121416)" />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: 'var(--text-primary, #e2e2e5)'
                  }}
                >
                  Trusted by Industry Leaders
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary, #a0a0a5)'
                  }}
                >
                  Steel, Cement, Chemical & More
                </p>
              </div>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem'
              }}
            >
              {[
                { label: 'Active Partners', value: '150+' },
                { label: 'Success Rate', value: '94%' },
                { label: 'Avg. Savings', value: '₹2.4L/mo' },
                { label: 'CO₂ Reduced', value: '8.6K tons' }
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-tertiary, #282a2c)',
                    borderRadius: 'var(--radius, 8px)'
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'var(--primary, #58e077)',
                      marginBottom: '0.25rem'
                    }}
                  >
                    {item.value}
                  </div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary, #a0a0a5)'
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: '5rem 2rem',
          textAlign: 'center',
          background: 'radial-gradient(ellipse at bottom, rgba(88, 224, 119, 0.1), transparent 60%)'
        }}
      >
        <div
          className="fade-in-up"
          style={{ maxWidth: '700px', margin: '0 auto', padding: '0 2rem' }}
        >
          <h2
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: 'var(--text-primary, #e2e2e5)'
            }}
          >
            Ready to Transform Your Waste?
          </h2>
          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary, #a0a0a5)',
              marginBottom: '2rem'
            }}
          >
            Join the industrial symbiosis revolution today
          </p>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <Link to="/register">
              <button
                className="btn btn-primary"
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, var(--primary, #58e077), var(--primary-dark, #2ebd59))',
                  color: 'var(--bg-primary, #121416)',
                  border: 'none',
                  borderRadius: 'var(--radius, 8px)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Create Free Account
              </button>
            </Link>
            <Link to="/login">
              <button
                className="btn btn-outline"
                style={{
                  padding: '1rem 2rem',
                  background: 'transparent',
                  color: 'var(--primary, #58e077)',
                  border: '1px solid var(--primary, #58e077)',
                  borderRadius: 'var(--radius, 8px)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '3rem 2rem',
          borderTop: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
          background: 'var(--bg-secondary, #1a1c1e)'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <img src="/logo.png" alt="SymbioTech Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              <span
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--text-primary, #e2e2e5)'
                }}
              >
                SymbioTech
              </span>
            </div>
            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary, #a0a0a5)',
                lineHeight: 1.6
              }}
            >
              Connecting industries for a sustainable circular economy.
            </p>
          </div>
          <div>
            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: 'var(--text-primary, #e2e2e5)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Platform
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['Dashboard', 'Marketplace', 'Network', 'Analytics'].map((item) => (
                <Link
                  key={item}
                  to="/login"
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary, #a0a0a5)',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary, #58e077)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary, #a0a0a5)')}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: 'var(--text-primary, #e2e2e5)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Company
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['About', 'Careers', 'Contact', 'Privacy'].map((item) => (
                <Link
                  key={item}
                  to="/login"
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary, #a0a0a5)',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary, #58e077)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary, #a0a0a5)')}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: 'var(--text-primary, #e2e2e5)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Connect
            </h4>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                <a
                  key={social}
                  href="#!"
                  onClick={(e) => e.preventDefault()}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius, 8px)',
                    background: 'var(--bg-tertiary, #282a2c)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary, #a0a0a5)',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary, #58e077)';
                    e.currentTarget.style.color = 'var(--bg-primary, #121416)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-tertiary, #282a2c)';
                    e.currentTarget.style.color = 'var(--text-secondary, #a0a0a5)';
                  }}
                >
                  <Globe2 size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div
          style={{
            maxWidth: '1200px',
            margin: '2rem auto 0',
            paddingTop: '2rem',
            borderTop: '1px solid var(--border, rgba(55, 57, 59, 0.5))',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-secondary, #a0a0a5)'
          }}
        >
          © 2024 SymbioTech. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
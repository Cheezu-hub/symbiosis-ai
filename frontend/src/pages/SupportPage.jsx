import React, { useState } from 'react';
import {
  HelpCircle, ChevronDown, ChevronUp, Mail, MessageSquare,
  Book, Zap, Recycle, Globe, BarChart2, Users, ArrowRight
} from 'lucide-react';
import Card from '../components/ui/Card';

const FAQ_DATA = [
  {
    category: 'Getting Started',
    icon: Book,
    color: '#58e077',
    items: [
      {
        q: 'What is SymbioTech?',
        a: 'SymbioTech is an AI-powered industrial symbiosis platform that connects industries to exchange waste materials as resources, reducing landfill waste and creating economic value from by-products.'
      },
      {
        q: 'How do I add a waste listing?',
        a: 'Go to Waste Listings in the sidebar and click "+ Add Waste Stream". Fill in the material type, quantity, unit, and your location. Once saved, the AI engine will automatically scan for matching resource requests from other industries.'
      },
      {
        q: 'How do I request a resource?',
        a: 'Navigate to Resource Requests and click "+ New Request". Specify the material you need, the quantity, and your preferred location. Other industries with matching waste will appear as suggested matches.'
      },
    ]
  },
  {
    category: 'AI Matching',
    icon: Zap,
    color: '#00daf3',
    items: [
      {
        q: 'How does the AI matching work?',
        a: 'Our AI engine compares waste listings against active resource requests using a multi-factor symbiosis score. It considers material type similarity, location proximity, quantity compatibility, and industry sector compatibility. Matches are scored 0–100.'
      },
      {
        q: 'What does the symbiosis score mean?',
        a: 'The symbiosis score (0–100) indicates the quality of a potential waste-to-resource match. Scores above 70 are considered strong matches (direct match), 40–70 moderate, and below 40 weak. Higher scores mean less processing and transportation needed.'
      },
      {
        q: 'Why am I not seeing any matches?',
        a: 'Matches appear when at least one other industry has a resource request for the material type you\'ve listed (or vice versa). Make sure you have active waste listings or resource requests. The AI updates matches in real time when new listings are added.'
      },
    ]
  },
  {
    category: 'Network & Impact',
    icon: Globe,
    color: '#10b981',
    items: [
      {
        q: 'What does the Network page show?',
        a: 'The Network page visualizes confirmed symbiosis relationships between industries as a graph. Each node is an industry; edges represent accepted waste-exchange relationships. The graph grows as matches are accepted.'
      },
      {
        q: 'How is environmental impact calculated?',
        a: 'Impact estimates are based on material-specific coefficients for CO₂ savings, water conservation, and energy recovery. For example, reusing 1 ton of fly ash avoids ~0.9 tons of CO₂ compared to virgin material production.'
      },
      {
        q: 'Can I export impact reports?',
        a: 'Impact data is available on the Impact page with charts and KPIs. Export functionality (PDF/CSV) is on our roadmap for a future release.'
      },
    ]
  },
  {
    category: 'Account & Security',
    icon: Users,
    color: '#f59e0b',
    items: [
      {
        q: 'How do I update my company profile?',
        a: 'Click your company name in the top-right corner or go to Profile in the sidebar. You can update company name, industry type, location, phone, and transport radius.'
      },
      {
        q: 'Is my data secure?',
        a: 'Yes. All API requests are authenticated with JWT tokens with a 7-day expiry. Passwords are hashed with bcrypt. All communication uses HTTPS in production.'
      },
    ]
  }
];

const FAQItem = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        border: '1px solid var(--border, rgba(55,57,59,0.5))',
        borderRadius: 'var(--radius, 8px)',
        marginBottom: '0.75rem',
        overflow: 'hidden',
        transition: 'border-color 0.2s'
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          background: open ? 'var(--bg-tertiary, #282a2c)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-primary, #e2e2e5)',
          fontWeight: 600,
          fontSize: '0.95rem',
          textAlign: 'left',
          gap: '1rem',
          transition: 'background 0.2s'
        }}
      >
        <span>{item.q}</span>
        {open ? <ChevronUp size={18} color="var(--primary, #58e077)" /> : <ChevronDown size={18} />}
      </button>
      {open && (
        <div
          style={{
            padding: '1rem 1.25rem',
            color: 'var(--text-secondary, #a0a0a5)',
            lineHeight: 1.7,
            borderTop: '1px solid var(--border, rgba(55,57,59,0.5))',
            background: 'rgba(0,0,0,0.15)',
            fontSize: '0.9rem'
          }}
        >
          {item.a}
        </div>
      )}
    </div>
  );
};

const SupportPage = () => {
  const [activeCategory, setActiveCategory] = useState(null);

  const visibleCategories = activeCategory
    ? FAQ_DATA.filter(c => c.category === activeCategory)
    : FAQ_DATA;

  return (
    <div className="page-container fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'var(--text-primary, #e2e2e5)'
        }}>
          <HelpCircle size={32} color="var(--primary, #58e077)" />
          Help &amp; Support
        </h1>
        <p style={{ color: 'var(--text-secondary, #a0a0a5)' }}>
          Everything you need to get the most out of SymbioTech
        </p>
      </div>

      {/* Quick Links */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '2.5rem'
      }}>
        {[
          { icon: Recycle, label: 'Add Waste Listing', link: '/waste-listings', color: '#58e077', desc: 'List your available waste streams' },
          { icon: Zap, label: 'AI Insights', link: '/ai-insights', color: '#00daf3', desc: 'Explore smart match recommendations' },
          { icon: Globe, label: 'Network Map', link: '/network', color: '#10b981', desc: 'View the symbiosis network' },
          { icon: BarChart2, label: 'Impact Report', link: '/impact', color: '#f59e0b', desc: 'Track your environmental impact' },
        ].map(({ icon: Icon, label, link, color, desc }) => (
          <a
            key={label}
            href={link}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.25rem',
              background: `${color}12`,
              border: `1px solid ${color}40`,
              borderRadius: 'var(--radius-lg, 12px)',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              color: 'inherit'
            }}
            onMouseEnter={e => e.currentTarget.style.background = `${color}22`}
            onMouseLeave={e => e.currentTarget.style.background = `${color}12`}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: color, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0
            }}>
              <Icon size={22} color="#121416" />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {label} <ArrowRight size={14} />
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{desc}</div>
            </div>
          </a>
        ))}
      </div>

      {/* FAQ Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Frequently Asked Questions
        </h2>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              border: `1px solid ${!activeCategory ? 'var(--primary, #58e077)' : 'var(--border)'}`,
              background: !activeCategory ? 'rgba(88,224,119,0.15)' : 'transparent',
              color: !activeCategory ? 'var(--primary, #58e077)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            All Topics
          </button>
          {FAQ_DATA.map(cat => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category === activeCategory ? null : cat.category)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '999px',
                border: `1px solid ${activeCategory === cat.category ? cat.color : 'var(--border)'}`,
                background: activeCategory === cat.category ? `${cat.color}22` : 'transparent',
                color: activeCategory === cat.category ? cat.color : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {visibleCategories.map(category => {
          const Icon = category.icon;
          return (
            <Card key={category.category} style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                marginBottom: '1.25rem', paddingBottom: '1rem',
                borderBottom: '1px solid var(--border, rgba(55,57,59,0.5))'
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: `${category.color}22`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={20} color={category.color} />
                </div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                  {category.category}
                </h3>
              </div>
              {category.items.map((item, i) => (
                <FAQItem key={i} item={item} />
              ))}
            </Card>
          );
        })}
      </div>

      {/* Contact Card */}
      <Card style={{
        background: 'linear-gradient(135deg, rgba(88,224,119,0.08), rgba(0,218,243,0.08))',
        border: '1px solid rgba(88,224,119,0.25)',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Still need help?
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Reach out to the SymbioTech team and we'll get back to you within 24 hours.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="mailto:support@symbiotech.app"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'var(--primary, #58e077)',
              color: '#121416',
              borderRadius: 'var(--radius, 8px)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.95rem'
            }}
          >
            <Mail size={18} /> Email Support
          </a>
          <a
            href="https://github.com/Cheezu-hub/symbiosis-ai"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius, 8px)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}
          >
            <MessageSquare size={18} /> GitHub Issues
          </a>
        </div>
      </Card>
    </div>
  );
};

export default SupportPage;

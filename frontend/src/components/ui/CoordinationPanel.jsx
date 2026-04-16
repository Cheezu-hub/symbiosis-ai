import React from 'react';
import { Phone, Mail, MessageCircle, ExternalLink, Calendar } from 'lucide-react';
import Card from './Card';
import Badge from './Badge';

/**
 * CoordinationPanel
 * ─────────────────────────────────────────────────────────────────────────────
 * Display contact details and direct action buttons (Call, WhatsApp, Email)
 * for accepted trade matches to facilitate direct coordination.
 */
const CoordinationPanel = ({ party, role, acceptedAt }) => {
  if (!party) return null;

  const { name, email, phone, location } = party;

  // Formatting WhatsApp link: Remove non-numeric characters, add +91 if not present
  const formatWhatsApp = (num) => {
    if (!num) return '';
    let digits = num.replace(/\D/g, '');
    if (digits.length === 10) digits = '91' + digits;
    return `https://wa.me/${digits}`;
  };

  const actionButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1,
    minWidth: '120px',
    border: '1px solid var(--border)',
    background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)'
  };

  return (
    <Card 
      style={{ 
        marginTop: '1.5rem', 
        background: 'rgba(88, 224, 119, 0.05)', 
        borderColor: 'var(--primary)',
        borderStyle: 'dashed'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageCircle size={20} style={{ color: 'var(--primary)' }} />
          <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
            Trade Coordination
          </h4>
        </div>
        <Badge variant="success">Accepted</Badge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Contact Info */}
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {role === 'seller' ? 'Buyer Contact Details' : 'Seller Contact Details'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
              <div style={{ width: '24px', color: 'var(--text-secondary)' }}><ExternalLink size={16} /></div>
              <span style={{ fontWeight: 600 }}>{name}</span>
            </div>
            {phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '24px' }}><Phone size={16} /></div>
                <span>{phone}</span>
              </div>
            )}
            {email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '24px' }}><Mail size={16} /></div>
                <span>{email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Trade Info */}
        {acceptedAt && (
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Trade Pipeline
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <Calendar size={16} />
              <span>Accepted on {new Date(acceptedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Use the actions below to coordinate logistics, pricing adjustments, and pickup timings directly with the partner.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {phone && (
          <>
            <a 
              href={`tel:${phone}`} 
              style={{ ...actionButtonStyle, textDecoration: 'none' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <Phone size={16} style={{ color: 'var(--accent)' }} />
              Call Now
            </a>
            <a 
              href={formatWhatsApp(phone)} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ ...actionButtonStyle, textDecoration: 'none' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(37, 211, 102, 0.1)'; e.currentTarget.style.borderColor = '#25D366'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <MessageCircle size={16} style={{ color: '#25D366' }} />
              WhatsApp
            </a>
          </>
        )}
        {email && (
          <a 
            href={`mailto:${email}?subject=SymbioNet Trade Coordination - ${name}`} 
            style={{ ...actionButtonStyle, textDecoration: 'none' }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(88, 179, 224, 0.1)'; e.currentTarget.style.borderColor = '#58b3e0'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <Mail size={16} style={{ color: '#58b3e0' }} />
            Email Partner
          </a>
        )}
      </div>
    </Card>
  );
};

export default CoordinationPanel;

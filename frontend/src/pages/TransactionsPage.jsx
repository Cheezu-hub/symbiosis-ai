import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { DollarSign, RefreshCw, ArrowUpRight, ArrowDownRight, Leaf, Droplet, Phone, Mail, ExternalLink } from 'lucide-react';

// ─── Inline contact chip ─────────────────────────────────────────────────────
const ContactChip = ({ icon: Icon, href, label, fallback }) => {
  if (!label || label.trim() === '') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        <Icon size={12} /> {fallback}
      </span>
    );
  }
  return (
    <a
      href={href}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 500,
        textDecoration: 'none', padding: '3px 8px', borderRadius: '6px',
        background: 'rgba(88,224,119,0.1)', border: '1px solid rgba(88,224,119,0.25)',
        transition: 'background 0.15s'
      }}
    >
      <Icon size={12} /> {label} <ExternalLink size={9} style={{ opacity: 0.5 }} />
    </a>
  );
};

const TransactionsPage = ({ user }) => {
  const [transactions, setTransactions] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState('all');

  useEffect(() => {
    fetchData();
  }, [role]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [txRes, dashRes] = await Promise.all([
        transactionAPI.getAll(role),
        transactionAPI.getDashboard()
      ]);
      setTransactions(txRes.data.data || []);
      setDashboard(dashRes.data.data);
    } catch (err) {
      setError('Failed to fetch transaction data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in-up">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-primary, #e2e2e5)' }}>
            Financial Ledger
          </h1>
          <p style={{ color: 'var(--text-secondary, #a0a0a5)' }}>
            Track your resource sales, purchases, and environmental ROI.
          </p>
        </div>
        <button className="btn-outline" onClick={fetchData} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', borderRadius: '8px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {/* Dashboard Metrics */}
      {dashboard && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          
          <Card style={{ background: 'rgba(88, 224, 119, 0.05)', border: '1px solid rgba(88, 224, 119, 0.2)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                   <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total Revenue</p>
                   <h2 style={{ color: 'var(--primary)', fontSize: '2.5rem', fontWeight: 700 }}>
                     ₹{dashboard.sales.totalEarned.toLocaleString()}
                   </h2>
                </div>
                <div style={{ background: 'rgba(88, 224, 119, 0.1)', padding: '0.75rem', borderRadius: '50%' }}>
                  <ArrowUpRight size={24} color="var(--primary)" />
                </div>
             </div>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
               From {dashboard.sales.count} waste sales
             </p>
          </Card>

          <Card style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                   <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total Spent</p>
                   <h2 style={{ color: 'var(--error)', fontSize: '2.5rem', fontWeight: 700 }}>
                     ₹{dashboard.purchases.totalSpent.toLocaleString()}
                   </h2>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '50%' }}>
                  <ArrowDownRight size={24} color="var(--error)" />
                </div>
             </div>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
               On {dashboard.purchases.count} resource acquisitions
             </p>
          </Card>

           <Card style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                   <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Net Impact</p>
                   <h2 style={{ color: 'var(--accent, #3b82f6)', fontSize: '2.5rem', fontWeight: 700 }}>
                     {dashboard.impact.wasteDiverted.toLocaleString()}t
                   </h2>
                </div>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '50%' }}>
                  <Leaf size={24} color="var(--accent, #3b82f6)" />
                </div>
             </div>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
               Waste diverted from landfill
             </p>
          </Card>

        </div>
      )}

      {/* Transactions List */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Transaction History</h3>
        
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: '8px' }}>
          {['all', 'seller', 'buyer'].map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                background: role === r ? 'var(--bg-card)' : 'transparent',
                color: role === r ? 'var(--primary)' : 'var(--text-secondary)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: role === r ? 600 : 400,
                textTransform: 'capitalize',
                transition: 'all 0.2s',
                boxShadow: role === r ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading && transactions.length === 0 ? (
        <div className="loading" style={{ height: '200px' }}><div className="spinner" /></div>
      ) : transactions.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '4rem', opacity: 0.7 }}>
          <DollarSign size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', margin: '0 auto' }} />
          <h3>No transactions yet.</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Completed trades will appear here.</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {transactions.map(tx => {
            const isSeller = tx.role === 'seller';
            return (
              <Card key={tx.id} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr) 150px minmax(150px, 1fr)', gap: '1.5rem', alignItems: 'center' }}>
                  
                  {/* Material Info */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '8px', 
                      background: isSeller ? 'rgba(88, 224, 119, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isSeller ? <ArrowUpRight size={20} color="var(--success)" /> : <ArrowDownRight size={20} color="var(--error)" />}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{tx.materialType}</h4>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {new Date(tx.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Counterparty + Contact */}
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      {isSeller ? 'Sold to' : 'Bought from'}
                    </p>
                    <p style={{ fontWeight: 600, marginBottom: '2px' }}>{isSeller ? tx.buyer.name : tx.seller.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.5rem' }}>{isSeller ? tx.buyer.type : tx.seller.type}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <ContactChip
                        icon={Phone}
                        href={`tel:${isSeller ? tx.buyer.phone : tx.seller.phone}`}
                        label={isSeller ? tx.buyer.phone : tx.seller.phone}
                        fallback="No phone"
                      />
                      <ContactChip
                        icon={Mail}
                        href={`mailto:${isSeller ? tx.buyer.email : tx.seller.email}`}
                        label={isSeller ? tx.buyer.email : tx.seller.email}
                        fallback="No email"
                      />
                    </div>
                  </div>

                  {/* Environment Impact */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                     {tx.impact.co2ReductionTons > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--success)' }}>
                           <Leaf size={14} /> {-tx.impact.co2ReductionTons}t CO₂
                        </div>
                     )}
                     {tx.impact.waterSavedLiters > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--accent, #3b82f6)' }}>
                           <Droplet size={14} /> {Math.round(tx.impact.waterSavedLiters)}L
                        </div>
                     )}
                  </div>

                  {/* Financials */}
                  <div style={{ textAlign: 'right' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: isSeller ? 'var(--success)' : 'var(--text-primary)' }}>
                      {tx.totalValue === 0 ? 'Free' : `${isSeller ? '+' : '-'}₹${tx.totalValue.toLocaleString()}`}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {tx.quantity} {tx.unit}
                    </p>
                  </div>

                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;

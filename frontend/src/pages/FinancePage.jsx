import React, { useState, useEffect } from 'react';
import { TrendingDown, DollarSign, Wallet, BarChart2, Zap, RefreshCw, Calculator, ArrowRight, ShieldCheck, Leaf } from 'lucide-react';
import { financeAPI } from '../services/api';

const fmt = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');
const fmtPct = (n) => parseFloat(n || 0).toFixed(1) + '%';

// ── Inline mini bar chart ──────────────────────────────────────────────────
function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 8, flex: 1 }}>
      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: color, transition: 'width 0.8s ease' }} />
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color, glow }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: `1px solid ${color}33`,
      borderRadius: 16, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
      boxShadow: glow ? `0 0 24px ${color}22` : 'none', transition: 'all 0.3s ease',
      cursor: 'default'
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ background: `${color}22`, borderRadius: 10, padding: '0.6rem', color }}>
          <Icon size={22} />
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 20 }}>Live</span>
      </div>
      <div>
        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
      </div>
      {sub && <div style={{ fontSize: '0.78rem', color, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

// ── Monthly savings chart ─────────────────────────────────────────────────
function MonthlySavingsChart({ data }) {
  if (!data?.length) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No data yet</div>;
  const maxVal = Math.max(...data.map(d => d.saved), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '0 0.5rem' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{fmt(d.saved)}</div>
          <div style={{
            width: '100%', background: 'linear-gradient(180deg, #58e077, #2ebd59)',
            borderRadius: '4px 4px 0 0', height: `${(d.saved / maxVal) * 80}px`,
            minHeight: 4, transition: 'height 0.6s ease', boxShadow: '0 0 8px #58e07744'
          }} />
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{d.month}</div>
        </div>
      ))}
    </div>
  );
}

// ── Savings Calculator ────────────────────────────────────────────────────
function SavingsCalculator() {
  const [form, setForm] = useState({ materialType: 'fly ash', quantity: 100, symbioPricePerUnit: 3200, logisticsCost: 15000, handlingCost: 5000, creditDays: 30 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const materials = ['fly ash', 'slag', 'copper scrap', 'aluminum scrap', 'plastic waste', 'paper waste', 'metal scrap', 'chemical waste', 'organic waste'];

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await financeAPI.calculate(form);
      setResult(res.data.data);
    } catch {
      // fallback local calc
      const qty = parseFloat(form.quantity) || 1;
      const paid = parseFloat(form.symbioPricePerUnit) * qty;
      const logistics = parseFloat(form.logisticsCost) || 0;
      const handling = parseFloat(form.handlingCost) || 0;
      const marketPrices = { 'fly ash': 5000, 'slag': 4500, 'copper scrap': 45000, 'aluminum scrap': 38000, 'plastic waste': 8000, 'paper waste': 3500, 'metal scrap': 20000, 'chemical waste': 12000, 'organic waste': 1500 };
      const market = (marketPrices[form.materialType] || 5000) * qty;
      const landed = paid + logistics + handling;
      const saved = Math.max(0, market - landed);
      setResult({ marketTotal: market, landedCostTotal: landed, totalSaved: saved, savingsPct: market > 0 ? ((saved / market) * 100).toFixed(1) : 0, annualizedSavings: saved * 12, capitalBenefit: (landed * 0.12 * parseInt(form.creditDays)) / 365 });
    } finally {
      setLoading(false);
    }
  };

  const inp = (label, key, type = 'number', options) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</label>
      {type === 'select' ? (
        <select value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.55rem 0.75rem', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type="number" value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.55rem 0.75rem', color: 'var(--text-primary)', fontSize: '0.88rem' }} />
      )}
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
        <Calculator size={20} color="#58e077" />
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Smart Savings Calculator</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.9rem', marginBottom: '1rem' }}>
        {inp('Material Type', 'materialType', 'select', materials)}
        {inp('Quantity (tons)', 'quantity')}
        {inp('SymbioTech Price/ton (₹)', 'symbioPricePerUnit')}
        {inp('Logistics Cost (₹)', 'logisticsCost')}
        {inp('Handling Cost (₹)', 'handlingCost')}
        {inp('Credit Period (days)', 'creditDays')}
      </div>
      <button onClick={calculate} disabled={loading}
        style={{ background: 'linear-gradient(135deg, #58e077, #2ebd59)', color: '#0a1a0e', border: 'none', borderRadius: 8, padding: '0.65rem 1.5rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
        {loading ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={16} />}
        Calculate Savings
      </button>
      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Market Value', val: fmt(result.marketTotal), color: '#ef4444' },
            { label: 'Landed Cost', val: fmt(result.landedCostTotal), color: '#f59e0b' },
            { label: 'Total Saved', val: fmt(result.totalSaved), color: '#58e077' },
            { label: 'Savings %', val: fmtPct(result.savingsPct), color: '#58e077' },
            { label: 'Annual Savings', val: fmt(result.annualizedSavings), color: '#00daf3' },
            { label: 'Capital Benefit', val: fmt(result.capitalBenefit), color: '#a78bfa' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: '0.9rem', border: `1px solid ${item.color}33` }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: item.color }}>{item.val}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Vendor Comparison ─────────────────────────────────────────────────────
function VendorComparison({ data }) {
  if (!data?.length) return (
    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
      Complete transactions to see vendor comparison
    </div>
  );
  const item = data[0];
  const maxVal = Math.max(item.traditional.total, item.symbiotech.total);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[
        { label: 'Traditional Procurement', data: item.traditional, color: '#ef4444' },
        { label: 'SymbioTech Procurement', data: item.symbiotech, color: '#58e077' }
      ].map((vendor, i) => (
        <div key={i} style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: vendor.color }}>{vendor.label}</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{fmt(vendor.data.total)}</span>
          </div>
          <MiniBar value={vendor.data.total} max={maxVal} color={vendor.color} />
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: 8 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Material: {fmt(vendor.data.materialCost)}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Logistics: {fmt(vendor.data.logistics)}</span>
          </div>
        </div>
      ))}
      <div style={{ background: 'rgba(88,224,119,0.1)', border: '1px solid #58e07744', borderRadius: 10, padding: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.88rem', color: '#58e077', fontWeight: 600 }}>💰 You Save</span>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#58e077' }}>{fmt(item.saving)}</span>
      </div>
    </div>
  );
}

// ── AI Suggestions ────────────────────────────────────────────────────────
function AISuggestions({ suggestions }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {(suggestions || []).map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.9rem', background: 'var(--bg-tertiary)', borderRadius: 12, padding: '1rem', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 3 }}>{s.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function FinancePage() {
  const [dashboard, setDashboard] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    Promise.all([
      financeAPI.getDashboard().catch(() => null),
      financeAPI.getVendorComparison().catch(() => null)
    ]).then(([d, v]) => {
      setDashboard(d?.data?.data || null);
      setVendors(v?.data?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const kpis = dashboard?.kpis || {};
  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'calculator', label: '🧮 Calculator' },
    { id: 'comparison', label: '⚖️ Comparison' },
    { id: 'insights', label: '🤖 AI Insights' }
  ];

  return (
    <div className="page-container fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ background: 'rgba(88,224,119,0.15)', borderRadius: 12, padding: '0.6rem', color: '#58e077' }}>
            <TrendingDown size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #58e077, #00daf3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Financial Intelligence
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Track savings · Optimize working capital · Maximize procurement ROI
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: '1.25rem', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '0.5rem 1.1rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                background: tab === t.id ? 'linear-gradient(135deg, #58e077, #2ebd59)' : 'var(--bg-tertiary)',
                color: tab === t.id ? '#0a1a0e' : 'var(--text-secondary)' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" />
        </div>
      )}

      {!loading && tab === 'dashboard' && (
        <>
          {/* KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <KpiCard icon={TrendingDown} label="Total Cost Saved" value={fmt(kpis.totalSaved)} sub={`${fmtPct(kpis.avgSavingsPct)} avg reduction`} color="#58e077" glow />
            <KpiCard icon={Wallet} label="Working Capital Preserved" value={fmt(kpis.workingCapitalPreserved)} sub="via credit terms" color="#00daf3" />
            <KpiCard icon={BarChart2} label="Avg Cost Reduction" value={fmtPct(kpis.avgSavingsPct)} sub="vs market rates" color="#f59e0b" />
            <KpiCard icon={DollarSign} label="Annualized Savings" value={fmt(kpis.annualizedSavings)} sub="projected" color="#a78bfa" />
            <KpiCard icon={ShieldCheck} label="Transactions Analyzed" value={kpis.transactionCount || 0} sub="completed trades" color="#10b981" />
            <KpiCard icon={Leaf} label="Market Value Avoided" value={fmt(kpis.totalMarketValue)} sub="total market cost" color="#f97316" />
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart2 size={18} color="#58e077" /> Monthly Savings Trend
              </h3>
              <MonthlySavingsChart data={dashboard?.monthlySavings} />
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Category Breakdown</h3>
              {(dashboard?.categoryBreakdown || []).length === 0
                ? <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', paddingTop: '2rem' }}>No data yet</div>
                : (dashboard?.categoryBreakdown || []).map((c, i) => {
                    const maxCat = Math.max(...(dashboard?.categoryBreakdown || []).map(x => x.saved), 1);
                    return (
                      <div key={i} style={{ marginBottom: '0.9rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: '0.82rem' }}>{c.category}</span>
                          <span style={{ fontSize: '0.82rem', color: '#58e077' }}>{fmt(c.saved)}</span>
                        </div>
                        <MiniBar value={c.saved} max={maxCat} color="#58e077" />
                      </div>
                    );
                  })
              }
            </div>
          </div>

          {/* Recent Transactions */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>💼 Recent Transaction Savings</h3>
            {(dashboard?.recentTransactions || []).length === 0
              ? <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No transactions found. Complete your first trade to see savings!</div>
              : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead><tr>
                      <th>Material</th><th>Qty</th><th>Market Rate</th><th>Paid/ton</th><th>Total Saved</th><th>Saving %</th>
                    </tr></thead>
                    <tbody>
                      {(dashboard?.recentTransactions || []).map((t, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{t.materialType}</td>
                          <td>{t.quantity} {t.unit}</td>
                          <td style={{ color: '#ef4444' }}>₹{t.marketPricePerUnit?.toLocaleString('en-IN')}/ton</td>
                          <td style={{ color: '#f59e0b' }}>₹{parseFloat(t.pricePerUnit || 0).toLocaleString('en-IN')}/ton</td>
                          <td style={{ color: '#58e077', fontWeight: 700 }}>{fmt(t.saved)}</td>
                          <td><span style={{ background: 'rgba(88,224,119,0.15)', color: '#58e077', padding: '2px 8px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600 }}>{t.savingsPct}%</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        </>
      )}

      {!loading && tab === 'calculator' && <SavingsCalculator />}

      {!loading && tab === 'comparison' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowRight size={18} color="#00daf3" /> Traditional vs SymbioTech Procurement
          </h3>
          <VendorComparison data={vendors} />
        </div>
      )}

      {!loading && tab === 'insights' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} color="#f59e0b" /> AI Cost Optimization
            </h3>
            <AISuggestions suggestions={dashboard?.suggestions} />
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>🌱 Carbon Credit Value</h3>
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                ₹{Math.round((dashboard?.kpis?.transactionCount || 0) * 4500).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>Estimated carbon credit value from your trades</div>
            </div>
            <div style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 12, padding: '1.25rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a78bfa' }}>
                ESG Score: {Math.min(100, 40 + (dashboard?.kpis?.transactionCount || 0) * 8)}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>Based on your industrial symbiosis activity</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

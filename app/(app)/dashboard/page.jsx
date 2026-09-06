import { createClient } from '@/lib/supabase/server';
import { Card, StatCard, Badge, SectionHead } from '@/components/ui';
import { fmt, fmtW, ratePerGram, priceBreakdown, TOLA_GRAMS, getPurity, todayISO, PURITIES } from '@/lib/pricing';
import { custBalance, suppBalance } from '@/lib/balances';
import DashboardCharts from '@/components/DashboardCharts';
import DashboardHero from '@/components/DashboardHero';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createClient();

  const [{ data: sales }, { data: customers }, { data: suppliers }, { data: products },
    { data: expenses }, { data: customerPurchases }, { data: metalRates }] = await Promise.all([
    supabase.from('sales').select('*, sale_payments(*)'),
    supabase.from('customers').select('*'),
    supabase.from('suppliers').select('*'),
    supabase.from('products').select('*'),
    supabase.from('expenses').select('*'),
    supabase.from('customer_purchases').select('*'),
    supabase.from('metal_rates').select('*').eq('id', 1).single(),
  ]);

  const s = sales || [], c = customers || [], sup = suppliers || [], p = products || [], e = expenses || [], cp = customerPurchases || [];
  const rates = metalRates || { gold_pure_per_gram: 0, silver_pure_per_gram: 0, usd_to_pkr: 284, prev_gold_pure_per_gram: 0, prev_silver_pure_per_gram: 0 };

  const todaySales = s.filter(x => x.sale_date === todayISO()).reduce((a, x) => a + Number(x.total), 0);
  const monthSales = s.reduce((a, x) => a + Number(x.total), 0);
  const totalReceivable = c.reduce((sum, cust) => sum + custBalance(s, cust.id, cust.opening_balance), 0);
  const totalPayable = sup.reduce((sum, spl) => sum + suppBalance([], spl.id, spl.opening_balance), 0); // purchases fetched separately on Purchases page
  const goldWeight = p.reduce((a, x) => a + (x.metal === 'gold' ? Number(x.gross_weight) * x.qty : 0), 0);
  const silverWeight = p.reduce((a, x) => a + (x.metal === 'silver' ? Number(x.gross_weight) * x.qty : 0), 0);
  const inventoryValue = p.reduce((a, x) => a + priceBreakdown({
    grossWeight: Number(x.gross_weight), stoneWeight: Number(x.stone_weight), purityId: x.purity_id, metalRates: rates,
    wastageType: x.wastage_type, wastageValue: Number(x.wastage_value), makingType: x.making_type, makingValue: Number(x.making_value),
    stoneValue: Number(x.stone_value), otherCharges: Number(x.other_charges),
  }).total * x.qty, 0);
  const lowStock = p.filter(x => x.qty <= 2);

  const allPayments = s.flatMap(x => x.sale_payments || []);
  const cash = allPayments.filter(pm => pm.method === 'Cash').reduce((a, pm) => a + Number(pm.amount), 0)
    - e.filter(x => x.payment_method === 'Cash').reduce((a, x) => a + Number(x.amount), 0)
    - cp.filter(x => x.payment_method === 'Cash').reduce((a, x) => a + Number(x.paid), 0);
  const bank = allPayments.filter(pm => pm.method !== 'Cash').reduce((a, pm) => a + Number(pm.amount), 0)
    - e.filter(x => x.payment_method !== 'Cash').reduce((a, x) => a + Number(x.amount), 0)
    - cp.filter(x => x.payment_method !== 'Cash').reduce((a, x) => a + Number(x.paid), 0);

  const goldChange = rates.prev_gold_pure_per_gram ? ((rates.gold_pure_per_gram - rates.prev_gold_pure_per_gram) / rates.prev_gold_pure_per_gram) * 100 : 0;
  const silverChange = rates.prev_silver_pure_per_gram ? ((rates.silver_pure_per_gram - rates.prev_silver_pure_per_gram) / rates.prev_silver_pure_per_gram) * 100 : 0;

  const salesTrend = [...Array(7)].map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10);
    const total = s.filter(x => x.sale_date === d).reduce((a, x) => a + Number(x.total), 0);
    return { day: d.slice(5), total };
  });
  const catMap = {};
  p.forEach(x => { catMap[x.category] = (catMap[x.category] || 0) + x.qty; });
  const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <DashboardHero />
      <div className="dj-grid g4 dj-section">
        <StatCard label="Today's Sales" value={fmt(todaySales)} />
        <StatCard label="Total Sales (all-time)" value={fmt(monthSales)} />
        <StatCard label="Receivables" value={fmt(totalReceivable)} trend={totalReceivable > 0 ? 1 : 0} trendLabel={`${c.filter(x => custBalance(s, x.id, x.opening_balance) > 0).length} customers owe`} />
        <StatCard label="Payables" value={fmt(totalPayable)} />
      </div>

      <div className="dj-grid g2 dj-section">
        <Card title="Gold Rate">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <p className="dj-stat">{fmt(rates.gold_pure_per_gram)}<span style={{ fontSize: 13, color: 'var(--ink-soft)' }}> /g (24K)</span></p>
            <span className={goldChange >= 0 ? 'up' : 'down'} style={{ fontSize: 12.5, fontWeight: 600 }}>{goldChange >= 0 ? '+' : ''}{goldChange.toFixed(2)}%</span>
          </div>
          <div className="dj-rate-table">
            <div className="dj-rate-table-row head"><span></span><span>Per Gram</span><span>Per Tola</span></div>
            <div className="dj-rate-table-row"><span>PKR</span><span>{fmt(rates.gold_pure_per_gram)}</span><span>{fmt(rates.gold_pure_per_gram * TOLA_GRAMS)}</span></div>
            <div className="dj-rate-table-row"><span>USD</span><span>${(rates.gold_pure_per_gram / rates.usd_to_pkr).toFixed(2)}</span><span>${(rates.gold_pure_per_gram * TOLA_GRAMS / rates.usd_to_pkr).toFixed(2)}</span></div>
          </div>
          <p className="dj-label" style={{ marginTop: 10, marginBottom: 4 }}>Other purities</p>
          <div className="dj-grid g4" style={{ gap: 8 }}>
            {['g22', 'g21', 'g18', 'g14'].map(id => (
              <div key={id} style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
                <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{getPurity(id).label}</div>
                <div>{fmt(ratePerGram(id, rates))}/g</div>
                <div style={{ fontSize: 10.5 }}>{fmt(ratePerGram(id, rates) * TOLA_GRAMS)}/tola</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 10, marginBottom: 0 }}>Source: {rates.source} · Updated {new Date(rates.last_updated).toLocaleString()}</p>
        </Card>
        <Card title="Silver Rate">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <p className="dj-stat">{fmt(rates.silver_pure_per_gram)}<span style={{ fontSize: 13, color: 'var(--ink-soft)' }}> /g (999)</span></p>
            <span className={silverChange >= 0 ? 'up' : 'down'} style={{ fontSize: 12.5, fontWeight: 600 }}>{silverChange >= 0 ? '+' : ''}{silverChange.toFixed(2)}%</span>
          </div>
          <div className="dj-rate-table">
            <div className="dj-rate-table-row head"><span></span><span>Per Gram</span><span>Per Tola</span></div>
            <div className="dj-rate-table-row"><span>PKR</span><span>{fmt(rates.silver_pure_per_gram)}</span><span>{fmt(rates.silver_pure_per_gram * TOLA_GRAMS)}</span></div>
            <div className="dj-rate-table-row"><span>USD</span><span>${(rates.silver_pure_per_gram / rates.usd_to_pkr).toFixed(2)}</span><span>${(rates.silver_pure_per_gram * TOLA_GRAMS / rates.usd_to_pkr).toFixed(2)}</span></div>
          </div>
          <p className="dj-label" style={{ marginTop: 10, marginBottom: 4 }}>Other purities</p>
          <div className="dj-grid g3" style={{ gap: 8 }}>
            {['s925', 's900'].map(id => (
              <div key={id} style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
                <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{getPurity(id).label}</div>
                <div>{fmt(ratePerGram(id, rates))}/g</div>
                <div style={{ fontSize: 10.5 }}>{fmt(ratePerGram(id, rates) * TOLA_GRAMS)}/tola</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 10, marginBottom: 0 }}>USD/PKR: {rates.usd_to_pkr}{rates.fetch_status === 'error' && <span style={{ color: 'var(--danger)' }}> · Live fetch failed: {rates.fetch_error}</span>}</p>
        </Card>
      </div>

      <DashboardCharts salesTrend={salesTrend} categoryData={categoryData} />

      <div className="dj-grid g3">
        <StatCard label="Gold in stock" value={fmtW(goldWeight)} />
        <StatCard label="Silver in stock" value={fmtW(silverWeight)} />
        <StatCard label="Inventory value" value={fmt(inventoryValue)} />
      </div>
      <div className="dj-grid g3" style={{ marginTop: 16 }}>
        <StatCard label="Cash in hand" value={fmt(cash)} />
        <StatCard label="Bank balance" value={fmt(bank)} />
        <Card title="Low stock alerts">
          {lowStock.length === 0 ? <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>All items sufficiently stocked.</p> :
            lowStock.map(x => (
              <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '4px 0' }}>
                <span>{x.name}</span><Badge text={`${x.qty} left`} kind={x.qty === 0 ? 'out' : 'low'} />
              </div>
            ))}
        </Card>
      </div>

      <div className="dj-section" style={{ marginTop: 20 }}>
        <SectionHead title="Purity Reference Table" />
        <Card>
          <table className="dj-table">
            <thead><tr><th>Purity</th><th>Metal</th><th>Factor</th><th>Rate / gram</th><th>Rate / tola</th></tr></thead>
            <tbody>
              {PURITIES.map(p => (
                <tr key={p.id}><td style={{ fontWeight: 600 }}>{p.label}</td><td style={{ textTransform: 'capitalize' }}>{p.metal}</td><td>{(p.factor * 100).toFixed(1)}%</td>
                  <td>{fmt(ratePerGram(p.id, rates))}</td><td>{fmt(ratePerGram(p.id, rates) * TOLA_GRAMS)}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

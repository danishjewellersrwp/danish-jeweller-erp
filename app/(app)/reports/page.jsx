import { createClient } from '@/lib/supabase/server';
import { Card, SectionHead, StatCard } from '@/components/ui';
import { fmt, priceBreakdown } from '@/lib/pricing';
import { custBalance, suppBalance } from '@/lib/balances';
import ExpenseChart from '@/components/ExpenseChart';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const supabase = createClient();
  const [{ data: sales }, { data: expenses }, { data: customers }, { data: suppliers },
    { data: purchases }, { data: products }, { data: customerPurchases }, { data: metalRates }] = await Promise.all([
    supabase.from('sales').select('*, sale_items(*), sale_payments(*)'),
    supabase.from('expenses').select('*'),
    supabase.from('customers').select('*'),
    supabase.from('suppliers').select('*'),
    supabase.from('purchases').select('*'),
    supabase.from('products').select('*'),
    supabase.from('customer_purchases').select('*'),
    supabase.from('metal_rates').select('*').eq('id', 1).single(),
  ]);

  const s = sales || [], e = expenses || [], c = customers || [], sup = suppliers || [], pur = purchases || [], p = products || [], cp = customerPurchases || [];
  const rates = metalRates || { gold_pure_per_gram: 0, silver_pure_per_gram: 0 };

  const revenue = s.reduce((a, x) => a + Number(x.total), 0);
  const cogs = s.reduce((sum, sale) => sum + (sale.sale_items || []).reduce((a, it) => a + Number(it.cost_per_gram || 0) * Number(it.net_weight) * it.qty, 0), 0);
  const grossProfit = revenue - cogs;
  const totalExpenses = e.reduce((a, x) => a + Number(x.amount), 0);
  const netProfit = grossProfit - totalExpenses;
  const receivable = c.reduce((a, x) => a + custBalance(s, x.id, x.opening_balance), 0);
  const payable = sup.reduce((a, x) => a + suppBalance(pur, x.id, x.opening_balance), 0);
  const inventoryValue = p.reduce((a, x) => a + priceBreakdown({ grossWeight: Number(x.gross_weight), stoneWeight: Number(x.stone_weight), purityId: x.purity_id, metalRates: rates, wastageType: x.wastage_type, wastageValue: Number(x.wastage_value), makingType: x.making_type, makingValue: Number(x.making_value), stoneValue: Number(x.stone_value), otherCharges: Number(x.other_charges) }).total * x.qty, 0);

  const allPayments = s.flatMap(x => x.sale_payments || []);
  const cash = allPayments.filter(pm => pm.method === 'Cash').reduce((a, pm) => a + Number(pm.amount), 0)
    - e.filter(x => x.payment_method === 'Cash').reduce((a, x) => a + Number(x.amount), 0)
    - cp.filter(x => x.payment_method === 'Cash').reduce((a, x) => a + Number(x.paid), 0);
  const bank = allPayments.filter(pm => pm.method !== 'Cash').reduce((a, pm) => a + Number(pm.amount), 0)
    - e.filter(x => x.payment_method !== 'Cash').reduce((a, x) => a + Number(x.amount), 0)
    - cp.filter(x => x.payment_method !== 'Cash').reduce((a, x) => a + Number(x.paid), 0);

  const expenseByCat = {};
  e.forEach(x => { expenseByCat[x.category] = (expenseByCat[x.category] || 0) + Number(x.amount); });
  const expenseChartData = Object.entries(expenseByCat).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <SectionHead title="Profit & Loss" />
      <Card style={{ marginBottom: 20 }}>
        <div className="dj-breakdown" style={{ fontSize: 13.5 }}>
          <div className="dj-breakdown-row"><span>Sales Revenue</span><span>{fmt(revenue)}</span></div>
          <div className="dj-breakdown-row"><span>Cost of Goods Sold</span><span>-{fmt(cogs)}</span></div>
          <div className="dj-breakdown-row total"><span>Gross Profit</span><span>{fmt(grossProfit)}</span></div>
          <div className="dj-breakdown-row" style={{ marginTop: 8 }}><span>Operating Expenses</span><span>-{fmt(totalExpenses)}</span></div>
          <div className="dj-breakdown-row total"><span>Net Profit</span><span>{fmt(netProfit)}</span></div>
        </div>
      </Card>

      <div className="dj-grid g4 dj-section">
        <StatCard label="Accounts Receivable" value={fmt(receivable)} />
        <StatCard label="Accounts Payable" value={fmt(payable)} />
        <StatCard label="Inventory Valuation" value={fmt(inventoryValue)} />
        <StatCard label="Gross Margin" value={revenue ? `${((grossProfit / revenue) * 100).toFixed(1)}%` : '0%'} />
      </div>

      <div className="dj-grid g2">
        <Card title="Cash & Bank Book">
          <div className="dj-breakdown-row"><span>Cash in hand</span><span>{fmt(cash)}</span></div>
          <div className="dj-breakdown-row"><span>Bank balance</span><span>{fmt(bank)}</span></div>
          <div className="dj-breakdown-row total"><span>Total available funds</span><span>{fmt(cash + bank)}</span></div>
        </Card>
        <Card title="Expenses by category">
          <ExpenseChart data={expenseChartData} />
        </Card>
      </div>

      <div className="dj-section" style={{ marginTop: 20 }}>
        <SectionHead title="Customer Ledger Summary" />
        <Card>
          <table className="dj-table">
            <thead><tr><th>Customer</th><th>Total Purchases</th><th>Balance Due</th></tr></thead>
            <tbody>
              {c.map(x => {
                const totalPurchases = s.filter(sale => sale.customer_id === x.id).reduce((a, sale) => a + Number(sale.total), 0);
                return <tr key={x.id}><td>{x.name}</td><td>{fmt(totalPurchases)}</td><td>{fmt(custBalance(s, x.id, x.opening_balance))}</td></tr>;
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

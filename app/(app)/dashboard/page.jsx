import { createClient } from '@/lib/supabase/server';
import { priceBreakdown, todayISO } from '@/lib/pricing';
import { custBalance, suppBalance } from '@/lib/balances';
import DashboardClient from './DashboardClient';

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
  const customersOwingCount = c.filter(x => custBalance(s, x.id, x.opening_balance) > 0).length;
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
    <DashboardClient
      todaySales={todaySales} monthSales={monthSales} totalReceivable={totalReceivable} totalPayable={totalPayable}
      customersOwingCount={customersOwingCount} rates={rates} goldChange={goldChange} silverChange={silverChange}
      goldWeight={goldWeight} silverWeight={silverWeight} inventoryValue={inventoryValue} cash={cash} bank={bank}
      lowStock={lowStock} salesTrend={salesTrend} categoryData={categoryData}
    />
  );
}

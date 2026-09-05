export function custBalance(sales, customerId, openingBalance = 0) {
  const owed = sales.filter(s => s.customer_id === customerId).reduce((a, s) => a + Number(s.balance || 0), 0);
  return Math.max(0, Number(openingBalance || 0) + owed);
}
export function suppBalance(purchases, supplierId, openingBalance = 0) {
  const owed = purchases.filter(p => p.supplier_id === supplierId).reduce((a, p) => a + Number(p.balance || 0), 0);
  return Math.max(0, Number(openingBalance || 0) + owed);
}

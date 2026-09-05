'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, SectionHead, Modal, Field } from '@/components/ui';
import { fmt, fmtW, getPurity, PURITIES, ratePerGram, todayISO } from '@/lib/pricing';
import { dbInsert } from '@/app/actions/db';

export default function PurchasesClient({ initialPurchases, initialCustomerPurchases, suppliers, customers, metalRates, canEdit }) {
  const [subTab, setSubTab] = useState('supplier');
  const [purchases, setPurchases] = useState(initialPurchases);
  const [customerPurchases, setCustomerPurchases] = useState(initialCustomerPurchases);
  const [showForm, setShowForm] = useState(false);

  const addPurchase = async (p) => {
    const res = await dbInsert('purchases', p, '/purchases');
    if (res.ok) { setPurchases(prev => [res.data, ...prev]); setShowForm(false); } else alert(res.error);
  };
  const addCustomerPurchase = async (cp) => {
    const res = await dbInsert('customer_purchases', cp, '/purchases');
    if (res.ok) { setCustomerPurchases(prev => [res.data, ...prev]); setShowForm(false); } else alert(res.error);
  };

  return (
    <div>
      <SectionHead title="Purchases" action={canEdit && (
        <button className="dj-btn dj-btn-gold" onClick={() => setShowForm(true)}><Plus size={14} /> {subTab === 'supplier' ? 'New Purchase' : 'Buy Old Jewellery'}</button>
      )} />
      <div className="dj-tabs">
        <div className={`dj-tab ${subTab === 'supplier' ? 'active' : ''}`} onClick={() => setSubTab('supplier')}>From Suppliers</div>
        <div className={`dj-tab ${subTab === 'customer' ? 'active' : ''}`} onClick={() => setSubTab('customer')}>From Customers (Old Jewellery Buyback)</div>
      </div>

      {subTab === 'supplier' && (
        <Card>
          <table className="dj-table">
            <thead><tr><th>Purchase No</th><th>Date</th><th>Supplier</th><th>Total</th><th>Paid</th><th>Balance</th></tr></thead>
            <tbody>
              {purchases.map(p => {
                const sup = suppliers.find(s => s.id === p.supplier_id);
                return <tr key={p.id}><td style={{ fontWeight: 600 }}>{p.purchase_no}</td><td>{p.purchase_date}</td><td>{sup?.name}</td><td>{fmt(p.total)}</td><td>{fmt(p.paid)}</td><td>{fmt(p.balance)}</td></tr>;
              })}
            </tbody>
          </table>
          {purchases.length === 0 && <div className="dj-empty">No purchases recorded.</div>}
        </Card>
      )}

      {subTab === 'customer' && (
        <Card>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 0 }}>
            Use this when a customer walks in to sell their own old gold or silver jewellery — the shop pays the customer directly.
          </p>
          <table className="dj-table">
            <thead><tr><th>Ref No</th><th>Date</th><th>Customer</th><th>Description</th><th>Purity</th><th>Net Wt</th><th>Rate</th><th>Amount Paid</th><th>Method</th></tr></thead>
            <tbody>
              {customerPurchases.map(cp => {
                const cust = customers.find(c => c.id === cp.customer_id);
                return (
                  <tr key={cp.id}>
                    <td style={{ fontWeight: 600 }}>{cp.purchase_no}</td><td>{cp.purchase_date}</td><td>{cust?.name}</td><td>{cp.description}</td>
                    <td>{getPurity(cp.purity_id).label}</td><td>{fmtW(cp.gross_weight - cp.stone_weight)}</td><td>{fmt(cp.rate_per_gram)}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(cp.paid)}</td><td>{cp.payment_method}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {customerPurchases.length === 0 && <div className="dj-empty">No customer buybacks recorded yet.</div>}
        </Card>
      )}

      {showForm && subTab === 'supplier' && <PurchaseForm suppliers={suppliers} purchaseCount={purchases.length} metalRates={metalRates} onClose={() => setShowForm(false)} onSave={addPurchase} />}
      {showForm && subTab === 'customer' && <CustomerBuybackForm customers={customers} count={customerPurchases.length} metalRates={metalRates} onClose={() => setShowForm(false)} onSave={addCustomerPurchase} />}
    </div>
  );
}

function PurchaseForm({ suppliers, purchaseCount, metalRates, onClose, onSave }) {
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id);
  const [metal, setMetal] = useState('gold');
  const [purityId, setPurityId] = useState('g22');
  const [weight, setWeight] = useState(0);
  const [paid, setPaid] = useState(0);
  const rate = ratePerGram(purityId, metalRates);
  const total = Math.round(weight * rate);
  return (
    <Modal title="New Purchase" onClose={onClose}>
      <Field label="Supplier"><select className="dj-select" value={supplierId} onChange={e => setSupplierId(e.target.value)}>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
      <div className="dj-grid g2">
        <Field label="Metal"><select className="dj-select" value={metal} onChange={e => { setMetal(e.target.value); setPurityId(e.target.value === 'gold' ? 'g22' : 's925'); }}><option value="gold">Gold</option><option value="silver">Silver</option></select></Field>
        <Field label="Purity"><select className="dj-select" value={purityId} onChange={e => setPurityId(e.target.value)}>{PURITIES.filter(p => p.metal === metal).map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></Field>
        <Field label="Weight (g)"><input type="number" className="dj-input" value={weight} onChange={e => setWeight(e.target.value)} /></Field>
        <Field label="Amount Paid Now"><input type="number" className="dj-input" value={paid} onChange={e => setPaid(e.target.value)} /></Field>
      </div>
      <div className="dj-breakdown"><div className="dj-breakdown-row total"><span>Total ({fmt(rate)}/g)</span><span>{fmt(total)}</span></div></div>
      <button className="dj-btn dj-btn-gold" style={{ width: '100%', marginTop: 14, justifyContent: 'center', padding: 10 }}
        onClick={() => onSave({ purchase_no: `PUR-${500 + purchaseCount + 1}`, purchase_date: todayISO(), supplier_id: supplierId, total, paid: Number(paid), balance: Math.max(0, total - Number(paid)) })}>
        Save Purchase
      </button>
    </Modal>
  );
}

function CustomerBuybackForm({ customers, count, metalRates, onClose, onSave }) {
  const [customerId, setCustomerId] = useState(customers[0]?.id);
  const [description, setDescription] = useState('');
  const [metal, setMetal] = useState('gold');
  const [purityId, setPurityId] = useState('g21');
  const [grossWeight, setGrossWeight] = useState(0);
  const [stoneWeight, setStoneWeight] = useState(0);
  const [testingResult, setTestingResult] = useState('');
  const [deduction, setDeduction] = useState(3);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const rate = ratePerGram(purityId, metalRates);
  const netWeight = Math.max(0, grossWeight - stoneWeight);
  const finalValue = Math.round(netWeight * rate * (1 - deduction / 100));
  return (
    <Modal title="Buy Old Jewellery from Customer" onClose={onClose}>
      <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 0 }}>Shop pays the customer for their old jewellery. Recorded as a purchase, not an exchange.</p>
      <Field label="Customer"><select className="dj-select" value={customerId} onChange={e => setCustomerId(e.target.value)}>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
      <Field label="Item Description"><input className="dj-input" value={description} onChange={e => setDescription(e.target.value)} /></Field>
      <div className="dj-grid g2">
        <Field label="Metal"><select className="dj-select" value={metal} onChange={e => { setMetal(e.target.value); setPurityId(e.target.value === 'gold' ? 'g21' : 's925'); }}><option value="gold">Gold</option><option value="silver">Silver</option></select></Field>
        <Field label="Tested Purity"><select className="dj-select" value={purityId} onChange={e => setPurityId(e.target.value)}>{PURITIES.filter(p => p.metal === metal).map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></Field>
        <Field label="Gross Weight (g)"><input type="number" className="dj-input" value={grossWeight} onChange={e => setGrossWeight(e.target.value)} /></Field>
        <Field label="Stone Weight (g)"><input type="number" className="dj-input" value={stoneWeight} onChange={e => setStoneWeight(e.target.value)} /></Field>
        <Field label="Testing Result"><input className="dj-input" value={testingResult} onChange={e => setTestingResult(e.target.value)} /></Field>
        <Field label="Deduction (%)"><input type="number" className="dj-input" value={deduction} onChange={e => setDeduction(e.target.value)} /></Field>
        <Field label="Payment Method"><select className="dj-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>{['Cash', 'Bank', 'Online Transfer', 'Cheque'].map(m => <option key={m}>{m}</option>)}</select></Field>
      </div>
      <div className="dj-breakdown">
        <div className="dj-breakdown-row"><span>Net weight</span><span>{fmtW(netWeight)}</span></div>
        <div className="dj-breakdown-row"><span>Rate</span><span>{fmt(rate)}/g</span></div>
        <div className="dj-breakdown-row total"><span>Amount payable</span><span>{fmt(finalValue)}</span></div>
      </div>
      <button className="dj-btn dj-btn-gold" style={{ width: '100%', marginTop: 14, justifyContent: 'center', padding: 10 }}
        onClick={() => onSave({
          purchase_no: `CPB-${700 + count + 1}`, purchase_date: todayISO(), customer_id: customerId, description, metal, purity_id: purityId,
          gross_weight: Number(grossWeight), stone_weight: Number(stoneWeight), testing_result: testingResult, deduction: Number(deduction),
          rate_per_gram: rate, final_value: finalValue, payment_method: paymentMethod, paid: finalValue, balance: 0,
        })}>
        Record Purchase
      </button>
    </Modal>
  );
}

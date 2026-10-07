'use client';
import { useState } from 'react';
import { Search, Trash2, Check } from 'lucide-react';
import { Card } from '@/components/ui';
import CategoryIcon, { CATEGORY_TILES } from '@/components/CategoryIcon';
import { fmt, fmtW, priceBreakdown, ratePerGram, getPurity } from '@/lib/pricing';
import { createSale, nextInvoiceNumber } from '@/app/actions/sales';

export default function POSClient({ initialProducts, customers, metalRates, settings }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [payMethod, setPayMethod] = useState('Cash');
  const [payments, setPayments] = useState([]);
  const [discountInput, setDiscountInput] = useState(0);
  const [checkingOut, setCheckingOut] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const results = products.filter(p => p.qty > 0 &&
    (category ? p.category === category : true) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())));

  const addToCart = (product) => {
    setCart(c => {
      const existing = c.find(i => i.productId === product.id);
      if (existing) {
        if (existing.qty >= product.qty) { notify(`Only ${product.qty} in stock`); return c; }
        return c.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...c, { productId: product.id, qty: 1, rateOverride: null }];
    });
  };
  const removeFromCart = (id) => setCart(c => c.filter(i => i.productId !== id));
  const updateQty = (id, qty) => setCart(c => c.map(i => i.productId === id ? { ...i, qty: Math.max(1, qty) } : i));
  // Editable per-line rate: pass null/'' to go back to the live market rate for that item.
  const updateRateOverride = (id, val) => setCart(c => c.map(i => i.productId === id ? { ...i, rateOverride: val === '' ? null : val } : i));

  const lineItems = cart.map(ci => {
    const product = products.find(p => p.id === ci.productId);
    const liveRate = ratePerGram(product.purity_id, metalRates);
    const b = priceBreakdown({
      grossWeight: Number(product.gross_weight), stoneWeight: Number(product.stone_weight), purityId: product.purity_id,
      metalRates, wastageType: product.wastage_type, wastageValue: Number(product.wastage_value),
      makingType: product.making_type, makingValue: Number(product.making_value), stoneValue: Number(product.stone_value),
      otherCharges: Number(product.other_charges), taxPercent: Number(settings?.tax_percent || 0),
      rateOverride: ci.rateOverride,
    });
    return { product, qty: ci.qty, breakdown: b, lineTotal: b.total * ci.qty, liveRate, rateOverride: ci.rateOverride };
  });

  const subtotal = lineItems.reduce((s, i) => s + i.breakdown.subtotal * i.qty, 0);
  const taxTotal = lineItems.reduce((s, i) => s + i.breakdown.tax * i.qty, 0);
  const grandTotal = Math.max(0, subtotal + taxTotal - Number(discountInput || 0));
  const paidSoFar = payments.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.round(grandTotal - paidSoFar);

  const addPayment = () => setPayments(p => [...p, { method: payMethod, amount: remaining > 0 ? remaining : 0 }]);
  const updatePaymentAmount = (idx, val) => setPayments(p => p.map((x, i) => i === idx ? { ...x, amount: Number(val) || 0 } : x));
  const removePayment = (idx) => setPayments(p => p.filter((_, i) => i !== idx));

  const checkout = async () => {
    if (lineItems.length === 0) { notify('Cart is empty'); return; }
    setCheckingOut(true);
    const finalPayments = payments.length ? payments : [{ method: payMethod, amount: grandTotal }];
    const invoiceNo = await nextInvoiceNumber();
    const items = lineItems.map(li => ({
      product_id: li.product.id, sku: li.product.sku, name: li.product.name, purity_label: getPurity(li.product.purity_id).label,
      gross_weight: Number(li.product.gross_weight), stone_weight: Number(li.product.stone_weight), qty: li.qty,
      rate: li.breakdown.rate, metal_value: li.breakdown.metalValue, wastage_amount: li.breakdown.wastageAmount,
      making_charge: li.breakdown.makingCharge, stone_value: li.breakdown.stoneValue, other_charges: li.breakdown.otherCharges,
      net_weight: li.breakdown.netWeight, subtotal: li.breakdown.subtotal, discount: li.breakdown.discount, tax: li.breakdown.tax,
      line_total: li.lineTotal, cost_per_gram: Number(li.product.cost_per_gram),
    }));
    const res = await createSale({
      invoiceNo, customerId, subtotal, discount: Number(discountInput || 0), tax: taxTotal, total: grandTotal,
      items, payments: finalPayments,
    });
    setCheckingOut(false);
    if (!res.ok) { notify(`Checkout failed: ${res.error}`); return; }
    notify(`Invoice ${invoiceNo} created — ${fmt(grandTotal)}`);
    setProducts(prev => prev.map(p => {
      const item = cart.find(c => c.productId === p.id);
      return item ? { ...p, qty: p.qty - item.qty } : p;
    }));
    setCart([]); setPayments([]); setDiscountInput(0);
  };

  return (
    <div className="dj-grid dj-pos-grid">
      <div>
        <div className="dj-cat-scroll">
          {CATEGORY_TILES.map(c => (
            <button key={c.label} className={`dj-cat-tile ${category === c.match ? 'active' : ''}`} onClick={() => setCategory(c.match)}>
              <div className="dj-cat-circle"><CategoryIcon type={c.icon} /></div>
              <span className="dj-cat-label">{c.label}</span>
            </button>
          ))}
        </div>
        <Card title="Search product by name, SKU or scan barcode">
          <div className="dj-search"><Search size={15} /><input className="dj-input" placeholder="Search jewellery..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        </Card>
        <div className="dj-grid g3" style={{ marginTop: 14 }}>
          {results.map(p => (
            <div key={p.id} className="dj-card" style={{ cursor: 'pointer' }} onClick={() => addToCart(p)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13.5 }}>{p.name}</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: 11, color: 'var(--ink-soft)' }}>{p.sku} · {getPurity(p.purity_id).label}</p>
                </div>
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--ink-soft)', margin: '8px 0 2px 0' }}>{fmtW(p.gross_weight)} gross</p>
              <p className="dj-serif" style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--navy)' }}>
                {fmt(priceBreakdown({ grossWeight: Number(p.gross_weight), stoneWeight: Number(p.stone_weight), purityId: p.purity_id, metalRates, wastageType: p.wastage_type, wastageValue: Number(p.wastage_value), makingType: p.making_type, makingValue: Number(p.making_value), stoneValue: Number(p.stone_value), otherCharges: Number(p.other_charges), taxPercent: Number(settings?.tax_percent || 0) }).total)}
              </p>
            </div>
          ))}
          {results.length === 0 && <div className="dj-empty" style={{ gridColumn: '1/-1' }}>No matching products in stock.</div>}
        </div>
      </div>

      <div>
        <Card title="Current sale">
          <div className="dj-field">
            <label className="dj-label">Customer</label>
            <select className="dj-select" value={customerId} onChange={e => setCustomerId(e.target.value)}>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 10 }}>
            {lineItems.length === 0 && <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>Cart is empty — click a product to add it.</p>}
            {lineItems.map(li => (
              <div key={li.product.id} className="dj-cart-item" style={{ flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontWeight: 600 }}>{li.product.name}</div>
                  <div style={{ color: 'var(--ink-soft)', fontSize: 11 }}>{getPurity(li.product.purity_id).label} · {fmtW(li.breakdown.netWeight)} net</div>
                </div>
                <input type="number" min={1} value={li.qty} onChange={e => updateQty(li.product.id, Number(e.target.value))}
                  style={{ width: 40, marginRight: 8, padding: 3, fontSize: 12, border: '1px solid var(--border)', borderRadius: 5 }} />
                <div style={{ width: 84, textAlign: 'right', fontWeight: 600 }}>{fmt(li.lineTotal)}</div>
                <button onClick={() => removeFromCart(li.product.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', marginLeft: 6 }}><Trash2 size={14} /></button>
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 10.5, color: 'var(--ink-soft)' }}>Rate (market: {fmt(li.liveRate)}/g)</span>
                  <input type="number" placeholder={String(Math.round(li.liveRate))} value={li.rateOverride ?? ''}
                    onChange={e => updateRateOverride(li.product.id, e.target.value)}
                    style={{ width: 90, padding: 3, fontSize: 11, border: '1px solid var(--border)', borderRadius: 5, textAlign: 'right' }} />
                </div>
              </div>
            ))}
          </div>

          <div className="dj-breakdown">
            <div className="dj-breakdown-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div className="dj-breakdown-row"><span>Tax ({settings?.tax_percent || 0}%)</span><span>{fmt(taxTotal)}</span></div>
            <div className="dj-breakdown-row">
              <span>Discount</span>
              <input type="number" value={discountInput} onChange={e => setDiscountInput(e.target.value)} style={{ width: 90, textAlign: 'right', padding: 3, border: '1px solid var(--border)', borderRadius: 5, fontSize: 12 }} />
            </div>
            <div className="dj-breakdown-row total"><span>Total</span><span>{fmt(grandTotal)}</span></div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label className="dj-label">Payment (split allowed)</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <select className="dj-select" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                {['Cash', 'Bank', 'Card', 'Online Transfer', 'Mobile Wallet', 'Cheque'].map(m => <option key={m}>{m}</option>)}
              </select>
              <button className="dj-btn" onClick={addPayment}>Add</button>
            </div>
            {payments.map((p, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, marginTop: 6 }}>
                <span>{p.method}</span>
                <input type="number" value={p.amount} onChange={e => updatePaymentAmount(idx, e.target.value)} style={{ width: 100, padding: 3, border: '1px solid var(--border)', borderRadius: 5, fontSize: 12, textAlign: 'right' }} />
                <button onClick={() => removePayment(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            <div style={{ fontSize: 12, marginTop: 8, color: remaining > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
              {remaining > 0 ? `Remaining balance: ${fmt(remaining)} (credit)` : 'Fully paid'}
            </div>
          </div>

          <button className="dj-btn dj-btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: 14, padding: 11 }} onClick={checkout} disabled={checkingOut}>
            <Check size={15} /> {checkingOut ? 'Processing…' : 'Complete Sale'}
          </button>
        </Card>
      </div>
      {toast && <div className="dj-toast"><Check size={15} />{toast}</div>}
    </div>
  );
}

'use client';
import { useState } from 'react';
import { Plus, Search, Edit3, Trash2 } from 'lucide-react';
import { Card, SectionHead, Modal, Field, stockBadge } from '@/components/ui';
import { fmt, fmtW, priceBreakdown, getPurity, PURITIES } from '@/lib/pricing';
import { dbInsert, dbUpdate, dbDelete } from '@/app/actions/db';

const CATEGORIES = ['Rings', 'Earrings', 'Bangles', 'Bracelets', 'Necklaces', 'Chains', 'Anklets', 'Pendants', 'Jewellery Sets', 'Nose Pins', 'Lockets', 'Brooches', 'Tikka', 'Bridal Sets', "Men's Jewellery", "Kids Jewellery", 'Custom Jewellery', 'Other'];

export default function ProductsClient({ initialProducts, metalRates, settings, canEdit }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  const save = async (form) => {
    setBusy(true);
    const payload = {
      sku: form.sku, name: form.name, category: form.category, metal: form.metal, purity_id: form.purityId,
      gross_weight: Number(form.grossWeight), stone_weight: Number(form.stoneWeight), qty: Number(form.qty),
      wastage_type: form.wastageType, wastage_value: Number(form.wastageValue),
      making_type: form.makingType, making_value: Number(form.makingValue),
      stone_value: Number(form.stoneValue), other_charges: Number(form.otherCharges), cost_per_gram: Number(form.costPerGram),
    };
    const res = editing
      ? await dbUpdate('products', editing.id, payload, '/products')
      : await dbInsert('products', payload, '/products');
    setBusy(false);
    if (res.ok) {
      setProducts(prev => editing ? prev.map(p => p.id === editing.id ? res.data : p) : [res.data, ...prev]);
      setShowForm(false); setEditing(null);
    } else {
      alert(res.error);
    }
  };
  const remove = async (id) => {
    if (!confirm('Remove this product?')) return;
    const res = await dbDelete('products', id, '/products');
    if (res.ok) setProducts(prev => prev.filter(p => p.id !== id));
    else alert(res.error);
  };

  return (
    <div>
      <SectionHead title="Products & Inventory" action={
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="dj-search"><Search size={14} /><input className="dj-input" placeholder="Search SKU or name" value={search} onChange={e => setSearch(e.target.value)} /></div>
          {canEdit && <button className="dj-btn dj-btn-gold" onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={14} /> Add Product</button>}
        </div>
      } />
      <Card>
        <table className="dj-table">
          <thead><tr>
            <th>SKU</th><th>Name</th><th>Category</th><th>Metal / Purity</th><th>Gross Wt</th><th>Net Wt</th>
            <th>Qty</th><th>Selling Price</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
            {filtered.map(p => {
              const b = priceBreakdown({ grossWeight: Number(p.gross_weight), stoneWeight: Number(p.stone_weight), purityId: p.purity_id, metalRates, wastageType: p.wastage_type, wastageValue: Number(p.wastage_value), makingType: p.making_type, makingValue: Number(p.making_value), stoneValue: Number(p.stone_value), otherCharges: Number(p.other_charges), taxPercent: Number(settings?.tax_percent || 0) });
              return (
                <tr key={p.id}>
                  <td>{p.sku}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{getPurity(p.purity_id).label}</td>
                  <td>{fmtW(p.gross_weight)}</td>
                  <td>{fmtW(b.netWeight)}</td>
                  <td>{p.qty}</td>
                  <td style={{ fontWeight: 600 }}>{fmt(b.total)}</td>
                  <td>{stockBadge(p.qty)}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    {canEdit && <button className="dj-btn dj-btn-sm" onClick={() => { setEditing(p); setShowForm(true); }}><Edit3 size={12} /></button>}
                    {canEdit && <button className="dj-btn dj-btn-sm dj-btn-danger" onClick={() => remove(p.id)}><Trash2 size={12} /></button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="dj-empty">No products found.</div>}
      </Card>
      {showForm && canEdit && (
        <ProductForm
          metalRates={metalRates} settings={settings} initial={editing} busy={busy}
          onClose={() => { setShowForm(false); setEditing(null); }} onSave={save}
        />
      )}
    </div>
  );
}

function ProductForm({ metalRates, settings, initial, busy, onClose, onSave }) {
  const [f, setF] = useState(initial ? {
    sku: initial.sku, name: initial.name, category: initial.category, metal: initial.metal, purityId: initial.purity_id,
    grossWeight: initial.gross_weight, stoneWeight: initial.stone_weight, qty: initial.qty,
    wastageType: initial.wastage_type, wastageValue: initial.wastage_value,
    makingType: initial.making_type, makingValue: initial.making_value,
    stoneValue: initial.stone_value, otherCharges: initial.other_charges, costPerGram: initial.cost_per_gram,
  } : {
    sku: `DJ-${Math.floor(Math.random() * 900 + 100)}`, name: '', category: 'Rings', metal: 'gold', purityId: 'g22',
    grossWeight: 0, stoneWeight: 0, qty: 1, wastageType: 'percent', wastageValue: settings?.default_wastage_percent || 6,
    makingType: 'per_gram', makingValue: settings?.default_making_per_gram || 450, stoneValue: 0, otherCharges: 0,
    costPerGram: metalRates?.gold_pure_per_gram || 0,
  });
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const preview = priceBreakdown({ grossWeight: Number(f.grossWeight), stoneWeight: Number(f.stoneWeight), purityId: f.purityId, metalRates, wastageType: f.wastageType, wastageValue: Number(f.wastageValue), makingType: f.makingType, makingValue: Number(f.makingValue), stoneValue: Number(f.stoneValue), otherCharges: Number(f.otherCharges), taxPercent: Number(settings?.tax_percent || 0) });
  const categories = CATEGORIES;

  return (
    <Modal title={initial ? 'Edit Product' : 'Add Product'} onClose={onClose} wide>
      <div className="dj-grid g2">
        <Field label="Product Name"><input className="dj-input" value={f.name} onChange={e => set('name', e.target.value)} /></Field>
        <Field label="SKU"><input className="dj-input" value={f.sku} onChange={e => set('sku', e.target.value)} /></Field>
        <Field label="Category"><select className="dj-select" value={f.category} onChange={e => set('category', e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Metal">
          <select className="dj-select" value={f.metal} onChange={e => { set('metal', e.target.value); set('purityId', e.target.value === 'gold' ? 'g22' : 's925'); }}>
            <option value="gold">Gold</option><option value="silver">Silver</option>
          </select>
        </Field>
        <Field label="Purity">
          <select className="dj-select" value={f.purityId} onChange={e => set('purityId', e.target.value)}>
            {PURITIES.filter(p => p.metal === f.metal).map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </Field>
        <Field label="Quantity"><input type="number" className="dj-input" value={f.qty} onChange={e => set('qty', Number(e.target.value))} /></Field>
        <Field label="Gross Weight (g)"><input type="number" step="0.01" className="dj-input" value={f.grossWeight} onChange={e => set('grossWeight', Number(e.target.value))} /></Field>
        <Field label="Stone Weight (g)"><input type="number" step="0.01" className="dj-input" value={f.stoneWeight} onChange={e => set('stoneWeight', Number(e.target.value))} /></Field>
        <Field label="Wastage Type">
          <select className="dj-select" value={f.wastageType} onChange={e => set('wastageType', e.target.value)}>
            <option value="percent">Percentage</option><option value="grams">Grams</option><option value="fixed">Fixed Amount</option>
          </select>
        </Field>
        <Field label="Wastage Value"><input type="number" className="dj-input" value={f.wastageValue} onChange={e => set('wastageValue', Number(e.target.value))} /></Field>
        <Field label="Making Charge Type">
          <select className="dj-select" value={f.makingType} onChange={e => set('makingType', e.target.value)}>
            <option value="per_gram">Per Gram</option><option value="percent">Percentage</option><option value="fixed">Fixed Amount</option>
          </select>
        </Field>
        <Field label="Making Charge Value"><input type="number" className="dj-input" value={f.makingValue} onChange={e => set('makingValue', Number(e.target.value))} /></Field>
        <Field label="Stone Value (PKR)"><input type="number" className="dj-input" value={f.stoneValue} onChange={e => set('stoneValue', Number(e.target.value))} /></Field>
        <Field label="Other Charges (PKR)"><input type="number" className="dj-input" value={f.otherCharges} onChange={e => set('otherCharges', Number(e.target.value))} /></Field>
        <Field label="Cost per gram (for COGS)"><input type="number" className="dj-input" value={f.costPerGram} onChange={e => set('costPerGram', Number(e.target.value))} /></Field>
      </div>
      <div className="dj-breakdown" style={{ marginTop: 6 }}>
        <div className="dj-breakdown-row"><span>Net weight</span><span>{fmtW(preview.netWeight)}</span></div>
        <div className="dj-breakdown-row"><span>Metal value ({fmt(preview.rate)}/g)</span><span>{fmt(preview.metalValue)}</span></div>
        <div className="dj-breakdown-row"><span>Wastage</span><span>{fmt(preview.wastageAmount)}</span></div>
        <div className="dj-breakdown-row"><span>Making charge</span><span>{fmt(preview.makingCharge)}</span></div>
        <div className="dj-breakdown-row"><span>Stone value</span><span>{fmt(preview.stoneValue)}</span></div>
        <div className="dj-breakdown-row"><span>Tax</span><span>{fmt(preview.tax)}</span></div>
        <div className="dj-breakdown-row total"><span>Selling Price</span><span>{fmt(preview.total)}</span></div>
      </div>
      <button className="dj-btn dj-btn-gold" style={{ marginTop: 14, width: '100%', justifyContent: 'center', padding: 10 }}
        disabled={busy} onClick={() => f.name && onSave(f)}>{busy ? 'Saving…' : 'Save Product'}</button>
    </Modal>
  );
}

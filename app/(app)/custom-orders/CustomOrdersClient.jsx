'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, SectionHead, Modal, Field } from '@/components/ui';
import { fmt, PURITIES, todayISO } from '@/lib/pricing';
import { dbInsert, dbUpdate } from '@/app/actions/db';

const STATUSES = ['Inquiry', 'Quotation', 'Advance Received', 'Design Approved', 'Production', 'Quality Check', 'Ready', 'Delivered', 'Cancelled'];

export default function CustomOrdersClient({ initialOrders, customers, canEdit }) {
  const [orders, setOrders] = useState(initialOrders);
  const [showForm, setShowForm] = useState(false);

  const add = async (o) => {
    const res = await dbInsert('custom_orders', o, '/custom-orders');
    if (res.ok) { setOrders(prev => [res.data, ...prev]); setShowForm(false); } else alert(res.error);
  };
  const updateStatus = async (id, status) => {
    const res = await dbUpdate('custom_orders', id, { status }, '/custom-orders');
    if (res.ok) setOrders(prev => prev.map(o => o.id === id ? res.data : o));
  };

  return (
    <div>
      <SectionHead title="Custom Jewellery Orders" action={canEdit && <button className="dj-btn dj-btn-gold" onClick={() => setShowForm(true)}><Plus size={14} /> New Order</button>} />
      <Card>
        <table className="dj-table">
          <thead><tr><th>Order No</th><th>Date</th><th>Customer</th><th>Description</th><th>Est. Price</th><th>Advance</th><th>Status</th></tr></thead>
          <tbody>
            {orders.map(o => {
              const cust = customers.find(c => c.id === o.customer_id);
              return (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600 }}>{o.order_no}</td><td>{o.order_date}</td><td>{cust?.name}</td><td>{o.description}</td>
                  <td>{fmt(o.estimated_price)}</td><td>{fmt(o.advance_paid)}</td>
                  <td><select className="dj-status-select" value={o.status} disabled={!canEdit} onChange={e => updateStatus(o.id, e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && <div className="dj-empty">No custom orders yet.</div>}
      </Card>
      {showForm && <CustomOrderForm customers={customers} count={orders.length} onClose={() => setShowForm(false)} onSave={add} />}
    </div>
  );
}

function CustomOrderForm({ customers, count, onClose, onSave }) {
  const [f, setF] = useState({ customerId: customers[0]?.id, description: '', metal: 'gold', purityId: 'g22', estimatedWeight: 0, estimatedPrice: 0, advancePaid: 0, expectedDate: todayISO() });
  return (
    <Modal title="New Custom Order" onClose={onClose}>
      <Field label="Customer"><select className="dj-select" value={f.customerId} onChange={e => setF({ ...f, customerId: e.target.value })}>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
      <Field label="Design Description"><input className="dj-input" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></Field>
      <div className="dj-grid g2">
        <Field label="Metal"><select className="dj-select" value={f.metal} onChange={e => setF({ ...f, metal: e.target.value, purityId: e.target.value === 'gold' ? 'g22' : 's925' })}><option value="gold">Gold</option><option value="silver">Silver</option></select></Field>
        <Field label="Purity"><select className="dj-select" value={f.purityId} onChange={e => setF({ ...f, purityId: e.target.value })}>{PURITIES.filter(p => p.metal === f.metal).map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></Field>
        <Field label="Estimated Weight (g)"><input type="number" className="dj-input" value={f.estimatedWeight} onChange={e => setF({ ...f, estimatedWeight: e.target.value })} /></Field>
        <Field label="Estimated Price"><input type="number" className="dj-input" value={f.estimatedPrice} onChange={e => setF({ ...f, estimatedPrice: e.target.value })} /></Field>
        <Field label="Advance Paid"><input type="number" className="dj-input" value={f.advancePaid} onChange={e => setF({ ...f, advancePaid: e.target.value })} /></Field>
        <Field label="Expected Completion"><input type="date" className="dj-input" value={f.expectedDate} onChange={e => setF({ ...f, expectedDate: e.target.value })} /></Field>
      </div>
      <button className="dj-btn dj-btn-gold" style={{ width: '100%', justifyContent: 'center', padding: 10 }}
        onClick={() => onSave({ order_no: `CO-${300 + count + 1}`, order_date: todayISO(), customer_id: f.customerId, description: f.description, metal: f.metal, purity_id: f.purityId, estimated_weight: Number(f.estimatedWeight), estimated_price: Number(f.estimatedPrice), advance_paid: Number(f.advancePaid), status: 'Inquiry', expected_date: f.expectedDate })}>
        Create Order
      </button>
    </Modal>
  );
}

'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, SectionHead, Modal, Field } from '@/components/ui';
import { fmt, todayISO } from '@/lib/pricing';
import { dbInsert, dbUpdate } from '@/app/actions/db';

const STATUSES = ['Received', 'Inspection', 'Quoted', 'Approved', 'In Repair', 'Ready', 'Delivered', 'Cancelled'];

export default function RepairsClient({ initialRepairs, customers, canEdit }) {
  const [repairs, setRepairs] = useState(initialRepairs);
  const [showForm, setShowForm] = useState(false);

  const add = async (r) => {
    const res = await dbInsert('repairs', r, '/repairs');
    if (res.ok) { setRepairs(prev => [res.data, ...prev]); setShowForm(false); } else alert(res.error);
  };
  const updateStatus = async (id, status) => {
    const res = await dbUpdate('repairs', id, { status }, '/repairs');
    if (res.ok) setRepairs(prev => prev.map(r => r.id === id ? res.data : r));
  };

  return (
    <div>
      <SectionHead title="Jewellery Repairs" action={canEdit && <button className="dj-btn dj-btn-gold" onClick={() => setShowForm(true)}><Plus size={14} /> New Repair</button>} />
      <Card>
        <table className="dj-table">
          <thead><tr><th>Repair No</th><th>Date</th><th>Customer</th><th>Item</th><th>Est. Cost</th><th>Expected</th><th>Status</th></tr></thead>
          <tbody>
            {repairs.map(r => {
              const cust = customers.find(c => c.id === r.customer_id);
              return (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.repair_no}</td><td>{r.repair_date}</td><td>{cust?.name}</td><td>{r.item}</td>
                  <td>{fmt(r.estimated_cost)}</td><td>{r.expected_date}</td>
                  <td><select className="dj-status-select" value={r.status} disabled={!canEdit} onChange={e => updateStatus(r.id, e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {repairs.length === 0 && <div className="dj-empty">No repair jobs yet.</div>}
      </Card>
      {showForm && <RepairForm customers={customers} count={repairs.length} onClose={() => setShowForm(false)} onSave={add} />}
    </div>
  );
}

function RepairForm({ customers, count, onClose, onSave }) {
  const [f, setF] = useState({ customerId: customers[0]?.id, item: '', description: '', estimatedCost: 0, expectedDate: todayISO() });
  return (
    <Modal title="New Repair" onClose={onClose}>
      <Field label="Customer"><select className="dj-select" value={f.customerId} onChange={e => setF({ ...f, customerId: e.target.value })}>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
      <Field label="Item"><input className="dj-input" value={f.item} onChange={e => setF({ ...f, item: e.target.value })} /></Field>
      <Field label="Description"><input className="dj-input" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></Field>
      <div className="dj-grid g2">
        <Field label="Estimated Cost"><input type="number" className="dj-input" value={f.estimatedCost} onChange={e => setF({ ...f, estimatedCost: e.target.value })} /></Field>
        <Field label="Expected Completion"><input type="date" className="dj-input" value={f.expectedDate} onChange={e => setF({ ...f, expectedDate: e.target.value })} /></Field>
      </div>
      <button className="dj-btn dj-btn-gold" style={{ width: '100%', justifyContent: 'center', padding: 10 }}
        onClick={() => onSave({ repair_no: `RPR-${200 + count + 1}`, repair_date: todayISO(), customer_id: f.customerId, item: f.item, description: f.description, estimated_cost: Number(f.estimatedCost), final_cost: null, status: 'Received', expected_date: f.expectedDate })}>
        Create Repair Job
      </button>
    </Modal>
  );
}

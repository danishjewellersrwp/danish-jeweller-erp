'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, SectionHead, Modal, Field, Badge } from '@/components/ui';
import { fmt } from '@/lib/pricing';
import { custBalance } from '@/lib/balances';
import { dbInsert } from '@/app/actions/db';

export default function CustomersClient({ initialCustomers, sales, canEdit }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [showForm, setShowForm] = useState(false);
  const [ledgerFor, setLedgerFor] = useState(null);

  const add = async (form) => {
    const res = await dbInsert('customers', { name: form.name, phone: form.phone, address: form.address, opening_balance: Number(form.openingBalance) }, '/customers');
    if (res.ok) { setCustomers(prev => [res.data, ...prev]); setShowForm(false); }
    else alert(res.error);
  };

  return (
    <div>
      <SectionHead title="Customers" action={canEdit && <button className="dj-btn dj-btn-gold" onClick={() => setShowForm(true)}><Plus size={14} /> Add Customer</button>} />
      <Card>
        <table className="dj-table">
          <thead><tr><th>Name</th><th>Phone</th><th>Address</th><th>Balance</th><th></th></tr></thead>
          <tbody>
            {customers.map(c => {
              const bal = custBalance(sales, c.id, c.opening_balance);
              return (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td><td>{c.phone}</td><td>{c.address}</td>
                  <td><Badge text={fmt(bal)} kind={bal > 0 ? 'low' : 'instock'} /></td>
                  <td><button className="dj-btn dj-btn-sm" onClick={() => setLedgerFor(c)}>Ledger</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {customers.length === 0 && <div className="dj-empty">No customers yet.</div>}
      </Card>
      {showForm && <PartyForm title="Add Customer" onClose={() => setShowForm(false)} onSave={add} />}
      {ledgerFor && <LedgerModal party={ledgerFor} rows={sales.filter(s => s.customer_id === ledgerFor.id).map(s => ({ date: s.sale_date, ref: s.invoice_no, debit: Number(s.total), credit: Number(s.paid_total) }))} onClose={() => setLedgerFor(null)} />}
    </div>
  );
}

export function PartyForm({ title, onClose, onSave }) {
  const [f, setF] = useState({ name: '', phone: '', address: '', openingBalance: 0 });
  return (
    <Modal title={title} onClose={onClose}>
      <Field label="Name"><input className="dj-input" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
      <Field label="Phone"><input className="dj-input" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></Field>
      <Field label="Address"><input className="dj-input" value={f.address} onChange={e => setF({ ...f, address: e.target.value })} /></Field>
      <Field label="Opening Balance"><input type="number" className="dj-input" value={f.openingBalance} onChange={e => setF({ ...f, openingBalance: Number(e.target.value) })} /></Field>
      <button className="dj-btn dj-btn-gold" style={{ width: '100%', justifyContent: 'center', padding: 10 }} onClick={() => f.name && onSave(f)}>Save</button>
    </Modal>
  );
}

export function LedgerModal({ party, rows, onClose }) {
  let running = Number(party.opening_balance);
  return (
    <Modal title={`${party.name} — Ledger`} onClose={onClose} wide>
      <table className="dj-table">
        <thead><tr><th>Date</th><th>Reference</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead>
        <tbody>
          <tr><td>-</td><td>Opening Balance</td><td>{fmt(party.opening_balance)}</td><td>-</td><td>{fmt(running)}</td></tr>
          {rows.map((r, i) => { running = running + r.debit - r.credit; return (
            <tr key={i}><td>{r.date}</td><td>{r.ref}</td><td>{fmt(r.debit)}</td><td>{fmt(r.credit)}</td><td>{fmt(running)}</td></tr>
          ); })}
        </tbody>
      </table>
      <div style={{ marginTop: 12, fontWeight: 700, fontFamily: "'Cormorant Garamond',serif", fontSize: 18 }}>Current balance: {fmt(running)}</div>
    </Modal>
  );
}

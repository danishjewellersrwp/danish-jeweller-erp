'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, SectionHead, Badge } from '@/components/ui';
import { PartyForm, LedgerModal } from '@/app/(app)/customers/CustomersClient';
import { fmt } from '@/lib/pricing';
import { suppBalance } from '@/lib/balances';
import { dbInsert } from '@/app/actions/db';

export default function SuppliersClient({ initialSuppliers, purchases, canEdit }) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [showForm, setShowForm] = useState(false);
  const [ledgerFor, setLedgerFor] = useState(null);

  const add = async (form) => {
    const res = await dbInsert('suppliers', { name: form.name, phone: form.phone, address: form.address, opening_balance: Number(form.openingBalance) }, '/suppliers');
    if (res.ok) { setSuppliers(prev => [res.data, ...prev]); setShowForm(false); }
    else alert(res.error);
  };

  return (
    <div>
      <SectionHead title="Suppliers" action={canEdit && <button className="dj-btn dj-btn-gold" onClick={() => setShowForm(true)}><Plus size={14} /> Add Supplier</button>} />
      <Card>
        <table className="dj-table">
          <thead><tr><th>Name</th><th>Phone</th><th>Address</th><th>Payable</th><th></th></tr></thead>
          <tbody>
            {suppliers.map(s => {
              const bal = suppBalance(purchases, s.id, s.opening_balance);
              return (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td><td>{s.phone}</td><td>{s.address}</td>
                  <td><Badge text={fmt(bal)} kind={bal > 0 ? 'low' : 'instock'} /></td>
                  <td><button className="dj-btn dj-btn-sm" onClick={() => setLedgerFor(s)}>Ledger</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {suppliers.length === 0 && <div className="dj-empty">No suppliers yet.</div>}
      </Card>
      {showForm && <PartyForm title="Add Supplier" onClose={() => setShowForm(false)} onSave={add} />}
      {ledgerFor && <LedgerModal party={ledgerFor} rows={purchases.filter(p => p.supplier_id === ledgerFor.id).map(p => ({ date: p.purchase_date, ref: p.purchase_no, debit: Number(p.total), credit: Number(p.paid) }))} onClose={() => setLedgerFor(null)} />}
    </div>
  );
}

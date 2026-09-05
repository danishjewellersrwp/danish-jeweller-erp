'use client';
import { useState } from 'react';
import { Printer } from 'lucide-react';
import Image from 'next/image';
import { Card, SectionHead, Modal, Badge, statusKind } from '@/components/ui';
import { fmt, fmtW } from '@/lib/pricing';

export default function SalesClient({ sales, customers }) {
  const [viewing, setViewing] = useState(null);
  return (
    <div>
      <SectionHead title="Sales History" />
      <Card>
        <table className="dj-table">
          <thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {sales.map(s => {
              const cust = customers.find(c => c.id === s.customer_id);
              return (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.invoice_no}</td>
                  <td>{s.sale_date}</td>
                  <td>{cust?.name}</td>
                  <td>{(s.sale_items || []).length}</td>
                  <td>{fmt(s.total)}</td>
                  <td>{fmt(s.paid_total)}</td>
                  <td>{fmt(s.balance)}</td>
                  <td><Badge text={s.status} kind={statusKind(s.status)} /></td>
                  <td><button className="dj-btn dj-btn-sm" onClick={() => setViewing(s)}><Printer size={12} /> View</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sales.length === 0 && <div className="dj-empty">No sales yet — create one from POS.</div>}
      </Card>
      {viewing && <InvoiceModal sale={viewing} customer={customers.find(c => c.id === viewing.customer_id)} onClose={() => setViewing(null)} />}
    </div>
  );
}

function InvoiceModal({ sale, customer, onClose }) {
  return (
    <Modal title={`Invoice ${sale.invoice_no}`} onClose={onClose} wide>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        <Image src="/logo.png" alt="Danish Jeweller" width={130} height={75} />
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '0 0 12px 0', textAlign: 'center' }}>{sale.sale_date} · Bill to: {customer?.name}</p>
      <table className="dj-table">
        <thead><tr><th>Item</th><th>Purity</th><th>Net Wt</th><th>Rate</th><th>Making</th><th>Stone</th><th>Qty</th><th>Line Total</th></tr></thead>
        <tbody>
          {(sale.sale_items || []).map((it) => (
            <tr key={it.id}>
              <td>{it.name}<div style={{ fontSize: 10.5, color: 'var(--ink-soft)' }}>{it.sku}</div></td>
              <td>{it.purity_label}</td><td>{fmtW(it.net_weight)}</td><td>{fmt(it.rate)}</td>
              <td>{fmt(it.making_charge)}</td><td>{fmt(it.stone_value)}</td><td>{it.qty}</td><td style={{ fontWeight: 600 }}>{fmt(it.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="dj-breakdown" style={{ marginTop: 12 }}>
        <div className="dj-breakdown-row"><span>Subtotal</span><span>{fmt(sale.subtotal)}</span></div>
        <div className="dj-breakdown-row"><span>Discount</span><span>-{fmt(sale.discount)}</span></div>
        <div className="dj-breakdown-row"><span>Tax</span><span>{fmt(sale.tax)}</span></div>
        <div className="dj-breakdown-row total"><span>Total</span><span>{fmt(sale.total)}</span></div>
      </div>
      <div style={{ marginTop: 10, fontSize: 12.5 }}>
        {(sale.sale_payments || []).map((p) => <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{p.method}</span><span>{fmt(p.amount)}</span></div>)}
        {sale.balance > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)', fontWeight: 600, marginTop: 4 }}><span>Balance due</span><span>{fmt(sale.balance)}</span></div>}
      </div>
    </Modal>
  );
}

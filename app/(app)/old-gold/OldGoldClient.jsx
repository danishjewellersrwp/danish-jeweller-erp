'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, SectionHead, Modal, Field } from '@/components/ui';
import { fmt, fmtW, getPurity, PURITIES, ratePerGram, todayISO } from '@/lib/pricing';
import { dbInsert } from '@/app/actions/db';

export default function OldGoldClient({ initialExchanges, customers, metalRates, canEdit }) {
  const [exchanges, setExchanges] = useState(initialExchanges);
  const [showForm, setShowForm] = useState(false);

  const add = async (og) => {
    const res = await dbInsert('old_gold_exchanges', og, '/old-gold');
    if (res.ok) { setExchanges(prev => [res.data, ...prev]); setShowForm(false); } else alert(res.error);
  };

  return (
    <div>
      <SectionHead title="Old Gold / Silver Exchange" action={canEdit && <button className="dj-btn dj-btn-gold" onClick={() => setShowForm(true)}><Plus size={14} /> New Exchange</button>} />
      <Card>
        <table className="dj-table">
          <thead><tr><th>Date</th><th>Customer</th><th>Description</th><th>Purity</th><th>Net Wt</th><th>Rate</th><th>Final Value</th></tr></thead>
          <tbody>
            {exchanges.map(o => {
              const cust = customers.find(c => c.id === o.customer_id);
              return <tr key={o.id}><td>{o.exchange_date}</td><td>{cust?.name}</td><td>{o.description}</td><td>{getPurity(o.purity_id).label}</td><td>{fmtW(o.gross_weight - o.stone_weight)}</td><td>{fmt(o.rate_per_gram)}</td><td style={{ fontWeight: 600 }}>{fmt(o.final_value)}</td></tr>;
            })}
          </tbody>
        </table>
        {exchanges.length === 0 && <div className="dj-empty">No exchange transactions yet.</div>}
      </Card>
      {showForm && <OldGoldForm customers={customers} metalRates={metalRates} onClose={() => setShowForm(false)} onSave={add} />}
    </div>
  );
}

function OldGoldForm({ customers, metalRates, onClose, onSave }) {
  const [customerId, setCustomerId] = useState(customers[0]?.id);
  const [description, setDescription] = useState('');
  const [metal, setMetal] = useState('gold');
  const [purityId, setPurityId] = useState('g21');
  const [grossWeight, setGrossWeight] = useState(0);
  const [stoneWeight, setStoneWeight] = useState(0);
  const [testingResult, setTestingResult] = useState('');
  const [deduction, setDeduction] = useState(2);
  const rate = ratePerGram(purityId, metalRates);
  const netWeight = Math.max(0, grossWeight - stoneWeight);
  const finalValue = Math.round(netWeight * rate * (1 - deduction / 100));
  return (
    <Modal title="Old Gold / Silver Exchange" onClose={onClose}>
      <Field label="Customer"><select className="dj-select" value={customerId} onChange={e => setCustomerId(e.target.value)}>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
      <Field label="Item Description"><input className="dj-input" value={description} onChange={e => setDescription(e.target.value)} /></Field>
      <div className="dj-grid g2">
        <Field label="Metal"><select className="dj-select" value={metal} onChange={e => { setMetal(e.target.value); setPurityId(e.target.value === 'gold' ? 'g21' : 's925'); }}><option value="gold">Gold</option><option value="silver">Silver</option></select></Field>
        <Field label="Tested Purity"><select className="dj-select" value={purityId} onChange={e => setPurityId(e.target.value)}>{PURITIES.filter(p => p.metal === metal).map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></Field>
        <Field label="Gross Weight (g)"><input type="number" className="dj-input" value={grossWeight} onChange={e => setGrossWeight(e.target.value)} /></Field>
        <Field label="Stone Weight (g)"><input type="number" className="dj-input" value={stoneWeight} onChange={e => setStoneWeight(e.target.value)} /></Field>
        <Field label="Testing Result"><input className="dj-input" value={testingResult} onChange={e => setTestingResult(e.target.value)} /></Field>
        <Field label="Deduction (%)"><input type="number" className="dj-input" value={deduction} onChange={e => setDeduction(e.target.value)} /></Field>
      </div>
      <div className="dj-breakdown">
        <div className="dj-breakdown-row"><span>Net weight</span><span>{fmtW(netWeight)}</span></div>
        <div className="dj-breakdown-row"><span>Rate</span><span>{fmt(rate)}/g</span></div>
        <div className="dj-breakdown-row total"><span>Exchange value</span><span>{fmt(finalValue)}</span></div>
      </div>
      <button className="dj-btn dj-btn-gold" style={{ width: '100%', marginTop: 14, justifyContent: 'center', padding: 10 }}
        onClick={() => onSave({ exchange_date: todayISO(), customer_id: customerId, description, metal, purity_id: purityId, gross_weight: Number(grossWeight), stone_weight: Number(stoneWeight), testing_result: testingResult, deduction: Number(deduction), rate_per_gram: rate, final_value: finalValue })}>
        Save Exchange
      </button>
    </Modal>
  );
}

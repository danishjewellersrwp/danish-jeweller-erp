'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, SectionHead, StatCard, Badge, Modal, Field } from '@/components/ui';
import { fmt, todayISO } from '@/lib/pricing';
import { dbInsert } from '@/app/actions/db';

const CATEGORIES = ['Rent', 'Electricity', 'Gas', 'Water', 'Salaries', 'Delivery', 'Packaging', 'Marketing', 'Repairs', 'Security', 'Bank Charges', 'Internet', 'Maintenance', 'Office', 'Miscellaneous'];

export default function ExpensesClient({ initialExpenses, canEdit }) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [showForm, setShowForm] = useState(false);
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const add = async (e) => {
    const res = await dbInsert('expenses', e, '/expenses');
    if (res.ok) { setExpenses(prev => [res.data, ...prev]); setShowForm(false); } else alert(res.error);
  };

  return (
    <div>
      <SectionHead title="Expenses" action={canEdit && <button className="dj-btn dj-btn-gold" onClick={() => setShowForm(true)}><Plus size={14} /> Add Expense</button>} />
      <div className="dj-grid g3 dj-section"><StatCard label="Total Expenses" value={fmt(total)} /></div>
      <Card>
        <table className="dj-table">
          <thead><tr><th>Date</th><th>Category</th><th>Payee</th><th>Method</th><th>Description</th><th>Amount</th></tr></thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id}><td>{e.expense_date}</td><td><Badge text={e.category} kind="gold" /></td><td>{e.payee}</td><td>{e.payment_method}</td><td>{e.description}</td><td style={{ fontWeight: 600 }}>{fmt(e.amount)}</td></tr>
            ))}
          </tbody>
        </table>
        {expenses.length === 0 && <div className="dj-empty">No expenses recorded.</div>}
      </Card>
      {showForm && <ExpenseForm onClose={() => setShowForm(false)} onSave={add} />}
    </div>
  );
}

function ExpenseForm({ onClose, onSave }) {
  const [f, setF] = useState({ date: todayISO(), category: 'Rent', amount: 0, paymentMethod: 'Cash', payee: '', description: '' });
  return (
    <Modal title="Add Expense" onClose={onClose}>
      <div className="dj-grid g2">
        <Field label="Date"><input type="date" className="dj-input" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} /></Field>
        <Field label="Category"><select className="dj-select" value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Amount"><input type="number" className="dj-input" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} /></Field>
        <Field label="Payment Method"><select className="dj-select" value={f.paymentMethod} onChange={e => setF({ ...f, paymentMethod: e.target.value })}>{['Cash', 'Bank', 'Card', 'Cheque'].map(m => <option key={m}>{m}</option>)}</select></Field>
        <Field label="Payee"><input className="dj-input" value={f.payee} onChange={e => setF({ ...f, payee: e.target.value })} /></Field>
        <Field label="Description"><input className="dj-input" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></Field>
      </div>
      <button className="dj-btn dj-btn-gold" style={{ width: '100%', justifyContent: 'center', padding: 10 }}
        onClick={() => onSave({ expense_date: f.date, category: f.category, amount: Number(f.amount), payment_method: f.paymentMethod, payee: f.payee, description: f.description })}>
        Save Expense
      </button>
    </Modal>
  );
}

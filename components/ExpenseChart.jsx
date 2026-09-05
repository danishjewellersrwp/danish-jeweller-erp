'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fmt } from '@/lib/pricing';

export default function ExpenseChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ECE4D2" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#6B7180" />
        <YAxis tick={{ fontSize: 10 }} stroke="#6B7180" />
        <Tooltip formatter={(v) => fmt(v)} />
        <Bar dataKey="value" fill="#AD8438" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

'use client';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui';
import { fmt } from '@/lib/pricing';

const COLORS = ['#AD8438', '#C9A24E', '#0E1626', '#6B7180', '#9A6B1F', '#2E6E4E', '#A6402F', '#8B93A6'];

export default function DashboardCharts({ salesTrend, categoryData }) {
  return (
    <div className="dj-grid g2 dj-section">
      <Card title="Sales trend — last 7 days">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={salesTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ECE4D2" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#6B7180" />
            <YAxis tick={{ fontSize: 11 }} stroke="#6B7180" tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
            <Tooltip formatter={(v) => fmt(v)} />
            <Line type="monotone" dataKey="total" stroke="#AD8438" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Card title="Inventory by category (qty)">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={{ fontSize: 10 }}>
              {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

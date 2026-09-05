'use client';
import { X } from 'lucide-react';

export const Card = ({ title, children, style }) => (
  <div className="dj-card" style={style}>
    {title && <p className="dj-card-title">{title}</p>}
    {children}
  </div>
);

export const StatCard = ({ label, value, trend, trendLabel }) => (
  <div className="dj-card">
    <p className="dj-card-title">{label}</p>
    <p className="dj-stat">{value}</p>
    {trend !== undefined && (
      <div className={`dj-stat-sub ${trend >= 0 ? 'up' : 'down'}`}>
        <span>{trendLabel}</span>
      </div>
    )}
  </div>
);

export const Badge = ({ text, kind = 'neutral' }) => <span className={`dj-badge b-${kind}`}>{text}</span>;

export const SectionHead = ({ title, action }) => (
  <div className="dj-section-head"><h2>{title}</h2>{action}</div>
);

export const Modal = ({ title, onClose, children, wide }) => (
  <div className="dj-modal-overlay" onClick={onClose}>
    <div className="dj-modal" style={wide ? { maxWidth: 780 } : undefined} onClick={e => e.stopPropagation()}>
      <div className="dj-modal-head"><h3>{title}</h3><button className="dj-close" onClick={onClose}><X size={18} /></button></div>
      {children}
    </div>
  </div>
);

export const Field = ({ label, children }) => <div className="dj-field"><label className="dj-label">{label}</label>{children}</div>;

export function stockBadge(qty) {
  if (qty <= 0) return <Badge text="Out of Stock" kind="out" />;
  if (qty <= 2) return <Badge text="Low Stock" kind="low" />;
  return <Badge text="In Stock" kind="instock" />;
}
export function statusKind(status) {
  if (['Paid', 'Delivered', 'Completed', 'Ready'].includes(status)) return 'instock';
  if (['Partial', 'In Repair', 'Production', 'Quoted', 'Approved'].includes(status)) return 'low';
  if (['Credit', 'Cancelled', 'Overdue'].includes(status)) return 'out';
  return 'neutral';
}

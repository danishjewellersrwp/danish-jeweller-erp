'use client';
import { Card, StatCard, Badge, SectionHead } from '@/components/ui';
import { fmt, fmtW, ratePerGram, TOLA_GRAMS, getPurity, PURITIES } from '@/lib/pricing';
import DashboardCharts from '@/components/DashboardCharts';
import DashboardHero from '@/components/DashboardHero';
import { useLanguage } from '@/lib/i18n';

export default function DashboardClient({
  todaySales, monthSales, totalReceivable, totalPayable, customersOwingCount,
  rates, goldChange, silverChange, goldWeight, silverWeight, inventoryValue,
  cash, bank, lowStock, salesTrend, categoryData,
}) {
  const { t } = useLanguage();

  return (
    <div>
      <DashboardHero />
      <div className="dj-grid g4 dj-section">
        <StatCard label={t('dashboard.todaySales')} value={fmt(todaySales)} />
        <StatCard label={t('dashboard.totalSales')} value={fmt(monthSales)} />
        <StatCard label={t('dashboard.receivables')} value={fmt(totalReceivable)} trend={totalReceivable > 0 ? 1 : 0} trendLabel={`${customersOwingCount} ${t('dashboard.customersOwe')}`} />
        <StatCard label={t('dashboard.payables')} value={fmt(totalPayable)} />
      </div>

      <div className="dj-grid g2 dj-section">
        <Card title={t('dashboard.goldRate')}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <p className="dj-stat">{fmt(rates.gold_pure_per_gram)}<span style={{ fontSize: 13, color: 'var(--ink-soft)' }}> /g (24K)</span></p>
            <span className={goldChange >= 0 ? 'up' : 'down'} style={{ fontSize: 12.5, fontWeight: 600 }}>{goldChange >= 0 ? '+' : ''}{goldChange.toFixed(2)}%</span>
          </div>
          <div className="dj-rate-table">
            <div className="dj-rate-table-row head"><span></span><span>{t('dashboard.perGram')}</span><span>{t('dashboard.perTola')}</span></div>
            <div className="dj-rate-table-row"><span>PKR</span><span>{fmt(rates.gold_pure_per_gram)}</span><span>{fmt(rates.gold_pure_per_gram * TOLA_GRAMS)}</span></div>
            <div className="dj-rate-table-row"><span>USD</span><span>${(rates.gold_pure_per_gram / rates.usd_to_pkr).toFixed(2)}</span><span>${(rates.gold_pure_per_gram * TOLA_GRAMS / rates.usd_to_pkr).toFixed(2)}</span></div>
          </div>
          <p className="dj-label" style={{ marginTop: 10, marginBottom: 4 }}>{t('dashboard.otherPurities')}</p>
          <div className="dj-grid g4" style={{ gap: 8 }}>
            {['g22', 'g21', 'g18', 'g14'].map(id => (
              <div key={id} style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
                <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{getPurity(id).label}</div>
                <div>{fmt(ratePerGram(id, rates))}/g</div>
                <div style={{ fontSize: 10.5 }}>{fmt(ratePerGram(id, rates) * TOLA_GRAMS)}/tola</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 10, marginBottom: 0 }}>{t('dashboard.source')}: {rates.source} · {t('dashboard.updated')} {new Date(rates.last_updated).toLocaleString()}</p>
        </Card>
        <Card title={t('dashboard.silverRate')}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <p className="dj-stat">{fmt(rates.silver_pure_per_gram)}<span style={{ fontSize: 13, color: 'var(--ink-soft)' }}> /g (999)</span></p>
            <span className={silverChange >= 0 ? 'up' : 'down'} style={{ fontSize: 12.5, fontWeight: 600 }}>{silverChange >= 0 ? '+' : ''}{silverChange.toFixed(2)}%</span>
          </div>
          <div className="dj-rate-table">
            <div className="dj-rate-table-row head"><span></span><span>{t('dashboard.perGram')}</span><span>{t('dashboard.perTola')}</span></div>
            <div className="dj-rate-table-row"><span>PKR</span><span>{fmt(rates.silver_pure_per_gram)}</span><span>{fmt(rates.silver_pure_per_gram * TOLA_GRAMS)}</span></div>
            <div className="dj-rate-table-row"><span>USD</span><span>${(rates.silver_pure_per_gram / rates.usd_to_pkr).toFixed(2)}</span><span>${(rates.silver_pure_per_gram * TOLA_GRAMS / rates.usd_to_pkr).toFixed(2)}</span></div>
          </div>
          <p className="dj-label" style={{ marginTop: 10, marginBottom: 4 }}>{t('dashboard.otherPurities')}</p>
          <div className="dj-grid g3" style={{ gap: 8 }}>
            {['s925', 's900'].map(id => (
              <div key={id} style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>
                <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{getPurity(id).label}</div>
                <div>{fmt(ratePerGram(id, rates))}/g</div>
                <div style={{ fontSize: 10.5 }}>{fmt(ratePerGram(id, rates) * TOLA_GRAMS)}/tola</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 10, marginBottom: 0 }}>{t('dashboard.usdPkr')}: {rates.usd_to_pkr}{rates.fetch_status === 'error' && <span style={{ color: 'var(--danger)' }}> · {t('dashboard.liveFetchFailed')}: {rates.fetch_error}</span>}</p>
        </Card>
      </div>

      <DashboardCharts salesTrend={salesTrend} categoryData={categoryData} />

      <div className="dj-grid g3">
        <StatCard label={t('dashboard.goldInStock')} value={fmtW(goldWeight)} />
        <StatCard label={t('dashboard.silverInStock')} value={fmtW(silverWeight)} />
        <StatCard label={t('dashboard.inventoryValue')} value={fmt(inventoryValue)} />
      </div>
      <div className="dj-grid g3" style={{ marginTop: 16 }}>
        <StatCard label={t('dashboard.cashInHand')} value={fmt(cash)} />
        <StatCard label={t('dashboard.bankBalance')} value={fmt(bank)} />
        <Card title={t('dashboard.lowStockAlerts')}>
          {lowStock.length === 0 ? <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{t('dashboard.allStocked')}</p> :
            lowStock.map(x => (
              <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '4px 0' }}>
                <span>{x.name}</span><Badge text={`${x.qty} left`} kind={x.qty === 0 ? 'out' : 'low'} />
              </div>
            ))}
        </Card>
      </div>

      <div className="dj-section" style={{ marginTop: 20 }}>
        <SectionHead title={t('dashboard.purityTable')} />
        <Card>
          <table className="dj-table">
            <thead><tr><th>{t('dashboard.purity')}</th><th>{t('dashboard.metal')}</th><th>{t('dashboard.factor')}</th><th>{t('dashboard.rateGram')}</th><th>{t('dashboard.rateTola')}</th></tr></thead>
            <tbody>
              {PURITIES.map(p => (
                <tr key={p.id}><td style={{ fontWeight: 600 }}>{p.label}</td><td style={{ textTransform: 'capitalize' }}>{p.metal}</td><td>{(p.factor * 100).toFixed(1)}%</td>
                  <td>{fmt(ratePerGram(p.id, rates))}</td><td>{fmt(ratePerGram(p.id, rates) * TOLA_GRAMS)}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

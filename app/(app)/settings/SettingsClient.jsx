'use client';
import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Coins, Check } from 'lucide-react';
import { Card, SectionHead, Field } from '@/components/ui';
import { fmt, ratePerGram, TOLA_GRAMS, PURITIES } from '@/lib/pricing';
import { refreshLiveRates, saveManualRates } from '@/app/actions/rates';
import { dbUpdate } from '@/app/actions/db';

export default function SettingsClient({ metalRates, settings, rateHistory }) {
  const [rates, setRates] = useState(metalRates);
  const [biz, setBiz] = useState(settings);
  const [fetching, startFetch] = useTransition();
  const [toast, setToast] = useState(null);
  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchNow = () => {
    startFetch(async () => {
      const res = await refreshLiveRates();
      notify(res.ok ? 'Live gold & silver rates fetched successfully' : `Live fetch failed: ${res.error}`);
      if (res.ok) window.location.reload();
    });
  };
  const saveRates = async () => {
    const res = await saveManualRates({ goldPurePerGram: Number(rates.gold_pure_per_gram), silverPurePerGram: Number(rates.silver_pure_per_gram), usdToPkr: Number(rates.usd_to_pkr) });
    notify(res.ok ? 'Metal rates updated' : `Failed: ${res.error}`);
  };
  const saveSettings = async () => {
    const res = await dbUpdate('settings', 1, {
      business_name: biz.business_name, tax_percent: Number(biz.tax_percent), default_wastage_percent: Number(biz.default_wastage_percent),
      default_making_per_gram: Number(biz.default_making_per_gram), auto_rate_update: biz.auto_rate_update, rate_update_interval_minutes: Number(biz.rate_update_interval_minutes),
    }, '/settings');
    notify(res.ok ? 'Settings saved' : `Failed: ${res.error}`);
  };

  return (
    <div>
      <SectionHead title="Metal Rate Configuration" />
      <Card style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 0 }}>
          Rates are never hard-coded. "Fetch Live Rates Now" runs as a real server-side function (a Vercel function, not a browser call) that pulls live gold and silver spot prices and converts them to PKR. If it fails, your last known rate is kept exactly as-is.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          <button className="dj-btn dj-btn-gold" onClick={fetchNow} disabled={fetching}>
            <Coins size={14} /> {fetching ? 'Fetching live rates…' : 'Fetch Live Rates Now'}
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-soft)' }}>
            <input type="checkbox" checked={biz.auto_rate_update} onChange={e => setBiz({ ...biz, auto_rate_update: e.target.checked })} />
            Auto-refresh every
            <input type="number" min="1" className="dj-input" style={{ width: 56, padding: '4px 6px' }} value={biz.rate_update_interval_minutes} onChange={e => setBiz({ ...biz, rate_update_interval_minutes: e.target.value })} />
            min (needs a scheduled Vercel Cron Job — see README)
          </label>
        </div>
        {rates.fetch_status === 'ok' && <div className="dj-rate-status ok">Live feed connected — last fetched {new Date(rates.last_updated).toLocaleTimeString()}.</div>}
        {rates.fetch_status === 'error' && <div className="dj-rate-status error">Live fetch failed: {rates.fetch_error} Showing last known rate from {new Date(rates.last_updated).toLocaleString()}.</div>}
        <div className="dj-grid g2" style={{ marginTop: 14 }}>
          <Field label="Gold 24K — Pure Rate (PKR/gram)"><input type="number" className="dj-input" value={rates.gold_pure_per_gram} onChange={e => setRates({ ...rates, gold_pure_per_gram: e.target.value })} /></Field>
          <Field label="Silver 999 — Pure Rate (PKR/gram)"><input type="number" className="dj-input" value={rates.silver_pure_per_gram} onChange={e => setRates({ ...rates, silver_pure_per_gram: e.target.value })} /></Field>
          <Field label="USD to PKR"><input type="number" className="dj-input" value={rates.usd_to_pkr} onChange={e => setRates({ ...rates, usd_to_pkr: e.target.value })} /></Field>
        </div>
        <button className="dj-btn dj-btn-gold" onClick={saveRates}>Save Manual Rates</button>
        <p style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 10, marginBottom: 0 }}>
          For guaranteed uptime in production, pair this with a licensed metals-data provider on a paid plan.
        </p>
      </Card>

      {rateHistory.length > 0 && (
        <>
          <SectionHead title="Rate Update History" />
          <Card style={{ marginBottom: 20 }}>
            <table className="dj-table">
              <thead><tr><th>Date/Time</th><th>Gold 24K (PKR/g)</th><th>Silver 999 (PKR/g)</th><th>Source</th></tr></thead>
              <tbody>
                {rateHistory.map(h => (
                  <tr key={h.id}><td>{new Date(h.recorded_at).toLocaleString()}</td><td>{fmt(h.gold)}</td><td>{fmt(h.silver)}</td><td>{h.source}</td></tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      <SectionHead title="Business Branding" />
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ background: '#0E1626', padding: 14, borderRadius: 10 }}>
            <Image src="/logo.png" alt="Danish Jeweller logo" width={140} height={81} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', maxWidth: 360 }}>
            This logo appears in the sidebar, top bar, and on every printed invoice. Replace /public/logo.png in the codebase and redeploy to update it everywhere.
          </div>
        </div>
      </Card>

      <SectionHead title="Business & Pricing Defaults" />
      <Card style={{ marginBottom: 20 }}>
        <div className="dj-grid g2">
          <Field label="Business Name"><input className="dj-input" value={biz.business_name} onChange={e => setBiz({ ...biz, business_name: e.target.value })} /></Field>
          <Field label="Default Tax (%)"><input type="number" className="dj-input" value={biz.tax_percent} onChange={e => setBiz({ ...biz, tax_percent: e.target.value })} /></Field>
          <Field label="Default Wastage (%)"><input type="number" className="dj-input" value={biz.default_wastage_percent} onChange={e => setBiz({ ...biz, default_wastage_percent: e.target.value })} /></Field>
          <Field label="Default Making Charge (PKR/gram)"><input type="number" className="dj-input" value={biz.default_making_per_gram} onChange={e => setBiz({ ...biz, default_making_per_gram: e.target.value })} /></Field>
        </div>
        <button className="dj-btn dj-btn-gold" onClick={saveSettings}>Save Settings</button>
      </Card>

      <SectionHead title="Purity Reference Table" />
      <Card>
        <table className="dj-table">
          <thead><tr><th>Purity</th><th>Metal</th><th>Factor</th><th>Rate / gram</th><th>Rate / tola</th></tr></thead>
          <tbody>
            {PURITIES.map(p => (
              <tr key={p.id}><td style={{ fontWeight: 600 }}>{p.label}</td><td style={{ textTransform: 'capitalize' }}>{p.metal}</td><td>{(p.factor * 100).toFixed(1)}%</td>
                <td>{fmt(ratePerGram(p.id, rates))}</td><td>{fmt(ratePerGram(p.id, rates) * TOLA_GRAMS)}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
      {toast && <div className="dj-toast"><Check size={15} />{toast}</div>}
    </div>
  );
}

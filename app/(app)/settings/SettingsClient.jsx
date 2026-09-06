'use client';
import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Coins, Check, Plus } from 'lucide-react';
import { Card, SectionHead, Field, Modal, Badge } from '@/components/ui';
import { fmt, ratePerGram, TOLA_GRAMS, PURITIES } from '@/lib/pricing';
import { refreshLiveRates, saveManualRates } from '@/app/actions/rates';
import { dbUpdate } from '@/app/actions/db';
import { createEmployee, setPin } from '@/app/actions/staff';
import { exportBackup, restoreBackup } from '@/app/actions/backup';
import { ROLES } from '@/lib/roles';

export default function SettingsClient({ metalRates, settings, rateHistory, profiles, currentProfile }) {
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

      {currentProfile?.role === 'admin' && (
        <BackupSection notify={notify} />
      )}

      {currentProfile?.role === 'admin' && (
        <EmployeesSection profiles={profiles} currentProfile={currentProfile} notify={notify} />
      )}

      {toast && <div className="dj-toast"><Check size={15} />{toast}</div>}
    </div>
  );
}

function BackupSection({ notify }) {
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [pendingRestore, setPendingRestore] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const fileInputRef = useState(null)[0];

  const doExport = async () => {
    setExporting(true);
    const res = await exportBackup();
    setExporting(false);
    if (!res.ok) { notify(`Export failed: ${res.error}`); return; }
    const blob = new Blob([JSON.stringify(res.backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    a.href = url;
    a.download = `danish-jeweller-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notify('Backup downloaded');
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        setPendingRestore(parsed);
        setConfirmText('');
      } catch {
        notify('That file is not valid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const doRestore = async () => {
    if (confirmText !== 'RESTORE') return;
    setRestoring(true);
    const res = await restoreBackup(pendingRestore);
    setRestoring(false);
    if (!res.ok) { notify(`Restore failed: ${res.error}`); return; }
    notify('Data restored — reloading…');
    setPendingRestore(null);
    setTimeout(() => window.location.reload(), 1200);
  };

  return (
    <>
      <SectionHead title="Backup & Restore" />
      <Card style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 0 }}>
          Download a complete backup of every business record (customers, products, sales, purchases, expenses, everything except login accounts) as a single JSON file. Keep copies somewhere safe — a shared drive, email to yourself, or Google Drive (see below).
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="dj-btn dj-btn-gold" onClick={doExport} disabled={exporting}>{exporting ? 'Preparing…' : 'Download Backup (.json)'}</button>
          <label className="dj-btn" style={{ cursor: 'pointer' }}>
            Restore from Backup File
            <input type="file" accept="application/json" onChange={handleFile} style={{ display: 'none' }} />
          </label>
        </div>
        <p style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 10, marginBottom: 0 }}>
          Restoring completely replaces all current business data with the contents of the file. Login accounts and roles are not affected.
        </p>
      </Card>

      <SectionHead title="Google Drive Backup" />
      <Card style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 0 }}>
          Automatic upload to Google Drive needs a one-time setup in Google Cloud Console (creating OAuth credentials for this app) before it can be wired in — that part has to happen on your Google account, not from here. Once you've created those credentials, share the Client ID/Secret and this button will be connected for real.
        </p>
        <button className="dj-btn" disabled>Connect Google Drive (setup required)</button>
      </Card>

      {pendingRestore && (
        <Modal title="Confirm Restore — This Replaces All Data" onClose={() => setPendingRestore(null)}>
          <p style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 600 }}>
            This will permanently delete all current customers, products, sales, purchases, and other business records, and replace them with the contents of the selected file.
          </p>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
            Backup exported: {pendingRestore.exported_at ? new Date(pendingRestore.exported_at).toLocaleString() : 'unknown'}
          </p>
          <Field label='Type RESTORE to confirm'>
            <input className="dj-input" value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="RESTORE" />
          </Field>
          <button className="dj-btn dj-btn-danger" style={{ width: '100%', justifyContent: 'center', padding: 10 }}
            disabled={confirmText !== 'RESTORE' || restoring} onClick={doRestore}>
            {restoring ? 'Restoring…' : 'Permanently Restore This Backup'}
          </button>
        </Modal>
      )}
    </>
  );
}


function EmployeesSection({ profiles, currentProfile, notify }) {
  const [showAdd, setShowAdd] = useState(false);
  const [pinTarget, setPinTarget] = useState(null);

  return (
    <>
      <SectionHead title="Employees" action={<button className="dj-btn dj-btn-gold" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Employee</button>} />
      <Card style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 0 }}>
          Each employee gets a role (matching the permissions built into the database) and a 4–6 digit PIN for fast sign-in at the till. The PIN is hashed and never stored or shown in plain text — if it's forgotten, reset it here.
        </p>
        <table className="dj-table">
          <thead><tr><th>Name</th><th>Role</th><th>PIN Set</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.full_name || '(unnamed)'}{p.id === currentProfile.id && <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}> (you)</span>}</td>
                <td><span className="dj-role-badge" style={{ color: 'var(--gold)' }}>{ROLES[p.role]?.label || p.role}</span></td>
                <td>{p.pin_hash ? <Badge text="Yes" kind="instock" /> : <Badge text="No PIN" kind="low" />}</td>
                <td>{p.active ? <Badge text="Active" kind="instock" /> : <Badge text="Inactive" kind="out" />}</td>
                <td><button className="dj-btn dj-btn-sm" onClick={() => setPinTarget(p)}>{p.pin_hash ? 'Reset PIN' : 'Set PIN'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {showAdd && <AddEmployeeForm onClose={() => setShowAdd(false)} notify={notify} />}
      {pinTarget && <SetPinForm target={pinTarget} onClose={() => setPinTarget(null)} notify={notify} />}
    </>
  );
}

function AddEmployeeForm({ onClose, notify }) {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('cashier');
  const [pin, setPinVal] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async () => {
    setErr(null);
    if (!fullName.trim()) { setErr('Enter a name.'); return; }
    if (!/^\d{4,6}$/.test(pin)) { setErr('PIN must be 4 to 6 digits.'); return; }
    if (pin !== confirmPin) { setErr('PINs do not match.'); return; }
    setBusy(true);
    const res = await createEmployee({ fullName, role, pin, email: email.trim() || undefined });
    setBusy(false);
    if (!res.ok) { setErr(res.error); return; }
    notify(`${fullName} added as ${ROLES[role]?.label}`);
    onClose();
  };

  return (
    <Modal title="Add Employee" onClose={onClose}>
      <Field label="Full Name"><input className="dj-input" value={fullName} onChange={e => setFullName(e.target.value)} /></Field>
      <Field label="Role">
        <select className="dj-select" value={role} onChange={e => setRole(e.target.value)}>
          {Object.entries(ROLES).map(([id, r]) => <option key={id} value={id}>{r.label}</option>)}
        </select>
      </Field>
      <Field label="Email (optional — used only for account recovery)"><input className="dj-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="leave blank to auto-generate" /></Field>
      <div className="dj-grid g2">
        <Field label="PIN (4–6 digits)"><input className="dj-input" type="password" inputMode="numeric" maxLength={6} value={pin} onChange={e => setPinVal(e.target.value.replace(/\D/g, ''))} /></Field>
        <Field label="Confirm PIN"><input className="dj-input" type="password" inputMode="numeric" maxLength={6} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))} /></Field>
      </div>
      {err && <p className="dj-login-error">{err}</p>}
      <button className="dj-btn dj-btn-gold" style={{ width: '100%', justifyContent: 'center', padding: 10 }} disabled={busy} onClick={submit}>
        {busy ? 'Creating…' : 'Create Employee'}
      </button>
    </Modal>
  );
}

function SetPinForm({ target, onClose, notify }) {
  const [pin, setPinVal] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async () => {
    setErr(null);
    if (!/^\d{4,6}$/.test(pin)) { setErr('PIN must be 4 to 6 digits.'); return; }
    if (pin !== confirmPin) { setErr('PINs do not match.'); return; }
    setBusy(true);
    const res = await setPin({ targetProfileId: target.id, pin });
    setBusy(false);
    if (!res.ok) { setErr(res.error); return; }
    notify(`PIN updated for ${target.full_name}`);
    onClose();
  };

  return (
    <Modal title={`${target.pin_hash ? 'Reset' : 'Set'} PIN — ${target.full_name}`} onClose={onClose}>
      <div className="dj-grid g2">
        <Field label="New PIN (4–6 digits)"><input className="dj-input" type="password" inputMode="numeric" maxLength={6} value={pin} onChange={e => setPinVal(e.target.value.replace(/\D/g, ''))} autoFocus /></Field>
        <Field label="Confirm PIN"><input className="dj-input" type="password" inputMode="numeric" maxLength={6} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))} /></Field>
      </div>
      {err && <p className="dj-login-error">{err}</p>}
      <button className="dj-btn dj-btn-gold" style={{ width: '100%', justifyContent: 'center', padding: 10 }} disabled={busy} onClick={submit}>
        {busy ? 'Saving…' : 'Save PIN'}
      </button>
    </Modal>
  );
}


'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Delete } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { pinLogin } from '@/app/actions/staff';
import { ROLES } from '@/lib/roles';

export default function LoginClient({ staff }) {
  const [mode, setMode] = useState(staff.length > 0 ? 'pick' : 'email');
  const [selected, setSelected] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submitPin = async (finalPin) => {
    setLoading(true);
    setError(null);
    const res = await pinLogin(selected.id, finalPin);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      setPin('');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  };

  const pressDigit = (d) => {
    if (loading) return;
    const next = (pin + d).slice(0, 6);
    setPin(next);
    setError(null);
    if (next.length >= 4 && d === 'submit-check') return; // no-op guard
  };
  const pressBackspace = () => setPin(p => p.slice(0, -1));
  const pressSubmit = () => { if (pin.length >= 4) submitPin(pin); };

  return (
    <div className="dj-root dj-login-root">
      <div className="dj-login-page">
        <div className="dj-login-card">
          <Image src="/logo.png" alt="Danish Jeweller" width={170} height={98} className="dj-login-logo" priority />

          {mode === 'pick' && (
            <>
              <p className="dj-login-sub">Who's signing in?</p>
              <div className="dj-staff-grid">
                {staff.map(s => (
                  <button key={s.id} className="dj-staff-tile" onClick={() => { setSelected(s); setMode('pin'); setPin(''); setError(null); }}>
                    <div className="dj-staff-avatar">{(s.full_name || '?').charAt(0).toUpperCase()}</div>
                    <div className="dj-staff-name">{s.full_name || 'Unnamed'}</div>
                    <div className="dj-staff-role">{ROLES[s.role]?.label || s.role}</div>
                  </button>
                ))}
              </div>
              <button className="dj-login-demo-toggle" onClick={() => setMode('email')}>Sign in with email instead</button>
            </>
          )}

          {mode === 'pin' && selected && (
            <>
              <p className="dj-login-sub">Hi, {selected.full_name} — enter your PIN</p>
              <div className="dj-pin-dots">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <span key={i} className={`dj-pin-dot ${i < pin.length ? 'filled' : ''}`} />
                ))}
              </div>
              {error && <p className="dj-login-error" style={{ textAlign: 'center' }}>{error}</p>}
              <div className="dj-pin-pad">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
                  <button key={d} className="dj-pin-key" onClick={() => pressDigit(d)} disabled={loading}>{d}</button>
                ))}
                <button className="dj-pin-key dj-pin-key-alt" onClick={() => { setMode('pick'); setSelected(null); setPin(''); }}>Back</button>
                <button className="dj-pin-key" onClick={() => pressDigit('0')} disabled={loading}>0</button>
                <button className="dj-pin-key dj-pin-key-alt" onClick={pressBackspace} disabled={loading}><Delete size={16} /></button>
              </div>
              <button className="dj-btn dj-btn-gold" style={{ width: '100%', justifyContent: 'center', padding: 11, marginTop: 12 }}
                disabled={pin.length < 4 || loading} onClick={pressSubmit}>
                {loading ? 'Checking…' : 'Unlock'}
              </button>
            </>
          )}

          {mode === 'email' && <EmailLoginForm onBack={() => setMode(staff.length > 0 ? 'pick' : 'email')} showBack={staff.length > 0} />}
        </div>
      </div>
    </div>
  );
}

function EmailLoginForm({ onBack, showBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) { setError(signInError.message); return; }
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <>
      <p className="dj-login-sub">Sign in with email</p>
      <form onSubmit={submit}>
        <div className="dj-field">
          <label className="dj-label">Email</label>
          <input className="dj-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} autoFocus placeholder="you@danishjeweller.com" />
        </div>
        <div className="dj-field">
          <label className="dj-label">Password</label>
          <input className="dj-input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <p className="dj-login-error">{error}</p>}
        <button type="submit" className="dj-btn dj-btn-gold" style={{ width: '100%', justifyContent: 'center', padding: 11, marginTop: 6 }} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
      {showBack && <button className="dj-login-demo-toggle" onClick={onBack}>Back to staff picker</button>}
      <p className="dj-login-note">
        New staff accounts and PINs are set up by an administrator in Settings → Employees.
      </p>
    </>
  );
}

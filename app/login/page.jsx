'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
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
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="dj-root dj-login-root">
      <div className="dj-login-page">
        <div className="dj-login-card">
          <Image src="/logo.png" alt="Danish Jeweller" width={170} height={98} className="dj-login-logo" priority />
          <p className="dj-login-sub">Sign in to your ERP</p>
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
          <p className="dj-login-note">
            New staff accounts are created by an administrator in Supabase Auth (or via the admin panel once built) and start as Read-only until promoted in Settings → Users.
          </p>
        </div>
      </div>
    </div>
  );
}

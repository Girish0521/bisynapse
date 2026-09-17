'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/lib/types';
import { sendEmailLoginCode, verifyEmailLoginCode } from '@/lib/supabaseClient';

interface EmailOtpLoginProps {
  selectedRole: UserRole;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
}

function errorMessage(error: unknown): string {
  return typeof error === 'object' && error && 'message' in error
    ? String(error.message) : 'Unable to complete email sign-in. Please try again.';
}

export function EmailOtpLogin({ selectedRole, disabled, onBusyChange }: EmailOtpLoginProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown(seconds => Math.max(0, seconds - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function sendCode() {
    if (disabled || cooldown) return;
    onBusyChange(true);
    setError(null);
    try {
      const normalized = await sendEmailLoginCode(sentTo || email, selectedRole);
      setSentTo(normalized);
      setToken('');
      setCooldown(60);
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      onBusyChange(false);
    }
  }

  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sentTo || disabled) return;
    onBusyChange(true);
    setError(null);
    try {
      await verifyEmailLoginCode(sentTo, token, selectedRole);
      // Reuse verified-session/category handling shared with Google sign-in.
      router.replace('/auth/callback');
    } catch (failure) {
      setError(errorMessage(failure));
      onBusyChange(false);
    }
  }

  return (
    <section className="border-t border-slate-200 pt-6 space-y-4" aria-label="Email sign-in">
      <h2 className="text-sm font-bold">Or sign in with an email code</h2>
      {error && <p role="alert" className="text-sm text-rose-800">{error}</p>}
      {!sentTo ? (
        <form className="space-y-3" onSubmit={event => { event.preventDefault(); void sendCode(); }}>
          <label htmlFor="login-email" className="block text-sm font-medium">Email address</label>
          <input id="login-email" type="email" autoComplete="email" required maxLength={254}
            value={email} onChange={event => setEmail(event.target.value)} disabled={disabled}
            className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          <button disabled={disabled || cooldown > 0} className="w-full border border-[#0F4C81] text-[#0F4C81] rounded-lg py-3 font-bold text-sm disabled:opacity-50">
            {cooldown ? `Send code in ${cooldown}s` : disabled ? 'Please wait...' : 'Send login code'}
          </button>
          <p className="text-xs text-slate-500">New accounts are created when you verify your email. No password needed.</p>
        </form>
      ) : (
        <form className="space-y-3" onSubmit={verifyCode}>
          <p role="status" className="text-sm">Code requested for {sentTo}. Check your inbox and spam folder.</p>
          <label htmlFor="login-code" className="block text-sm font-medium">Six-digit login code</label>
          <input id="login-code" type="text" inputMode="numeric" autoComplete="one-time-code"
            pattern="[0-9]{6}" maxLength={6} required value={token} disabled={disabled}
            onChange={event => setToken(event.target.value.replace(/\D/g, ''))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 tracking-widest" />
          <button disabled={disabled || token.length !== 6} className="w-full bg-[#0F4C81] text-white rounded-lg py-3 font-bold text-sm disabled:opacity-50">
            {disabled ? 'Please wait...' : 'Verify and sign in'}
          </button>
          <div className="flex justify-between gap-3 text-sm">
            <button type="button" disabled={disabled || cooldown > 0} onClick={() => void sendCode()} className="text-blue-800 disabled:opacity-50">
              {cooldown ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
            <button type="button" disabled={disabled} className="text-blue-800" onClick={() => { setSentTo(null); setToken(''); setError(null); }}>Change email</button>
          </div>
        </form>
      )}
    </section>
  );
}

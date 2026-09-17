import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import type { UserRole } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isConfigured = Boolean(supabaseUrl && supabaseKey)
  && !supabaseUrl.includes('your-supabase-project-ref')
  && !supabaseKey.includes('your_supabase_anon_key_here');

export const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export function getRedirectUrl(): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  return origin + '/auth/callback';
}

/** Public categories are preferences. Officer approval is admin-managed metadata. */
export function resolveUserRole(user: User, desired?: string | null): UserRole {
  const requested = desired || user.user_metadata?.role;
  if (requested === 'officer' || (!desired && user.app_metadata?.role === 'officer')) {
    return user.app_metadata?.role === 'officer' ? 'officer' : 'consumer';
  }
  return requested === 'retailer' || requested === 'industry' ? requested : 'consumer';
}

export async function signInWithGoogle(desiredRole?: string) {
  if (!supabase) {
    return { error: { message: 'Google sign-in is not configured yet. Please try again later.', code: 'SUPABASE_NOT_CONFIGURED' }, data: { url: null } };
  }
  if (typeof window !== 'undefined' && desiredRole) {
    localStorage.setItem('bisynapse_pending_role', desiredRole);
  }
  return supabase.auth.signInWithOAuth({
    provider: 'google', options: { redirectTo: getRedirectUrl() },
  });
}

function profileFromUser(user: User) {
  return {
    auth_user_id: user.id,
    email: user.email || '',
    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    avatar_url: user.user_metadata?.avatar_url || '',
    role: resolveUserRole(user),
  };
}

export async function sendEmailLoginCode(email: string, desiredRole: UserRole) {
  if (!supabase) throw new Error('Email sign-in is not configured yet.');
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error('Enter a valid email address.');
  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: { shouldCreateUser: true, emailRedirectTo: getRedirectUrl() },
  });
  if (error) throw error;
  // A category preference is not an authenticated session or authorization.
  localStorage.setItem('bisynapse_pending_role', desiredRole);
  return normalized;
}

export async function verifyEmailLoginCode(email: string, token: string, desiredRole: UserRole) {
  if (!supabase) throw new Error('Email sign-in is not configured yet.');
  if (!/^\d{6}$/.test(token)) throw new Error('Enter the six-digit code from your email.');
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(), token, type: 'email',
  });
  if (error) throw error;
  if (!data.session) throw new Error('Sign-in could not be verified. Please request a new code.');
  localStorage.setItem('bisynapse_pending_role', desiredRole);
}

/** No public users table is needed for this initial Auth-only integration. */
export async function getUserProfile(userId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || data.user.id !== userId) return null;
  return profileFromUser(data.user);
}

export async function saveUserProfile(profile: {
  auth_user_id: string; name: string; email: string; role: string;
  avatar_url?: string; organization?: string;
}) {
  if (!supabase) throw new Error('Authentication is not configured.');
  const { data: verified, error: verifyError } = await supabase.auth.getUser();
  if (verifyError || !verified.user || verified.user.id !== profile.auth_user_id) {
    throw new Error('Please sign in before saving your category.');
  }
  const role = resolveUserRole(verified.user, profile.role);
  const { data, error } = await supabase.auth.updateUser({ data: {
    name: profile.name, role: role === 'officer' ? 'consumer' : role,
  } });
  if (error) throw error;
  return profileFromUser(data.user);
}

export async function signOut() {
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
  if (typeof window !== 'undefined') {
    for (const key of ['bisynapse_user_role', 'bisynapse_user_email', 'bisynapse_user_name',
      'bisynapse_user_avatar', 'bisynapse_user_id', 'bisynapse_pending_role']) {
      localStorage.removeItem(key);
    }
  }
}

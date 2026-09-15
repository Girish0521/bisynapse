import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

/**
 * Get current window origin safely for environment-aware OAuth redirect URLs
 */
export function getRedirectUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  return 'http://localhost:3000/auth/callback';
}

/**
 * Trigger REAL Supabase Google OAuth Sign-In
 */
export async function signInWithGoogle(desiredRole?: string) {
  if (typeof window !== 'undefined' && desiredRole) {
    localStorage.setItem('bisynapse_pending_role', desiredRole);
  }

  if (!supabase) {
    return {
      error: {
        message: 'Supabase URL and Anon Key are not configured in your environment variables (NEXT_PUBLIC_SUPABASE_URL). Please add them to .env.local or Vercel settings.',
        code: 'SUPABASE_NOT_CONFIGURED',
      },
      data: { url: null },
    };
  }

  const redirectUrl = getRedirectUrl();

  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
}

/**
 * Fetch existing User Profile & Role from Supabase database
 */
export async function getUserProfile(userId: string) {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching user profile from Supabase:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception fetching profile:', err);
    return null;
  }
}

/**
 * Upsert User Profile into Supabase database (users table)
 */
export async function saveUserProfile(profile: {
  auth_user_id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  organization?: string;
}) {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          auth_user_id: profile.auth_user_id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          avatar_url: profile.avatar_url || null,
          organization: profile.organization || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'auth_user_id' }
      )
      .select()
      .single();

    if (error) {
      console.warn('Error saving user profile to Supabase:', error.message);
    }
    return data;
  } catch (err) {
    console.error('Exception saving profile:', err);
    return null;
  }
}

/**
 * Sign Out from Supabase Auth and clear local session state
 */
export async function signOut() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('bisynapse_user_role');
    localStorage.removeItem('bisynapse_user_email');
    localStorage.removeItem('bisynapse_user_name');
    localStorage.removeItem('bisynapse_user_avatar');
    localStorage.removeItem('bisynapse_user_id');
    localStorage.removeItem('bisynapse_pending_role');
  }

  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout notice:', e);
    }
  }
}

/**
 * Verify if email domain or profile is authorized for Government Officer role
 */
export function isAuthorizedOfficerEmail(email: string): boolean {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  return (
    lower.endsWith('@bis.gov.in') ||
    lower.endsWith('@gov.in') ||
    lower.endsWith('@nic.in') ||
    lower.startsWith('officer.') ||
    lower.startsWith('admin.') ||
    lower === 'officer@bisynapse.gov.in'
  );
}

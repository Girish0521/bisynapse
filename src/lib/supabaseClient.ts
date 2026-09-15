import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export async function signInWithGoogle(role: string = 'consumer') {
  if (!supabase) {
    console.warn('Supabase not configured, using local mock auth');
    return { error: null, data: { user: { email: `demo.${role}@bisynapse.gov.in` } } };
  }
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login?role=${role}` : undefined,
    },
  });
}

export async function signOut() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('bisynapse_user_role');
    localStorage.removeItem('bisynapse_user_email');
  }
  if (supabase) {
    await supabase.auth.signOut();
  }
}

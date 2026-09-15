'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@/lib/types';
import { supabase, getUserProfile, signOut, isAuthorizedOfficerEmail } from '@/lib/supabaseClient';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  isOfficerAuthorized?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isLoading: true,
  logout: async () => {},
  setRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    async function initAuthSession() {
      if (!supabase) {
        // Fallback to local storage session if Supabase is not configured
        if (typeof window !== 'undefined') {
          const storedRole = localStorage.getItem('bisynapse_user_role') as UserRole;
          const storedEmail = localStorage.getItem('bisynapse_user_email');
          const storedName = localStorage.getItem('bisynapse_user_name');
          const storedId = localStorage.getItem('bisynapse_user_id') || 'demo-user-id';

          if (storedRole && ['consumer', 'retailer', 'industry', 'officer'].includes(storedRole)) {
            const isOfficer = storedRole === 'officer';
            const authUser: AuthUser = {
              id: storedId,
              email: storedEmail || 'demo.user@bisynapse.gov.in',
              name: storedName || (storedEmail ? storedEmail.split('@')[0] : 'Demo User'),
              role: storedRole,
              isOfficerAuthorized: isOfficer,
            };
            if (isMounted) {
              setUser(authUser);
              setRoleState(storedRole);
            }
          }
        }
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const supabaseUser = session.user;
          const email = supabaseUser.email || '';
          const name = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || email.split('@')[0] || 'User';
          const avatarUrl = supabaseUser.user_metadata?.avatar_url;

          // Check DB profile
          const dbProfile = await getUserProfile(supabaseUser.id);
          const storedRole = (typeof window !== 'undefined' ? localStorage.getItem('bisynapse_user_role') : null) as UserRole;
          const resolvedRole: UserRole | null = (dbProfile?.role as UserRole) || storedRole || null;

          const isOfficerAuth = isAuthorizedOfficerEmail(email) || dbProfile?.role === 'officer';

          if (resolvedRole) {
            const authUser: AuthUser = {
              id: supabaseUser.id,
              email,
              name,
              avatar_url: avatarUrl,
              role: resolvedRole,
              isOfficerAuthorized: isOfficerAuth,
            };
            if (isMounted) {
              setUser(authUser);
              setRoleState(resolvedRole);
              if (typeof window !== 'undefined') {
                localStorage.setItem('bisynapse_user_role', resolvedRole);
                localStorage.setItem('bisynapse_user_email', email);
                localStorage.setItem('bisynapse_user_name', name);
                localStorage.setItem('bisynapse_user_id', supabaseUser.id);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Auth init session check warning:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuthSession();

    // Listen to Supabase Auth State Changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null);
            setRoleState(null);
            setIsLoading(false);
          }
        } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
          const supabaseUser = session.user;
          const email = supabaseUser.email || '';
          const name = supabaseUser.user_metadata?.full_name || email.split('@')[0] || 'User';
          const dbProfile = await getUserProfile(supabaseUser.id);
          const storedRole = (typeof window !== 'undefined' ? localStorage.getItem('bisynapse_user_role') : null) as UserRole;
          const resolvedRole: UserRole | null = (dbProfile?.role as UserRole) || storedRole || null;

          if (resolvedRole && isMounted) {
            setUser({
              id: supabaseUser.id,
              email,
              name,
              avatar_url: supabaseUser.user_metadata?.avatar_url,
              role: resolvedRole,
              isOfficerAuthorized: isAuthorizedOfficerEmail(email) || dbProfile?.role === 'officer',
            });
            setRoleState(resolvedRole);
          }
          if (isMounted) setIsLoading(false);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }
  }, []);

  const handleSetRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bisynapse_user_role', newRole);
    }
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setRoleState(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading, logout: handleLogout, setRole: handleSetRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}

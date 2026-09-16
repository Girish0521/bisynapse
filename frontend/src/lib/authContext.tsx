'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { UserRole } from '@/lib/types';
import { supabase, resolveUserRole, signOut } from '@/lib/supabaseClient';

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
  user: null, role: null, isLoading: true,
  logout: async () => {}, setRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    let revision = 0;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    function applyUser(verifiedUser: User | null) {
      if (!mounted) return;
      if (!verifiedUser) {
        setUser(null);
      } else {
        const email = verifiedUser.email || '';
        setUser({
          id: verifiedUser.id, email,
          name: verifiedUser.user_metadata?.full_name || verifiedUser.user_metadata?.name || email.split('@')[0] || 'User',
          avatar_url: verifiedUser.user_metadata?.avatar_url,
          role: resolveUserRole(verifiedUser),
          isOfficerAuthorized: verifiedUser.app_metadata?.role === 'officer',
        });
      }
      setIsLoading(false);
    }

    async function refreshUser() {
      const current = ++revision;
      if (!supabase) { applyUser(null); return; }
      try {
        // Validate identity with Auth; local-storage values are not sessions.
        const { data, error } = await supabase.auth.getUser();
        if (current === revision) applyUser(error ? null : data.user);
      } catch {
        if (current === revision) applyUser(null);
      }
    }

    void refreshUser();
    const subscription = supabase?.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        ++revision;
        clearTimeout(refreshTimer);
        applyUser(null);
        return;
      }
      // Avoid calling Supabase from inside its synchronous auth callback lock.
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => { void refreshUser(); }, 0);
    }).data.subscription;

    return () => {
      mounted = false;
      ++revision;
      clearTimeout(refreshTimer);
      subscription?.unsubscribe();
    };
  }, []);

  const setRole = useCallback((requested: UserRole) => {
    setUser(current => {
      if (!current) return null;
      const role = requested === 'officer' && !current.isOfficerAuthorized ? 'consumer' : requested;
      return { ...current, role };
    });
  }, []);

  const logout = async () => {
    await signOut();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, isLoading, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() { return useContext(AuthContext); }

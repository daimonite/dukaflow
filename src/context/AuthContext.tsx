import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { clearLocalBusinessState } from '../services/cloudBusinessState';
import { authRedirectUrl, isSupabaseConfigured, supabase } from '../services/supabaseClient';

const redirectOptions = authRedirectUrl ? { emailRedirectTo: authRedirectUrl } : undefined;

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  configured: boolean;
  cloudStatus: 'idle' | 'saving' | 'saved' | 'offline' | 'error';
  setCloudStatus: (status: AuthContextValue['cloudStatus']) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [cloudStatus, setCloudStatus] = useState<AuthContextValue['cloudStatus']>('idle');

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let alive = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!alive) return;
      if (error) console.error('Unable to restore Supabase session:', error.message);
      setSession(data.session);
      setLoading(false);
      // Confirmation links carry the session token in the URL fragment and the
      // SDK only clears PKCE codes, so drop the token before it enters history.
      if (window.location.hash.includes('access_token=')) {
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${window.location.search}`
        );
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });
    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextValue = {
    session,
    loading,
    configured: isSupabaseConfigured,
    cloudStatus,
    setCloudStatus,
    signIn: async (email, password) => {
      if (!supabase) throw new Error('Supabase settings are missing.');
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    signUp: async (email, password) => {
      if (!supabase) throw new Error('Supabase settings are missing.');
      const { error } = await supabase.auth.signUp({
        email,
        password,
        ...(redirectOptions ? { options: redirectOptions } : {}),
      });
      if (error) throw error;
    },
    resendConfirmation: async (email) => {
      if (!supabase) throw new Error('Supabase settings are missing.');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        ...(redirectOptions ? { options: redirectOptions } : {}),
      });
      if (error) throw error;
    },
    signOut: async () => {
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Only after the sign-out is confirmed: a failed attempt must not destroy
      // the records of the account that is still signed in. The cloud copy is
      // untouched, so signing back in restores everything from the account.
      clearLocalBusinessState();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

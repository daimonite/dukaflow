import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const configuredRedirectUrl = (import.meta.env.VITE_AUTH_REDIRECT_URL as string | undefined)?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Where Supabase sends the user after they click the confirmation link.
 *
 * Supabase ignores it unless it matches an entry in Authentication → URL
 * Configuration → Redirect URLs, and silently falls back to the project's Site
 * URL instead (which is why links were landing on localhost).
 *
 * Defaults to the current origin, so a browser sign-up returns to itself. The
 * Android build has no browsable origin of its own, so it must set
 * VITE_AUTH_REDIRECT_URL to the hosted web app.
 */
export const authRedirectUrl =
  configuredRedirectUrl ||
  (typeof window !== 'undefined' ? `${window.location.origin}/` : undefined);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Confirmation links return the session in the URL; without this the
        // user arrives at a signed-out app.
        detectSessionInUrl: true,
      },
    })
  : null;

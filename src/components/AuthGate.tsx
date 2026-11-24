import React, { useEffect, useState } from 'react';
import { ArrowRight, Cloud, LoaderCircle, LogIn, UserPlus } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../context/AuthContext';
import {
  BusinessState,
  emptyBusinessState,
  hasSavedBusinessState,
  loadCloudBusinessState,
  localStateToCloudSnapshot,
  saveCloudBusinessState,
  writeLocalBusinessState,
} from '../services/cloudBusinessState';

type GateState = 'checking' | 'ready' | 'setup' | 'conflict' | 'error';

export const AuthGate: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { session, loading, configured } = useAuth();
  const [gateState, setGateState] = useState<GateState>('checking');
  const [deviceHasData, setDeviceHasData] = useState(false);
  const [remoteState, setRemoteState] = useState<BusinessState | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [retryIndex, setRetryIndex] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      setGateState('checking');
      return;
    }

    let active = true;
    setGateState('checking');
    setError('');
    setDeviceHasData(hasSavedBusinessState());

    loadCloudBusinessState(session.user.id)
      .then(snapshot => {
        if (!active) return;
        const cloudState = snapshot?.state ?? null;
        const localDirty = localStorage.getItem('dukaflow_cloud_dirty') === 'true';
        if (cloudState && localDirty && hasSavedBusinessState()) {
          setRemoteState(cloudState);
          setGateState('conflict');
        } else if (cloudState) {
          writeLocalBusinessState(cloudState);
          localStorage.removeItem('dukaflow_cloud_dirty');
          setGateState('ready');
        } else {
          setGateState('setup');
        }
      })
      .catch(err => {
        if (!active) return;
        // Offline (or a failed request) with a copy on this device: keep working
        // from that copy. The next change marks the state dirty and re-syncs it
        // once the network is back, so the shop never blocks on a dead link.
        if (hasSavedBusinessState()) {
          setGateState('ready');
          return;
        }
        setError('Could not load your saved business.');
        setGateState('error');
      });

    return () => { active = false; };
  }, [session?.user.id, loading, retryIndex]);

  const startBusiness = async (importDevice: boolean) => {
    if (!session) return;
    setBusy(true);
    setError('');
    try {
      const state = importDevice ? localStateToCloudSnapshot() : emptyBusinessState();
      await saveCloudBusinessState(session.user.id, state);
      writeLocalBusinessState(state);
      localStorage.removeItem('dukeflow_cloud_dirty');
      setGateState('ready');
    } catch (err: any) {
      setError('Could not save your choice. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const chooseVersion = async (useCloud: boolean) => {
    if (!session || !remoteState) return;
    setBusy(true);
    setError('');
    try {
      if (useCloud) {
        writeLocalBusinessState(remoteState);
        localStorage.removeItem('dukeflow_cloud_dirty');
      } else {
        await saveCloudBusinessState(session.user.id, localStateToCloudSnapshot());
        localStorage.removeItem('dukeflow_cloud_dirty');
      }
      setGateState('ready');
    } catch (err: any) {
      setError('Could not save your changes. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!configured) return <SetupRequired />;
  if (loading || (session && gateState === 'checking')) return <LoadingScreen label="Checking your account…" />;
  if (!session) return <LoginScreen />;
  if (gateState === 'error') return <MessageScreen title="Couldn’t load your saved business" message="Check your internet connection, then try again." action="Try again" onAction={() => setRetryIndex(value => value + 1)} />;
  if (gateState === 'setup') {
    return (
      <div className="min-h-screen bg-[#f6f8f5] flex items-center justify-center p-4">
        <section className="w-full max-w-lg bg-white rounded-3xl border border-gray-100 shadow-lg p-6 sm:p-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4"><Cloud /></div>
          <p className="text-xs uppercase tracking-widest font-bold text-emerald-700">First-time setup</p>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Choose your business data</h1>
          <p className="text-sm text-gray-600 mt-2">There’s no saved business for this account yet. Choose how you want to begin.</p>
          {deviceHasData ? (
            <div className="grid gap-3 mt-6">
              <button disabled={busy} onClick={() => startBusiness(true)} className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold px-4 py-3 flex items-center justify-center gap-2"><ArrowRight className="w-4 h-4" />Import this device’s saved data</button>
              <button disabled={busy} onClick={() => startBusiness(false)} className="w-full rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-60 text-gray-700 font-semibold px-4 py-3">Start with an empty business</button>
              <p className="text-xs text-amber-700 bg-amber-50 rounded-xl p-3">Import copies the records saved on this phone, including any demo records already stored there.</p>
            </div>
          ) : (
            <button disabled={busy} onClick={() => startBusiness(false)} className="w-full mt-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold px-4 py-3">Create an empty business</button>
          )}
          {error && <p role="alert" className="text-sm text-red-600 mt-4">{error}</p>}
        </section>
      </div>
    );
  }
  if (gateState === 'conflict') {
    return (
      <div className="min-h-screen bg-[#f6f8f5] flex items-center justify-center p-4">
        <section className="w-full max-w-lg bg-white rounded-3xl border border-gray-100 shadow-lg p-6 sm:p-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4"><Cloud /></div>
          <h1 className="text-2xl font-extrabold text-gray-900">Choose the latest copy</h1>
          <p className="text-sm text-gray-600 mt-2">This device and your account have different saved changes. Choose which version to keep.</p>
          <div className="grid gap-3 mt-6">
            <button disabled={busy} onClick={() => chooseVersion(false)} className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold px-4 py-3">Keep this phone’s changes</button>
            <button disabled={busy} onClick={() => chooseVersion(true)} className="w-full rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-60 text-gray-700 font-semibold px-4 py-3">Use the account’s saved copy</button>
          </div>
          {error && <p role="alert" className="text-sm text-red-600 mt-4">{error}</p>}
        </section>
      </div>
    );
  }

  // Only reached once the account has a business, so every child (and any cloud
  // write it starts) runs against an existing row. Sign-out or a new session
  // sends the gate back to 'checking', which unmounts these children again.
  return <>{children}</>;
};

const LoginScreen: React.FC = () => {
  const { signIn, signUp, resendConfirmation } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setError('');
    setNeedsConfirmation(false);
    try {
      if (mode === 'login') await signIn(email.trim(), password);
      else {
        await signUp(email.trim(), password);
        setMessage('Account created. Check your email to confirm it if prompted, then sign in.');
        setMode('login');
      }
    } catch (err: any) {
      const raw = err?.message || 'Sign-in failed. Check your email and password.';
      if (/email not confirmed|not confirmed|confirm your email/i.test(raw)) {
        setNeedsConfirmation(true);
        setError('This email hasn’t been confirmed yet. Open the confirmation link we emailed you, then sign in.');
      } else {
        setError(raw);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim() || resending) return;
    setResending(true);
    setError('');
    try {
      await resendConfirmation(email.trim());
      setMessage(`Confirmation email sent to ${email.trim()}. Open the link, then sign in.`);
    } catch (err: any) {
      setError(err?.message || 'Could not resend the confirmation email. Try again shortly.');
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f8f5] flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-lg p-6 sm:p-8">
        <BrandLogo className="w-12 h-12 rounded-2xl mb-5" />
        <p className="text-xs uppercase tracking-widest font-bold text-emerald-700">DukaSmart · private account</p>
        <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{mode === 'login' ? 'Sign in to your business' : 'Create your account'}</h1>
        <p className="text-sm text-gray-600 mt-2">Sign in to access and keep your business records backed up.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-gray-700">Email
            <input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-emerald-600" />
          </label>
          <label className="block text-sm font-semibold text-gray-700">Password
            <input required type="password" minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-emerald-600" />
          </label>
          {error && (
            <div>
              <p role="alert" className="text-sm text-red-600">{error}</p>
              {needsConfirmation && (
                <button type="button" onClick={handleResend} disabled={resending || busy} className="mt-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 disabled:opacity-60 text-emerald-700 font-semibold px-4 py-2 text-sm">
                  {resending ? 'Sending…' : 'Resend confirmation email'}
                </button>
              )}
            </div>
          )}
          {message && <p role="status" className="text-sm text-emerald-700 bg-emerald-50 rounded-xl p-3">{message}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold px-4 py-3 flex items-center justify-center gap-2">
            {busy ? <LoaderCircle className="w-4 h-4 animate-spin" /> : mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }} className="w-full mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-900">
          {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}
        </button>
      </section>
    </main>
  );
};

const SetupRequired: React.FC = () => <MessageScreen title="Account sign-in unavailable" message="This app needs to be set up before you can sign in. Please contact the person who installed it." />;
const LoadingScreen: React.FC<{ label: string }> = ({ label }) => <div className="min-h-screen flex items-center justify-center bg-[#f6f8f5] text-sm text-gray-600 gap-2"><LoaderCircle className="w-5 h-5 animate-spin text-emerald-700" />{label}</div>;
const MessageScreen: React.FC<{ title: string; message: string; action?: string; onAction?: () => void }> = ({ title, message, action, onAction }) => <div className="min-h-screen flex items-center justify-center bg-[#f6f8f5] p-4"><section className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-lg p-6"><h1 className="text-xl font-extrabold text-gray-900">{title}</h1><p className="text-sm text-gray-600 mt-2">{message}</p>{action && onAction && <button onClick={onAction} className="mt-5 rounded-xl bg-emerald-700 text-white font-bold px-4 py-2.5">{action}</button>}</section></div>;

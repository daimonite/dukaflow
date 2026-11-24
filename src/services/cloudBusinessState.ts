import { supabase } from './supabaseClient';

const STORAGE_PREFIX = 'dukeflow_app_state_v1_';

const STORAGE_FIELDS = {
  settings: 'settings',
  products: 'products',
  customers: 'customers',
  suppliers: 'suppliers',
  sales: 'sales',
  purchases: 'purchases',
  expenses: 'expenses',
  owner_drawings: 'owner_drawings',
  ledger: 'ledger',
  power_members: 'power_members',
  power_periods: 'power_periods',
  meter_readings: 'meter_readings',
  power_payments: 'power_payments',
  audit_logs: 'audit_logs',
  cash_register: 'cash_register',
} as const;

export type BusinessState = Record<keyof typeof STORAGE_FIELDS, unknown>;

export interface CloudSnapshot {
  state: BusinessState;
  /** Optimistic-concurrency token: the row's `updated_at`. */
  revision: string;
}

/** The cloud row changed since this device last read it. */
export class CloudConflictError extends Error {
  constructor() {
    super('Another device saved this business first.');
    this.name = 'CloudConflictError';
  }
}

// The revision this device is allowed to replace. Set by every load and save so
// a save always writes over the version it actually has, never a newer one.
let currentRevision: string | null = null;

export const getCloudRevision = (): string | null => currentRevision;

export const hasSavedBusinessState = (): boolean =>
  Object.values(STORAGE_FIELDS).some(field => localStorage.getItem(`${STORAGE_PREFIX}${field}`) !== null);

export const readLocalBusinessState = (): BusinessState => {
  const state = {} as BusinessState;
  for (const [key, storageKey] of Object.entries(STORAGE_FIELDS)) {
    const value = localStorage.getItem(`${STORAGE_PREFIX}${storageKey}`);
    (state as Record<string, unknown>)[key] = value ? JSON.parse(value) : null;
  }
  return state;
};

export const writeLocalBusinessState = (state: BusinessState): void => {
  for (const [key, storageKey] of Object.entries(STORAGE_FIELDS)) {
    const value = state[key as keyof BusinessState];
    if (value !== null && value !== undefined) {
      localStorage.setItem(`${STORAGE_PREFIX}${storageKey}`, JSON.stringify(value));
    }
  }
};

// Signing out hands the device to the next account, so the business records this
// one left behind must go too; otherwise the setup screen offers to import them.
// The language preference and unrelated device keys are deliberately kept.
export const clearLocalBusinessState = (): void => {
  for (const storageKey of Object.values(STORAGE_FIELDS)) {
    localStorage.removeItem(`${STORAGE_PREFIX}${storageKey}`);
  }
  localStorage.removeItem('dukaflow_cloud_dirty');
  currentRevision = null;
};

export const emptyBusinessState = (): BusinessState => ({
  settings: {
    storeName: 'My Business',
    storeLocation: '',
    storePhone: '',
    adminName: 'Owner',
    adminPin: '',
    managerName: '',
    receiptFooter: 'Thank you for your purchase.',
  },
  products: [],
  customers: [],
  suppliers: [],
  sales: [],
  purchases: [],
  expenses: [],
  owner_drawings: [],
  ledger: [],
  power_members: [],
  power_periods: [],
  meter_readings: [],
  power_payments: [],
  audit_logs: [],
  cash_register: {
    id: `reg-${new Date().toISOString().slice(0, 10)}`,
    date: new Date().toISOString().slice(0, 10),
    opened_at: new Date().toISOString(),
    opening_cash: 0,
    cash_sales: 0,
    cash_debt_payments: 0,
    cash_expenses: 0,
    cash_owner_drawings: 0,
    expected_closing: 0,
    status: 'open',
  },
});

export const loadCloudBusinessState = async (userId: string): Promise<CloudSnapshot | null> => {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase
    .from('business_state')
    .select('data, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    currentRevision = null;
    return null;
  }
  currentRevision = data.updated_at as string;
  return { state: data.data as BusinessState, revision: currentRevision };
};

/**
 * Writes the snapshot only if the cloud row is still the revision this device
 * read. A stale device (another phone saved in between) gets a
 * `CloudConflictError` instead of silently replacing the newer records.
 */
export const saveCloudBusinessState = async (
  userId: string,
  state: BusinessState,
  revision: string | null = currentRevision
): Promise<string> => {
  if (!supabase) throw new Error('Supabase is not configured.');
  const updatedAt = new Date().toISOString();

  if (!revision) {
    const { data, error } = await supabase
      .from('business_state')
      .insert({ user_id: userId, data: state, updated_at: updatedAt })
      .select('updated_at')
      .maybeSingle();
    if (error) {
      // Another device created the row first (primary-key violation).
      if (error.code === '23505') throw new CloudConflictError();
      throw error;
    }
    currentRevision = (data?.updated_at as string) ?? updatedAt;
    return currentRevision;
  }

  const { data, error } = await supabase
    .from('business_state')
    .update({ data: state, updated_at: updatedAt })
    .eq('user_id', userId)
    .eq('updated_at', revision)
    .select('updated_at')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new CloudConflictError();

  currentRevision = data.updated_at as string;
  return currentRevision;
};

export const localStateToCloudSnapshot = (): BusinessState => {
  const localState = readLocalBusinessState();
  const state = { ...emptyBusinessState(), ...localState };
  for (const key of Object.keys(state) as (keyof BusinessState)[]) {
    if (state[key] === null || state[key] === undefined) {
      state[key] = emptyBusinessState()[key];
    }
  }
  // The PIN is a legacy UI preference, not authentication. Never send it to the cloud.
  const settings = state.settings as Record<string, unknown> | null;
  if (settings) {
    const { adminPin: _ignoredPin, ...safeSettings } = settings;
    state.settings = safeSettings;
  }
  return state;
};

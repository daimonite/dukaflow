// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BusinessState } from './cloudBusinessState';

type QueryResult = { data: unknown; error: { code?: string; message?: string } | null };
interface Call {
  method: string;
  args: unknown[];
}
interface Builder {
  insert: (...args: unknown[]) => Builder;
  update: (...args: unknown[]) => Builder;
  eq: (...args: unknown[]) => Builder;
  select: (...args: unknown[]) => Builder;
  maybeSingle: () => Promise<QueryResult>;
}

// The service reads `supabase` when it saves, so the mock hands the current
// test's fake client to it through this holder.
const holder = vi.hoisted(() => ({ client: null as { from: (table: string) => Builder } | null }));

vi.mock('./supabaseClient', () => ({
  supabase: { from: (table: string) => holder.client!.from(table) },
}));

const { CloudConflictError, clearLocalBusinessState, getCloudRevision, saveCloudBusinessState } = await import(
  './cloudBusinessState'
);

const createMockClient = (result: QueryResult) => {
  const calls: Call[] = [];
  const builder = {} as Builder;
  for (const method of ['insert', 'update', 'eq', 'select'] as const) {
    builder[method] = (...args: unknown[]) => {
      calls.push({ method, args });
      return builder;
    };
  }
  builder.maybeSingle = async () => {
    calls.push({ method: 'maybeSingle', args: [] });
    return result;
  };
  const from = vi.fn((table: string) => {
    calls.push({ method: 'from', args: [table] });
    return builder;
  });
  return { from, calls };
};

const methods = (calls: Call[]): string[] => calls.map(call => call.method);
const eqCalls = (calls: Call[]): unknown[][] => calls.filter(call => call.method === 'eq').map(call => call.args);

const state = (patch: Partial<BusinessState> = {}): BusinessState => ({
  settings: { storeName: 'Duka Langu' },
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
  cash_register: { id: 'reg-local' },
  ...patch,
});

describe('saveCloudBusinessState', () => {
  beforeEach(() => {
    clearLocalBusinessState();
    holder.client = null;
  });

  it('updates when the revision still matches the cloud row', async () => {
    const client = createMockClient({ data: { updated_at: '2026-11-24T10:00:01.000Z' }, error: null });
    holder.client = client;

    const revision = await saveCloudBusinessState('user-1', state(), '2026-11-24T10:00:00.000Z');

    expect(methods(client.calls)).toEqual(['from', 'update', 'eq', 'eq', 'select', 'maybeSingle']);
    expect(eqCalls(client.calls)).toEqual([
      ['user_id', 'user-1'],
      ['updated_at', '2026-11-24T10:00:00.000Z'],
    ]);
    expect(revision).toBe('2026-11-24T10:00:01.000Z');
    expect(getCloudRevision()).toBe('2026-11-24T10:00:01.000Z');
  });

  it('raises a conflict without writing when the revision is stale', async () => {
    const client = createMockClient({ data: null, error: null });
    holder.client = client;

    await expect(saveCloudBusinessState('user-1', state(), '2026-11-24T09:00:00.000Z')).rejects.toBeInstanceOf(
      CloudConflictError
    );

    expect(methods(client.calls)).toEqual(['from', 'update', 'eq', 'eq', 'select', 'maybeSingle']);
    // The rejected save must not become the revision the next save claims.
    expect(getCloudRevision()).toBeNull();
  });

  it('treats an existing row on first insert as a conflict', async () => {
    const client = createMockClient({ data: null, error: { code: '23505', message: 'duplicate key' } });
    holder.client = client;

    await expect(saveCloudBusinessState('user-1', state(), null)).rejects.toBeInstanceOf(CloudConflictError);

    expect(methods(client.calls)).toEqual(['from', 'insert', 'select', 'maybeSingle']);
    expect(getCloudRevision()).toBeNull();
  });

  it('stores the returned revision after a first insert', async () => {
    const client = createMockClient({ data: { updated_at: '2026-11-24T11:00:00.000Z' }, error: null });
    holder.client = client;

    const revision = await saveCloudBusinessState('user-1', state(), null);

    expect(revision).toBe('2026-11-24T11:00:00.000Z');
    expect(getCloudRevision()).toBe('2026-11-24T11:00:00.000Z');
  });
});

import { describe, expect, it } from 'vitest';
import { BusinessState } from '../services/cloudBusinessState';
import { mergeBusinessState } from './mergeBusinessState';

const state = (patch: Partial<BusinessState> = {}): BusinessState => ({
  settings: { storeName: 'Local Shop' },
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

describe('mergeBusinessState', () => {
  it('keeps the other device records that this device never saw', () => {
    const local = state({ sales: [{ id: 'sale-local', total: 1000 }] });
    const remote = state({
      sales: [{ id: 'sale-phone-2', total: 4000 }],
      products: [{ id: 'prod-2', name: 'Sabuni' }],
    });

    const merged = mergeBusinessState(local, remote);

    expect((merged.sales as { id: string }[]).map(s => s.id)).toEqual(['sale-local', 'sale-phone-2']);
    expect((merged.products as { id: string }[]).map(p => p.id)).toEqual(['prod-2']);
  });

  it('keeps the local version when both sides have the same record', () => {
    const local = state({ products: [{ id: 'prod-1', sell_price: 3200 }] });
    const remote = state({ products: [{ id: 'prod-1', sell_price: 3000 }] });

    const merged = mergeBusinessState(local, remote);

    expect(merged.products).toEqual([{ id: 'prod-1', sell_price: 3200 }]);
  });

  it('never duplicates records that both sides already share', () => {
    const both = [{ id: 'sale-1' }, { id: 'sale-2' }];
    const merged = mergeBusinessState(state({ sales: both }), state({ sales: both }));

    expect((merged.sales as { id: string }[]).map(s => s.id)).toEqual(['sale-1', 'sale-2']);
  });

  it('keeps local settings and cash register', () => {
    const local = state({ settings: { storeName: 'Duka Langu' }, cash_register: { id: 'reg-local' } });
    const remote = state({ settings: { storeName: 'Other' }, cash_register: { id: 'reg-remote' } });

    const merged = mergeBusinessState(local, remote);

    expect(merged.settings).toEqual({ storeName: 'Duka Langu' });
    expect(merged.cash_register).toEqual({ id: 'reg-local' });
  });

  it('falls back to the cloud list when the local side is missing', () => {
    const merged = mergeBusinessState(state({ expenses: null }), state({ expenses: [{ id: 'exp-1' }] }));

    expect(merged.expenses).toEqual([{ id: 'exp-1' }]);
  });
});

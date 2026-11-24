import { BusinessState } from '../services/cloudBusinessState';

/**
 * Collections that are lists of records with an `id`. Merged by id: everything
 * this device has stays, and records that only exist in the cloud are appended,
 * so another phone's sales survive a conflicted save.
 */
export const COLLECTION_KEYS = [
  'products',
  'customers',
  'suppliers',
  'sales',
  'purchases',
  'expenses',
  'owner_drawings',
  'ledger',
  'power_members',
  'power_periods',
  'meter_readings',
  'power_payments',
  'audit_logs',
] as const;

const mergeList = (local: unknown, remote: unknown): unknown => {
  if (!Array.isArray(local)) return Array.isArray(remote) ? remote : local;
  if (!Array.isArray(remote)) return local;

  const seen = new Set<string>();
  for (const item of local) {
    if (item && typeof item === 'object' && 'id' in item) seen.add(String(item.id));
  }

  const merged = [...local];
  for (const item of remote) {
    if (!item || typeof item !== 'object' || !('id' in item)) continue;
    const id = String(item.id);
    if (seen.has(id)) continue;
    seen.add(id);
    merged.push(item);
  }
  return merged;
};

/**
 * Local wins where both sides have the same record; cloud-only records are
 * kept. Settings and the cash register are single objects, so the device doing
 * the save keeps its own.
 */
export const mergeBusinessState = (local: BusinessState, remote: BusinessState): BusinessState => {
  const merged: BusinessState = { ...local };
  for (const key of COLLECTION_KEYS) {
    merged[key] = mergeList(local[key], remote[key]);
  }
  return merged;
};

import { describe, expect, it } from 'vitest';
import { formatQty, formatTsh } from './translations';

describe('formatTsh', () => {
  it('rounds to whole shillings and groups thousands', () => {
    expect(formatTsh(1234.56)).toBe('1,235 TSh');
    expect(formatTsh(1234567)).toBe('1,234,567 TSh');
    expect(formatTsh(0)).toBe('0 TSh');
  });

  it('returns zero for invalid input instead of NaN', () => {
    expect(formatTsh(Number.NaN)).toBe('0 TSh');
  });
});

describe('formatQty', () => {
  it('formats pieces as whole counts', () => {
    expect(formatQty(3, 'piece')).toBe('3 pcs');
    expect(formatQty(2.6, 'piece')).toBe('3 pcs');
  });

  it('shows fractional units with two decimals', () => {
    expect(formatQty(1.5, 'kg')).toBe('1.50 kg');
    expect(formatQty(2, 'kg')).toBe('2 kg');
  });

  it('returns the bare number when no unit is given', () => {
    expect(formatQty(4.25)).toBe('4.25');
  });
});

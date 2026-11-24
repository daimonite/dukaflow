import { describe, expect, it } from 'vitest';
import { BusinessType } from '../data/businessCatalog';
import {
  buildCatalogProducts,
  CatalogRow,
  catalogRowKey,
  defaultReorderLevel,
} from './productDefaults';

const catalog: BusinessType = {
  id: 'test',
  label: 'Test',
  emoji: '🧪',
  hint: '',
  items: [
    { name: 'Sukari', category: 'Vyakula (Groceries)', base_unit: 'kg', sell_price: 3000, avg_cost: 2600 },
    { name: 'Sabuni', category: 'Usafi (Cleaning)', base_unit: 'piece', sell_price: 1500, avg_cost: 1200 },
  ],
};

const row = (patch: Partial<CatalogRow> = {}): CatalogRow => ({
  checked: true,
  qty: '10',
  price: '3000',
  ...patch,
});

const stocked = (...names: string[]): Set<string> => new Set(names.map(catalogRowKey));

describe('defaultReorderLevel', () => {
  it('stays below the opening stock so new products are not low stock', () => {
    expect(defaultReorderLevel(10)).toBe(2);
    expect(defaultReorderLevel(50)).toBe(10);
    expect(defaultReorderLevel(1)).toBe(1);
    expect(defaultReorderLevel(0)).toBe(1);
  });
});

describe('buildCatalogProducts', () => {
  it('builds a product per checked catalogue item', () => {
    const products = buildCatalogProducts(catalog.items, { Sukari: row(), Sabuni: row() }, stocked());

    expect(products).toHaveLength(2);
    expect(products[0]).toMatchObject({
      name: 'Sukari',
      category: 'Vyakula (Groceries)',
      base_unit: 'kg',
      sell_price: 3000,
      avg_cost: 2600,
      stock_qty: 10,
      reorder_level: 2,
      active: true,
    });
    expect(products[0].unit_options).toEqual([
      { label: '1 kg', factor: 1, use_for_buying: false, use_for_selling: true },
    ]);
  });

  it('skips unchecked rows and items already in stock', () => {
    const products = buildCatalogProducts(
      catalog.items,
      { Sukari: row({ checked: false }), Sabuni: row() },
      stocked('  sabuni ')
    );

    expect(products).toHaveLength(0);
  });

  it('drops rows without a usable sell price but keeps the rest', () => {
    const products = buildCatalogProducts(
      catalog.items,
      { Sukari: row({ price: '0' }), Sabuni: row() },
      stocked()
    );

    expect(products.map(p => p.name)).toEqual(['Sabuni']);
  });

  it('treats a blank quantity as zero stock', () => {
    const [product] = buildCatalogProducts(catalog.items, { Sukari: row({ qty: '' }) }, stocked());

    expect(product.stock_qty).toBe(0);
    expect(product.avg_cost).toBe(2600);
  });
});

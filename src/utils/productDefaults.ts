import { Product } from '../types';
import { CatalogItem } from '../data/businessCatalog';

export interface CatalogRow {
  checked: boolean;
  qty: string;
  price: string;
}

export const catalogRowKey = (name: string): string => name.trim().toLowerCase();

/**
 * Reorder threshold for new stock: 20% of what was just added, at least 1.
 * Reusing the opening quantity flagged every new product as low stock the
 * moment it was created.
 */
export const defaultReorderLevel = (stockQty: number): number =>
  Math.max(1, Math.round((Number.isFinite(stockQty) ? stockQty : 0) * 0.2));

/**
 * Turns catalogue selections into products ready for `addProducts`.
 * Skips rows that are unchecked, already stocked, or have no usable sell price.
 */
export const buildCatalogProducts = (
  items: CatalogItem[],
  rows: Record<string, CatalogRow>,
  existing: Set<string>
): Omit<Product, 'id'>[] => {
  return items.reduce<Omit<Product, 'id'>[]>((products, item) => {
    const row = rows[item.name];
    if (!row?.checked || existing.has(catalogRowKey(item.name))) return products;

    const price = parseFloat(row.price);
    if (!(price > 0)) return products;

    const qty = parseFloat(row.qty);
    const stockQty = Number.isFinite(qty) && qty > 0 ? qty : 0;

    products.push({
      name: item.name,
      category: item.category,
      base_unit: item.base_unit,
      sell_price: price,
      avg_cost: item.avg_cost,
      stock_qty: stockQty,
      reorder_level: defaultReorderLevel(stockQty),
      active: true,
      unit_options: [
        { label: `1 ${item.base_unit}`, factor: 1, use_for_buying: false, use_for_selling: true },
      ],
    });
    return products;
  }, []);
};

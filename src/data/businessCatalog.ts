import { BaseUnit } from '../types';

export interface CatalogItem {
  name: string;
  category: string;
  base_unit: BaseUnit;
  sell_price: number; // TSh per base unit
  avg_cost: number;   // TSh per base unit
}

export interface BusinessType {
  id: string;
  label: string;
  emoji: string;
  hint: string;
  items: CatalogItem[];
}

/**
 * Starter catalogues so a new shop can fill its shelves in one pass instead of
 * typing every product. Prices are typical Tanzanian retail prices and are
 * editable before saving.
 */
export const BUSINESS_TYPES: BusinessType[] = [
  {
    id: 'grocery',
    label: 'Duka la Vyakula',
    emoji: '🛒',
    hint: 'Unga, sukari, mafuta, sabuni',
    items: [
      { name: 'Sukari Nyeupe', category: 'Vyakula (Groceries)', base_unit: 'kg', sell_price: 3000, avg_cost: 2600 },
      { name: 'Unga wa Sembe', category: 'Nafaka (Grains)', base_unit: 'kg', sell_price: 2200, avg_cost: 1900 },
      { name: 'Mchele', category: 'Nafaka (Grains)', base_unit: 'kg', sell_price: 2600, avg_cost: 2300 },
      { name: 'Maharage', category: 'Nafaka (Grains)', base_unit: 'kg', sell_price: 2800, avg_cost: 2400 },
      { name: 'Mafuta ya Kupikia', category: 'Vyakula (Groceries)', base_unit: 'litre', sell_price: 5200, avg_cost: 4600 },
      { name: 'Chumvi', category: 'Vyakula (Groceries)', base_unit: 'kg', sell_price: 1200, avg_cost: 900 },
      { name: 'Sabuni ya Kufulia', category: 'Usafi (Cleaning)', base_unit: 'piece', sell_price: 1500, avg_cost: 1200 },
      { name: 'Chai Rangi', category: 'Vyakula (Groceries)', base_unit: 'piece', sell_price: 500, avg_cost: 350 },
      { name: 'Mkaa', category: 'Vyakula (Groceries)', base_unit: 'kg', sell_price: 1500, avg_cost: 1100 },
      { name: 'Mayai', category: 'Vyakula (Groceries)', base_unit: 'piece', sell_price: 500, avg_cost: 420 },
    ],
  },
  {
    id: 'beverages',
    label: 'Vinywaji & Bar',
    emoji: '🥤',
    hint: 'Soda, maji, bia, juisi',
    items: [
      { name: 'Soda 500ml', category: 'Vinywaji (Beverages)', base_unit: 'piece', sell_price: 1200, avg_cost: 900 },
      { name: 'Soda 1.5L', category: 'Vinywaji (Beverages)', base_unit: 'piece', sell_price: 3000, avg_cost: 2500 },
      { name: 'Maji ya Chupa 1L', category: 'Vinywaji (Beverages)', base_unit: 'piece', sell_price: 800, avg_cost: 550 },
      { name: 'Bia 500ml', category: 'Vinywaji (Beverages)', base_unit: 'piece', sell_price: 2500, avg_cost: 2100 },
      { name: 'Juisi ya Pakiti', category: 'Vinywaji (Beverages)', base_unit: 'piece', sell_price: 1500, avg_cost: 1200 },
      { name: 'Maziwa ya Pakiti', category: 'Vinywaji (Beverages)', base_unit: 'piece', sell_price: 2000, avg_cost: 1700 },
      { name: 'Biskuti', category: 'Vyakula (Groceries)', base_unit: 'piece', sell_price: 1000, avg_cost: 800 },
      { name: 'Mishkaki wa Nyama', category: 'Vyakula (Groceries)', base_unit: 'piece', sell_price: 1500, avg_cost: 1100 },
    ],
  },
  {
    id: 'pharmacy',
    label: 'Duka la Dawa',
    emoji: '💊',
    hint: 'Dawa za OTC, plasta, vitamini',
    items: [
      { name: 'Panadol', category: 'Dawa (Medicine)', base_unit: 'piece', sell_price: 500, avg_cost: 300 },
      { name: 'Paracetamol', category: 'Dawa (Medicine)', base_unit: 'piece', sell_price: 300, avg_cost: 150 },
      { name: 'ORS', category: 'Dawa (Medicine)', base_unit: 'piece', sell_price: 500, avg_cost: 300 },
      { name: 'Vitamini C', category: 'Dawa (Medicine)', base_unit: 'piece', sell_price: 1000, avg_cost: 700 },
      { name: 'Dawa ya Kikohozi', category: 'Dawa (Medicine)', base_unit: 'piece', sell_price: 3000, avg_cost: 2400 },
      { name: 'Plasta', category: 'Mahitaji (Supplies)', base_unit: 'piece', sell_price: 500, avg_cost: 300 },
      { name: 'Pamba ya Kuangalia', category: 'Mahitaji (Supplies)', base_unit: 'piece', sell_price: 1000, avg_cost: 700 },
      { name: 'Barakoa', category: 'Mahitaji (Supplies)', base_unit: 'piece', sell_price: 500, avg_cost: 300 },
      { name: 'Spirit ya Kusafisha', category: 'Mahitaji (Supplies)', base_unit: 'litre', sell_price: 6000, avg_cost: 4500 },
    ],
  },
  {
    id: 'hardware',
    label: 'Vifaa vya Ujenzi',
    emoji: '🔧',
    hint: 'Saruji, rangi, umeme',
    items: [
      { name: 'Saruji', category: 'Ujenzi (Hardware)', base_unit: 'kg', sell_price: 450, avg_cost: 380 },
      { name: 'Msumari', category: 'Ujenzi (Hardware)', base_unit: 'kg', sell_price: 3500, avg_cost: 3000 },
      { name: 'Rangi', category: 'Ujenzi (Hardware)', base_unit: 'litre', sell_price: 9000, avg_cost: 7500 },
      { name: 'Bomba la PVC', category: 'Ujenzi (Hardware)', base_unit: 'piece', sell_price: 6000, avg_cost: 4500 },
      { name: 'Swichi ya Umeme', category: 'Umeme (Electrical)', base_unit: 'piece', sell_price: 3000, avg_cost: 2000 },
      { name: 'Soketi (Socket)', category: 'Umeme (Electrical)', base_unit: 'piece', sell_price: 4000, avg_cost: 3000 },
      { name: 'Nyaya 1.5mm', category: 'Umeme (Electrical)', base_unit: 'piece', sell_price: 2500, avg_cost: 1800 },
      { name: 'Taa ya Bulb', category: 'Umeme (Electrical)', base_unit: 'piece', sell_price: 3500, avg_cost: 2500 },
    ],
  },
  {
    id: 'clothing',
    label: 'Nguo & Viatu',
    emoji: '👕',
    hint: 'Kanga, jeans, viatu',
    items: [
      { name: 'T-shirt', category: 'Nguo (Clothing)', base_unit: 'piece', sell_price: 10000, avg_cost: 7000 },
      { name: 'Suruali ya Jeans', category: 'Nguo (Clothing)', base_unit: 'piece', sell_price: 25000, avg_cost: 18000 },
      { name: 'Kanga', category: 'Nguo (Clothing)', base_unit: 'piece', sell_price: 12000, avg_cost: 9000 },
      { name: 'Viatu vya Canvas', category: 'Viatu (Shoes)', base_unit: 'piece', sell_price: 20000, avg_cost: 15000 },
      { name: 'Soksi', category: 'Viatu (Shoes)', base_unit: 'piece', sell_price: 3000, avg_cost: 2000 },
      { name: 'Kofia', category: 'Nguo (Clothing)', base_unit: 'piece', sell_price: 5000, avg_cost: 3500 },
      { name: 'Mkoba', category: 'Nguo (Clothing)', base_unit: 'piece', sell_price: 15000, avg_cost: 11000 },
      { name: 'Shuka ya Kitanda', category: 'Nguo (Clothing)', base_unit: 'piece', sell_price: 18000, avg_cost: 14000 },
    ],
  },
];

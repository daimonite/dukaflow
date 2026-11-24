import React, { useMemo, useState } from 'react';
import { CheckCircle2, Layers, X } from 'lucide-react';
import { Modal } from './Modal';
import { Product } from '../types';
import { BUSINESS_TYPES, BusinessType } from '../data/businessCatalog';
import { buildCatalogProducts, CatalogRow, catalogRowKey } from '../utils/productDefaults';

interface CatalogPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onCommit: (products: Omit<Product, 'id'>[]) => void;
}

export const CatalogPickerModal: React.FC<CatalogPickerModalProps> = ({
  isOpen,
  onClose,
  products,
  onCommit,
}) => {
  const [type, setType] = useState<BusinessType | null>(null);
  const [rows, setRows] = useState<Record<string, CatalogRow>>({});

  const existing = useMemo(
    () => new Set(products.map(product => catalogRowKey(product.name))),
    [products]
  );

  // Same builder the save uses, so the button count always matches the payload.
  const ready = useMemo(
    () => (type ? buildCatalogProducts(type.items, rows, existing) : []),
    [type, rows, existing]
  );

  const choose = (next: BusinessType) => {
    const defaults: Record<string, CatalogRow> = {};
    next.items.forEach(item => {
      defaults[item.name] = {
        checked: !existing.has(catalogRowKey(item.name)),
        qty: '10',
        price: String(item.sell_price),
      };
    });
    setType(next);
    setRows(defaults);
  };

  const patch = (name: string, next: Partial<CatalogRow>) =>
    setRows(prev => ({ ...prev, [name]: { ...prev[name], ...next } }));

  const close = () => {
    setType(null);
    setRows({});
    onClose();
  };

  const save = () => {
    if (ready.length === 0) return;
    onCommit(ready);
    setType(null);
    setRows({});
  };

  return (
    <Modal isOpen={isOpen} onClose={close} maxWidth="max-w-lg">
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between pb-3 border-b border-emerald-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-gray-900">Ongeza Bidhaa kwa Orodha</h3>
              <p className="text-xs text-gray-500">Chagua aina ya biashara, kisha bidhaa zako</p>
            </div>
          </div>
          <button
            onClick={close}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0"
            aria-label="Funga"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {BUSINESS_TYPES.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => choose(option)}
              className={`px-3 py-2 rounded-xl border text-left transition-all ${
                type?.id === option.id
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50/40'
              }`}
            >
              <span className="text-xs font-bold block leading-tight">
                {option.emoji} {option.label}
              </span>
              <span className={`text-[10px] block leading-tight ${type?.id === option.id ? 'text-emerald-50' : 'text-gray-400'}`}>
                {option.hint}
              </span>
            </button>
          ))}
        </div>

        {type ? (
          <>
            <div className="max-h-[45vh] overflow-y-auto space-y-1.5 pr-1">
              {type.items.map(item => {
                const row = rows[item.name];
                const inStock = existing.has(catalogRowKey(item.name));
                if (!row) return null;
                return (
                  <div
                    key={item.name}
                    className={`rounded-xl border p-2.5 ${
                      inStock
                        ? 'bg-gray-50 border-gray-100'
                        : row.checked
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={row.checked && !inStock}
                        disabled={inStock}
                        onChange={e => patch(item.name, { checked: e.target.checked })}
                        className="w-4 h-4 accent-emerald-600 flex-shrink-0"
                        aria-label={`Chagua ${item.name}`}
                      />
                      <span className={`text-xs font-bold flex-1 ${inStock ? 'text-gray-400' : 'text-gray-800'}`}>
                        {item.name}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 flex-shrink-0">
                        {inStock ? 'Ipo dukani' : item.base_unit}
                      </span>
                    </div>

                    {!inStock && row.checked && (
                      <div className="flex items-end gap-2 mt-2">
                        <label className="flex-1">
                          <span className="block text-[10px] font-semibold text-gray-500">Bei ya kuuza (TSh)</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={row.price}
                            onChange={e => patch(item.name, { price: e.target.value })}
                            className="w-full h-8 px-2 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                          />
                        </label>
                        <label className="w-24 flex-shrink-0">
                          <span className="block text-[10px] font-semibold text-gray-500">Idadi ({item.base_unit})</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={row.qty}
                            onChange={e => patch(item.name, { qty: e.target.value })}
                            className="w-full h-8 px-2 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={close}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-xs transition-colors"
              >
                Ghairi
              </button>
              <button
                type="button"
                onClick={save}
                disabled={ready.length === 0}
                className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Hifadhi Bidhaa{ready.length > 0 ? ` (${ready.length})` : ''}
              </button>
            </div>
          </>
        ) : (
          <p className="text-[11px] text-gray-500 rounded-xl bg-gray-50 border border-gray-100 p-3">
            Chagua aina ya biashara juu ili kuona bidhaa zinazopatikana. Bei na idadi zinaweza kubadilishwa kabla ya kuhifadhi.
          </p>
        )}
      </div>
    </Modal>
  );
};

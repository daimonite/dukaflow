import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  Globe,
  Bell,
  AlertTriangle,
  Menu,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';

const SCREEN_LABELS: Record<string, { sw: string; en: string; emoji: string }> = {
  pos:       { sw: 'Mauzo ya Haraka',      en: 'Quick POS Sale',         emoji: '🛒' },
  calendar:  { sw: 'Dashibodi / Kalenda',   en: 'Dashboard & Calendar',   emoji: '📅' },
  stock:     { sw: 'Stoo & Bidhaa',         en: 'Stock & Inventory',      emoji: '📦' },
  debtors:   { sw: 'Madeni & Wasambazaji',  en: 'Debtors & Creditors',    emoji: '👥' },
  expenses:  { sw: 'Matumizi & Mwenyewe',   en: 'Expenses & Drawings',    emoji: '💳' },
  purchases: { sw: 'Ununuzi wa Mzigo',      en: 'Stock Purchases',        emoji: '📋' },
  power:     { sw: 'Bili ya Umeme (LUKU)',   en: 'Community Power Billing',emoji: '⚡' },
  analytics: { sw: 'Takwimu & Faida',       en: 'Analytics & Profit',     emoji: '📊' },
  admin:     { sw: 'Ukaguzi & Usimamizi',   en: 'Audit Log & Admin',      emoji: '🔐' },
};

const CLOUD_DOT: Record<string, { className: string; title: string }> = {
  saving:  { className: 'bg-amber-400', title: 'Inahifadhi kwenye wingu…' },
  saved:   { className: 'bg-emerald-500', title: 'Imehifadhiwa' },
  offline: { className: 'bg-amber-400', title: 'Imehifadhiwa kwenye kifaa' },
  error:   { className: 'bg-red-500', title: 'Haikuweza kuhifadhi' },
  idle:    { className: 'bg-white/40', title: '' },
};

export const Header: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onMenuClick: () => void;
}> = ({ activeTab, setActiveTab, onMenuClick }) => {
  const { language, setLanguage, t, auditLogs, products } = useShop();
  const { cloudStatus, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const currentScreen = SCREEN_LABELS[activeTab] || SCREEN_LABELS.pos;
  const lowStockCount = products.filter(p => p.stock_qty <= p.reorder_level).length;
  const alertLogs = auditLogs.filter(l => l.severity === 'alert').slice(0, 5);
  const cloudDot = CLOUD_DOT[cloudStatus] || CLOUD_DOT.idle;

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-900 border-b border-emerald-950/60 shadow-lg shadow-emerald-950/20">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2">
        <div className="flex items-center justify-between gap-2">

          {/* Menu + brand + current screen */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onMenuClick}
              className="flex items-center justify-center w-10 h-10 flex-shrink-0 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all btn-press"
              aria-label="Open navigation menu"
              title="Fungua Menyu ya Pembeni (Sidebar Navigation)"
            >
              <Menu className="w-4 h-4 text-emerald-300" />
            </button>
            <BrandLogo className="w-9 h-9 flex-shrink-0 rounded-lg ring-1 ring-white/20" />
            <div className="min-w-0 leading-tight">
              <div className="font-display font-extrabold text-base sm:text-xl tracking-tight text-white truncate">
                Duka<span className="text-emerald-300">Smart</span>
              </div>
              <div className="text-[11px] text-emerald-100/80 truncate max-w-[45vw] sm:max-w-xs font-medium">
                <span className="mr-1">{currentScreen.emoji}</span>
                {language === 'sw' ? currentScreen.sw : currentScreen.en}
              </div>
            </div>
          </div>

          {/* Low-stock alert (tablet and up) */}
          {lowStockCount > 0 && (
            <button
              onClick={() => setActiveTab('stock')}
              className="hidden lg:flex items-center gap-1.5 flex-shrink-0 bg-emerald-500/20 text-emerald-100 border border-emerald-400/40 px-2.5 py-1.5 rounded-xl hover:bg-emerald-500/30 transition-colors text-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse text-emerald-300" />
              <span className="font-bold">{lowStockCount} {t.lowStockNotice}</span>
            </button>
          )}

          {/* Cloud status (dot only — details show on hover) */}
          {cloudDot.title && (
            <span
              aria-live="polite"
              title={cloudDot.title}
              className={`hidden sm:block w-2 h-2 rounded-full flex-shrink-0 animate-pulse ${cloudDot.className}`}
            />
          )}

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
              className="flex items-center gap-1 text-xs font-semibold px-2 h-10 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 hover:text-white transition-colors text-white/90"
              title="Badili Lugha / Switch Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase">{language}</span>
            </button>

            {/* Audit Notifications Bell */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex items-center justify-center w-10 h-10 rounded-xl text-white/85 hover:bg-white/15 hover:text-white border border-white/15 transition-colors"
                title="Arifa za Mabadiliko / Audit Alerts"
              >
                <Bell className="w-4 h-4" />
                {alertLogs.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {alertLogs.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-auto mt-0 sm:mt-2 w-[calc(100vw-1.5rem)] sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="font-bold text-xs text-gray-800">Arifa Muhimu za Mfumo (Audit)</span>
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        setActiveTab('admin');
                      }}
                      className="text-[11px] text-emerald-600 hover:underline font-semibold"
                    >
                      Tazama Zote
                    </button>
                  </div>
                  <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                    {alertLogs.length === 0 ? (
                      <p className="text-xs text-gray-400 py-3 text-center">Hakuna arifa za dharura kwa sasa.</p>
                    ) : (
                      alertLogs.map(log => (
                        <div key={log.id} className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs">
                          <div className="flex items-center justify-between font-semibold text-emerald-950">
                            <span>{log.action}</span>
                            <span className="text-[10px] text-gray-500">{new Date(log.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-gray-700 mt-0.5 text-[11px]">{log.reason}</p>
                          <div className="text-[10px] text-gray-400 mt-1">na {log.user_name}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => void signOut()}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-white/85 hover:bg-red-500/25 hover:text-white border border-white/15 transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

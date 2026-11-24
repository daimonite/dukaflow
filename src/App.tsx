import React, { useState, useCallback, useEffect } from 'react';
import { ShopProvider } from './context/ShopContext';
import { SyncProvider } from './context/SyncContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PosScreen } from './components/PosScreen';
import { CalendarScreen } from './components/CalendarScreen';
import { StockScreen } from './components/StockScreen';
import { DebtorsCreditorsScreen } from './components/DebtorsCreditorsScreen';
import { ExpensesPersonalScreen } from './components/ExpensesPersonalScreen';
import { PurchasesScreen } from './components/PurchasesScreen';
import { PowerBillingScreen } from './components/PowerBillingScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { AdminAuditScreen } from './components/AdminAuditScreen';
import { AuthProvider } from './context/AuthContext';
import { AuthGate } from './components/AuthGate';

// Tab order defines slide direction
const TAB_ORDER = ['pos', 'calendar', 'stock', 'debtors', 'expenses', 'purchases', 'power', 'analytics', 'admin'];

const slideDirection = (from: string, to: string): 'left' | 'right' => {
  const fromIdx = TAB_ORDER.indexOf(from);
  const toIdx   = TAB_ORDER.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) return 'left';
  return toIdx > fromIdx ? 'left' : 'right';
};

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('pos');
  const [prevTab, setPrevTab] = useState<string>('pos');
  const [slideDir, setSlideDir] = useState<'left' | 'right' | 'none'>('none');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // The window scrolls the page, and remounting a screen no longer resets that
  // offset, so start each screen at the top instead of mid-page.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const switchTab = useCallback((id: string) => {
    if (id === activeTab) {
      setSidebarOpen(false);
      return;
    }
    setSlideDir(slideDirection(activeTab, id));
    setPrevTab(activeTab);
    setActiveTab(id);
    setSidebarOpen(false);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#f6f8f5] text-gray-900 flex flex-col font-sans selection:bg-emerald-700 selection:text-white">
      {/* ── Top App Header ── */}
      <Header
        activeTab={activeTab}
        setActiveTab={switchTab}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* ── Slide-Out Sidebar (Single Navigation Truth) ── */}
      <Sidebar
        isOpen={sidebarOpen}
        activeTab={activeTab}
        onClose={() => setSidebarOpen(false)}
        onNavigate={switchTab}
      />

      {/* ── Main Content Router ── */}
      {/* overflow-x-clip, not overflow-x-hidden: `hidden` turns this into a
          scroll container, which would become the sticky reference for the
          screens' sub-headers and push them down over their own content. */}
      <main className="flex-1 overflow-x-clip">
        <div
          key={activeTab}
          onAnimationEnd={() => setSlideDir('none')}
          className={
            activeTab === prevTab || slideDir === 'none'
              ? ''
              : slideDir === 'left'
              ? 'screen-slide-left'
              : 'screen-slide-right'
          }
        >
          {activeTab === 'pos'       && <PosScreen />}
          {activeTab === 'calendar'  && <CalendarScreen />}
          {activeTab === 'stock'     && <StockScreen />}
          {activeTab === 'debtors'   && <DebtorsCreditorsScreen />}
          {activeTab === 'expenses'  && <ExpensesPersonalScreen />}
          {activeTab === 'purchases' && <PurchasesScreen />}
          {activeTab === 'power'     && <PowerBillingScreen />}
          {activeTab === 'analytics' && <AnalyticsScreen />}
          {activeTab === 'admin'     && <AdminAuditScreen />}
        </div>
      </main>

    </div>
  );
}

export default function App() {
  return (
    <SyncProvider>
      <AuthProvider>
        <AuthGate>
          <ShopProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </ShopProvider>
        </AuthGate>
      </AuthProvider>
    </SyncProvider>
  );
}

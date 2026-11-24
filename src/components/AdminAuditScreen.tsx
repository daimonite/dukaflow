import React, { useState, useMemo, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  Shield,
  AlertTriangle,
  History,
  DollarSign,
  Download,
  RotateCcw,
  CheckCircle2,
  Lock,
  Layers,
  Eye,
  Coins,
  Settings,
  Store,
  Save,
  Trash2,
  Phone,
  User,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Modal } from './Modal';
import { formatTsh } from '../utils/translations';
import { AuditSeverity, AuditLogEntry } from '../types';

export const AdminAuditScreen: React.FC = () => {
  const {
    t,
    auditLogs,
    currentRole,
    cashRegister,
    closeDayRegister,
    openNewDayRegister,
    exportDatabaseJSON,
    resetToDefaultData,
    settings,
    updateSettings,
    clearDemoTransactions
  } = useShop();

  const [severityFilter, setSeverityFilter] = useState<'all' | AuditSeverity>('all');

  // Store Settings state
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeLocation, setStoreLocation] = useState(settings.storeLocation);
  const [storePhone, setStorePhone] = useState(settings.storePhone);
  const [adminName, setAdminName] = useState(settings.adminName);
  const [managerName, setManagerName] = useState(settings.managerName);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    setStoreName(settings.storeName);
    setStoreLocation(settings.storeLocation);
    setStorePhone(settings.storePhone);
    setAdminName(settings.adminName);
    setManagerName(settings.managerName);
    setReceiptFooter(settings.receiptFooter);
  }, [settings]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: storeName.trim(),
      storeLocation: storeLocation.trim(),
      storePhone: (storePhone ?? '').trim(),
      adminName: adminName.trim(),
      managerName: managerName.trim(),
      receiptFooter: (receiptFooter ?? '').trim(),
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleClearDemoData = () => {
    const confirmed = window.confirm(
      '⚠️ UNATHIBITISHA KUANZA UPYA?\n\n' +
      'Kitendo hiki kitafuta:\n' +
      '• Mauzo yote ya majaribio (Sales)\n' +
      '• Madeni yote ya wateja na wasambazaji (Debts)\n' +
      '• Manunuzi ya bidhaa (Purchases)\n' +
      '• Matumizi ya duka (Expenses)\n' +
      '• Vipindi vya umeme na malipo (Power Billing)\n' +
      '• Historia ya droo ya pesa\n\n' +
      '✅ ORODHA YA BIDHAA (Product Catalog) na MIPANGILIO YA DUKA VITABAKI SALAMA bila kufutika.\n\n' +
      'Bonyeza OK kuanza upya.'
    );
    if (confirmed) {
      clearDemoTransactions();
      alert('✅ Mfumo umesafishwa kikamilifu! Orodha ya bidhaa na mipangilio vimehifadhiwa, uko tayari kurekodi biashara halisi.');
    }
  };

  // Cash Register closing modal
  const [showCloseRegisterModal, setShowCloseRegisterModal] = useState(false);
  const [actualCashInput, setActualCashInput] = useState('');
  const [registerNotes, setRegisterNotes] = useState('');

  // Cash Register opening modal
  const [showOpenRegisterModal, setShowOpenRegisterModal] = useState(false);
  const [openingCashInput, setOpeningCashInput] = useState('50000');
  const [openingNotes, setOpeningNotes] = useState('Float ya asubuhi');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (severityFilter === 'all') return true;
      return log.severity === severityFilter;
    });
  }, [auditLogs, severityFilter]);

  const alertCount = auditLogs.filter(l => l.severity === 'alert').length;

  const displayAuditValue = (value: unknown) => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'object') return 'Details updated';
    return String(value);
  };

  const handleCloseRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const actual = parseFloat(actualCashInput);
    if (isNaN(actual) || actual < 0) {
      alert('Tafadhali weka kiasi halisi cha pesa ulichohesabu.');
      return;
    }
    closeDayRegister(actual, registerNotes.trim() || undefined);
    setShowCloseRegisterModal(false);
    setActualCashInput('');
    setRegisterNotes('');
  };

  const handleOpenRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const opening = parseFloat(openingCashInput);
    if (isNaN(opening) || opening < 0) {
      alert('Tafadhali weka float sahihi ya asubuhi.');
      return;
    }
    openNewDayRegister(opening, openingNotes.trim() || undefined);
    setShowOpenRegisterModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-emerald-100 shadow-xs">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span>Admin & Kumbukumbu za Mfumo (Audit Log)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Fuatilia mabadiliko ya bei za bidhaa, mauzo yaliyofutwa (voids), na hesabu ya droo ya pesa ya kila siku.
          </p>
        </div>

        {/* Register closing / opening button */}
        <div className="flex items-center gap-2">
          {cashRegister.status === 'open' ? (
            <button
              onClick={() => {
                setActualCashInput(cashRegister.expected_closing.toString());
                setShowCloseRegisterModal(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>Funga Droo ya Pesa ya Siku (Reconcile)</span>
            </button>
          ) : (
            <button
              onClick={() => setShowOpenRegisterModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>Fungua Droo Mpya ya Leo</span>
            </button>
          )}
        </div>
      </div>

      {/* Store Settings & Security Card */}
      <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">
                Mipangilio ya Duka & PIN ya Usalama
              </h3>
              <p className="text-xs text-gray-400">
                Badilisha jina la biashara yako, namba ya simu ya risiti, na nenosiri (PIN) la kuingia Admin.
              </p>
            </div>
          </div>
          {settingsSaved && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1 self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4" />
              <span>Mipangilio imehifadhiwa!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Jina la Duka / Biashara:
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                placeholder="Mf. Neema Super Duka"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Mahali / Mtaa (Location):
              </label>
              <input
                type="text"
                required
                value={storeLocation}
                onChange={e => setStoreLocation(e.target.value)}
                placeholder="Mf. Arusha au Kariakoo"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Namba ya Simu ya Duka (Risiti):
              </label>
              <input
                type="text"
                required
                value={storePhone}
                onChange={e => setStorePhone(e.target.value)}
                placeholder="Mf. 0754 000 000"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono font-medium focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Jina la Msimamizi Mkuu (Admin):
              </label>
              <input
                type="text"
                required
                value={adminName}
                onChange={e => setAdminName(e.target.value)}
                placeholder="Mama Neema"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Jina la Muuzaji (Manager):
              </label>
              <input
                type="text"
                required
                value={managerName}
                onChange={e => setManagerName(e.target.value)}
                placeholder="Baraka"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Ujumbe wa Chini ya Risiti (Receipt Footer):
            </label>
            <input
              type="text"
              value={receiptFooter}
              onChange={e => setReceiptFooter(e.target.value)}
              placeholder="Asante kwa kufanya biashara nasi! Karibu tena."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Hifadhi Mipangilio ya Duka</span>
            </button>
          </div>
        </form>
      </div>

      {/* Cash Drawer Status Card */}
      <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-sm text-gray-900">
              Ulinganifu wa Pesa ya Droo (Cash Drawer Reconciliation)
            </h3>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              cashRegister.status === 'open'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {cashRegister.status === 'open' ? 'Droo Imefunguliwa' : 'Droo Imefungwa'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-gray-400 block">Pesa ya Kuanzia (Float):</span>
            <span className="font-mono font-bold text-sm text-gray-800">
              {formatTsh(cashRegister.opening_cash)}
            </span>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <span className="text-emerald-700 block">Mauzo ya Cash Leo:</span>
            <span className="font-mono font-bold text-sm text-emerald-900">
              +{formatTsh(cashRegister.cash_sales)}
            </span>
          </div>

          <div className="p-3 bg-red-50/60 rounded-2xl border border-red-100">
            <span className="text-red-700 block">Matumizi ya Cash Leo:</span>
            <span className="font-mono font-bold text-sm text-red-900">
              -{formatTsh(cashRegister.cash_expenses)}
            </span>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <span className="text-emerald-700 block font-bold">Pesa Inayotarajiwa Drooni:</span>
            <span className="font-mono font-extrabold text-base text-emerald-950">
              {formatTsh(cashRegister.expected_closing)}
            </span>
          </div>
        </div>

        {cashRegister.status === 'closed' && cashRegister.actual_closing !== undefined && (
          <div className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
            cashRegister.difference === 0
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}>
            <span>Pesa Halisi Iliyohesabiwa: <strong className="font-mono">{formatTsh(cashRegister.actual_closing)}</strong></span>
            <span>Tofauti ya Droo: <strong className="font-mono">{cashRegister.difference! >= 0 ? `+${cashRegister.difference}` : cashRegister.difference} TSh</strong></span>
          </div>
        )}
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-emerald-600" />
              <span>Kumbukumbu ya Vitendo na Mabadiliko (Audit Trail)</span>
            </h3>
            <p className="text-xs text-gray-400">
              Kila badiliko la bei au kufuta mauzo linaandikwa na kutolewa arifa mara moja.
            </p>
          </div>

          {/* Severity filter pills */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setSeverityFilter('all')}
              className={`px-3 py-1 rounded-xl font-bold ${
                severityFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Zote ({auditLogs.length})
            </button>
            <button
              onClick={() => setSeverityFilter('alert')}
              className={`px-3 py-1 rounded-xl font-bold ${
                severityFilter === 'alert' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700'
              }`}
            >
              Arifa za Dharura ({alertCount})
            </button>
            <button
              onClick={() => setSeverityFilter('digest')}
              className={`px-3 py-1 rounded-xl font-bold ${
                severityFilter === 'digest' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700'
              }`}
            >
              Kawaida
            </button>
          </div>
        </div>

        <div className="space-y-2.5 max-h-[450px] overflow-y-auto">
          {filteredLogs.map(log => {
            const isAlert = log.severity === 'alert';
            return (
              <div
                key={log.id}
                className={`p-3.5 rounded-2xl border text-xs transition-all ${
                  isAlert
                    ? 'bg-red-50/40 border-red-200'
                    : 'bg-emerald-50/20 border-emerald-100'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                        isAlert ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-gray-900 font-extrabold">{log.table_name.toUpperCase()}</span>
                  </div>

                  <span className="text-[11px] text-gray-400">
                    {new Date(log.at).toLocaleString()}
                  </span>
                </div>

                <p className="text-gray-800 font-medium mt-1">
                  Sababu: <span className="font-semibold text-gray-950">"{log.reason}"</span>
                </p>

                {/* Values diff */}
                {log.old_value && log.new_value && (
                  <div className="mt-2 p-2 bg-white/80 rounded-xl border border-gray-100 text-[11px] font-mono flex items-center gap-4 text-gray-600">
                    <div>Awali: <span className="text-gray-800 font-bold">{displayAuditValue(log.old_value)}</span></div>
                    <div>→ Sasa: <span className="text-emerald-700 font-bold">{displayAuditValue(log.new_value)}</span></div>
                  </div>
                )}

                <div className="text-[10px] text-gray-400 mt-2 flex items-center justify-between">
                  <span>Mhusika: <strong className="text-gray-600">{log.user_name}</strong></span>
                  <span>ID: {log.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Management & Start Fresh */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 space-y-4">
        <div>
          <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-emerald-500" />
            <span>Usimamizi wa Data & Hifadhi (Data Management)</span>
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Pakua nakala ya kumbukumbu zako, au safisha data za majaribio unapoanza kuuza rasmi dukani.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Backup JSON */}
          <button
            type="button"
            onClick={exportDatabaseJSON}
            className="p-3.5 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 rounded-2xl flex flex-col items-start gap-1 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Pakua nakala ya data</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-tight">
              Hifadhi faili la nakala (backup) kwenye simu au kompyuta yako.
            </p>
          </button>

          {/* Start Fresh / Clear Demo Data */}
          <button
            type="button"
            onClick={handleClearDemoData}
            className="p-3.5 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 rounded-2xl flex flex-col items-start gap-1 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Anza Upya (Bila Demo)</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-tight">
              Futa mauzo na madeni ya majaribio lakini <strong>bakiza bidhaa na bei zako</strong>.
            </p>
          </button>

          {/* Reset All to Demo */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Una uhakika unataka kurudisha data zote za mfano? Mauzo yako yote yatafutwa na kubadilishwa na data za mfano.')) {
                resetToDefaultData();
              }
            }}
            className="p-3.5 bg-red-50/60 hover:bg-red-100/60 border border-red-200 rounded-2xl flex flex-col items-start gap-1 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-950">
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>Rejesha Data za Mfano</span>
            </div>
            <p className="text-[11px] text-red-700 leading-tight">
              Rudisha mfumo katika hali ya awali ya mafunzo na mifano.
            </p>
          </button>
        </div>
      </div>

      {/* Modal: Close Cash Register */}
      <Modal
        isOpen={showCloseRegisterModal}
        onClose={() => setShowCloseRegisterModal(false)}
        title="Funga Droo ya Pesa ya Siku (End of Day)"
        maxWidth="max-w-sm"
      >
        <p className="text-xs text-gray-500 mb-3">
          Hesabu pesa taslimu zilizopo mkononi kwenye droo.
        </p>

        <form onSubmit={handleCloseRegisterSubmit} className="space-y-3">
          <div className="p-2.5 bg-emerald-50 rounded-xl text-xs">
            <span className="text-gray-500 block">Pesa Inayotarajiwa:</span>
            <span className="font-mono font-black text-sm text-emerald-950">
              {formatTsh(cashRegister.expected_closing)}
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Pesa Halisi Uliyohesabu Drooni (TSh):
            </label>
            <input
              type="number"
              required
              value={actualCashInput}
              onChange={e => setActualCashInput(e.target.value)}
              placeholder="52400"
              className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-sm font-mono font-bold focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          {parseFloat(actualCashInput) >= 0 && (
            <div className="text-xs font-semibold">
              Tofauti:{' '}
              <span
                className={
                  parseFloat(actualCashInput) - cashRegister.expected_closing === 0
                    ? 'text-emerald-600'
                    : 'text-red-600 font-bold'
                }
              >
                {parseFloat(actualCashInput) - cashRegister.expected_closing} TSh
              </span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Maelezo (Hiari):</label>
            <input
              type="text"
              value={registerNotes}
              onChange={e => setRegisterNotes(e.target.value)}
              placeholder="Mf. Chenji ya 100 ilipungua asubuhi"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCloseRegisterModal(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Ghairi
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              Funga Hesabu ya Droo
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Open Cash Register */}
      <Modal
        isOpen={showOpenRegisterModal}
        onClose={() => setShowOpenRegisterModal(false)}
        title="Fungua Droo Mpya ya Leo"
        maxWidth="max-w-sm"
      >
        <p className="text-xs text-gray-500 mb-3">
          Weka float ya kuanzia asubuhi.
        </p>

        <form onSubmit={handleOpenRegisterSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Float ya Kuanzia Asubuhi (TSh):
            </label>
            <input
              type="number"
              required
              value={openingCashInput}
              onChange={e => setOpeningCashInput(e.target.value)}
              placeholder="50000"
              className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-sm font-mono font-bold focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Maelezo (Hiari):</label>
            <input
              type="text"
              value={openingNotes}
              onChange={e => setOpeningNotes(e.target.value)}
              placeholder="Mf. Noti za 10,000 na sarafu za chenji"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowOpenRegisterModal(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Ghairi
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              Fungua Droo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  Database, 
  Cpu, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  HardDrive, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Layers,
  Trash2,
  Laptop
} from 'lucide-react';
import { 
  getDatabaseMetrics, 
  exportLocalDataPackage, 
  importLocalDataPackage, 
  wipeLocalDatabase 
} from '../db/indexedDB';
import { validateGoogleApiKey } from '../utils/aiAdvisor';
import { OFWCARecord, CoordinatorMS, CoordinatorRMS, ModelingHistoryStep, AppSettings } from '../types';

interface InstallationModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (newKey: string) => void;
  records: OFWCARecord[];
  msList: CoordinatorMS[];
  rmsList: CoordinatorRMS[];
  history: ModelingHistoryStep[];
  onPackageImported: (imported: {
    records: OFWCARecord[];
    msList: CoordinatorMS[];
    rmsList: CoordinatorRMS[];
    history: ModelingHistoryStep[];
  }) => void;
}

export const InstallationModal: React.FC<InstallationModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  records,
  msList,
  rmsList,
  history,
  onPackageImported,
}) => {
  const [activeTab, setActiveTab] = useState<'package' | 'db' | 'api'>('package');
  const [currentKeyInput, setCurrentKeyInput] = useState(apiKey);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyValidationResult, setKeyValidationResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [dbMetrics, setDbMetrics] = useState<{
    recordsCount: number;
    msCount: number;
    rmsCount: number;
    historyCount: number;
    estimatedStorageBytes: number;
    isIndexedDbSupported: boolean;
  } | null>(null);

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentKeyInput(apiKey);
  }, [apiKey]);

  useEffect(() => {
    if (isOpen) {
      loadMetrics();
    }
  }, [isOpen, records.length]);

  useEffect(() => {
    // Listen for PWA install event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const loadMetrics = async () => {
    const m = await getDatabaseMetrics();
    setDbMetrics(m);
  };

  const handleTestKey = async () => {
    setIsTestingKey(true);
    setKeyValidationResult(null);
    const result = await validateGoogleApiKey(currentKeyInput);
    setKeyValidationResult(result);
    setIsTestingKey(false);
    if (result.valid) {
      onSaveApiKey(currentKeyInput);
    }
  };

  const handleSaveKey = () => {
    onSaveApiKey(currentKeyInput);
    setKeyValidationResult({ valid: true, message: 'Klucz Google API został pomyślnie zapisany w lokalnej bazie.' });
  };

  const handleExportPackage = async () => {
    await exportLocalDataPackage(records, msList, rmsList, history);
    await loadMetrics();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const pkg = await importLocalDataPackage(text);
      onPackageImported({
        records: pkg.records,
        msList: pkg.msList,
        rmsList: pkg.rmsList,
        history: pkg.history
      });
      await loadMetrics();
      alert(`Pomyślnie zaimportowano paczkę: ${pkg.records.length} rekordów OFWCA!`);
    } catch (err: any) {
      alert(`Błąd importu paczki: ${err.message}`);
    } finally {
      e.target.value = '';
    }
  };

  const handleInstallPWA = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    } else {
      alert('Aplikacja może zostać zainstalowana z poziomu paska adresu przeglądarki Chrome/Edge (ikona komputera/instalacji po prawej stronie paska URL).');
    }
  };

  const handleWipeDatabase = async () => {
    if (confirm('Czy na pewno chcesz wyczyścić lokalną bazę danych IndexedDB? Ta operacja usunie wszystkie lokalnie zapisane rekordy.')) {
      await wipeLocalDatabase();
      await loadMetrics();
      alert('Lokalna baza danych została wyczyszczona.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Laptop className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Paczka Instalacyjna, Baza Lokalna i Google API
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Konfiguracja instalacji na PC, wydajnego silnika IndexedDB oraz kluczy Google Maps i AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/30 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('package')}
            className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'package'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Instalacja PC (PWA)</span>
          </button>

          <button
            onClick={() => setActiveTab('db')}
            className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'db'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Wydajna Baza IndexedDB</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'api'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Klucz Google API (Maps & AI)</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: PACZKA INSTALACYJNA PC */}
          {activeTab === 'package' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Aplikacja Desktopowa 100% Offline (Zero Zewnętrznych Serwerów)</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Sales Territory Studio (STS v1.0) instaluje się bezpośrednio na Twoim komputerze PC w standardzie PWA. Cała baza OFWCA, agencji i modeli przeliczana jest lokalnie w procesorze Twojego urządzenia bez wysyłania wrażliwych danych poza firmę.
                </p>
              </div>

              {/* Install PWA Button Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">Instalacja programu na komputerze</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tworzy dedykowany skrót na pulpicie i uruchamia STS w osobnym oknie bez pasków przeglądarki.
                    </p>
                  </div>
                  {isInstalled ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Zainstalowano na PC</span>
                    </span>
                  ) : (
                    <button
                      onClick={handleInstallPWA}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition cursor-pointer"
                    >
                      Zainstaluj na PC
                    </button>
                  )}
                </div>
              </div>

              {/* Package Backup & Export */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Eksport Paczki Danych</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Pobierz kompletną paczkę bazy (rekordy, historię, podział terytorialny i ustawienia) w jednym pliku <code className="text-white">.sts-pkg.json</code>.
                  </p>
                  <button
                    onClick={handleExportPackage}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition cursor-pointer mt-1"
                  >
                    Pobierz paczkę (.sts-pkg.json)
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span>Wczytaj Paczkę z Pliku</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Odtwórz stan modelowania z wcześniej wyeksportowanej paczki lub przenieś dane na inny komputer.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportFile}
                    accept=".json,.sts-pkg.json"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition cursor-pointer mt-1"
                  >
                    Wczytaj plik paczki
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WYDAJNA BAZA INDEXEDDB */}
          {activeTab === 'db' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-bold text-white text-sm">Status Lokalnej Bazy IndexedDB (Dexie Engine)</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[10px]">
                    Wydajność Wysoka (Asynchroniczna)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Zamiast ograniczonego do 5 MB LocalStorage, aplikacja wykorzystuje silnik <strong>IndexedDB</strong>, który umożliwia błyskawiczne indeksowanie i przetwarzanie ponad 100 000 rekordów OFWCA, historii kroków i pełnego podziału terytorialnego.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Rekordy w bazie:</div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {dbMetrics?.recordsCount || records.length}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Koordynatorzy (MS):</div>
                    <div className="text-base font-bold text-blue-400 mt-0.5">
                      {dbMetrics?.msCount || msList.length}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Kroki historii:</div>
                    <div className="text-base font-bold text-indigo-400 mt-0.5">
                      {dbMetrics?.historyCount || history.length}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Zajętość pamięci:</div>
                    <div className="text-base font-bold text-emerald-400 mt-0.5">
                      {((dbMetrics?.estimatedStorageBytes || 0) / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={loadMetrics}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Odśwież statystyki bazy</span>
                </button>

                <button
                  onClick={handleWipeDatabase}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs cursor-pointer font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Wyczyść bazę IndexedDB</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: KLUCZ GOOGLE API */}
          {activeTab === 'api' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-white text-sm">Konfiguracja Google API Key (Maps + Gemini AI)</h4>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Wprowadzony klucz Google API odblokowuje:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] pl-2">
                  <li><strong>Mapy Google</strong>: Warstwy satelitarne, hybrydowe, podział administracyjny na 380 powiatów TERYT.</li>
                  <li><strong>Gemini 2.5 Flash</strong>: Inteligentny asystent proponujący bezkonfliktowe wyrównanie obciążeń i redukcję dysproporcji.</li>
                </ul>

                <div className="space-y-2 pt-2">
                  <label className="text-[11px] font-semibold text-slate-300 block">
                    Twój klucz Google API (Maps & Gemini):
                  </label>
                  <input
                    type="password"
                    value={currentKeyInput}
                    onChange={e => setCurrentKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full font-mono text-xs px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Klucz jest przechowywany bezpiecznie w lokalnej pamięci Twojego komputera.</span>
                    <span>Wspierane: Google Maps JS API + Gemini AI</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleTestKey}
                    disabled={isTestingKey || !currentKeyInput}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold transition cursor-pointer"
                  >
                    {isTestingKey ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sprawdzanie...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Testuj poprawność klucza</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSaveKey}
                    disabled={!currentKeyInput}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition cursor-pointer shadow-lg shadow-blue-500/20"
                  >
                    Zapisz klucz
                  </button>
                </div>

                {keyValidationResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 mt-2 ${
                      keyValidationResult.valid
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {keyValidationResult.valid ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    )}
                    <span>{keyValidationResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Sales Territory Studio • Wersja 1.0.4 • Baza Lokalna PC
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer transition text-xs"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};

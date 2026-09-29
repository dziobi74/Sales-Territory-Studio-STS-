import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  OFWCARecord, 
  CoordinatorMS, 
  CoordinatorRMS, 
  ModelingHistoryStep, 
  TerritoryBalanceMetric,
  DataAuditReport 
} from './types';
import { generateRealisticDataset } from './utils/demoDataGenerator';
import { calculateTerritoryMetrics, generateAuditReport, computeBalancingProposals } from './utils/balancer';
import { parseExcelWorkbook } from './utils/excelParser';
import { exportModeledWorkbook } from './utils/excelExporter';
import { 
  persistAllRecords, 
  loadAllRecords, 
  persistCoordinators, 
  loadCoordinators, 
  persistHistory, 
  loadHistory,
  saveAppSetting,
  getAppSetting
} from './db/indexedDB';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { TerritoryMap } from './components/TerritoryMap';
import { TerritoryBalancing } from './components/TerritoryBalancing';
import { ReassignmentWorkbench } from './components/ReassignmentWorkbench';
import { HierarchyAnalytics } from './components/HierarchyAnalytics';
import { DataAuditTab } from './components/DataAuditTab';
import { DocumentationTab } from './components/DocumentationTab';
import { AITerritoryAdvisor } from './components/AITerritoryAdvisor';
import { AutoBalanceModal } from './components/AutoBalanceModal';
import { InstallationModal } from './components/InstallationModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const DEFAULT_GOOGLE_KEY = (typeof window !== 'undefined' ? localStorage.getItem('STS_GOOGLE_API_KEY') : null) || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDx8L35dkaoxPtBqiwOv406C6XUnRD_WKI';

export default function App() {
  const [records, setRecords] = useState<OFWCARecord[]>([]);
  const [msList, setMsList] = useState<CoordinatorMS[]>([]);
  const [rmsList, setRmsList] = useState<CoordinatorRMS[]>([]);
  const [history, setHistory] = useState<ModelingHistoryStep[]>([]);
  const [activeTab, setActiveTab] = useState<'map' | 'balance' | 'workbench' | 'hierarchy' | 'audit' | 'ai' | 'docs'>('map');
  const [isAutoBalanceOpen, setIsAutoBalanceOpen] = useState(false);
  const [isInstallationModalOpen, setIsInstallationModalOpen] = useState(false);
  const [googleApiKey, setGoogleApiKey] = useState<string>(DEFAULT_GOOGLE_KEY);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [fileWarnings, setFileWarnings] = useState<string[]>([]);

  // Initialize data on mount: prioritize IndexedDB, fallback to demo dataset
  useEffect(() => {
    async function initData() {
      try {
        const localKey = localStorage.getItem('STS_GOOGLE_API_KEY');
        const dbKey = await getAppSetting<string>('google_api_key', localKey || DEFAULT_GOOGLE_KEY);
        if (dbKey) {
          setGoogleApiKey(dbKey);
          localStorage.setItem('STS_GOOGLE_API_KEY', dbKey);
        }

        const dbRecords = await loadAllRecords();
        const { msList: dbMs, rmsList: dbRms } = await loadCoordinators();
        const dbHistory = await loadHistory();

        if (dbRecords && dbRecords.length > 0 && dbMs && dbMs.length > 0) {
          setRecords(dbRecords);
          setMsList(dbMs);
          setRmsList(dbRms);
          setHistory(dbHistory || []);
          return;
        }
      } catch (err) {
        console.warn('Błąd odczytu z IndexedDB:', err);
      }

      // Default: generate realistic demo dataset for 16 Polish Voivodeships
      const demo = generateRealisticDataset();
      setRecords(demo.records);
      setMsList(demo.msList);
      setRmsList(demo.rmsList);

      // Cache into IndexedDB for persistent PC work
      persistAllRecords(demo.records);
      persistCoordinators(demo.msList, demo.rmsList);
    }

    initData();
  }, []);

  // Background auto-sync to high-performance local IndexedDB
  useEffect(() => {
    if (records.length > 0) {
      persistAllRecords(records);
    }
  }, [records]);

  useEffect(() => {
    if (msList.length > 0 && rmsList.length > 0) {
      persistCoordinators(msList, rmsList);
    }
  }, [msList, rmsList]);

  useEffect(() => {
    if (history.length > 0) {
      persistHistory(history);
    }
  }, [history]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Calculate territory metrics
  const {
    metrics,
    rmsMetrics,
    gwpStdDevInitial,
    gwpStdDevCurrent,
    ofwcaStdDevInitial,
    ofwcaStdDevCurrent,
    averageGwp2026,
    averageActiveOfwca
  } = useMemo(() => {
    return calculateTerritoryMetrics(records, msList, rmsList);
  }, [records, msList, rmsList]);

  // Calculate audit report
  const auditReport = useMemo(() => {
    return generateAuditReport(records);
  }, [records]);

  // Compute Auto-balance proposals
  const autoBalanceProposals = useMemo(() => {
    return computeBalancingProposals(records, metrics, averageGwp2026);
  }, [records, metrics, averageGwp2026]);

  // Handle reassigning a batch of records
  const handleReassignBatch = useCallback((recordIds: string[], targetMsName: string, reason?: string) => {
    if (recordIds.length === 0 || !targetMsName) return;

    // Snapshot previous MS for undo
    const previousMsMap: Record<string, string> = {};
    records.forEach(r => {
      if (recordIds.includes(r.id)) {
        previousMsMap[r.id] = r.currentMs;
      }
    });

    const coordinator = msList.find(m => m.name === targetMsName);
    const targetRms = coordinator ? coordinator.rms : 'RMS Standard';

    // Apply mutation
    setRecords(prev => prev.map(r => {
      if (recordIds.includes(r.id)) {
        return {
          ...r,
          currentMs: targetMsName,
          currentRms: targetRms
        };
      }
      return r;
    }));

    // Record step in history
    const step: ModelingHistoryStep = {
      id: `step_${Date.now()}`,
      timestamp: Date.now(),
      description: reason || `Przeniesiono ${recordIds.length} rekordów do ${targetMsName}`,
      changesCount: recordIds.length,
      previousMsMap
    };
    setHistory(prev => [step, ...prev]);

    setToastMessage({
      type: 'success',
      text: `Pomyślnie przeniesiono ${recordIds.length} rekordów do ${targetMsName}.`
    });
  }, [records, msList]);

  // Handle resetting a single record to its initial MS
  const handleResetRecord = useCallback((recordId: string) => {
    setRecords(prev => prev.map(r => {
      if (r.id === recordId) {
        return {
          ...r,
          currentMs: r.initialMs,
          currentRms: r.initialRms
        };
      }
      return r;
    }));
    setToastMessage({ type: 'info', text: 'Przywrócono pierwotne przypisanie rekordu.' });
  }, []);

  // Handle Undo
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const [lastStep, ...remainingHistory] = history;

    setRecords(prev => prev.map(r => {
      if (lastStep.previousMsMap[r.id]) {
        const prevMs = lastStep.previousMsMap[r.id];
        const coordinator = msList.find(m => m.name === prevMs);
        return {
          ...r,
          currentMs: prevMs,
          currentRms: coordinator ? coordinator.rms : r.initialRms
        };
      }
      return r;
    }));

    setHistory(remainingHistory);
    setToastMessage({
      type: 'info',
      text: `Cofnięto operację: "${lastStep.description}"`
    });
  }, [history, msList]);

  // Handle uploading and parsing an Excel workbook
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setToastMessage({ type: 'info', text: 'Parsowanie pliku Excel...' });
      const buffer = await file.arrayBuffer();
      const result = parseExcelWorkbook(buffer);

      setRecords(result.records);
      setMsList(result.msList);
      setRmsList(result.rmsList);
      setHistory([]); // Fresh model history
      setFileWarnings(result.warnings);

      // Persist directly into IndexedDB
      await persistAllRecords(result.records);
      await persistCoordinators(result.msList, result.rmsList);

      setToastMessage({
        type: 'success',
        text: `Wczytano pomyślnie ${result.records.length} rekordów OFWCA dla ${result.msList.length} MS!`
      });
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err.message || 'Błąd podczas wczytywania pliku Excel.'
      });
    }
  }, []);

  // Handle Export to Excel
  const handleExportModeled = useCallback(() => {
    try {
      exportModeledWorkbook(records, msList, rmsList, metrics);
      setToastMessage({
        type: 'success',
        text: 'Wygenerowano i pobrano plik Excel z nowym podziałem terytoriów!'
      });
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: 'Błąd podczas eksportu do Excel: ' + err.message
      });
    }
  }, [records, msList, rmsList, metrics]);

  // Handle downloading empty Excel template
  const handleDownloadTemplate = useCallback(() => {
    // Generate demo as a downloadable template
    const demo = generateRealisticDataset();
    exportModeledWorkbook(demo.records, demo.msList, demo.rmsList, calculateTerritoryMetrics(demo.records, demo.msList, demo.rmsList).metrics);
    setToastMessage({
      type: 'info',
      text: 'Pobrano wzorcowy szablon pliku Excel (baza, MS_lista, RMS_lista).'
    });
  }, []);

  // Handle loading realistic demo data
  const handleLoadDemo = useCallback(async () => {
    const demo = generateRealisticDataset();
    setRecords(demo.records);
    setMsList(demo.msList);
    setRmsList(demo.rmsList);
    setHistory([]);
    setFileWarnings([]);

    await persistAllRecords(demo.records);
    await persistCoordinators(demo.msList, demo.rmsList);

    setToastMessage({
      type: 'success',
      text: `Załadowano dane demo: ${demo.records.length} OFWCA w 16 województwach.`
    });
  }, []);

  // Handle applying proposals from Auto-Balancer
  const handleApplyProposals = useCallback((appliedProposals: typeof autoBalanceProposals) => {
    appliedProposals.forEach(p => {
      handleReassignBatch(p.recordIds, p.targetMs, p.reason);
    });
    setIsAutoBalanceOpen(false);
  }, [autoBalanceProposals, handleReassignBatch]);

  // Save new Google API Key
  const handleSaveApiKey = useCallback((newKey: string) => {
    const trimmed = newKey.trim();
    setGoogleApiKey(trimmed);
    localStorage.setItem('STS_GOOGLE_API_KEY', trimmed);
    saveAppSetting('google_api_key', trimmed);
    setToastMessage({
      type: 'success',
      text: 'Klucz Google API został zapisany w lokalnej bazie danych!'
    });
  }, []);

  // Restore from imported package
  const handlePackageImported = useCallback((imported: {
    records: OFWCARecord[];
    msList: CoordinatorMS[];
    rmsList: CoordinatorRMS[];
    history: ModelingHistoryStep[];
  }) => {
    setRecords(imported.records);
    setMsList(imported.msList);
    setRmsList(imported.rmsList);
    setHistory(imported.history);
    setToastMessage({
      type: 'success',
      text: `Pomyślnie wczytano paczkę instalacyjną: ${imported.records.length} rekordów!`
    });
    setIsInstallationModalOpen(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Main App Navigation & Toolbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onFileUpload={handleFileUpload}
        onLoadDemo={handleLoadDemo}
        onDownloadTemplate={handleDownloadTemplate}
        onExportModeled={handleExportModeled}
        onUndo={handleUndo}
        canUndo={history.length > 0}
        totalRecordsCount={records.length}
        auditIssuesCount={auditReport.missingLocationCount + auditReport.missingGwpCount + auditReport.duplicatesCount}
        onOpenInstallation={() => setIsInstallationModalOpen(true)}
        hasGoogleKey={Boolean(googleApiKey)}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto px-4 py-6">
        {/* Warning Banner if Excel had non-fatal parsing remarks */}
        {fileWarnings.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-start justify-between">
            <div>
              <strong className="block font-bold mb-1">Uwagi walidatora struktury Excel:</strong>
              <ul className="list-disc list-inside space-y-0.5 text-amber-300/90">
                {fileWarnings.slice(0, 3).map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
            <button 
              onClick={() => setFileWarnings([])}
              className="text-amber-400 hover:text-white text-xs font-semibold px-2 py-1 rounded bg-amber-900/40"
            >
              Ukryj
            </button>
          </div>
        )}

        {/* Global Key Metrics Summary */}
        <MetricCards
          records={records}
          balanceMetrics={metrics}
          gwpStdDevInitial={gwpStdDevInitial}
          gwpStdDevCurrent={gwpStdDevCurrent}
        />

        {/* Tab 1: Interactive Territory Map (ODL Vector GIS + Google Maps GIS) */}
        {activeTab === 'map' && (
          <TerritoryMap
            records={records}
            msList={msList}
            rmsList={rmsList}
            onReassignBatch={handleReassignBatch}
            googleApiKey={googleApiKey}
            onSaveApiKey={handleSaveApiKey}
            onOpenSettings={() => setIsInstallationModalOpen(true)}
          />
        )}

        {/* Tab 2: Territory Balancing & Workload Leveling */}
        {activeTab === 'balance' && (
          <TerritoryBalancing
            metrics={metrics}
            rmsMetrics={rmsMetrics}
            records={records}
            msList={msList}
            rmsList={rmsList}
            gwpStdDevInitial={gwpStdDevInitial}
            gwpStdDevCurrent={gwpStdDevCurrent}
            ofwcaStdDevInitial={ofwcaStdDevInitial}
            ofwcaStdDevCurrent={ofwcaStdDevCurrent}
            averageGwp2026={averageGwp2026}
            averageActiveOfwca={averageActiveOfwca}
            onOpenAutoBalance={() => setIsAutoBalanceOpen(true)}
          />
        )}

        {/* Tab 3: Reassignment Workbench */}
        {activeTab === 'workbench' && (
          <ReassignmentWorkbench
            records={records}
            msList={msList}
            rmsList={rmsList}
            onReassignBatch={handleReassignBatch}
            onResetRecord={handleResetRecord}
          />
        )}

        {/* Tab 4: Hierarchy & Sales Analytics */}
        {activeTab === 'hierarchy' && (
          <HierarchyAnalytics
            records={records}
            msList={msList}
            rmsList={rmsList}
          />
        )}

        {/* Tab 5: Data Quality & Audit Report */}
        {activeTab === 'audit' && (
          <DataAuditTab
            auditReport={auditReport}
            records={records}
          />
        )}

        {/* Tab 6: AI Territory Advisor (Gemini 2.5 Flash) */}
        {activeTab === 'ai' && (
          <AITerritoryAdvisor
            apiKey={googleApiKey}
            onSaveApiKey={handleSaveApiKey}
            records={records}
            metrics={metrics}
            averageGwp={averageGwp2026}
            averageOfwca={averageActiveOfwca}
            onApplyRecommendation={handleReassignBatch}
            onOpenSettings={() => setIsInstallationModalOpen(true)}
          />
        )}

        {/* Tab 7: Application Documentation (STS v1.0) */}
        {activeTab === 'docs' && (
          <DocumentationTab />
        )}
      </main>

      {/* Auto-Balance Modal */}
      <AutoBalanceModal
        isOpen={isAutoBalanceOpen}
        onClose={() => setIsAutoBalanceOpen(false)}
        proposals={autoBalanceProposals}
        onApplyProposals={handleApplyProposals}
      />

      {/* Installation, IndexedDB & Google API Key Settings Modal */}
      <InstallationModal
        isOpen={isInstallationModalOpen}
        onClose={() => setIsInstallationModalOpen(false)}
        apiKey={googleApiKey}
        onSaveApiKey={handleSaveApiKey}
        records={records}
        msList={msList}
        rmsList={rmsList}
        history={history}
        onPackageImported={handlePackageImported}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 border bg-slate-900 border-slate-700 text-white">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500">
        <p>Sales Territory Studio (STS v1.0) • Bazowane na koncepcji Open Door Logistics Studio • Przetwarzanie 100% lokalne na komputerze PC (IndexedDB)</p>
      </footer>
    </div>
  );
}

import React, { useRef } from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  RotateCcw, 
  Sparkles, 
  Map, 
  Scale, 
  ArrowRightLeft, 
  BarChart3, 
  ShieldAlert, 
  BookOpen,
  Laptop,
  BrainCircuit,
  Key,
  Database
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'map' | 'balance' | 'workbench' | 'hierarchy' | 'audit' | 'ai' | 'docs';
  setActiveTab: (tab: 'map' | 'balance' | 'workbench' | 'hierarchy' | 'audit' | 'ai' | 'docs') => void;
  onFileUpload: (file: File) => void;
  onLoadDemo: () => void;
  onDownloadTemplate: () => void;
  onExportModeled: () => void;
  onUndo: () => void;
  canUndo: boolean;
  totalRecordsCount: number;
  auditIssuesCount: number;
  onOpenInstallation: () => void;
  hasGoogleKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onFileUpload,
  onLoadDemo,
  onDownloadTemplate,
  onExportModeled,
  onUndo,
  canUndo,
  totalRecordsCount,
  auditIssuesCount,
  onOpenInstallation,
  hasGoogleKey
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 shadow-xl">
      <div className="max-w-[1680px] mx-auto px-4 py-3">
        {/* Top brand & toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo & branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <img src="/icon.svg" alt="STS" className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white tracking-tight">
                  Sales Territory Studio (STS v1.0)
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold tracking-wide">
                  GIS Studio v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Modelowanie struktur sprzedaży OFWCA • Balansowanie obciążenia MS / RMS • Podział DKP / DPD
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls"
              className="hidden"
            />

            {/* Undo button */}
            {canUndo && (
              <button
                onClick={onUndo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer font-medium"
                title="Cofnij ostatnie przeniesienie"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                <span>Cofnij</span>
              </button>
            )}

            {/* Upload Excel */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer font-medium"
              title="Wczytaj plik Excel z danymi OFWCA, agencji i przypisaniami"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Wgraj Excel (.xlsx)</span>
            </button>

            {/* Load Demo */}
            <button
              onClick={onLoadDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer font-medium"
              title="Załaduj realistyczny zbiór danych dla 16 województw"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Dane demo</span>
            </button>

            {/* Download Template */}
            <button
              onClick={onDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer font-medium"
              title="Pobierz szablon Excel ze strukturą 'baza', 'MS_lista', 'RMS_lista'"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Szablon</span>
            </button>

            {/* Export Modeled */}
            <button
              onClick={onExportModeled}
              disabled={totalRecordsCount === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-md shadow-emerald-500/20 transition cursor-pointer"
              title="Eksportuj zbalansowaną strukturę i raport do pliku Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Eksportuj model (.xlsx)</span>
            </button>

            {/* Installation & Local Database & Google API Button */}
            <button
              onClick={onOpenInstallation}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition cursor-pointer font-medium ${
                hasGoogleKey
                  ? 'bg-blue-950/70 hover:bg-blue-900/70 text-blue-200 border-blue-700/60'
                  : 'bg-amber-950/70 hover:bg-amber-900/70 text-amber-200 border-amber-700/60'
              }`}
              title="Paczka instalacyjna PC, wydajna baza lokalna IndexedDB i klucze Google API (Maps & AI)"
            >
              <Laptop className="w-3.5 h-3.5 text-blue-400" />
              <span>Paczka & Baza PC</span>
              {hasGoogleKey ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" title="Google API Aktywne" />
              ) : (
                <span title="Wymaga klucza Google API">
                  <Key className="w-3 h-3 text-amber-400" />
                </span>
              )}
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'map'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Mapa Administracyjna (ODL GIS)</span>
          </button>

          <button
            onClick={() => setActiveTab('balance')}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'balance'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Bilans i Wyrównanie (MS / RMS)</span>
          </button>

          <button
            onClick={() => setActiveTab('workbench')}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'workbench'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Warsztat Przenoszenia</span>
          </button>

          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'hierarchy'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analityka i Hierarchia</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Kontrola i Audyt Danych</span>
            {auditIssuesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                {auditIssuesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-cyan-300" />
            <span>Doradca AI (Gemini 2.5)</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'docs'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Dokumentacja Aplikacji</span>
          </button>
        </div>
      </div>
    </header>
  );
};

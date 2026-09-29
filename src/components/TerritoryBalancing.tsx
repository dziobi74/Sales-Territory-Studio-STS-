import React, { useState, useMemo } from 'react';
import { 
  TerritoryBalanceMetric, 
  RMSBalanceMetric, 
  CoordinatorMS, 
  CoordinatorRMS, 
  OFWCARecord 
} from '../types';
import { calculateVoivodeshipTerritoryBreakdown } from '../utils/balancer';
import { POLAND_VOIVODESHIPS } from '../data/polandGeo';
import { 
  Scale, 
  Users, 
  Sparkles, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  Compass, 
  Building2, 
  UserCheck, 
  ChevronRight,
  TrendingUp,
  MapPin
} from 'lucide-react';

interface TerritoryBalancingProps {
  metrics: TerritoryBalanceMetric[];
  rmsMetrics: RMSBalanceMetric[];
  records: OFWCARecord[];
  msList: CoordinatorMS[];
  rmsList: CoordinatorRMS[];
  gwpStdDevInitial: number;
  gwpStdDevCurrent: number;
  ofwcaStdDevInitial: number;
  ofwcaStdDevCurrent: number;
  averageGwp2026: number;
  averageActiveOfwca: number;
  onOpenAutoBalance: () => void;
}

type ViewSubMode = 'ms' | 'rms' | 'voivodeship_territory';

export const TerritoryBalancing: React.FC<TerritoryBalancingProps> = ({
  metrics,
  rmsMetrics,
  records,
  msList,
  rmsList,
  gwpStdDevInitial,
  gwpStdDevCurrent,
  ofwcaStdDevInitial,
  ofwcaStdDevCurrent,
  averageGwp2026,
  averageActiveOfwca,
  onOpenAutoBalance,
}) => {
  const [subView, setSubView] = useState<ViewSubMode>('ms');
  const [selectedRmsFilter, setSelectedRmsFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedVoivodeshipFilter, setSelectedVoivodeshipFilter] = useState<string>('all');

  // Filtered metrics for MS view
  const filteredMetrics = useMemo(() => {
    return metrics.filter(m => {
      if (selectedRmsFilter !== 'all' && m.rmsName !== selectedRmsFilter) return false;
      if (selectedStatusFilter !== 'all' && m.workloadStatus !== selectedStatusFilter) return false;
      if (searchTerm && !m.msName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [metrics, selectedRmsFilter, selectedStatusFilter, searchTerm]);

  // Filtered RMS metrics
  const filteredRmsMetrics = useMemo(() => {
    return rmsMetrics.filter(r => {
      if (searchTerm && !r.rmsName.toLowerCase().includes(searchTerm.toLowerCase()) && !r.region.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [rmsMetrics, searchTerm]);

  // Voivodeship territory breakdown: Z terenu vs Z poza z DKP/DPD
  const voivodeshipBreakdowns = useMemo(() => {
    return calculateVoivodeshipTerritoryBreakdown(records, msList);
  }, [records, msList]);

  // Filtered voivodeship breakdown
  const filteredVoivodeshipBreakdowns = useMemo(() => {
    if (selectedVoivodeshipFilter === 'all') return voivodeshipBreakdowns;
    return voivodeshipBreakdowns.filter(b => b.voivodeship.toLowerCase() === selectedVoivodeshipFilter.toLowerCase());
  }, [voivodeshipBreakdowns, selectedVoivodeshipFilter]);

  const formatPLN = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)} mln zł`;
    return `${(val / 1_000).toFixed(0)} tys. zł`;
  };

  // Reduction in variance / std dev
  const gwpStdDevDiff = gwpStdDevInitial > 0 ? ((gwpStdDevInitial - gwpStdDevCurrent) / gwpStdDevInitial) * 100 : 0;
  const ofwcaStdDevDiff = ofwcaStdDevInitial > 0 ? ((ofwcaStdDevInitial - ofwcaStdDevCurrent) / ofwcaStdDevInitial) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner: Workload Leveling & Optimization Summary */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Scale className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Wyrównanie Sił Sprzedażowych i Obciążenia Koordynatorów
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Panel analityczno-bilansujący STS v1.0. Porównuj stan początkowy z modelowanym dla Koordynatorów (MS), Dyrektorów (RMS) oraz analizuj spójność terytoriów (Z terenu vs Z poza z podziałem na DKP i DPD).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAutoBalance}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition active:scale-95 cursor-pointer border border-indigo-400/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>Asystent Auto-Balansowania</span>
            </button>
          </div>
        </div>

        {/* Statistical Variance Reduction Indicators */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400">Cel średni GWP 2026 na MS:</div>
            <div className="text-base font-bold text-white mt-0.5">{formatPLN(averageGwp2026)}</div>
            <div className="text-[10px] text-slate-500 mt-1">±15% tolerancja optymalna</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400">Cel średni aktywnych OFWCA:</div>
            <div className="text-base font-bold text-white mt-0.5">{averageActiveOfwca.toFixed(1)} OFWCA</div>
            <div className="text-[10px] text-slate-500 mt-1">na jednego koordynatora</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400">Odchylenie stand. GWP 2026:</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-base font-bold text-white">{formatPLN(gwpStdDevCurrent)}</span>
              {gwpStdDevDiff > 0 ? (
                <span className="text-[11px] font-semibold text-emerald-400">
                  (-{gwpStdDevDiff.toFixed(1)}% dysproporcji)
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">Baza początkowa</span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Początkowe: {formatPLN(gwpStdDevInitial)}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400">Odchylenie stand. OFWCA:</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-base font-bold text-white">{ofwcaStdDevCurrent.toFixed(1)}</span>
              {ofwcaStdDevDiff > 0 ? (
                <span className="text-[11px] font-semibold text-emerald-400">
                  (-{ofwcaStdDevDiff.toFixed(1)}%)
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">Baza początkowa</span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Początkowe: {ofwcaStdDevInitial.toFixed(1)}</div>
          </div>
        </div>
      </div>

      {/* Sub-View Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-2.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setSubView('ms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
              subView === 'ms'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Widok Koordynatorów (MS)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-950/60 text-[10px]">
              {metrics.length}
            </span>
          </button>

          <button
            onClick={() => setSubView('rms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
              subView === 'rms'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Widok Dyrektorów (RMS)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-950/60 text-[10px]">
              {rmsMetrics.length}
            </span>
          </button>

          <button
            onClick={() => setSubView('voivodeship_territory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
              subView === 'voivodeship_territory'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4 text-cyan-300" />
            <span>Analiza Województw: Teren vs Poza Terenem (DKP / DPD)</span>
          </button>
        </div>

        {/* Global Search inside Tab */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder={
              subView === 'ms' 
                ? 'Szukaj koordynatora (MS)...' 
                : subView === 'rms' 
                ? 'Szukaj dyrektora (RMS)...' 
                : 'Szukaj w analizie terytoriów...'
            }
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBVIEW 1: KOORDYNATORZY (MS) */}
      {/* ========================================================================= */}
      {subView === 'ms' && (
        <div className="space-y-4">
          {/* Secondary filter toolbar for MS */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-300">Filtry MS:</span>

              <select
                value={selectedRmsFilter}
                onChange={e => setSelectedRmsFilter(e.target.value)}
                className="rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">Wszyscy Dyrektorzy (RMS)</option>
                {rmsList.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>

              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                className="rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">Każde obciążenie</option>
                <option value="Przeładowany">Przeładowani (&gt;115%)</option>
                <option value="Optymalny">Optymalni (85-115%)</option>
                <option value="Niedociążony">Niedociążeni (&lt;85%)</option>
              </select>
            </div>

            <div className="text-[11px] text-slate-400">
              Wyświetlanie <strong className="text-white">{filteredMetrics.length}</strong> z {metrics.length} koordynatorów
            </div>
          </div>

          {/* MS Side-by-Side Balance Table with Detailed DKP / DPD Breakdown */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Koordynator (MS)</th>
                    <th className="py-3.5 px-4">Dyrektor (RMS)</th>
                    <th className="py-3.5 px-4 text-center">Status Obciążenia</th>
                    <th className="py-3.5 px-4">Indeks Balansu</th>
                    <th className="py-3.5 px-4 text-center">OFWCA Łącznie (Przed → Po)</th>
                    <th className="py-3.5 px-4 text-center">OFWCA DKP</th>
                    <th className="py-3.5 px-4 text-center">OFWCA DPD</th>
                    <th className="py-3.5 px-4 text-right">GWP 2026 (Przed → Po)</th>
                    <th className="py-3.5 px-4 text-right">GWP DKP / DPD</th>
                    <th className="py-3.5 px-4">Obszar działania</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredMetrics.map(item => {
                    const isOverloaded = item.workloadStatus === 'Przeładowany';
                    const isUnderloaded = item.workloadStatus === 'Niedociążony';

                    return (
                      <tr key={item.msName} className="hover:bg-slate-800/40 transition group">
                        {/* Coordinator name */}
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="truncate">{item.msName}</span>
                          </div>
                        </td>

                        {/* RMS name */}
                        <td className="py-3.5 px-4 text-slate-400">
                          <span className="truncate max-w-[140px] block">{item.rmsName}</span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 text-center">
                          {isOverloaded && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/30">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Przeładowany</span>
                            </span>
                          )}
                          {isUnderloaded && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Niedociążony</span>
                            </span>
                          )}
                          {!isOverloaded && !isUnderloaded && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Optymalny</span>
                            </span>
                          )}
                        </td>

                        {/* Workload Progress Bar */}
                        <td className="py-3.5 px-4 min-w-[130px]">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-slate-400 font-medium">Wskaźnik:</span>
                            <strong className="text-white">{Math.round(item.workloadIndex)}%</strong>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                isOverloaded
                                  ? 'bg-rose-500'
                                  : isUnderloaded
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, (item.workloadIndex / 150) * 100)}%` }}
                            />
                          </div>
                        </td>

                        {/* OFWCA Before vs After */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 font-semibold">
                            <span className="text-slate-400">{item.initialOfwcaCount}</span>
                            <ArrowRight className="w-3 h-3 text-slate-600" />
                            <span className="text-white font-bold">{item.currentOfwcaCount}</span>
                            {item.deltaOfwca !== 0 && (
                              <span
                                className={`text-[10px] px-1 rounded font-bold ${
                                  item.deltaOfwca > 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                                }`}
                              >
                                {item.deltaOfwca > 0 ? `+${item.deltaOfwca}` : item.deltaOfwca}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            ({item.currentActiveOfwcaCount} aktywnych)
                          </span>
                        </td>

                        {/* OFWCA DKP */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold border border-violet-500/30 text-[11px]">
                              {item.currentDkpCount} DKP
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {item.currentOfwcaCount > 0 ? ((item.currentDkpCount / item.currentOfwcaCount) * 100).toFixed(0) : 0}% udziału
                          </span>
                        </td>

                        {/* OFWCA DPD */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30 text-[11px]">
                              {item.currentDpdCount} DPD
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {item.currentOfwcaCount > 0 ? ((item.currentDpdCount / item.currentOfwcaCount) * 100).toFixed(0) : 0}% udziału
                          </span>
                        </td>

                        {/* GWP 2026 Before vs After */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-bold text-white">
                            {formatPLN(item.currentGwp2026)}
                          </div>
                          {item.deltaGwp2026 !== 0 ? (
                            <div
                              className={`text-[10px] font-semibold ${
                                item.deltaGwp2026 > 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {item.deltaGwp2026 > 0 ? '+' : ''}{formatPLN(item.deltaGwp2026)} (
                              {item.deltaGwpPercent > 0 ? '+' : ''}{item.deltaGwpPercent.toFixed(1)}%)
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-500">Bez zmian</div>
                          )}
                        </td>

                        {/* GWP DKP / DPD */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="text-violet-300 font-semibold text-[11px]">
                            {formatPLN(item.currentDkpGwp2026)}
                          </div>
                          <div className="text-sky-300 text-[10px]">
                            {formatPLN(item.currentDpdGwp2026)}
                          </div>
                        </td>

                        {/* Voivodeships & Powiats */}
                        <td className="py-3.5 px-4 text-slate-300">
                          <div className="truncate max-w-[150px]" title={item.wojewodztwa.join(', ')}>
                            {item.wojewodztwa.length > 0 ? item.wojewodztwa.join(', ') : 'Brak'}
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            {item.powiatyCount} powiatów
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBVIEW 2: DYREKTORZY REGIONALNI (RMS) */}
      {/* ========================================================================= */}
      {subView === 'rms' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>
                Widok zagregowany dla <strong>Dyrektorów Regionalnych (RMS)</strong> wraz z rozbiciem sieci OFWCA na DKP i DPD oraz podległych menadżerów.
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Liczba Dyrektorów: <strong className="text-white">{filteredRmsMetrics.length}</strong>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Dyrektor (RMS)</th>
                    <th className="py-3.5 px-4">Region</th>
                    <th className="py-3.5 px-4 text-center">Podlegli MS</th>
                    <th className="py-3.5 px-4 text-center">OFWCA Łącznie</th>
                    <th className="py-3.5 px-4 text-center">OFWCA DKP (udział %)</th>
                    <th className="py-3.5 px-4 text-center">OFWCA DPD (udział %)</th>
                    <th className="py-3.5 px-4 text-center">Agenci</th>
                    <th className="py-3.5 px-4 text-right">GWP 2025</th>
                    <th className="py-3.5 px-4 text-right">GWP 2026 (Przed → Po)</th>
                    <th className="py-3.5 px-4 text-right">GWP DKP / DPD</th>
                    <th className="py-3.5 px-4">Województwa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredRmsMetrics.map(rms => {
                    const dkpPct = rms.currentOfwcaCount > 0 ? (rms.currentDkpCount / rms.currentOfwcaCount) * 100 : 0;
                    const dpdPct = rms.currentOfwcaCount > 0 ? (rms.currentDpdCount / rms.currentOfwcaCount) * 100 : 0;

                    return (
                      <tr key={rms.rmsName} className="hover:bg-slate-800/40 transition">
                        {/* RMS Name */}
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: rms.color }}
                            />
                            <span>{rms.rmsName}</span>
                          </div>
                        </td>

                        {/* Region */}
                        <td className="py-3.5 px-4 text-slate-300 font-medium">
                          {rms.region}
                        </td>

                        {/* Subordinate MS count & names */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 text-xs">
                            {rms.msNames.length} MS
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-1 truncate max-w-[130px] mx-auto" title={rms.msNames.join(', ')}>
                            {rms.msNames.join(', ')}
                          </span>
                        </td>

                        {/* OFWCA Total Before vs After */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 font-semibold">
                            <span className="text-slate-400">{rms.initialOfwcaCount}</span>
                            <ArrowRight className="w-3 h-3 text-slate-600" />
                            <span className="text-white font-bold">{rms.currentOfwcaCount}</span>
                            {rms.deltaOfwca !== 0 && (
                              <span
                                className={`text-[10px] px-1 rounded font-bold ${
                                  rms.deltaOfwca > 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                                }`}
                              >
                                {rms.deltaOfwca > 0 ? `+${rms.deltaOfwca}` : rms.deltaOfwca}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            ({rms.currentActiveOfwcaCount} aktywnych)
                          </span>
                        </td>

                        {/* OFWCA DKP */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            <span className="px-2.5 py-1 rounded bg-violet-500/20 text-violet-300 font-bold border border-violet-500/30 text-xs">
                              {rms.currentDkpCount} DKP
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                            {dkpPct.toFixed(1)}% sieci
                          </span>
                        </td>

                        {/* OFWCA DPD */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            <span className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30 text-xs">
                              {rms.currentDpdCount} DPD
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                            {dpdPct.toFixed(1)}% sieci
                          </span>
                        </td>

                        {/* Agents */}
                        <td className="py-3.5 px-4 text-center text-slate-300 font-semibold">
                          {rms.currentAgentCount}
                        </td>

                        {/* GWP 2025 */}
                        <td className="py-3.5 px-4 text-right text-slate-400">
                          {formatPLN(rms.currentGwp2025)}
                        </td>

                        {/* GWP 2026 Before vs After */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-bold text-white">
                            {formatPLN(rms.currentGwp2026)}
                          </div>
                          {rms.deltaGwp2026 !== 0 ? (
                            <div
                              className={`text-[10px] font-semibold ${
                                rms.deltaGwp2026 > 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {rms.deltaGwp2026 > 0 ? '+' : ''}{formatPLN(rms.deltaGwp2026)} (
                              {rms.deltaGwpPercent > 0 ? '+' : ''}{rms.deltaGwpPercent.toFixed(1)}%)
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-500">Bez zmian</div>
                          )}
                        </td>

                        {/* GWP DKP vs DPD */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="text-violet-300 font-semibold text-[11px]">
                            {formatPLN(rms.currentDkpGwp2026)}
                          </div>
                          <div className="text-sky-300 text-[10px]">
                            {formatPLN(rms.currentDpdGwp2026)}
                          </div>
                        </td>

                        {/* Voivodeships list */}
                        <td className="py-3.5 px-4 text-slate-300">
                          <div className="truncate max-w-[150px]" title={rms.wojewodztwa.join(', ')}>
                            {rms.wojewodztwa.length > 0 ? rms.wojewodztwa.join(', ') : 'Brak'}
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            {rms.powiatyCount} powiatów
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBVIEW 3: ANALIZA WOJEWÓDZTW - TEREN VS POZA TERENEM Z DKP/DPD */}
      {/* ========================================================================= */}
      {subView === 'voivodeship_territory' && (
        <div className="space-y-6">
          {/* Informational Header */}
          <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Analiza Spójności Terytoriów Wojewódzkich: „Z terenu” vs „Z poza terenu” (DKP / DPD)</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Kluczowy moduł do weryfikacji dysproporcji geograficznych. Wskazuje dla każdego województwa, którzy koordynatorzy (MS) działają na danym terenie, ilu sprzedawców (OFWCA) pochodzi z ich naturalnego rejonu macierzystego (<strong>„Z terenu”</strong>), a ilu to rozproszone przypisania z innych województw (<strong>„Z poza terenu”</strong>), wraz z dokładnym rozbiciem na kanały <strong>DKP</strong> i <strong>DPD</strong>.
            </p>
          </div>

          {/* Filter Bar for Voivodeship Selection */}
          <div className="flex items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-white">Wybierz województwo do szczegółowej analizy:</span>
              <select
                value={selectedVoivodeshipFilter}
                onChange={e => setSelectedVoivodeshipFilter(e.target.value)}
                className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
              >
                <option value="all">Wszystkie 16 województw (Zbiorczo)</option>
                {POLAND_VOIVODESHIPS.map(v => (
                  <option key={v.id} value={v.name}>{v.name} ({v.capital})</option>
                ))}
              </select>
            </div>

            <div className="text-[11px] text-slate-400">
              Liczba analizowanych województw: <strong className="text-white">{filteredVoivodeshipBreakdowns.length}</strong>
            </div>
          </div>

          {/* List of Voivodeships with their active MS breakdown */}
          <div className="space-y-6">
            {filteredVoivodeshipBreakdowns.map(vb => {
              return (
                <div
                  key={vb.voivodeship}
                  className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden"
                >
                  {/* Voivodeship Header Card */}
                  <div className="bg-slate-950/80 px-5 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400 text-sm">
                        {vb.voivodeship.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">
                            Województwo {vb.voivodeship}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold">
                            {vb.msRows.length} aktywnych MS
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-3">
                          <span>Łącznie w województwie: <strong className="text-white">{vb.totalOfwca} OFWCA</strong></span>
                          <span>•</span>
                          <span>Przypis: <strong className="text-emerald-400">{formatPLN(vb.totalGwp2026)}</strong></span>
                          <span>•</span>
                          <span>Struktura: <strong className="text-violet-300">{vb.totalDkp} DKP</strong> / <strong className="text-sky-300">{vb.totalDpd} DPD</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Voivodeship Territory Compactness Gauge */}
                    <div className="flex items-center gap-4 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Wskaźnik Zwartości Terenowej</div>
                        <div className="text-sm font-bold text-white mt-0.5">
                          {vb.territoryCompactnessPercent.toFixed(1)}% z terenu
                        </div>
                      </div>
                      <div className="w-20 bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                        <div
                          className={`h-2.5 rounded-full ${
                            vb.territoryCompactnessPercent >= 80
                              ? 'bg-emerald-500'
                              : vb.territoryCompactnessPercent >= 50
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, vb.territoryCompactnessPercent)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Table of MS operating in this voivodeship */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4">Koordynator (MS)</th>
                          <th className="py-3 px-4">Dyrektor (RMS)</th>
                          <th className="py-3 px-4 text-center">Status Terytorium</th>
                          <th className="py-3 px-4 text-center">Wszyscy OFWCA</th>
                          {/* In Territory Group */}
                          <th className="py-3 px-4 text-center bg-emerald-950/20 text-emerald-300 border-x border-slate-800">
                            Z Terenu (Łącznie)
                          </th>
                          <th className="py-3 px-4 text-center bg-emerald-950/10 text-emerald-400">
                            Z Terenu: DKP
                          </th>
                          <th className="py-3 px-4 text-center bg-emerald-950/10 text-emerald-400 border-r border-slate-800">
                            Z Terenu: DPD
                          </th>
                          {/* Out of Territory Group */}
                          <th className="py-3 px-4 text-center bg-amber-950/20 text-amber-300 border-x border-slate-800">
                            Z Poza Terenu (Łącznie)
                          </th>
                          <th className="py-3 px-4 text-center bg-amber-950/10 text-amber-400">
                            Z Poza: DKP
                          </th>
                          <th className="py-3 px-4 text-center bg-amber-950/10 text-amber-400 border-r border-slate-800">
                            Z Poza: DPD
                          </th>
                          <th className="py-3 px-4 text-right">GWP 2026 w woj.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {vb.msRows.map(row => {
                          return (
                            <tr key={row.msName} className="hover:bg-slate-800/30 transition">
                              {/* MS Name */}
                              <td className="py-3 px-4 font-bold text-white">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ backgroundColor: row.color }}
                                  />
                                  <span>{row.msName}</span>
                                </div>
                              </td>

                              {/* RMS */}
                              <td className="py-3 px-4 text-slate-400">
                                {row.rmsName}
                              </td>

                              {/* Is Primary Territory Badge */}
                              <td className="py-3 px-4 text-center">
                                {row.isPrimaryTerritory ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Teren Macierzysty</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[10px] border border-amber-500/30">
                                    <Compass className="w-3 h-3" />
                                    <span>Obsługa Zewnętrzna</span>
                                  </span>
                                )}
                              </td>

                              {/* Total OFWCA of MS in this Voivodeship */}
                              <td className="py-3 px-4 text-center font-bold text-white">
                                {row.totalOfwcaInVoivodeship}
                              </td>

                              {/* IN TERRITORY: TOTAL */}
                              <td className="py-3 px-4 text-center font-bold text-emerald-300 bg-emerald-950/20 border-x border-slate-800">
                                {row.inTerritoryOfwca}
                              </td>

                              {/* IN TERRITORY: DKP */}
                              <td className="py-3 px-4 text-center text-violet-300 font-semibold bg-emerald-950/10">
                                {row.inTerritoryDkp}
                              </td>

                              {/* IN TERRITORY: DPD */}
                              <td className="py-3 px-4 text-center text-sky-300 font-semibold bg-emerald-950/10 border-r border-slate-800">
                                {row.inTerritoryDpd}
                              </td>

                              {/* OUT OF TERRITORY: TOTAL */}
                              <td className="py-3 px-4 text-center font-bold text-amber-300 bg-amber-950/20 border-x border-slate-800">
                                {row.outOfTerritoryOfwca}
                              </td>

                              {/* OUT OF TERRITORY: DKP */}
                              <td className="py-3 px-4 text-center text-violet-300 font-semibold bg-amber-950/10">
                                {row.outOfTerritoryDkp}
                              </td>

                              {/* OUT OF TERRITORY: DPD */}
                              <td className="py-3 px-4 text-center text-sky-300 font-semibold bg-amber-950/10 border-r border-slate-800">
                                {row.outOfTerritoryDpd}
                              </td>

                              {/* GWP 2026 */}
                              <td className="py-3 px-4 text-right font-bold text-white">
                                {formatPLN(row.gwp2026InVoivodeship)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

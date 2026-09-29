import React from 'react';
import { OFWCARecord, TerritoryBalanceMetric } from '../types';
import { TrendingUp, Users, Building2, ShieldCheck, Scale, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';

interface MetricCardsProps {
  records: OFWCARecord[];
  balanceMetrics: TerritoryBalanceMetric[];
  gwpStdDevInitial: number;
  gwpStdDevCurrent: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  records,
  balanceMetrics,
  gwpStdDevInitial,
  gwpStdDevCurrent,
}) => {
  // Aggregate business measures
  const totalGwp2025 = records.reduce((s, r) => s + r.gwp2025Total, 0);
  const totalGwp2026 = records.reduce((s, r) => s + r.gwp2026Total, 0);
  const totalDetal2026 = records.reduce((s, r) => s + r.gwp2026Detal, 0);
  const totalEduPs2026 = records.reduce((s, r) => s + r.gwp2026EduPs, 0);
  const growthRate = totalGwp2025 > 0 ? ((totalGwp2026 - totalGwp2025) / totalGwp2025) * 100 : 0;

  const totalOfwca = records.length;
  const activeOfwca = records.filter(r => r.isActive).length;
  const terminatedOfwca = totalOfwca - activeOfwca;

  const uniqueAgents = new Set(records.map(r => r.numerAgencji)).size;

  const dkpRecords = records.filter(r => r.isDkp);
  const dpdRecords = records.filter(r => !r.isDkp);
  const dkpGwp2026 = dkpRecords.reduce((s, r) => s + r.gwp2026Total, 0);
  const dpdGwp2026 = dpdRecords.reduce((s, r) => s + r.gwp2026Total, 0);
  const dkpPercent = totalOfwca > 0 ? (dkpRecords.length / totalOfwca) * 100 : 0;

  // Workload distribution
  const overloadedCount = balanceMetrics.filter(m => m.workloadStatus === 'Przeładowany').length;
  const underloadedCount = balanceMetrics.filter(m => m.workloadStatus === 'Niedociążony').length;
  const optimalCount = balanceMetrics.filter(m => m.workloadStatus === 'Optymalny').length;

  // Changed records
  const changedCount = records.filter(r => r.currentMs !== r.initialMs).length;

  const formatPLN = (val: number) => {
    if (val >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(2)} mln PLN`;
    }
    return `${(val / 1_000).toFixed(0)} tys. PLN`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-5">
      {/* 1. GWP 2026 & Dynamika */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 p-4 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Łączny GWP 2026</span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-white tracking-tight">
          {formatPLN(totalGwp2026)}
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 font-semibold text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +{growthRate.toFixed(1)}% vs 2025
          </span>
          <span className="text-slate-400">
            (GWP '25: {formatPLN(totalGwp2025)})
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-2 text-[10px] text-slate-400">
          <div>Detal: <strong className="text-slate-200">{formatPLN(totalDetal2026)}</strong></div>
          <div className="text-right">EDU PS: <strong className="text-slate-200">{formatPLN(totalEduPs2026)}</strong></div>
        </div>
      </div>

      {/* 2. OFWCA (Aktywni vs Zakończeni) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 p-4 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Sprzedawcy OFWCA</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-white tracking-tight">{activeOfwca}</span>
          <span className="text-xs font-medium text-emerald-400">aktywnych</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>Łącznie w bazie: <strong className="text-slate-200">{totalOfwca}</strong></span>
          {terminatedOfwca > 0 && (
            <span className="text-amber-400 font-medium">
              {terminatedOfwca} zakończonych
            </span>
          )}
        </div>
        <div className="mt-2.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${totalOfwca > 0 ? (activeOfwca / totalOfwca) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* 3. Agencje & Agenci */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 p-4 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Agencje i Partnerzy</span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-white tracking-tight">
          {uniqueAgents} agencji
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>Śr. OFWCA na agencję:</span>
          <strong className="text-slate-200">
            {uniqueAgents > 0 ? (totalOfwca / uniqueAgents).toFixed(1) : 0}
          </strong>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex justify-between">
          <span>Obsługiwane powiaty:</span>
          <strong className="text-cyan-400">
            {new Set(records.map(r => r.powiat).filter(Boolean)).size}
          </strong>
        </div>
      </div>

      {/* 4. Podział DKP vs DPD */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 p-4 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Struktura DKP / DPD</span>
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-violet-300">DKP: {dkpRecords.length}</span>
            <span className="text-[10px] text-slate-400 block">{dkpPercent.toFixed(0)}% bazy</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-sky-300">DPD: {dpdRecords.length}</span>
            <span className="text-[10px] text-slate-400 block">{(100 - dkpPercent).toFixed(0)}% bazy</span>
          </div>
        </div>
        <div className="mt-2 w-full bg-sky-950 rounded-full h-2 flex overflow-hidden border border-slate-700/50">
          <div
            className="bg-violet-500 h-2 transition-all duration-500"
            style={{ width: `${dkpPercent}%` }}
            title={`DKP: ${dkpPercent.toFixed(1)}%`}
          />
          <div
            className="bg-sky-500 h-2 transition-all duration-500"
            style={{ width: `${100 - dkpPercent}%` }}
            title={`DPD: ${(100 - dkpPercent).toFixed(1)}%`}
          />
        </div>
        <div className="mt-2 pt-1.5 flex justify-between text-[10px] text-slate-400">
          <span>DKP: {formatPLN(dkpGwp2026)}</span>
          <span>DPD: {formatPLN(dpdGwp2026)}</span>
        </div>
      </div>

      {/* 5. Balansowanie Koordynatorów (MS) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 p-4 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Obciążenie Koordynatorów</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white tracking-tight">{balanceMetrics.length} MS</span>
          <span className="text-[11px] text-slate-400">({optimalCount} w normie)</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-rose-400 font-medium">
            {overloadedCount} przeładowanych
          </span>
          <span className="text-amber-400 font-medium">
            {underloadedCount} niedociążonych
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
          <span className="text-slate-400">Zmiany w modelu:</span>
          {changedCount > 0 ? (
            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
              {changedCount} przeniesionych
            </span>
          ) : (
            <span className="text-slate-500">Baza początkowa</span>
          )}
        </div>
      </div>
    </div>
  );
};

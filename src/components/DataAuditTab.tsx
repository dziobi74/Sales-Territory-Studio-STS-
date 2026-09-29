import React, { useState } from 'react';
import { OFWCARecord, DataAuditReport } from '../types';
import { ShieldAlert, AlertTriangle, FileWarning, CheckCircle, Copy, MapPinOff, DollarSign, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface DataAuditTabProps {
  auditReport: DataAuditReport;
  records: OFWCARecord[];
}

type AuditFilter = 'all' | 'terminated' | 'location' | 'gwp' | 'duplicates';

export const DataAuditTab: React.FC<DataAuditTabProps> = ({
  auditReport,
  records
}) => {
  const [activeFilter, setActiveFilter] = useState<AuditFilter>('all');

  const filteredList = records.filter(r => {
    if (activeFilter === 'terminated') return r.isTerminated;
    if (activeFilter === 'location') return r.hasLocationIssue;
    if (activeFilter === 'gwp') return r.hasGwpIssue;
    if (activeFilter === 'duplicates') return r.isDuplicate;
    // all issues
    return r.isTerminated || r.hasLocationIssue || r.hasGwpIssue || r.isDuplicate;
  });

  const exportAuditIssuesToExcel = () => {
    const wb = XLSX.utils.book_new();

    const rows = filteredList.map(r => ({
      'Numer OFWCA': r.numerOfwca,
      'Nazwa agenta': r.nazwaAgenta,
      'Numer agencji': r.numerAgencji,
      'Województwo': r.wojewodztwo,
      'Powiat': r.powiat,
      'Kod pocztowy': r.kodPocztowy,
      'Pracuje do': r.pracujeDo || '',
      'Status aktywności': r.isActive ? 'AKTYWNY' : 'ZAKOŃCZONY',
      'GWP 2026': r.gwp2026Total,
      'Koordynator (MS)': r.currentMs,
      'Problemy i uwagi': (r.warnings || []).join('; ')
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Weryfikacja_Bledow');
    XLSX.writeFile(wb, 'ODL_Raport_Audytu_Danych.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-slate-900 p-5 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-white tracking-wide">
              Kontrola Spójności i Audyt Jakości Danych
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Automatyczna weryfikacja rekordów zakończonych („Pracuje do”), braków lokalizacyjnych, zerowych wolumenów GWP oraz potencjalnych duplikatów OFWCA.
          </p>
        </div>

        <button
          onClick={exportAuditIssuesToExcel}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Eksportuj listę do weryfikacji</span>
        </button>
      </div>

      {/* KPI Cards for Audit Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Terminated */}
        <div
          onClick={() => setActiveFilter('terminated')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeFilter === 'terminated'
              ? 'bg-amber-950/40 border-amber-500 shadow-lg'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Zakończone („Pracuje do”)</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {auditReport.terminatedCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Wymagają odłączenia z portfela aktywnego
          </div>
        </div>

        {/* Missing Location */}
        <div
          onClick={() => setActiveFilter('location')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeFilter === 'location'
              ? 'bg-amber-950/40 border-amber-500 shadow-lg'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Brak Lokalizacji</span>
            <MapPinOff className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">
            {auditReport.missingLocationCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Brak powiatu lub kodu pocztowego
          </div>
        </div>

        {/* Missing GWP */}
        <div
          onClick={() => setActiveFilter('gwp')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeFilter === 'gwp'
              ? 'bg-amber-950/40 border-amber-500 shadow-lg'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Braki GWP (Zerowe)</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {auditReport.missingGwpCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Rekordy bez przypisanej sprzedaży
          </div>
        </div>

        {/* Duplicates */}
        <div
          onClick={() => setActiveFilter('duplicates')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            activeFilter === 'duplicates'
              ? 'bg-amber-950/40 border-amber-500 shadow-lg'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Duplikaty OFWCA</span>
            <Copy className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">
            {auditReport.duplicatesCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Wielokrotne powiązania w agencjach
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800 text-xs">
        <span className="text-slate-400 px-2 font-medium">Filtr widoku:</span>
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Wszystkie problemy ({filteredList.length})
        </button>
        <button
          onClick={() => setActiveFilter('terminated')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeFilter === 'terminated' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Zakończeni ({auditReport.terminatedCount})
        </button>
        <button
          onClick={() => setActiveFilter('location')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeFilter === 'location' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Brak lokalizacji ({auditReport.missingLocationCount})
        </button>
        <button
          onClick={() => setActiveFilter('gwp')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeFilter === 'gwp' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Braki GWP ({auditReport.missingGwpCount})
        </button>
        <button
          onClick={() => setActiveFilter('duplicates')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
            activeFilter === 'duplicates' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Duplikaty ({auditReport.duplicatesCount})
        </button>
      </div>

      {/* Audit Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-[10px] uppercase text-slate-400 font-semibold tracking-wider z-10">
              <tr>
                <th className="py-3 px-4">Numer OFWCA</th>
                <th className="py-3 px-4">Agent / Agencja</th>
                <th className="py-3 px-4">Lokalizacja</th>
                <th className="py-3 px-4">Pracuje do</th>
                <th className="py-3 px-4 text-right">GWP 2026</th>
                <th className="py-3 px-4">Koordynator</th>
                <th className="py-3 px-4">Wykryte niezgodności</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredList.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {rec.numerOfwca}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{rec.nazwaAgenta}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{rec.numerAgencji}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <div>{rec.wojewodztwo || <span className="text-rose-400">Brak</span>}</div>
                    <div className="text-[10px] text-slate-500">
                      {rec.powiat || <span className="text-rose-400">Brak powiatu</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {rec.pracujeDo ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-[11px] border border-amber-500/30">
                        {rec.pracujeDo}
                      </span>
                    ) : (
                      <span className="text-emerald-400 text-[11px]">Brak (Aktywny)</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-200">
                    {rec.gwp2026Total.toLocaleString()} zł
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {rec.currentMs}
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      {(rec.warnings || []).map((w, idx) => (
                        <div
                          key={idx}
                          className="text-[10px] text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20 inline-block mr-1"
                        >
                          {w}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

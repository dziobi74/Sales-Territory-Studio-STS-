import React, { useState, useMemo } from 'react';
import { OFWCARecord, CoordinatorMS, CoordinatorRMS } from '../types';
import { RefreshCw, Search, Filter, Check, ArrowRightLeft, Layers, Building2, UserCheck, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ReassignmentWorkbenchProps {
  records: OFWCARecord[];
  msList: CoordinatorMS[];
  rmsList: CoordinatorRMS[];
  onReassignBatch: (recordIds: string[], targetMsName: string, reason?: string) => void;
  onResetRecord: (recordId: string) => void;
}

type WorkbenchTab = 'ofwca' | 'powiat' | 'agent';

export const ReassignmentWorkbench: React.FC<ReassignmentWorkbenchProps> = ({
  records,
  msList,
  rmsList,
  onReassignBatch,
  onResetRecord
}) => {
  const [activeTab, setActiveTab] = useState<WorkbenchTab>('ofwca');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetMs, setTargetMs] = useState<string>(msList[0]?.name || '');

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterWoj, setFilterWoj] = useState<string>('all');
  const [filterMs, setFilterMs] = useState<string>('all');
  const [filterDkp, setFilterDkp] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Unique lists for dropdowns
  const uniqueVoivodeships = useMemo(() => {
    return Array.from(new Set(records.map(r => r.wojewodztwo).filter(Boolean))).sort();
  }, [records]);

  // Filtered OFWCA records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (filterWoj !== 'all' && r.wojewodztwo !== filterWoj) return false;
      if (filterMs !== 'all' && r.currentMs !== filterMs) return false;
      if (filterDkp === 'dkp' && !r.isDkp) return false;
      if (filterDkp === 'dpd' && r.isDkp) return false;
      if (filterStatus === 'active' && !r.isActive) return false;
      if (filterStatus === 'terminated' && r.isActive) return false;

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchOfwca = r.numerOfwca.toLowerCase().includes(q);
        const matchAgent = r.nazwaAgenta.toLowerCase().includes(q);
        const matchAgencyNr = r.numerAgencji.toLowerCase().includes(q);
        const matchPowiat = (r.powiat || '').toLowerCase().includes(q);
        const matchOddzial = (r.oddzial || '').toLowerCase().includes(q);
        if (!matchOfwca && !matchAgent && !matchAgencyNr && !matchPowiat && !matchOddzial) {
          return false;
        }
      }

      return true;
    });
  }, [records, filterWoj, filterMs, filterDkp, filterStatus, searchTerm]);

  // Aggregated Powiats
  const aggregatedPowiats = useMemo(() => {
    const map = new Map<string, {
      powiatName: string;
      wojewodztwo: string;
      records: OFWCARecord[];
      gwp2026: number;
      dominantMs: string;
      msCounts: Map<string, number>;
    }>();

    records.forEach(r => {
      const powKey = `${r.wojewodztwo || 'Nieznane'}___${r.powiat || 'Brak powiatu'}`;
      if (!map.has(powKey)) {
        map.set(powKey, {
          powiatName: r.powiat || 'Brak powiatu',
          wojewodztwo: r.wojewodztwo || 'Nieznane',
          records: [],
          gwp2026: 0,
          dominantMs: '',
          msCounts: new Map()
        });
      }
      const item = map.get(powKey)!;
      item.records.push(r);
      item.gwp2026 += r.gwp2026Total;
      const count = item.msCounts.get(r.currentMs) || 0;
      item.msCounts.set(r.currentMs, count + 1);
    });

    map.forEach(item => {
      let maxC = -1;
      let dom = '';
      item.msCounts.forEach((c, ms) => {
        if (c > maxC) {
          maxC = c;
          dom = ms;
        }
      });
      item.dominantMs = dom;
    });

    return Array.from(map.values())
      .filter(item => {
        if (filterWoj !== 'all' && item.wojewodztwo !== filterWoj) return false;
        if (filterMs !== 'all' && item.dominantMs !== filterMs) return false;
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          return item.powiatName.toLowerCase().includes(q) || item.wojewodztwo.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => b.gwp2026 - a.gwp2026);
  }, [records, filterWoj, filterMs, searchTerm]);

  // Aggregated Agents
  const aggregatedAgents = useMemo(() => {
    const map = new Map<string, {
      agencyNumber: string;
      agentName: string;
      wojewodztwo: string;
      records: OFWCARecord[];
      gwp2026: number;
      currentMs: string;
    }>();

    records.forEach(r => {
      const agKey = r.numerAgencji;
      if (!map.has(agKey)) {
        map.set(agKey, {
          agencyNumber: r.numerAgencji,
          agentName: r.nazwaAgenta,
          wojewodztwo: r.wojewodztwo,
          records: [],
          gwp2026: 0,
          currentMs: r.currentMs
        });
      }
      const item = map.get(agKey)!;
      item.records.push(r);
      item.gwp2026 += r.gwp2026Total;
    });

    return Array.from(map.values())
      .filter(item => {
        if (filterWoj !== 'all' && item.wojewodztwo !== filterWoj) return false;
        if (filterMs !== 'all' && item.currentMs !== filterMs) return false;
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          return item.agentName.toLowerCase().includes(q) || item.agencyNumber.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => b.gwp2026 - a.gwp2026);
  }, [records, filterWoj, filterMs, searchTerm]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredRecords.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBatchApply = () => {
    if (selectedIds.length === 0 || !targetMs) return;
    onReassignBatch(selectedIds, targetMs, `Hurtowe przypisanie ${selectedIds.length} OFWCA`);
    setSelectedIds([]);
  };

  const handleReassignPowiat = (powiatRecords: OFWCARecord[], newMs: string) => {
    const ids = powiatRecords.map(r => r.id);
    onReassignBatch(ids, newMs, `Przeniesienie powiatu: ${powiatRecords[0]?.powiat}`);
  };

  const handleReassignAgent = (agentRecords: OFWCARecord[], newMs: string) => {
    const ids = agentRecords.map(r => r.id);
    onReassignBatch(ids, newMs, `Przeniesienie agencji: ${agentRecords[0]?.nazwaAgenta}`);
  };

  const formatPLN = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)} mln zł`;
    return `${(val / 1_000).toFixed(0)} tys. zł`;
  };

  return (
    <div className="space-y-5">
      {/* Top Reassignment Workbench Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ArrowRightLeft className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Warsztat Przenoszenia i Modyfikacji Struktury
            </h2>
            <p className="text-xs text-slate-400">
              Przenoś zasoby na poziomie Powiatu, Agencji lub pojedynczego OFWCA.
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => { setActiveTab('ofwca'); setSelectedIds([]); }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ofwca'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Poziom OFWCA ({records.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab('powiat'); setSelectedIds([]); }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'powiat'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Poziom Powiatu</span>
          </button>
          <button
            onClick={() => { setActiveTab('agent'); setSelectedIds([]); }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'agent'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Poziom Agencji</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-xs">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Szukaj OFWCA, agenta, numeru, powiatu..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <select
            value={filterWoj}
            onChange={e => setFilterWoj(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Wszystkie województwa</option>
            {uniqueVoivodeships.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterMs}
            onChange={e => setFilterMs(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Wszyscy MS</option>
            {msList.map(ms => (
              <option key={ms.id} value={ms.name}>{ms.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterDkp}
            onChange={e => setFilterDkp(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Wszyscy (DKP & DPD)</option>
            <option value="dkp">Tylko DKP</option>
            <option value="dpd">Tylko DPD</option>
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Każdy status aktywności</option>
            <option value="active">Tylko Aktywni</option>
            <option value="terminated">Zakończeni (Pracuje do)</option>
          </select>
        </div>
      </div>

      {/* Level 1: OFWCA Table View */}
      {activeTab === 'ofwca' && (
        <div className="space-y-3">
          {/* Batch Floating Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="font-semibold">
                Zaznaczono: <strong className="text-blue-400">{selectedIds.length}</strong> z {filteredRecords.length}
              </span>
              {selectedIds.length > 0 && (
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Wyczyść zaznaczenie
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Przypisz zaznaczonych do:</span>
              <select
                value={targetMs}
                onChange={e => setTargetMs(e.target.value)}
                className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {msList.map(ms => (
                  <option key={ms.id} value={ms.name}>{ms.name}</option>
                ))}
              </select>
              <button
                onClick={handleBatchApply}
                disabled={selectedIds.length === 0}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Zastosuj zmianę</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-950 z-10 border-b border-slate-800 text-[10px] uppercase text-slate-400 font-semibold tracking-wider">
                  <tr>
                    <th className="py-3 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredRecords.length && filteredRecords.length > 0}
                        onChange={handleSelectAll}
                        className="rounded bg-slate-800 border-slate-700 text-blue-600"
                      />
                    </th>
                    <th className="py-3 px-3">OFWCA & Agent</th>
                    <th className="py-3 px-3">Nr Agencji</th>
                    <th className="py-3 px-3">Typ</th>
                    <th className="py-3 px-3">Lokalizacja</th>
                    <th className="py-3 px-3 text-right">GWP 2025</th>
                    <th className="py-3 px-3 text-right">GWP 2026</th>
                    <th className="py-3 px-3">Aktualny Koordynator (MS)</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredRecords.map(r => {
                    const isSelected = selectedIds.includes(r.id);
                    const isMoved = r.currentMs !== r.initialMs;

                    return (
                      <tr
                        key={r.id}
                        className={`hover:bg-slate-800/40 transition ${
                          isSelected ? 'bg-blue-950/30' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedIds(prev =>
                                isSelected ? prev.filter(id => id !== r.id) : [...prev, r.id]
                              );
                            }}
                            className="rounded bg-slate-800 border-slate-700 text-blue-600"
                          />
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{r.nazwaAgenta}</div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                            <span>ID: {r.numerOfwca}</span>
                            <span>•</span>
                            <span>{r.oddzial}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-300">
                          {r.numerAgencji}
                        </td>

                        <td className="py-3 px-3">
                          {r.isDkp ? (
                            <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold text-[10px] border border-violet-500/30">
                              DKP
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold text-[10px] border border-sky-500/30">
                              DPD
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-slate-300">
                          <div>{r.wojewodztwo || 'Brak woj.'}</div>
                          <div className="text-[10px] text-slate-500">
                            {r.powiat || 'Brak powiatu'} • {r.kodPocztowy || 'brak kodu'}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right text-slate-400 font-medium">
                          {formatPLN(r.gwp2025Total)}
                        </td>

                        <td className="py-3 px-3 text-right font-bold text-emerald-400">
                          {formatPLN(r.gwp2026Total)}
                        </td>

                        {/* Inline MS Changer */}
                        <td className="py-3 px-3">
                          <select
                            value={r.currentMs}
                            onChange={e => onReassignBatch([r.id], e.target.value, `Zmiana OFWCA ${r.numerOfwca}`)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition ${
                              isMoved
                                ? 'bg-blue-950/80 border-blue-500 text-blue-200'
                                : 'bg-slate-950 border-slate-700 text-slate-200'
                            }`}
                          >
                            {msList.map(ms => (
                              <option key={ms.id} value={ms.name}>{ms.name}</option>
                            ))}
                          </select>
                          {isMoved && (
                            <div className="flex items-center gap-1.5 text-[10px] text-blue-400 mt-1">
                              <span>(początkowo: {r.initialMs})</span>
                              <button
                                onClick={() => onResetRecord(r.id)}
                                className="underline hover:text-white"
                                title="Przywróć pierwotnego MS"
                              >
                                Cofnij
                              </button>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {r.isActive ? (
                            <span className="text-emerald-400 font-medium text-[10px]">Aktywny</span>
                          ) : (
                            <span
                              className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-[10px] border border-amber-500/30"
                              title={`Pracuje do: ${r.pracujeDo}`}
                            >
                              Zakończony
                            </span>
                          )}
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

      {/* Level 2: Powiat Aggregated View */}
      {activeTab === 'powiat' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aggregatedPowiats.map((p, idx) => (
            <div
              key={`${p.wojewodztwo}_${p.powiatName}_${idx}`}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-xl hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                    {p.wojewodztwo}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    Powiat {p.powiatName}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400">
                    {formatPLN(p.gwp2026)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">GWP 2026</span>
                </div>
              </div>

              <div className="mt-3 py-2 border-y border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span>OFWCA w powiecie: <strong className="text-white">{p.records.length}</strong></span>
                <span>Agencji: <strong className="text-white">{new Set(p.records.map(r => r.numerAgencji)).size}</strong></span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 block mb-1">Przypisz cały powiat do:</label>
                  <select
                    defaultValue={p.dominantMs}
                    onChange={e => handleReassignPowiat(p.records, e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {msList.map(ms => (
                      <option key={ms.id} value={ms.name}>{ms.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Level 3: Agent Aggregated View */}
      {activeTab === 'agent' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aggregatedAgents.map(ag => (
            <div
              key={ag.agencyNumber}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-xl hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    {ag.agencyNumber}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5 truncate max-w-[200px]" title={ag.agentName}>
                    {ag.agentName}
                  </h3>
                  <span className="text-[10px] text-slate-400">{ag.wojewodztwo}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400">
                    {formatPLN(ag.gwp2026)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">GWP 2026</span>
                </div>
              </div>

              <div className="mt-3 py-2 border-y border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span>Przypisani OFWCA: <strong className="text-white">{ag.records.length}</strong></span>
                <span>Województwo: <strong className="text-slate-200">{ag.wojewodztwo}</strong></span>
              </div>

              <div className="mt-3">
                <label className="text-[10px] text-slate-400 block mb-1">Koordynator agencji:</label>
                <select
                  value={ag.currentMs}
                  onChange={e => handleReassignAgent(ag.records, e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {msList.map(ms => (
                    <option key={ms.id} value={ms.name}>{ms.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

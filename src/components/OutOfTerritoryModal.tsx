import React, { useState } from 'react';
import { 
  Compass, 
  X, 
  MapPin, 
  Users, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  Building2, 
  Briefcase, 
  TrendingUp, 
  Search,
  Filter
} from 'lucide-react';
import { OFWCARecord, CoordinatorMS } from '../types';

interface OutOfTerritoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  msName: string;
  voivodeshipName: string;
  records: OFWCARecord[];
  msList: CoordinatorMS[];
  onReassign?: (recordIds: string[], targetMs: string, reason?: string) => void;
}

export const OutOfTerritoryModal: React.FC<OutOfTerritoryModalProps> = ({
  isOpen,
  onClose,
  msName,
  voivodeshipName,
  records,
  msList,
  onReassign
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(new Set());
  const [targetMs, setTargetMs] = useState<string>('');

  if (!isOpen) return null;

  const coordinator = msList.find(m => m.name === msName);
  const homeRegion = coordinator?.primaryVoivodeship || coordinator?.region || 'Inny region';

  const filteredRecords = records.filter(r => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.numerOfwca.toLowerCase().includes(term) ||
      r.nazwaAgenta.toLowerCase().includes(term) ||
      r.numerAgencji.toLowerCase().includes(term) ||
      r.powiat.toLowerCase().includes(term) ||
      r.wojewodztwo.toLowerCase().includes(term)
    );
  });

  const totalGwp = records.reduce((s, r) => s + (r.gwp2026Total || 0), 0);
  const dkpCount = records.filter(r => r.isDkp).length;
  const dpdCount = records.length - dkpCount;

  const formatPLN = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)} mln zł`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)} tys. zł`;
    return `${val} zł`;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecordIds(new Set(filteredRecords.map(r => r.id)));
    } else {
      setSelectedRecordIds(new Set());
    }
  };

  const toggleSelectRecord = (id: string) => {
    setSelectedRecordIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExecuteBatchReassign = () => {
    if (!onReassign || selectedRecordIds.size === 0 || !targetMs) return;
    onReassign(
      Array.from(selectedRecordIds),
      targetMs,
      `Korekta ogona terytorialnego: przeniesiono ${selectedRecordIds.size} OFWCA z ${msName} do ${targetMs}`
    );
    setSelectedRecordIds(new Set());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Szczegóły OFWCA spoza terenu (Out-of-Territory)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  {records.length} OFWCA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Koordynator: <strong className="text-white">{msName}</strong> • Analizowane województwo: <strong className="text-white">{voivodeshipName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business Context Callout Banner */}
        <div className="bg-amber-950/20 px-6 py-3 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-semibold text-amber-300 block">
              Dlaczego ci OFWCA są oznaczeni jako „Z poza terenu”?
            </span>
            <p className="text-[11px] text-slate-300 max-w-2xl leading-relaxed">
              Terenem macierzystym koordynatora <strong>{msName}</strong> jest <em>{homeRegion}</em>. Poniżsi sprzedawcy fizycznie prowadzą działalność w woj. <strong>{voivodeshipName}</strong>, tworząc tzw. <em>ogon terytorialny</em> wymagający dojazdów międzywojewódzkich.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-300 shrink-0">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              GWP 2026: <strong className="text-emerald-400">{formatPLN(totalGwp)}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              Struktura: <strong className="text-violet-300">{dkpCount} DKP</strong> / <strong className="text-sky-300">{dpdCount} DPD</strong>
            </span>
          </div>
        </div>

        {/* Toolbar: Search and Batch Reassignment */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filtruj po OFWCA, agencji, powiecie..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {onReassign && selectedRecordIds.size > 0 && (
            <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-amber-500/30 animate-in fade-in">
              <span className="text-[11px] text-slate-300 font-semibold px-2">
                Zaznaczono: <strong>{selectedRecordIds.size}</strong>
              </span>
              <select
                value={targetMs}
                onChange={e => setTargetMs(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
              >
                <option value="">Wybierz nowego koordynatora...</option>
                {msList.filter(m => m.name !== msName).map(m => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.primaryVoivodeship || m.region || 'Brak regionu'})
                  </option>
                ))}
              </select>
              <button
                disabled={!targetMs}
                onClick={handleExecuteBatchReassign}
                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer"
              >
                Przenieś zaznaczonych
              </button>
            </div>
          )}
        </div>

        {/* Table of Records */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredRecords.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Brak rekordów spełniających kryteria wyszukiwania.
            </div>
          ) : (
            <div className="border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    {onReassign && (
                      <th className="py-2.5 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={selectedRecordIds.size === filteredRecords.length && filteredRecords.length > 0}
                          onChange={e => handleSelectAll(e.target.checked)}
                          className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="py-2.5 px-3">Numer OFWCA / Agent</th>
                    <th className="py-2.5 px-3">Numer Agencji</th>
                    <th className="py-2.5 px-3">Faktyczne Województwo</th>
                    <th className="py-2.5 px-3">Powiat & Kod Pocztowy</th>
                    <th className="py-2.5 px-3 text-center">Kanał</th>
                    <th className="py-2.5 px-3 text-right">GWP 2026</th>
                    {onReassign && <th className="py-2.5 px-3 text-center">Szybkie Przeniesienie</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredRecords.map(r => {
                    const isSelected = selectedRecordIds.has(r.id);
                    return (
                      <tr 
                        key={r.id} 
                        className={`hover:bg-slate-800/40 transition ${isSelected ? 'bg-amber-500/10' : ''}`}
                      >
                        {onReassign && (
                          <td className="py-2.5 px-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectRecord(r.id)}
                              className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-white">{r.numerOfwca}</div>
                          <div className="text-[10px] text-slate-400">{r.nazwaAgenta}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">
                          {r.numerAgencji}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-emerald-300 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{r.wojewodztwo}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-white">{r.powiat || 'Brak powiatu'}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{r.kodPocztowy || 'b/d'}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {r.isDkp ? (
                            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold text-[10px] border border-violet-500/30">
                              DKP
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold text-[10px] border border-sky-500/30">
                              DPD
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-400">
                          {formatPLN(r.gwp2026Total || 0)}
                        </td>
                        {onReassign && (
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => {
                                toggleSelectRecord(r.id);
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold border border-slate-700 transition cursor-pointer"
                            >
                              {isSelected ? 'Odznacz' : 'Wybierz'}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>
            Wyświetlono {filteredRecords.length} z {records.length} rekordów spoza terenu
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition cursor-pointer"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  History, 
  RotateCcw, 
  Save, 
  Trash2, 
  Download, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  FileText, 
  X, 
  GitCompare, 
  Users, 
  TrendingUp,
  Clock
} from 'lucide-react';
import { OFWCARecord, CoordinatorMS, CoordinatorRMS, ModelingHistoryStep } from '../types';
import { BackupPackage, createNamedSnapshot, loadAllSnapshots, deleteSnapshotById } from '../db/indexedDB';

interface VersionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: OFWCARecord[];
  msList: CoordinatorMS[];
  rmsList: CoordinatorRMS[];
  history: ModelingHistoryStep[];
  onRestoreSnapshot: (snapshot: BackupPackage) => void;
  onResetToBase: () => void;
  onToast: (msg: { type: 'success' | 'info' | 'warning' | 'error'; text: string }) => void;
}

export const VersionManagerModal: React.FC<VersionManagerModalProps> = ({
  isOpen,
  onClose,
  records,
  msList,
  rmsList,
  history,
  onRestoreSnapshot,
  onResetToBase,
  onToast
}) => {
  const [snapshots, setSnapshots] = useState<BackupPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newVersionName, setNewVersionName] = useState<string>('');
  const [newVersionDesc, setNewVersionDesc] = useState<string>('');
  const [diffSnapshot, setDiffSnapshot] = useState<BackupPackage | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Load snapshots from IndexedDB
  const refreshSnapshots = async () => {
    try {
      setLoading(true);
      const list = await loadAllSnapshots();
      setSnapshots(list);
    } catch (err) {
      console.error('Błąd odczytu wersji z IndexedDB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshSnapshots();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate current state metrics
  const currentTotalGwp = records.reduce((acc, r) => acc + (r.gwp2026Total || 0), 0);
  const currentChangedRecordsCount = records.filter(r => r.currentMs !== r.initialMs).length;

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionName.trim()) {
      onToast({ type: 'warning', text: 'Wprowadź nazwę wersji / punktu przywracania.' });
      return;
    }

    try {
      const snap = await createNamedSnapshot(
        newVersionName.trim(),
        newVersionDesc.trim(),
        records,
        msList,
        rmsList,
        history
      );
      setNewVersionName('');
      setNewVersionDesc('');
      await refreshSnapshots();
      onToast({
        type: 'success',
        text: `Pomyślnie utworzono wersję: "${snap.name}". Możesz do niej wrócić w dowolnym momencie.`
      });
    } catch (err) {
      onToast({ type: 'error', text: 'Błąd podczas zapisywania wersji w IndexedDB.' });
    }
  };

  const handleRestore = (snap: BackupPackage) => {
    onRestoreSnapshot(snap);
    onToast({
      type: 'success',
      text: `Przywrócono stan struktur z wersji: "${snap.name}" (${snap.dateStr}).`
    });
    onClose();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSnapshotById(id);
      await refreshSnapshots();
      setConfirmDeleteId(null);
      onToast({ type: 'info', text: 'Usunięto wersję z pamięci lokalnej.' });
    } catch {
      onToast({ type: 'error', text: 'Nie udało się usunąć wybranej wersji.' });
    }
  };

  const handleDownloadJson = (snap: BackupPackage) => {
    const blob = new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snap.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.sts-snap.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Compute diff between current state and selected snapshot
  const computeDiff = (snap: BackupPackage) => {
    const snapRecordMap = new Map(snap.records.map(r => [r.id, r]));
    const diffList: Array<{
      id: string;
      numerOfwca: string;
      nazwaAgenta: string;
      wojewodztwo: string;
      powiat: string;
      currentMs: string;
      snapshotMs: string;
      gwp2026: number;
    }> = [];

    records.forEach(curr => {
      const snapRec = snapRecordMap.get(curr.id);
      if (snapRec && snapRec.currentMs !== curr.currentMs) {
        diffList.push({
          id: curr.id,
          numerOfwca: curr.numerOfwca,
          nazwaAgenta: curr.nazwaAgenta,
          wojewodztwo: curr.wojewodztwo,
          powiat: curr.powiat,
          currentMs: curr.currentMs,
          snapshotMs: snapRec.currentMs,
          gwp2026: curr.gwp2026Total || 0
        });
      }
    });

    return diffList;
  };

  const formatPLN = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)} mln zł`;
    return `${(val / 1_000).toFixed(0)} tys. zł`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Wersjonowanie Struktur i Punkty Przywracania</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-semibold">
                  {snapshots.length} zapisanych wersji
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Twórz punkty kontrolne, testuj różne scenariusze i cofaj zmiany w dowolnej chwili bez utraty danych.
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

        {/* Current State Summary Banner */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Łącznie: <strong>{records.length} OFWCA</strong>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              GWP 2026: <strong>{formatPLN(currentTotalGwp)}</strong>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Zmodyfikowane rekordy: <strong className="text-amber-400">{currentChangedRecordsCount}</strong>
            </span>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Czy na pewno chcesz przywrócić pierwotny stan bazowy z pliku Excel (cofnąć wszystkie modelowania)?')) {
                onResetToBase();
                onToast({ type: 'info', text: 'Przywrócono stan bazowy z pliku Excel.' });
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold transition cursor-pointer text-xs"
            title="Przywraca początkowe przypisania wszystkich rekordów"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Resetuj do stanu bazowego z pliku</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Create New Snapshot Form */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Save className="w-4 h-4 text-emerald-400" />
                <span>Utwórz Nowy Punkt Przywracania (Zapisz Bieżącą Wersję)</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Snapshot IndexedDB</span>
            </div>

            <form onSubmit={handleCreateSnapshot} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Nazwa Wersji *
                  </label>
                  <input
                    type="text"
                    required
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    placeholder="np. Wersja 1: Optymalizacja Mazowsza"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Uzasadnienie Biznesowe / Notatka Zmian (opcjonalnie)
                  </label>
                  <input
                    type="text"
                    value={newVersionDesc}
                    onChange={(e) => setNewVersionDesc(e.target.value)}
                    placeholder="np. Wyrównano obciążenie MS Wiśniewskiego i przesunięto 12 OFWCA DKP z zachodu"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Zapisz Punkt Przywracania</span>
                </button>
              </div>
            </form>
          </div>

          {/* Diff View (if active) */}
          {diffSnapshot && (
            <div className="bg-slate-950 border border-blue-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white text-xs">
                    Porównanie (Diff): Stan Bieżący vs Wersja „{diffSnapshot.name}”
                  </span>
                </div>
                <button
                  onClick={() => setDiffSnapshot(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Zamknij porównanie ✕
                </button>
              </div>

              {(() => {
                const diffs = computeDiff(diffSnapshot);
                if (diffs.length === 0) {
                  return (
                    <div className="py-4 text-center text-xs text-slate-400">
                      Brak różnic w przypisaniu koordynatorów (MS) między stanem bieżącym a tą wersją.
                    </div>
                  );
                }
                return (
                  <div className="space-y-2">
                    <div className="text-[11px] text-blue-300">
                      Wykryto <strong>{diffs.length} rekordów</strong> z odmiennym przypisaniem do koordynatora MS:
                    </div>
                    <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-lg">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-900 text-slate-400 sticky top-0">
                          <tr>
                            <th className="py-2 px-3">OFWCA / Agent</th>
                            <th className="py-2 px-3">Lokalizacja</th>
                            <th className="py-2 px-3">Wersja „{diffSnapshot.name}”</th>
                            <th className="py-2 px-3">Stan Bieżący</th>
                            <th className="py-2 px-3 text-right">GWP 2026</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          {diffs.map(d => (
                            <tr key={d.id} className="hover:bg-slate-900/50">
                              <td className="py-1.5 px-3">
                                <div className="font-semibold text-white">{d.numerOfwca}</div>
                                <div className="text-[10px] text-slate-400">{d.nazwaAgenta}</div>
                              </td>
                              <td className="py-1.5 px-3">
                                {d.wojewodztwo}, pow. {d.powiat || 'b/d'}
                              </td>
                              <td className="py-1.5 px-3 font-semibold text-amber-400">
                                {d.snapshotMs}
                              </td>
                              <td className="py-1.5 px-3 font-semibold text-emerald-400">
                                {d.currentMs}
                              </td>
                              <td className="py-1.5 px-3 text-right font-mono">
                                {formatPLN(d.gwp2026)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Snapshots List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Zapisane Punkty Kontrolne i Wersje ({snapshots.length})
            </h3>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Ładowanie wersji...</div>
            ) : snapshots.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 p-6">
                Nie utworzono jeszcze żadnego punktu przywracania. Skorzystaj z formularza powyżej, aby zapisać aktualny stan jako Wersję 1.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {snapshots.map((snap) => {
                  const snapGwp = snap.records.reduce((acc, r) => acc + (r.gwp2026Total || 0), 0);
                  const diffsCount = computeDiff(snap).length;

                  return (
                    <div
                      key={snap.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {snap.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-purple-400" />
                            {snap.dateStr}
                          </span>
                          {diffsCount === 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                              Aktualny stan
                            </span>
                          )}
                        </div>

                        {snap.version && snap.version !== 'Ręczna migawka stanu struktur' && (
                          <p className="text-xs text-slate-400 italic">
                            „{snap.version}”
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                          <span>{snap.recordsCount} rekordów OFWCA</span>
                          <span>•</span>
                          <span>{snap.msCount} Menadżerów (MS)</span>
                          <span>•</span>
                          <span>GWP: <strong className="text-slate-200">{formatPLN(snapGwp)}</strong></span>
                          <span>•</span>
                          <span className={diffsCount > 0 ? 'text-amber-400 font-semibold' : 'text-slate-500'}>
                            {diffsCount > 0 ? `Różnice względem teraz: ${diffsCount} OFWCA` : 'Zgodny z bieżącym stanem'}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setDiffSnapshot(diffSnapshot?.id === snap.id ? null : snap)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                          title="Porównaj różnice z bieżącym stanem"
                        >
                          <GitCompare className="w-3.5 h-3.5 text-blue-400" />
                          <span>Porównaj</span>
                        </button>

                        <button
                          onClick={() => handleDownloadJson(snap)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                          title="Pobierz kopię JSON tej wersji"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {confirmDeleteId === snap.id ? (
                          <div className="flex items-center gap-1 bg-rose-950/60 p-1 rounded-lg border border-rose-800">
                            <span className="text-[10px] text-rose-300 font-bold px-1">Usunąć?</span>
                            <button
                              onClick={() => handleDelete(snap.id)}
                              className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] cursor-pointer"
                            >
                              Tak
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] cursor-pointer"
                            >
                              Nie
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(snap.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            title="Usuń tę wersję"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (window.confirm(`Czy na pewno chcesz przywrócić wersję: "${snap.name}"? Obecne niezapisane zmiany zostaną nadpisane.`)) {
                              handleRestore(snap);
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Przywróć tę wersję</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Wszystkie wersje są bezpiecznie szyfrowane w lokalnej bazie IndexedDB w Twojej przeglądarce.
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

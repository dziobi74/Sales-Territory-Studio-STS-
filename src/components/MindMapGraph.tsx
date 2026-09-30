import React, { useState, useMemo } from 'react';
import { 
  GitBranch, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Building2, 
  User, 
  TrendingUp, 
  MapPin, 
  Search, 
  Users, 
  Compass, 
  ShieldCheck, 
  Maximize2, 
  Minimize2,
  FolderOpen,
  Folder,
  CheckCircle2,
  AlertTriangle,
  Network
} from 'lucide-react';
import { OFWCARecord, CoordinatorMS, CoordinatorRMS } from '../types';

interface MindMapGraphProps {
  records: OFWCARecord[];
  msList: CoordinatorMS[];
  rmsList: CoordinatorRMS[];
  onSelectOfwca?: (ofwcaId: string) => void;
  onReassignOfwca?: (recordIds: string[], targetMs: string, reason?: string) => void;
}

export const MindMapGraph: React.FC<MindMapGraphProps> = ({
  records,
  msList,
  rmsList,
  onSelectOfwca,
  onReassignOfwca
}) => {
  // Set of node IDs that are expanded
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(['root', 'rms_1', 'rms_2', 'rms_3']) // default: root and RMS expanded
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    label: string;
    type: 'root' | 'rms' | 'ms' | 'wojewodztwo' | 'powiat' | 'ofwca';
    gwp: number;
    ofwcaCount: number;
    dkpCount: number;
    dpdCount: number;
    color?: string;
    details?: string;
    record?: OFWCARecord;
  } | null>(null);

  const formatPLN = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)} mln zł`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)} tys. zł`;
    return `${val.toFixed(0)} zł`;
  };

  const msMap = useMemo(() => new Map(msList.map(m => [m.name, m])), [msList]);

  // Aggregate total root metrics
  const totalGwp = useMemo(() => records.reduce((s, r) => s + (r.gwp2026Total || 0), 0), [records]);
  const totalDkp = useMemo(() => records.filter(r => r.isDkp).length, [records]);
  const totalDpd = records.length - totalDkp;

  // Toggle expansion
  const toggleNode = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set<string>(['root']);
    rmsList.forEach(r => {
      all.add(r.id);
      const subordinates = msList.filter(m => m.rms === r.name || r.name.includes(m.rms));
      subordinates.forEach(m => {
        all.add(m.id);
        const mRecs = records.filter(rec => rec.currentMs === m.name);
        const voivs = new Set(mRecs.map(rec => rec.wojewodztwo));
        voivs.forEach(v => all.add(`${m.id}_${v}`));
      });
    });
    setExpandedNodes(all);
  };

  const collapseToRms = () => {
    setExpandedNodes(new Set(['root']));
  };

  const collapseToMs = () => {
    const next = new Set<string>(['root']);
    rmsList.forEach(r => next.add(r.id));
    setExpandedNodes(next);
  };

  // Build tree structure
  const treeData = useMemo(() => {
    return rmsList.map(rms => {
      const subordinateMs = msList.filter(m => 
        m.rms === rms.name || 
        rms.name.includes(m.rms) || 
        m.rms.includes(rms.region)
      );

      const rmsRecords = records.filter(r => {
        const c = msMap.get(r.currentMs);
        return r.currentRms === rms.name || (c && (c.rms === rms.name || rms.name.includes(c.rms)));
      });

      const rmsGwp = rmsRecords.reduce((s, r) => s + (r.gwp2026Total || 0), 0);
      const rmsDkp = rmsRecords.filter(r => r.isDkp).length;
      const rmsDpd = rmsRecords.length - rmsDkp;

      const msNodes = subordinateMs.map(ms => {
        const msRecords = records.filter(r => r.currentMs === ms.name);
        const msGwp = msRecords.reduce((s, r) => s + (r.gwp2026Total || 0), 0);
        const msDkp = msRecords.filter(r => r.isDkp).length;
        const msDpd = msRecords.length - msDkp;

        // Group by voivodeship
        const voivMap = new Map<string, OFWCARecord[]>();
        msRecords.forEach(r => {
          const v = r.wojewodztwo || 'Nieokreślone';
          if (!voivMap.has(v)) voivMap.set(v, []);
          voivMap.get(v)!.push(r);
        });

        const voivNodes = Array.from(voivMap.entries()).map(([vName, vRecords]) => {
          const homeWoj = (ms.primaryVoivodeship || ms.region || '').toLowerCase();
          const isHome = homeWoj.includes(vName.toLowerCase()) || vName.toLowerCase().includes(homeWoj);
          const vGwp = vRecords.reduce((s, r) => s + (r.gwp2026Total || 0), 0);
          const vDkp = vRecords.filter(r => r.isDkp).length;
          const vDpd = vRecords.length - vDkp;

          // Group by powiat
          const powiatMap = new Map<string, OFWCARecord[]>();
          vRecords.forEach(r => {
            const p = r.powiat || 'Brak powiatu';
            if (!powiatMap.has(p)) powiatMap.set(p, []);
            powiatMap.get(p)!.push(r);
          });

          const powiatNodes = Array.from(powiatMap.entries()).map(([pName, pRecords]) => {
            const pGwp = pRecords.reduce((s, r) => s + (r.gwp2026Total || 0), 0);
            const pDkp = pRecords.filter(r => r.isDkp).length;
            const pDpd = pRecords.length - pDkp;

            return {
              id: `${ms.id}_${vName}_${pName}`,
              name: pName,
              isHome,
              gwp: pGwp,
              ofwcaCount: pRecords.length,
              dkpCount: pDkp,
              dpdCount: pDpd,
              records: pRecords
            };
          });

          return {
            id: `${ms.id}_${vName}`,
            name: vName,
            isHome,
            gwp: vGwp,
            ofwcaCount: vRecords.length,
            dkpCount: vDkp,
            dpdCount: vDpd,
            powiatNodes
          };
        });

        return {
          id: ms.id,
          ms,
          name: ms.name,
          color: ms.color,
          gwp: msGwp,
          ofwcaCount: msRecords.length,
          dkpCount: msDkp,
          dpdCount: msDpd,
          voivNodes
        };
      });

      return {
        id: rms.id,
        rms,
        name: rms.name,
        color: rms.color,
        gwp: rmsGwp,
        ofwcaCount: rmsRecords.length,
        dkpCount: rmsDkp,
        dpdCount: rmsDpd,
        msNodes
      };
    });
  }, [records, msList, rmsList, msMap]);

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Network className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-white tracking-wide">
              Mapa Myśli Struktur Sprzedaży (Graf Drzewiasty: Od Ogółu do Szczegółu)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Interaktywna eksploracja sieci od poziomu strategicznego (Cała Polska / RMS) poprzez Koordynatorów (MS), aż do województw, powiatów i pojedynczych agentów OFWCA. Klikaj w węzły, aby je rozwijać i zwijać.
          </p>
        </div>

        {/* Tree controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={expandAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Rozwiń Wszystko</span>
          </button>
          <button
            onClick={collapseToMs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition cursor-pointer"
          >
            <Folder className="w-3.5 h-3.5 text-purple-400" />
            <span>Zwiń do MS</span>
          </button>
          <button
            onClick={collapseToRms}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Zwiń do RMS</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Graph & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Mind Map Canvas Column */}
        <div className="lg:col-span-8 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-x-auto min-h-[680px]">
          <div className="min-w-[620px] space-y-6">
            
            {/* ROOT NODE: Cała Organizacja Polska */}
            <div className="relative">
              <div
                onClick={() => {
                  setSelectedNode({
                    id: 'root',
                    label: 'Polska (Cała Sieć Sprzedaży)',
                    type: 'root',
                    gwp: totalGwp,
                    ofwcaCount: records.length,
                    dkpCount: totalDkp,
                    dpdCount: totalDpd
                  });
                  toggleNode('root');
                }}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-4 max-w-xl shadow-xl ${
                  expandedNodes.has('root')
                    ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-blue-500/50 ring-2 ring-blue-500/20'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold shadow-md">
                    PL
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-base">
                        Polska (Całość Sieci Sprzedaży)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                        Poziom 0 • Ogół
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      3 Dyrekcje Regionalne (RMS) • {msList.length} Koordynatorów (MS) • 16 województw
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div className="font-mono font-bold text-emerald-400 text-sm">
                      {formatPLN(totalGwp)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {records.length} OFWCA ({totalDkp} DKP / {totalDpd} DPD)
                    </div>
                  </div>
                  <button
                    onClick={(e) => toggleNode('root', e)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {expandedNodes.has('root') ? <ChevronDown className="w-4 h-4 text-blue-400" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* BRANCH TO RMS NODES */}
              {expandedNodes.has('root') && (
                <div className="ml-8 mt-4 pl-6 border-l-2 border-dashed border-blue-500/40 space-y-6 animate-in fade-in duration-200">
                  {treeData.map(rmsNode => {
                    const isRmsExpanded = expandedNodes.has(rmsNode.id);
                    return (
                      <div key={rmsNode.id} className="relative">
                        {/* Horizontal connecting notch */}
                        <div className="absolute -left-6 top-6 w-6 h-0.5 bg-blue-500/40" />

                        {/* RMS Node Card */}
                        <div
                          onClick={() => {
                            setSelectedNode({
                              id: rmsNode.id,
                              label: rmsNode.name,
                              type: 'rms',
                              gwp: rmsNode.gwp,
                              ofwcaCount: rmsNode.ofwcaCount,
                              dkpCount: rmsNode.dkpCount,
                              dpdCount: rmsNode.dpdCount,
                              color: rmsNode.color,
                              details: `Dyrektor makroregionu. Nadzoruje ${rmsNode.msNodes.length} Menadżerów Sprzedaży.`
                            });
                            toggleNode(rmsNode.id);
                          }}
                          className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-4 max-w-lg shadow-md ${
                            isRmsExpanded
                              ? 'bg-purple-950/40 border-purple-500/50 shadow-purple-500/10'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-4 h-4 rounded-lg shrink-0 shadow-sm"
                              style={{ backgroundColor: rmsNode.color }}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">
                                  {rmsNode.name}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-semibold">
                                  RMS Makroregion
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {rmsNode.msNodes.length} podległych Koordynatorów (MS)
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-right">
                            <div>
                              <div className="font-mono font-bold text-emerald-400 text-xs">
                                {formatPLN(rmsNode.gwp)}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {rmsNode.ofwcaCount} OFWCA
                              </div>
                            </div>
                            <button
                              onClick={(e) => toggleNode(rmsNode.id, e)}
                              className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                            >
                              {isRmsExpanded ? <ChevronDown className="w-3.5 h-3.5 text-purple-400" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* BRANCH TO MS NODES */}
                        {isRmsExpanded && (
                          <div className="ml-8 mt-3 pl-6 border-l-2 border-dashed border-purple-500/30 space-y-4 animate-in fade-in duration-150">
                            {rmsNode.msNodes.map(msNode => {
                              const isMsExpanded = expandedNodes.has(msNode.id);
                              return (
                                <div key={msNode.id} className="relative">
                                  <div className="absolute -left-6 top-5 w-6 h-0.5 bg-purple-500/30" />

                                  {/* MS Node Card */}
                                  <div
                                    onClick={() => {
                                      setSelectedNode({
                                        id: msNode.id,
                                        label: msNode.name,
                                        type: 'ms',
                                        gwp: msNode.gwp,
                                        ofwcaCount: msNode.ofwcaCount,
                                        dkpCount: msNode.dkpCount,
                                        dpdCount: msNode.dpdCount,
                                        color: msNode.color,
                                        details: `Koordynator Sprzedaży (MS). Rejon: ${msNode.ms.region || 'Brak'}`
                                      });
                                      toggleNode(msNode.id);
                                    }}
                                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 max-w-md ${
                                      isMsExpanded
                                        ? 'bg-orange-950/30 border-orange-500/40 shadow-orange-500/10'
                                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                                        style={{ backgroundColor: msNode.color }}
                                      />
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-white text-xs">
                                            {msNode.name}
                                          </span>
                                          <span className="px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 text-[9px] font-semibold">
                                            Koordynator (MS)
                                          </span>
                                        </div>
                                        <div className="text-[10px] text-slate-400">
                                          {msNode.voivNodes.length} województw w zasięgu
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2.5 text-right">
                                      <div>
                                        <div className="font-mono font-bold text-emerald-400 text-xs">
                                          {formatPLN(msNode.gwp)}
                                        </div>
                                        <div className="text-[10px] text-slate-400">
                                          {msNode.ofwcaCount} OFWCA
                                        </div>
                                      </div>
                                      <button
                                        onClick={(e) => toggleNode(msNode.id, e)}
                                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                                      >
                                        {isMsExpanded ? <ChevronDown className="w-3.5 h-3.5 text-orange-400" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                      </button>
                                    </div>
                                  </div>

                                  {/* BRANCH TO VOIVODESHIPS */}
                                  {isMsExpanded && (
                                    <div className="ml-7 mt-2 pl-5 border-l border-slate-800 space-y-2.5 animate-in fade-in duration-100">
                                      {msNode.voivNodes.map(vNode => {
                                        const isVoivExpanded = expandedNodes.has(vNode.id);
                                        return (
                                          <div key={vNode.id} className="relative">
                                            <div className="absolute -left-5 top-4 w-5 h-0.5 bg-slate-800" />

                                            {/* Voivodeship Node Card */}
                                            <div
                                              onClick={() => {
                                                setSelectedNode({
                                                  id: vNode.id,
                                                  label: `Woj. ${vNode.name}`,
                                                  type: 'wojewodztwo',
                                                  gwp: vNode.gwp,
                                                  ofwcaCount: vNode.ofwcaCount,
                                                  dkpCount: vNode.dkpCount,
                                                  dpdCount: vNode.dpdCount,
                                                  details: vNode.isHome 
                                                    ? 'Teren macierzysty dla tego koordynatora.' 
                                                    : 'Obsługa zewnętrzna (teren zamiejscowy / ogon terytorialny).'
                                                });
                                                toggleNode(vNode.id);
                                              }}
                                              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex items-center justify-between gap-2 max-w-sm"
                                            >
                                              <div className="flex items-center gap-2">
                                                <MapPin className={`w-3.5 h-3.5 shrink-0 ${vNode.isHome ? 'text-emerald-400' : 'text-amber-400'}`} />
                                                <span className="font-semibold text-white text-xs">
                                                  Woj. {vNode.name}
                                                </span>
                                                {vNode.isHome ? (
                                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                                                    Teren
                                                  </span>
                                                ) : (
                                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                                                    Z poza
                                                  </span>
                                                )}
                                              </div>

                                              <div className="flex items-center gap-2 text-right">
                                                <span className="font-mono text-[11px] text-emerald-400">
                                                  {formatPLN(vNode.gwp)}
                                                </span>
                                                <button
                                                  onClick={(e) => toggleNode(vNode.id, e)}
                                                  className="p-0.5 text-slate-400 hover:text-white"
                                                >
                                                  {isVoivExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                                </button>
                                              </div>
                                            </div>

                                            {/* BRANCH TO POWIATY */}
                                            {isVoivExpanded && (
                                              <div className="ml-6 mt-1.5 pl-4 border-l border-slate-800/80 space-y-1.5 animate-in fade-in">
                                                {vNode.powiatNodes.map(pNode => (
                                                  <div key={pNode.id} className="relative">
                                                    <div className="absolute -left-4 top-3.5 w-4 h-0.5 bg-slate-800/80" />

                                                    {/* Powiat Leaf Card */}
                                                    <div
                                                      onClick={() => {
                                                        setSelectedNode({
                                                          id: pNode.id,
                                                          label: `Powiat: ${pNode.name} (${vNode.name})`,
                                                          type: 'powiat',
                                                          gwp: pNode.gwp,
                                                          ofwcaCount: pNode.ofwcaCount,
                                                          dkpCount: pNode.dkpCount,
                                                          dpdCount: pNode.dpdCount,
                                                          details: `Powiat obsługiwany przez ${msNode.name}.`
                                                        });
                                                      }}
                                                      className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/90 hover:border-blue-500/40 transition cursor-pointer flex items-center justify-between text-xs max-w-xs"
                                                    >
                                                      <span className="font-medium text-slate-300 truncate">
                                                        pow. {pNode.name}
                                                      </span>
                                                      <div className="flex items-center gap-2 text-[10px] text-slate-400 shrink-0">
                                                        <span>{pNode.ofwcaCount} OFWCA</span>
                                                        <span className="text-emerald-400 font-mono">{formatPLN(pNode.gwp)}</span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Node Inspector Side Panel (Szczegóły Węzła) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-400" />
              <span>Inspektor Węzła Mapy Myśli</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Kliknij dowolny węzeł na grafie po lewej, aby zbadać jego strukturę.
            </p>
          </div>

          {selectedNode ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">
                    Poziom: {selectedNode.type.toUpperCase()}
                  </span>
                  {selectedNode.color && (
                    <span
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: selectedNode.color }}
                    />
                  )}
                </div>
                <h4 className="text-base font-extrabold text-white">
                  {selectedNode.label}
                </h4>
                {selectedNode.details && (
                  <p className="text-xs text-slate-400 italic">
                    {selectedNode.details}
                  </p>
                )}
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Plan GWP 2026:</span>
                  <strong className="text-emerald-400 text-sm font-mono block mt-0.5">
                    {formatPLN(selectedNode.gwp)}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Liczba OFWCA:</span>
                  <strong className="text-white text-sm block mt-0.5">
                    {selectedNode.ofwcaCount}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Placówki DKP:</span>
                  <strong className="text-violet-300 text-sm block mt-0.5">
                    {selectedNode.dkpCount} DKP
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Agenci DPD:</span>
                  <strong className="text-sky-300 text-sm block mt-0.5">
                    {selectedNode.dpdCount} DPD
                  </strong>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Wzorzec Myślenia Terytorialnego
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Struktura od ogółu do szczegółu pozwala wyśledzić, który dyrektor regionalny ma zrównoważony potencjał, którzy koordynatorzy generują przypis i w jakich powiatach występują niepożądane enklawy terytorialne.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-500">
              Wybierz węzeł na grafie po lewej, aby wyświetlić metryki.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

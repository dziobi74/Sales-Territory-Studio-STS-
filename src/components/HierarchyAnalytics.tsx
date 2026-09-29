import React, { useState, useMemo } from 'react';
import { OFWCARecord, CoordinatorMS, CoordinatorRMS } from '../types';
import { GitBranch, ChevronRight, ChevronDown, Layers, Building2, User, TrendingUp, BarChart3 } from 'lucide-react';

interface HierarchyAnalyticsProps {
  records: OFWCARecord[];
  msList: CoordinatorMS[];
  rmsList: CoordinatorRMS[];
}

export const HierarchyAnalytics: React.FC<HierarchyAnalyticsProps> = ({
  records,
  msList,
  rmsList,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const [activeAnalysisView, setActiveAnalysisView] = useState<'hierarchy' | 'wojewodztwa' | 'products' | 'dkp_dpd'>('hierarchy');

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const formatPLN = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)} mln zł`;
    return `${(val / 1_000).toFixed(0)} tys. zł`;
  };

  // Build hierarchical tree: Oddział -> Region_oddział -> Region_województwo -> Województwo -> Powiat -> Agent -> OFWCA
  const hierarchyTree = useMemo(() => {
    const root: Record<string, any> = {};

    records.forEach(r => {
      const oddzial = r.oddzial || 'Oddział Główny';
      const regOddz = r.regionOddzial || 'Region 1';
      const regWoj = r.regionWojewodztwo || 'Centralny';
      const woj = r.wojewodztwo || 'Nieznane';
      const pow = r.powiat || 'Brak powiatu';
      const agent = `${r.nazwaAgenta} (${r.numerAgencji})`;

      if (!root[oddzial]) root[oddzial] = { name: oddzial, gwp: 0, ofwcaCount: 0, children: {} };
      root[oddzial].gwp += r.gwp2026Total;
      root[oddzial].ofwcaCount++;

      const oNode = root[oddzial].children;
      if (!oNode[regOddz]) oNode[regOddz] = { name: regOddz, gwp: 0, ofwcaCount: 0, children: {} };
      oNode[regOddz].gwp += r.gwp2026Total;
      oNode[regOddz].ofwcaCount++;

      const roNode = oNode[regOddz].children;
      if (!roNode[regWoj]) roNode[regWoj] = { name: regWoj, gwp: 0, ofwcaCount: 0, children: {} };
      roNode[regWoj].gwp += r.gwp2026Total;
      roNode[regWoj].ofwcaCount++;

      const rwNode = roNode[regWoj].children;
      if (!rwNode[woj]) rwNode[woj] = { name: woj, gwp: 0, ofwcaCount: 0, children: {} };
      rwNode[woj].gwp += r.gwp2026Total;
      rwNode[woj].ofwcaCount++;

      const wNode = rwNode[woj].children;
      if (!wNode[pow]) wNode[pow] = { name: pow, gwp: 0, ofwcaCount: 0, children: {} };
      wNode[pow].gwp += r.gwp2026Total;
      wNode[pow].ofwcaCount++;

      const pNode = wNode[pow].children;
      if (!pNode[agent]) pNode[agent] = { name: agent, gwp: 0, ofwcaCount: 0, ofwcaList: [] };
      pNode[agent].gwp += r.gwp2026Total;
      pNode[agent].ofwcaCount++;
      pNode[agent].ofwcaList.push(r);
    });

    return root;
  }, [records]);

  // Voivodeship rankings
  const voivodeshipRankings = useMemo(() => {
    const map = new Map<string, {
      woj: string;
      gwp2025: number;
      gwp2026: number;
      detal2026: number;
      eduPs2026: number;
      ofwcaCount: number;
      agentCount: Set<string>;
      dkpCount: number;
      dpdCount: number;
    }>();

    records.forEach(r => {
      const w = r.wojewodztwo || 'Nieokreślone';
      if (!map.has(w)) {
        map.set(w, {
          woj: w,
          gwp2025: 0,
          gwp2026: 0,
          detal2026: 0,
          eduPs2026: 0,
          ofwcaCount: 0,
          agentCount: new Set(),
          dkpCount: 0,
          dpdCount: 0
        });
      }
      const item = map.get(w)!;
      item.gwp2025 += r.gwp2025Total;
      item.gwp2026 += r.gwp2026Total;
      item.detal2026 += r.gwp2026Detal;
      item.eduPs2026 += r.gwp2026EduPs;
      item.ofwcaCount++;
      item.agentCount.add(r.numerAgencji);
      if (r.isDkp) item.dkpCount++;
      else item.dpdCount++;
    });

    return Array.from(map.values()).sort((a, b) => b.gwp2026 - a.gwp2026);
  }, [records]);

  // Product Totals
  const productTotals = useMemo(() => {
    const gwp2025Detal = records.reduce((s, r) => s + r.gwp2025Detal, 0);
    const gwp2026Detal = records.reduce((s, r) => s + r.gwp2026Detal, 0);
    const gwp2025EduPs = records.reduce((s, r) => s + r.gwp2025EduPs, 0);
    const gwp2026EduPs = records.reduce((s, r) => s + r.gwp2026EduPs, 0);
    return {
      gwp2025Detal,
      gwp2026Detal,
      gwp2025EduPs,
      gwp2026EduPs,
      growthDetal: gwp2025Detal > 0 ? ((gwp2026Detal - gwp2025Detal) / gwp2025Detal) * 100 : 0,
      growthEduPs: gwp2025EduPs > 0 ? ((gwp2026EduPs - gwp2025EduPs) / gwp2025EduPs) * 100 : 0,
    };
  }, [records]);

  return (
    <div className="space-y-6">
      {/* View Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <BarChart3 className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Analityka Sprzedaży i Struktura Hierarchiczna
            </h2>
            <p className="text-xs text-slate-400">
              Drzewo powiązań organizacyjnych oraz przekroje produktowe i terytorialne.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveAnalysisView('hierarchy')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeAnalysisView === 'hierarchy'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Drzewo Hierarchii</span>
          </button>
          <button
            onClick={() => setActiveAnalysisView('wojewodztwa')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeAnalysisView === 'wojewodztwa'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ranking Województw</span>
          </button>
          <button
            onClick={() => setActiveAnalysisView('products')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeAnalysisView === 'products'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Detal vs EDU PS</span>
          </button>
        </div>
      </div>

      {/* 1. Hierarchical Tree View */}
      {activeAnalysisView === 'hierarchy' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
          <div className="mb-4 pb-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">
              Oddział → Region oddziału → Region województwa → Województwo → Powiat → Agent → OFWCA
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setExpandedNodes(new Set(['root', ...Object.keys(hierarchyTree)]))}
                className="text-purple-400 hover:underline cursor-pointer"
              >
                Rozwiń poziomy 1-2
              </button>
              <span>•</span>
              <button
                onClick={() => setExpandedNodes(new Set())}
                className="text-slate-400 hover:underline cursor-pointer"
              >
                Zwiń wszystko
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {Object.entries(hierarchyTree).map(([oddzName, oddzNode]: [string, any]) => {
              const isOddzExp = expandedNodes.has(oddzName);

              return (
                <div key={oddzName} className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3">
                  <div
                    onClick={() => toggleNode(oddzName)}
                    className="flex items-center justify-between font-bold text-white cursor-pointer hover:text-purple-400 transition"
                  >
                    <div className="flex items-center gap-2">
                      {isOddzExp ? <ChevronDown className="w-4 h-4 text-purple-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                      <span className="text-purple-300">🏢 Oddział: {oddzName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400">{formatPLN(oddzNode.gwp)}</span>
                      <span className="text-[10px] text-slate-500 ml-2">({oddzNode.ofwcaCount} OFWCA)</span>
                    </div>
                  </div>

                  {/* Level 2: Region Oddział */}
                  {isOddzExp && (
                    <div className="mt-2 ml-4 pl-3 border-l border-slate-800 space-y-2">
                      {Object.entries(oddzNode.children).map(([roName, roNode]: [string, any]) => {
                        const roKey = `${oddzName}___${roName}`;
                        const isRoExp = expandedNodes.has(roKey);

                        return (
                          <div key={roKey} className="rounded-lg bg-slate-900/60 p-2.5">
                            <div
                              onClick={() => toggleNode(roKey)}
                              className="flex items-center justify-between text-slate-200 cursor-pointer font-semibold"
                            >
                              <div className="flex items-center gap-2">
                                {isRoExp ? <ChevronDown className="w-3.5 h-3.5 text-blue-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                                <span>🌐 Region: {roName}</span>
                              </div>
                              <span className="text-emerald-400 font-bold">{formatPLN(roNode.gwp)}</span>
                            </div>

                            {/* Level 3: Województwa */}
                            {isRoExp && (
                              <div className="mt-2 ml-4 pl-3 border-l border-slate-700/60 space-y-1.5">
                                {Object.entries(roNode.children).map(([regWojName, regWojNode]: [string, any]) => (
                                  <div key={regWojName} className="space-y-1">
                                    {Object.entries(regWojNode.children).map(([wojName, wojNode]: [string, any]) => {
                                      const wKey = `${roKey}___${wojName}`;
                                      const isWExp = expandedNodes.has(wKey);

                                      return (
                                        <div key={wKey} className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                                          <div
                                            onClick={() => toggleNode(wKey)}
                                            className="flex items-center justify-between cursor-pointer text-slate-300 font-medium"
                                          >
                                            <div className="flex items-center gap-1.5">
                                              {isWExp ? <ChevronDown className="w-3 h-3 text-cyan-400" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                                              <span className="text-cyan-300">Woj. {wojName}</span>
                                            </div>
                                            <span className="text-white font-semibold">{formatPLN(wojNode.gwp)}</span>
                                          </div>

                                          {/* Powiaty & Agents */}
                                          {isWExp && (
                                            <div className="mt-2 ml-3 pl-2 border-l border-slate-800 space-y-1">
                                              {Object.entries(wojNode.children).map(([powName, powNode]: [string, any]) => (
                                                <div key={powName} className="p-1.5 text-[11px] text-slate-400">
                                                  <div className="flex justify-between font-medium text-slate-300">
                                                    <span>Powiat: {powName} ({powNode.ofwcaCount} OFWCA)</span>
                                                    <span className="text-emerald-400">{formatPLN(powNode.gwp)}</span>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
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
        </div>
      )}

      {/* 2. Voivodeship Ranking Table */}
      {activeAnalysisView === 'wojewodztwa' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
          <div className="p-4 bg-slate-950 border-b border-slate-800 font-bold text-white text-xs">
            Ranking Województw wg GWP 2026 i Potencjału Sprzedażowego
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950/80 text-[10px] uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Poz.</th>
                  <th className="py-3 px-4">Województwo</th>
                  <th className="py-3 px-4 text-center">OFWCA</th>
                  <th className="py-3 px-4 text-center">Agencje</th>
                  <th className="py-3 px-4 text-right">GWP 2025</th>
                  <th className="py-3 px-4 text-right">GWP 2026</th>
                  <th className="py-3 px-4 text-right">Detal 2026</th>
                  <th className="py-3 px-4 text-right">EDU PS 2026</th>
                  <th className="py-3 px-4 text-center">DKP / DPD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {voivodeshipRankings.map((item, idx) => (
                  <tr key={item.woj} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-white">{item.woj}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-200">{item.ofwcaCount}</td>
                    <td className="py-3 px-4 text-center text-slate-400">{item.agentCount.size}</td>
                    <td className="py-3 px-4 text-right text-slate-400">{formatPLN(item.gwp2025)}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">{formatPLN(item.gwp2026)}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{formatPLN(item.detal2026)}</td>
                    <td className="py-3 px-4 text-right text-slate-300">{formatPLN(item.eduPs2026)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-violet-400">{item.dkpCount} DKP</span> / <span className="text-sky-400">{item.dpdCount} DPD</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Product Breakdown: Detal vs EDU PS */}
      {activeAnalysisView === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2">
              Linia Produktowa: GWP Detal
            </h3>
            <div className="flex items-baseline justify-between mt-4">
              <span className="text-2xl font-bold text-emerald-400">{formatPLN(productTotals.gwp2026Detal)}</span>
              <span className="text-xs font-semibold text-emerald-400">+{productTotals.growthDetal.toFixed(1)}% r/r</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">GWP 2025 detal: {formatPLN(productTotals.gwp2025Detal)}</p>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2">
              Linia Produktowa: GWP EDU PS
            </h3>
            <div className="flex items-baseline justify-between mt-4">
              <span className="text-2xl font-bold text-indigo-400">{formatPLN(productTotals.gwp2026EduPs)}</span>
              <span className="text-xs font-semibold text-indigo-400">+{productTotals.growthEduPs.toFixed(1)}% r/r</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">GWP 2025 EDU PS: {formatPLN(productTotals.gwp2025EduPs)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

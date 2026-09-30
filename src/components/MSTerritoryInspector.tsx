import React, { useState, useMemo } from 'react';
import { OFWCARecord, CoordinatorMS, CoordinatorRMS } from '../types';
import { POLAND_VOIVODESHIPS, VoivodeshipGeo, PowiatGeoInfo } from '../data/polandGeo';
import { matchRecordToVoivodeship, matchRecordToPowiat } from '../utils/geoMatcher';
import { 
  Users, 
  MapPin, 
  TrendingUp, 
  Building2, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRightLeft, 
  Layers, 
  Compass, 
  Filter,
  CheckCircle2,
  X,
  UserCheck
} from 'lucide-react';

interface MSTerritoryInspectorProps {
  records: OFWCARecord[];
  msList: CoordinatorMS[];
  rmsList: CoordinatorRMS[];
  onReassignBatch: (recordIds: string[], targetMsName: string, reason?: string) => void;
  initialSelectedMs?: string;
}

export const MSTerritoryInspector: React.FC<MSTerritoryInspectorProps> = ({
  records,
  msList,
  rmsList,
  onReassignBatch,
  initialSelectedMs
}) => {
  const [selectedMsName, setSelectedMsName] = useState<string>(
    initialSelectedMs || (msList.length > 0 ? msList[0].name : '')
  );
  const [msSearchFilter, setMsSearchFilter] = useState('');
  const [powiatSearchFilter, setPowiatSearchFilter] = useState('');
  const [expandedVoivodeships, setExpandedVoivodeships] = useState<Set<string>>(new Set());
  const [expandedPowiaty, setExpandedPowiaty] = useState<Set<string>>(new Set());
  const [transferPowiatTarget, setTransferPowiatTarget] = useState<{
    powiatName: string;
    voivodeshipName: string;
    records: OFWCARecord[];
  } | null>(null);
  const [targetTransferMs, setTargetTransferMs] = useState<string>('');

  const msMap = useMemo(() => new Map(msList.map(m => [m.name, m])), [msList]);
  const currentCoordinator = msMap.get(selectedMsName);

  // Group all records for the selected MS
  const msRecords = useMemo(() => {
    return records.filter(r => r.currentMs === selectedMsName);
  }, [records, selectedMsName]);

  // Overall stats for each MS for quick selector badges
  const msSummaries = useMemo(() => {
    const map = new Map<string, {
      ms: CoordinatorMS;
      totalOfwca: number;
      dkpCount: number;
      dpdCount: number;
      gwp2026: number;
      voivodeshipsCount: number;
      powiatyCount: number;
      primaryVoivodeship: string;
    }>();

    msList.forEach(m => {
      map.set(m.name, {
        ms: m,
        totalOfwca: 0,
        dkpCount: 0,
        dpdCount: 0,
        gwp2026: 0,
        voivodeshipsCount: 0,
        powiatyCount: 0,
        primaryVoivodeship: m.primaryVoivodeship || 'Nieokreślone'
      });
    });

    const msVoivMap = new Map<string, Set<string>>();
    const msPowiatMap = new Map<string, Set<string>>();
    const msVoivCounts = new Map<string, Map<string, number>>();

    records.forEach(r => {
      const summary = map.get(r.currentMs);
      if (summary) {
        summary.totalOfwca++;
        if (r.isDkp) summary.dkpCount++;
        else summary.dpdCount++;
        summary.gwp2026 += r.gwp2026Total;

        const vName = r.wojewodztwo || 'Nieokreślone';
        const pName = r.powiat || 'Brak powiatu';

        if (!msVoivMap.has(r.currentMs)) msVoivMap.set(r.currentMs, new Set());
        msVoivMap.get(r.currentMs)!.add(vName.toLowerCase());

        if (!msPowiatMap.has(r.currentMs)) msPowiatMap.set(r.currentMs, new Set());
        msPowiatMap.get(r.currentMs)!.add(`${vName.toLowerCase()}___${pName.toLowerCase()}`);

        if (!msVoivCounts.has(r.currentMs)) msVoivCounts.set(r.currentMs, new Map());
        const vCounts = msVoivCounts.get(r.currentMs)!;
        vCounts.set(vName, (vCounts.get(vName) || 0) + 1);
      }
    });

    map.forEach((summary, msName) => {
      summary.voivodeshipsCount = msVoivMap.get(msName)?.size || 0;
      summary.powiatyCount = msPowiatMap.get(msName)?.size || 0;

      // Determine top voivodeship if not set
      const vCounts = msVoivCounts.get(msName);
      if (vCounts && vCounts.size > 0) {
        let maxV = '';
        let maxC = 0;
        vCounts.forEach((c, v) => {
          if (c > maxC) {
            maxC = c;
            maxV = v;
          }
        });
        if (maxV) summary.primaryVoivodeship = maxV;
      }
    });

    return map;
  }, [msList, records]);

  // Selected MS detailed geographical breakdown: Voivodeship -> Powiat -> OFWCA
  const geographicalBreakdown = useMemo(() => {
    if (!selectedMsName) return [];

    const homeVoivodeship = currentCoordinator?.primaryVoivodeship || 
      msSummaries.get(selectedMsName)?.primaryVoivodeship || '';

    // Group records by Voivodeship
    const vMap = new Map<string, {
      geo: VoivodeshipGeo | undefined;
      voivodeshipName: string;
      isHome: boolean;
      ofwcaCount: number;
      dkpCount: number;
      dpdCount: number;
      gwp2026: number;
      powiatyMap: Map<string, {
        powiatName: string;
        terytCode: string;
        capital: string;
        isHome: boolean;
        ofwcaCount: number;
        dkpCount: number;
        dpdCount: number;
        gwp2026: number;
        records: OFWCARecord[];
      }>;
    }>();

    msRecords.forEach(r => {
      const matchedV = matchRecordToVoivodeship(r, POLAND_VOIVODESHIPS);
      const vName = matchedV ? matchedV.name : (r.wojewodztwo || 'Nieznane');
      const vKey = vName.toLowerCase();

      if (!vMap.has(vKey)) {
        const isHome = Boolean(
          (homeVoivodeship && homeVoivodeship.toLowerCase() === vKey) || 
          (matchedV && matchedV.name.toLowerCase() === homeVoivodeship.toLowerCase())
        );
        
        vMap.set(vKey, {
          geo: matchedV,
          voivodeshipName: vName,
          isHome,
          ofwcaCount: 0,
          dkpCount: 0,
          dpdCount: 0,
          gwp2026: 0,
          powiatyMap: new Map()
        });
      }

      const vEntry = vMap.get(vKey)!;
      vEntry.ofwcaCount++;
      if (r.isDkp) vEntry.dkpCount++;
      else vEntry.dpdCount++;
      vEntry.gwp2026 += r.gwp2026Total;

      // Match Powiat
      const powiatList = vEntry.geo?.administrativePowiaty || [];
      const matchedP = matchRecordToPowiat(r, powiatList);
      const pName = matchedP ? matchedP.name : (r.powiat || 'Brak powiatu');
      const pKey = pName.toLowerCase();

      if (!vEntry.powiatyMap.has(pKey)) {
        vEntry.powiatyMap.set(pKey, {
          powiatName: pName,
          terytCode: matchedP?.terytCode || '---',
          capital: matchedP?.capital || pName,
          isHome: vEntry.isHome,
          ofwcaCount: 0,
          dkpCount: 0,
          dpdCount: 0,
          gwp2026: 0,
          records: []
        });
      }

      const pEntry = vEntry.powiatyMap.get(pKey)!;
      pEntry.ofwcaCount++;
      if (r.isDkp) pEntry.dkpCount++;
      else pEntry.dpdCount++;
      pEntry.gwp2026 += r.gwp2026Total;
      pEntry.records.push(r);
    });

    // Convert map to sorted array (home voivodeship first, then by OFWCA count desc)
    const sortedVoivodeships = Array.from(vMap.values()).map(v => {
      const sortedPowiaty = Array.from(v.powiatyMap.values()).sort((a, b) => b.ofwcaCount - a.ofwcaCount);
      return {
        ...v,
        powiaty: sortedPowiaty
      };
    }).sort((a, b) => {
      if (a.isHome && !b.isHome) return -1;
      if (!a.isHome && b.isHome) return 1;
      return b.ofwcaCount - a.ofwcaCount;
    });

    return sortedVoivodeships;
  }, [selectedMsName, currentCoordinator, msRecords, msSummaries]);

  // Overall calculations for current selected MS
  const currentMsStats = useMemo(() => {
    const totalOfwca = msRecords.length;
    const dkpCount = msRecords.filter(r => r.isDkp).length;
    const dpdCount = totalOfwca - dkpCount;
    const gwp2026 = msRecords.reduce((acc, r) => acc + r.gwp2026Total, 0);
    const gwp2025 = msRecords.reduce((acc, r) => acc + r.gwp2025Total, 0);

    let totalPowiaty = 0;
    let homeOfwca = 0;
    geographicalBreakdown.forEach(v => {
      totalPowiaty += v.powiaty.length;
      if (v.isHome) homeOfwca += v.ofwcaCount;
    });

    const outOfwca = totalOfwca - homeOfwca;
    const compactness = totalOfwca > 0 ? (homeOfwca / totalOfwca) * 100 : 100;

    return {
      totalOfwca,
      dkpCount,
      dpdCount,
      gwp2026,
      gwp2025,
      totalVoivodeships: geographicalBreakdown.length,
      totalPowiaty,
      homeOfwca,
      outOfwca,
      compactness
    };
  }, [msRecords, geographicalBreakdown]);

  // Auto-expand voivodeships on MS change
  React.useEffect(() => {
    const initialExp = new Set<string>();
    geographicalBreakdown.forEach(v => initialExp.add(v.voivodeshipName.toLowerCase()));
    setExpandedVoivodeships(initialExp);
  }, [selectedMsName, geographicalBreakdown.length]);

  const toggleVoivodeship = (vKey: string) => {
    setExpandedVoivodeships(prev => {
      const next = new Set(prev);
      if (next.has(vKey)) next.delete(vKey);
      else next.add(vKey);
      return next;
    });
  };

  const togglePowiat = (pKey: string) => {
    setExpandedPowiaty(prev => {
      const next = new Set(prev);
      if (next.has(pKey)) next.delete(pKey);
      else next.add(pKey);
      return next;
    });
  };

  const handleExecuteTransferPowiat = () => {
    if (!transferPowiatTarget || !targetTransferMs || transferPowiatTarget.records.length === 0) return;
    const ids = transferPowiatTarget.records.map(r => r.id);
    onReassignBatch(
      ids,
      targetTransferMs,
      `Przepięcie terytorialne powiatu ${transferPowiatTarget.powiatName} (${transferPowiatTarget.voivodeshipName}) od ${selectedMsName} do ${targetTransferMs}`
    );
    setTransferPowiatTarget(null);
    setTargetTransferMs('');
  };

  const formatPLN = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)} mln zł`;
    return `${(val / 1_000).toFixed(0)} tys. zł`;
  };

  // Filtered MS list for selector
  const filteredMsList = useMemo(() => {
    if (!msSearchFilter) return msList;
    const term = msSearchFilter.toLowerCase();
    return msList.filter(m => 
      m.name.toLowerCase().includes(term) ||
      m.rms.toLowerCase().includes(term) ||
      (m.primaryVoivodeship && m.primaryVoivodeship.toLowerCase().includes(term))
    );
  }, [msList, msSearchFilter]);

  return (
    <div className="space-y-6">
      {/* 1. MS Selection Strip */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Compass className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-white tracking-wide">
                Inspektor Zasięgu Terytorialnego MS do Poziomu Powiatów
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Wybierz Menadżera Sprzedaży (MS), aby przeanalizować jego dokładną obecność w powiatach, zweryfikować OFWCA „Z terenu” vs „Z poza terenu” oraz szybko transferować całe powiaty.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Szukaj MS lub regionu..."
              value={msSearchFilter}
              onChange={(e) => setMsSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Scrollable MS Pill Grid */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
          {filteredMsList.map(m => {
            const isSelected = m.name === selectedMsName;
            const summary = msSummaries.get(m.name);
            return (
              <button
                key={m.name}
                onClick={() => setSelectedMsName(m.name)}
                className={`shrink-0 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: m.color }}
                />
                <div className="text-left">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>{m.name}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">
                    {summary?.powiatyCount || 0} pow. • {summary?.totalOfwca || 0} OFWCA
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Coordinator Overview KPI Tiles */}
      {currentCoordinator && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              Obsadzone Powiaty
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {currentMsStats.totalPowiaty}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              w {currentMsStats.totalVoivodeships} województwach
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Łącznie OFWCA
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {currentMsStats.totalOfwca}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span className="text-cyan-400 font-medium">DKP: {currentMsStats.dkpCount}</span>
              <span>•</span>
              <span className="text-purple-400 font-medium">DPD: {currentMsStats.dpdCount}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Plan GWP 2026
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {formatPLN(currentMsStats.gwp2026)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              2025: {formatPLN(currentMsStats.gwp2025)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              Wojew. Domowe
            </div>
            <div className="text-sm font-bold text-white mt-1.5 truncate">
              {currentCoordinator.primaryVoivodeship || msSummaries.get(selectedMsName)?.primaryVoivodeship || '---'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Główna baza koordynatora
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Z terenu vs Poza
            </div>
            <div className="text-xl font-bold text-white mt-1">
              <span className="text-emerald-400">{currentMsStats.homeOfwca}</span>
              <span className="text-slate-500 text-sm font-normal"> / </span>
              <span className="text-amber-400">{currentMsStats.outOfwca}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Lokalni / Zewnętrzni OFWCA
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-purple-400" />
              Wskaźnik Zwartości
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {currentMsStats.compactness.toFixed(0)}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {currentMsStats.compactness >= 80 ? 'Wysoka zwartość' : 'Wymaga optymalizacji'}
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Split View: Map Overview + Detailed Powiaty Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Poland Footprint Map */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: currentCoordinator?.color || '#3b82f6' }}
              />
              <span className="font-bold text-white text-xs">
                Mapa Zasięgu: {selectedMsName}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {geographicalBreakdown.length} woj. z agentami
            </span>
          </div>

          {/* SVG Map Render */}
          <div className="relative w-full aspect-[1000/950] max-h-[480px] bg-slate-950/60 rounded-xl border border-slate-800/80 p-2 flex items-center justify-center">
            <svg
              viewBox="0 0 1000 950"
              className="w-full h-full drop-shadow-lg"
              preserveAspectRatio="xMidYMid meet"
            >
              {POLAND_VOIVODESHIPS.map((geo) => {
                const isVoivodeshipActive = geographicalBreakdown.find(
                  v => v.voivodeshipName.toLowerCase() === geo.name.toLowerCase()
                );
                const isHome = isVoivodeshipActive?.isHome;
                const msColor = currentCoordinator?.color || '#3b82f6';

                return (
                  <g key={geo.id}>
                    <path
                      d={geo.path}
                      fill={
                        isVoivodeshipActive
                          ? isHome
                            ? msColor
                            : `${msColor}88` // slightly transparent if out of home territory
                          : '#1e293b'
                      }
                      stroke={isVoivodeshipActive ? '#ffffff' : '#334155'}
                      strokeWidth={isVoivodeshipActive ? 2.5 : 1}
                      strokeLinejoin="round"
                      className="transition-all duration-200 cursor-pointer"
                      onClick={() => toggleVoivodeship(geo.name.toLowerCase())}
                    >
                      <title>{geo.name}: {isVoivodeshipActive ? `${isVoivodeshipActive.ofwcaCount} OFWCA (${isVoivodeshipActive.powiaty.length} powiatów)` : 'Brak obecności tego MS'}</title>
                    </path>

                    {/* Badge on active Voivodeship */}
                    {isVoivodeshipActive && (
                      <g
                        transform={`translate(${geo.labelX}, ${geo.labelY})`}
                        className="pointer-events-none select-none"
                      >
                        <rect
                          x={-34}
                          y={-14}
                          width={68}
                          height={26}
                          rx={8}
                          fill="#090d16"
                          stroke={isHome ? '#10b981' : '#f59e0b'}
                          strokeWidth={1.5}
                        />
                        <text
                          x={0}
                          y={3}
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {isVoivodeshipActive.ofwcaCount} OFWCA
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded shadow-sm border border-emerald-400"
                style={{ backgroundColor: currentCoordinator?.color || '#3b82f6' }}
              />
              <span className="text-slate-300 font-medium">Teren Domowy (Home)</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded shadow-sm border border-amber-400 opacity-60"
                style={{ backgroundColor: currentCoordinator?.color || '#3b82f6' }}
              />
              <span className="text-slate-300 font-medium">Poza Terenem (Out)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700" />
              <span>Brak agentów</span>
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Powiaty Breakdown List */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h4 className="font-bold text-white text-sm">
                Wykaz Powiatów Koordynatora {selectedMsName}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Rozwiń powiat, aby zobaczyć agentów lub przenieść cały powiat do innego MS
              </p>
            </div>

            {/* Powiat Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filtruj powiaty..."
                value={powiatSearchFilter}
                onChange={(e) => setPowiatSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* List of Voivodeships and Powiaty */}
          <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
            {geographicalBreakdown.map((voiv) => {
              const vKey = voiv.voivodeshipName.toLowerCase();
              const isVExp = expandedVoivodeships.has(vKey);

              // Filter powiaty if search active
              const displayedPowiaty = voiv.powiaty.filter(p => 
                !powiatSearchFilter || 
                p.powiatName.toLowerCase().includes(powiatSearchFilter.toLowerCase()) ||
                p.terytCode.includes(powiatSearchFilter) ||
                p.capital.toLowerCase().includes(powiatSearchFilter.toLowerCase())
              );

              if (displayedPowiaty.length === 0 && powiatSearchFilter) {
                return null;
              }

              return (
                <div
                  key={vKey}
                  className={`rounded-2xl border transition overflow-hidden ${
                    voiv.isHome 
                      ? 'bg-slate-950/80 border-emerald-500/30 shadow-md shadow-emerald-500/5' 
                      : 'bg-slate-950/60 border-amber-500/30'
                  }`}
                >
                  {/* Voivodeship Header */}
                  <div
                    onClick={() => toggleVoivodeship(vKey)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition select-none"
                  >
                    <div className="flex items-center gap-3">
                      {isVExp ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            Województwo {voiv.voivodeshipName}
                          </span>
                          {voiv.isHome ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              Teren Domowy
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Poza Terenem
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {voiv.powiaty.length} obsadzonych powiatów • DKP: {voiv.dkpCount}, DPD: {voiv.dpdCount}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-white text-xs">
                        {voiv.ofwcaCount} OFWCA
                      </div>
                      <div className="text-[11px] text-emerald-400 font-medium">
                        {formatPLN(voiv.gwp2026)}
                      </div>
                    </div>
                  </div>

                  {/* Powiaty Grid */}
                  {isVExp && (
                    <div className="p-3 pt-0 border-t border-slate-800/70 space-y-2.5">
                      {displayedPowiaty.map((pow) => {
                        const pKey = `${vKey}___${pow.powiatName.toLowerCase()}`;
                        const isPExp = expandedPowiaty.has(pKey);

                        return (
                          <div
                            key={pKey}
                            className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm"
                          >
                            <div className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div
                                onClick={() => togglePowiat(pKey)}
                                className="flex items-center gap-2.5 cursor-pointer flex-1 select-none"
                              >
                                {isPExp ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-xs">
                                      Powiat {pow.powiatName}
                                    </span>
                                    <span className="font-mono text-[10px] text-slate-500">
                                      TERYT: {pow.terytCode}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                    <span className="text-cyan-300">DKP: {pow.dkpCount}</span>
                                    <span>•</span>
                                    <span className="text-purple-300">DPD: {pow.dpdCount}</span>
                                    <span>•</span>
                                    <span>Stolica: {pow.capital}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
                                <div className="text-right">
                                  <div className="text-xs font-bold text-white">
                                    {pow.ofwcaCount} OFWCA
                                  </div>
                                  <div className="text-[10px] text-emerald-400 font-medium">
                                    {formatPLN(pow.gwp2026)}
                                  </div>
                                </div>

                                {/* Reassign Button */}
                                <button
                                  onClick={() => {
                                    setTransferPowiatTarget({
                                      powiatName: pow.powiatName,
                                      voivodeshipName: voiv.voivodeshipName,
                                      records: pow.records
                                    });
                                    setTargetTransferMs(
                                      msList.find(m => m.name !== selectedMsName)?.name || ''
                                    );
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 text-[11px] font-semibold border border-blue-500/20 transition cursor-pointer flex items-center gap-1.5"
                                  title="Przenieś wszystkich agentów z tego powiatu do innego MS"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5" />
                                  <span>Przenieś powiat</span>
                                </button>
                              </div>
                            </div>

                            {/* Nested OFWCA list inside this Powiat */}
                            {isPExp && (
                              <div className="p-3 bg-slate-950/80 border-t border-slate-800 space-y-2">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Agenci i OFWCA w powiecie ({pow.records.length}):
                                </div>
                                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                  {pow.records.map((rec) => (
                                    <div
                                      key={rec.id}
                                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] flex items-center justify-between gap-2"
                                    >
                                      <div>
                                        <div className="font-semibold text-white flex items-center gap-1.5">
                                          <span>{rec.nazwaAgenta}</span>
                                          <span className="text-[10px] text-slate-400 font-mono">
                                            ({rec.numerAgencji})
                                          </span>
                                        </div>
                                        <div className="text-[10px] text-slate-400">
                                          OFWCA: {rec.numerOfwca} • {rec.kodPocztowy}
                                        </div>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <div className="flex items-center gap-1 justify-end">
                                          <span
                                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                              rec.isDkp
                                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                            }`}
                                          >
                                            {rec.isDkp ? 'DKP' : 'DPD'}
                                          </span>
                                        </div>
                                        <span className="text-emerald-400 font-medium text-[10px]">
                                          {formatPLN(rec.gwp2026Total)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
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
      </div>

      {/* 4. Quick Modal to Transfer Powiat */}
      {transferPowiatTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <ArrowRightLeft className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-bold text-white text-sm">
                    Przeniesienie Powiatu {transferPowiatTarget.powiatName}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Województwo {transferPowiatTarget.voivodeshipName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTransferPowiatTarget(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Liczba przenoszonych OFWCA:</span>
                <span className="font-bold text-white">{transferPowiatTarget.records.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Łączny przypis GWP 2026:</span>
                <span className="font-bold text-emerald-400">
                  {formatPLN(transferPowiatTarget.records.reduce((a, b) => a + b.gwp2026Total, 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dotychczasowy koordynator:</span>
                <span className="font-bold text-white">{selectedMsName}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Wybierz nowego Koordynatora (MS):
              </label>
              <select
                value={targetTransferMs}
                onChange={(e) => setTargetTransferMs(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {msList
                  .filter(m => m.name !== selectedMsName)
                  .map(m => (
                    <option key={m.name} value={m.name}>
                      {m.name} ({m.primaryVoivodeship || m.rms})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setTransferPowiatTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Anuluj
              </button>
              <button
                onClick={handleExecuteTransferPowiat}
                disabled={!targetTransferMs}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20"
              >
                Potwierdź przeniesienie
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

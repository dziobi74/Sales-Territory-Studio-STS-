import React, { useState, useMemo } from 'react';
import { OFWCARecord, CoordinatorMS, CoordinatorRMS } from '../types';
import { POLAND_VOIVODESHIPS, VoivodeshipGeo, PowiatGeoInfo } from '../data/polandGeo';
import { matchRecordToVoivodeship, matchRecordToPowiat } from '../utils/geoMatcher';
import { 
  MapPin, 
  Users, 
  TrendingUp, 
  Layers, 
  ChevronRight, 
  Check, 
  X, 
  ShieldAlert, 
  ArrowRightLeft, 
  Compass, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  ZoomIn,
  Search,
  Filter,
  Globe,
  Map as MapIcon
} from 'lucide-react';
import { GoogleTerritoryMap } from './GoogleTerritoryMap';
import { MSTerritoryInspector } from './MSTerritoryInspector';
import { OutOfTerritoryModal } from './OutOfTerritoryModal';

interface TerritoryMapProps {
  records: OFWCARecord[];
  msList: CoordinatorMS[];
  rmsList: CoordinatorRMS[];
  onReassignBatch: (recordIds: string[], targetMsName: string, reason?: string) => void;
  googleApiKey?: string;
  onSaveApiKey?: (newKey: string) => void;
  onOpenSettings?: () => void;
}

type ColorMode = 'ms' | 'rms' | 'gwp' | 'ofwca' | 'dkp';
type EngineMode = 'odl_svg' | 'ms_territory' | 'google_maps';

export const TerritoryMap: React.FC<TerritoryMapProps> = ({
  records,
  msList,
  rmsList,
  onReassignBatch,
  googleApiKey = '',
  onSaveApiKey = () => {},
  onOpenSettings = () => {}
}) => {
  const [engineMode, setEngineMode] = useState<EngineMode>('odl_svg');
  const [selectedInspectorMs, setSelectedInspectorMs] = useState<string>('');
  const [colorMode, setColorMode] = useState<ColorMode>('ms');
  const [selectedVoivodeship, setSelectedVoivodeship] = useState<VoivodeshipGeo | null>(null);
  const [hoveredVoivodeship, setHoveredVoivodeship] = useState<VoivodeshipGeo | null>(null);
  const [targetMsForVoivodeship, setTargetMsForVoivodeship] = useState<string>('');
  const [selectedOfwcaIdsInDrawer, setSelectedOfwcaIdsInDrawer] = useState<string[]>([]);
  const [drawerTab, setDrawerTab] = useState<'powiaty' | 'ms_breakdown' | 'ofwca_list' | 'reassign'>('ms_breakdown');
  const [powiatSearchTerm, setPowiatSearchTerm] = useState<string>('');
  const [outOfTerritoryModalData, setOutOfTerritoryModalData] = useState<{
    msName: string;
    voivodeshipName: string;
    records: OFWCARecord[];
  } | null>(null);

  // Maps and quick lookups
  const msMap = useMemo(() => new Map(msList.map(m => [m.name, m])), [msList]);
  const rmsMap = useMemo(() => new Map(rmsList.map(r => [r.name, r])), [rmsList]);

  // Group records by Voivodeship
  const voivodeshipStats = useMemo(() => {
    const stats = new Map<string, {
      records: OFWCARecord[];
      gwp2025: number;
      gwp2026: number;
      detal2026: number;
      eduPs2026: number;
      ofwcaCount: number;
      activeOfwcaCount: number;
      agentCount: number;
      dkpCount: number;
      dpdCount: number;
      msCounts: Map<string, { count: number; dkp: number; dpd: number; gwp2026: number }>;
      dominantMs: string;
      dominantRms: string;
    }>();

    POLAND_VOIVODESHIPS.forEach(v => {
      stats.set(v.name.toLowerCase(), {
        records: [],
        gwp2025: 0,
        gwp2026: 0,
        detal2026: 0,
        eduPs2026: 0,
        ofwcaCount: 0,
        activeOfwcaCount: 0,
        agentCount: 0,
        dkpCount: 0,
        dpdCount: 0,
        msCounts: new Map(),
        dominantMs: '',
        dominantRms: ''
      });
    });

    records.forEach(r => {
      const matchedV = matchRecordToVoivodeship(r, POLAND_VOIVODESHIPS);
      const key = matchedV ? matchedV.name.toLowerCase() : (r.wojewodztwo || '').toLowerCase();
      let item = stats.get(key);

      if (item) {
        item.records.push(r);
        item.gwp2025 += r.gwp2025Total;
        item.gwp2026 += r.gwp2026Total;
        item.detal2026 += r.gwp2026Detal;
        item.eduPs2026 += r.gwp2026EduPs;
        item.ofwcaCount++;
        if (r.isActive) item.activeOfwcaCount++;
        if (r.isDkp) item.dkpCount++;
        else item.dpdCount++;

        const currentMsEntry = item.msCounts.get(r.currentMs) || { count: 0, dkp: 0, dpd: 0, gwp2026: 0 };
        currentMsEntry.count++;
        if (r.isDkp) currentMsEntry.dkp++;
        else currentMsEntry.dpd++;
        currentMsEntry.gwp2026 += r.gwp2026Total;
        item.msCounts.set(r.currentMs, currentMsEntry);
      }
    });

    // Compute dominant MS and RMS
    stats.forEach(item => {
      item.agentCount = new Set(item.records.map(r => r.numerAgencji)).size;
      let maxCount = -1;
      let dominant = '';
      item.msCounts.forEach((val, ms) => {
        if (val.count > maxCount) {
          maxCount = val.count;
          dominant = ms;
        }
      });
      item.dominantMs = dominant;

      // Compute dominant RMS from records in this voivodeship
      const rmsCounts = new Map<string, number>();
      item.records.forEach(r => {
        const coord = msMap.get(r.currentMs);
        const rName = r.currentRms || coord?.rms || 'RMS Standard';
        rmsCounts.set(rName, (rmsCounts.get(rName) || 0) + 1);
      });
      let maxRmsCount = -1;
      let dominantRms = '';
      rmsCounts.forEach((c, rms) => {
        if (c > maxRmsCount) {
          maxRmsCount = c;
          dominantRms = rms;
        }
      });
      const coordinator = msMap.get(dominant);
      item.dominantRms = dominantRms || (coordinator ? coordinator.rms : 'RMS Standard');
    });

    return stats;
  }, [records, msMap]);

  // Max values for choropleth scales
  const maxGwp = useMemo(() => {
    let max = 1;
    voivodeshipStats.forEach(v => {
      if (v.gwp2026 > max) max = v.gwp2026;
    });
    return max;
  }, [voivodeshipStats]);

  const maxOfwca = useMemo(() => {
    let max = 1;
    voivodeshipStats.forEach(v => {
      if (v.ofwcaCount > max) max = v.ofwcaCount;
    });
    return max;
  }, [voivodeshipStats]);

  // Get color for voivodeship based on current coloring mode
  const getVoivodeshipColor = (geo: VoivodeshipGeo): string => {
    const data = voivodeshipStats.get(geo.name.toLowerCase());
    if (!data || data.records.length === 0) {
      return '#334155'; // Dark slate for empty
    }

    if (colorMode === 'ms') {
      const coordinator = msMap.get(data.dominantMs);
      return coordinator ? coordinator.color : '#475569';
    }

    if (colorMode === 'rms') {
      const dominantRmsName = (data.dominantRms || '').toLowerCase();
      // Match by exact name or region keyword (Północ, Centrum, Południe)
      const rms = rmsList.find(r => 
        r.name.toLowerCase() === dominantRmsName ||
        dominantRmsName.includes(r.name.toLowerCase()) ||
        r.name.toLowerCase().includes(dominantRmsName) ||
        (r.region && dominantRmsName.includes(r.region.toLowerCase()))
      );
      return rms ? rms.color : '#1d4ed8';
    }

    if (colorMode === 'gwp') {
      const ratio = Math.min(1, data.gwp2026 / maxGwp);
      return ratio > 0.7 ? '#059669' : ratio > 0.4 ? '#0284c7' : ratio > 0.15 ? '#6366f1' : '#334155';
    }

    if (colorMode === 'ofwca') {
      const ratio = Math.min(1, data.ofwcaCount / maxOfwca);
      return ratio > 0.7 ? '#f59e0b' : ratio > 0.4 ? '#f97316' : ratio > 0.15 ? '#e11d48' : '#475569';
    }

    if (colorMode === 'dkp') {
      const ratio = data.ofwcaCount > 0 ? data.dkpCount / data.ofwcaCount : 0;
      return ratio > 0.6 ? '#8b5cf6' : ratio > 0.35 ? '#3b82f6' : '#06b6d4';
    }

    return '#3b82f6';
  };

  const formatPLN = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)} mln PLN`;
    return `${(val / 1_000).toFixed(0)} tys. PLN`;
  };

  // Detailed analysis of MS in the selected voivodeship:
  // "ile owca jest z ich terenu a ile z poza z podziałe na DKP i DPD"
  const selectedVoivodeshipMsBreakdown = useMemo(() => {
    if (!selectedVoivodeship) return [];
    const vName = selectedVoivodeship.name.toLowerCase();
    const data = voivodeshipStats.get(vName);
    if (!data) return [];

    const result: Array<{
      msName: string;
      color: string;
      rmsName: string;
      isHomeTerritory: boolean;
      totalOfwcaInVoivodeship: number;
      // In territory (if this is home voivodeship)
      inTerritoryOfwca: number;
      inTerritoryDkp: number;
      inTerritoryDpd: number;
      // Out of territory (if home voivodeship is somewhere else)
      outOfTerritoryOfwca: number;
      outOfTerritoryDkp: number;
      outOfTerritoryDpd: number;
      inTerritoryRecords: OFWCARecord[];
      outOfTerritoryRecords: OFWCARecord[];
      gwp2026InVoivodeship: number;
    }> = [];

    data.msCounts.forEach((entry, msName) => {
      const coordinator = msMap.get(msName);
      const rms = coordinator ? coordinator.rms : 'RMS Standard';
      const color = coordinator ? coordinator.color : '#3b82f6';
      
      // Determine if this voivodeship is the coordinator's primary/home territory
      const homeWoj = (coordinator?.primaryVoivodeship || coordinator?.region || '').toLowerCase();
      const isHome = homeWoj ? (homeWoj.includes(vName) || vName.includes(homeWoj)) : false;

      const msRecords = data.records.filter(r => r.currentMs === msName);
      const inRecs = isHome ? msRecords : [];
      const outRecs = !isHome ? msRecords : [];

      result.push({
        msName,
        color,
        rmsName: rms,
        isHomeTerritory: isHome,
        totalOfwcaInVoivodeship: entry.count,
        inTerritoryOfwca: inRecs.length,
        inTerritoryDkp: inRecs.filter(r => r.isDkp).length,
        inTerritoryDpd: inRecs.filter(r => !r.isDkp).length,
        outOfTerritoryOfwca: outRecs.length,
        outOfTerritoryDkp: outRecs.filter(r => r.isDkp).length,
        outOfTerritoryDpd: outRecs.filter(r => !r.isDkp).length,
        inTerritoryRecords: inRecs,
        outOfTerritoryRecords: outRecs,
        gwp2026InVoivodeship: entry.gwp2026,
      });
    });

    return result.sort((a, b) => b.totalOfwcaInVoivodeship - a.totalOfwcaInVoivodeship);
  }, [selectedVoivodeship, voivodeshipStats, msMap]);

  // Administrative counties/powiaty analysis for the selected voivodeship
  const selectedVoivodeshipPowiaty = useMemo(() => {
    if (!selectedVoivodeship) return [];
    const vName = selectedVoivodeship.name.toLowerCase();
    const data = voivodeshipStats.get(vName);
    const recordsInVoivodeship = data ? data.records : [];

    // Map records by powiat
    const powiatRecordMap = new Map<string, OFWCARecord[]>();
    recordsInVoivodeship.forEach(r => {
      const pKey = (r.powiat || 'Brak powiatu').toLowerCase();
      const list = powiatRecordMap.get(pKey) || [];
      list.push(r);
      powiatRecordMap.set(pKey, list);
    });

    const powiatList = selectedVoivodeship.administrativePowiaty || [];
    const list = powiatList.map((p: PowiatGeoInfo) => {
      // Find matching records using robust geo matcher
      const matchedRecs = recordsInVoivodeship.filter(r => {
        const matched = matchRecordToPowiat(r, powiatList);
        return matched ? matched.terytCode === p.terytCode : false;
      });

      const totalOfwca = matchedRecs.length;
      const dkpCount = matchedRecs.filter(r => r.isDkp).length;
      const dpdCount = totalOfwca - dkpCount;
      const gwp2026 = matchedRecs.reduce((acc, r) => acc + r.gwp2026Total, 0);

      // Dominant MS in county
      const msCounts = new Map<string, number>();
      matchedRecs.forEach(r => {
        msCounts.set(r.currentMs, (msCounts.get(r.currentMs) || 0) + 1);
      });
      let dominantMs = 'Brak';
      let maxC = 0;
      msCounts.forEach((c, ms) => {
        if (c > maxC) {
          maxC = c;
          dominantMs = ms;
        }
      });

      return {
        ...p,
        totalOfwca,
        dkpCount,
        dpdCount,
        gwp2026,
        dominantMs,
        matchedRecs
      };
    });

    if (!powiatSearchTerm) return list;
    return list.filter((p: any) => 
      p.name.toLowerCase().includes(powiatSearchTerm.toLowerCase()) ||
      p.terytCode.includes(powiatSearchTerm) ||
      p.capital.toLowerCase().includes(powiatSearchTerm.toLowerCase()) ||
      p.dominantMs.toLowerCase().includes(powiatSearchTerm.toLowerCase())
    );
  }, [selectedVoivodeship, voivodeshipStats, powiatSearchTerm]);

  const handleOpenDrawer = (geo: VoivodeshipGeo) => {
    setSelectedVoivodeship(geo);
    const data = voivodeshipStats.get(geo.name.toLowerCase());
    setSelectedOfwcaIdsInDrawer(data ? data.records.map(r => r.id) : []);
    if (data && data.dominantMs) {
      setTargetMsForVoivodeship(data.dominantMs);
    } else if (msList.length > 0) {
      setTargetMsForVoivodeship(msList[0].name);
    }
  };

  const handleApplyVoivodeshipReassignment = () => {
    if (!selectedVoivodeship || !targetMsForVoivodeship || selectedOfwcaIdsInDrawer.length === 0) return;
    onReassignBatch(
      selectedOfwcaIdsInDrawer,
      targetMsForVoivodeship,
      `Przeniesienie terytorialne z mapy: woj. ${selectedVoivodeship.name}`
    );
  };

  const handleReassignPowiat = (powiatName: string, matchedRecs: OFWCARecord[], targetMs: string) => {
    if (matchedRecs.length === 0 || !targetMs) return;
    onReassignBatch(
      matchedRecs.map(r => r.id),
      targetMs,
      `Przeniesienie powiatu ${powiatName} do ${targetMs}`
    );
  };

  return (
    <div className="relative rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-5 mb-6">
      {/* Map Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <MapPin className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white tracking-wide">
              Interaktywna Mapa Polski z Podziałem Administracyjnym (ODL GIS)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Wektorowa mapa 16 województw i 380 powiatów TERYT. Kliknij w województwo, aby sprawdzić podział DKP/DPD, analizę „Z terenu vs Z poza” oraz obsadę MS.
          </p>
        </div>

        {/* Engine and Mode Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* GIS Engine Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-indigo-500/30 text-xs">
            <button
              onClick={() => setEngineMode('odl_svg')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                engineMode === 'odl_svg'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Województwa (ODL)</span>
            </button>

            <button
              onClick={() => {
                if (!selectedInspectorMs && msList.length > 0) {
                  setSelectedInspectorMs(msList[0].name);
                }
                setEngineMode('ms_territory');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                engineMode === 'ms_territory'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-cyan-300" />
              <span>Zakres MS do Powiatów</span>
            </button>

            <button
              onClick={() => setEngineMode('google_maps')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                engineMode === 'google_maps'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-300" />
              <span>Google Maps GIS</span>
            </button>
          </div>

          {/* Mode Selector Buttons for SVG */}
          {engineMode === 'odl_svg' && (
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-[11px] text-slate-400 px-2 font-medium flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Kolorowanie:
              </span>
              <button
                onClick={() => setColorMode('ms')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  colorMode === 'ms'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/25 ring-1 ring-orange-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span>Koordynatorzy (MS)</span>
              </button>
              <button
                onClick={() => setColorMode('rms')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  colorMode === 'rms'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 ring-1 ring-purple-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Dyrektorzy (RMS)</span>
              </button>
              <button
                onClick={() => setColorMode('gwp')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  colorMode === 'gwp'
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                GWP 2026
              </button>
              <button
                onClick={() => setColorMode('ofwca')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  colorMode === 'ofwca'
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Liczba OFWCA
              </button>
              <button
                onClick={() => setColorMode('dkp')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  colorMode === 'dkp'
                    ? 'bg-cyan-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Udział DKP %
              </button>
            </div>
          )}
        </div>
      </div>

      {engineMode === 'google_maps' ? (
        <GoogleTerritoryMap
          apiKey={googleApiKey}
          onSaveApiKey={onSaveApiKey}
          records={records}
          msList={msList}
          rmsList={rmsList}
          onReassignBatch={onReassignBatch}
          onSwitchToSvgMap={() => setEngineMode('odl_svg')}
        />
      ) : engineMode === 'ms_territory' ? (
        <MSTerritoryInspector
          records={records}
          msList={msList}
          rmsList={rmsList}
          onReassignBatch={onReassignBatch}
          initialSelectedMs={selectedInspectorMs || (msList[0]?.name)}
        />
      ) : (

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main SVG Map Canvas */}
        <div className="lg:col-span-8 relative bg-slate-950/90 rounded-2xl border border-slate-800/80 p-3 overflow-hidden shadow-inner flex flex-col items-center justify-center">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Active Mode Notice Banner */}
          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 mb-2 rounded-xl bg-slate-950/90 border border-slate-800 text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Aktywny Tryb:
              </span>
              {colorMode === 'ms' && (
                <span className="font-bold text-orange-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                  Koordynatorzy (MS) • 8 unikalnych barw menadżerów
                </span>
              )}
              {colorMode === 'rms' && (
                <span className="font-bold text-purple-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                  Obszary Dyrektorów Regionalnych (RMS) • 3 makroregiony Polski
                </span>
              )}
              {colorMode === 'gwp' && (
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Przypis Składki (Plan GWP 2026)
                </span>
              )}
              {colorMode === 'ofwca' && (
                <span className="font-bold text-blue-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Gęstość Liczby OFWCA w Województwach
                </span>
              )}
              {colorMode === 'dkp' && (
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  Udział Placówek Własnych (DKP %)
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              Kliknij województwo, aby sprawdzić szczegóły w panelu bocznym
            </span>
          </div>

          <svg
            viewBox="0 0 1000 950"
            className="w-full max-h-[640px] drop-shadow-2xl select-none"
          >
            {/* Defs for gradients and glow filters */}
            <defs>
              <filter id="voivodeship-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.4" floodColor="#000000" />
              </filter>
              <filter id="selected-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#38bdf8" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Voivodeship Boundaries & Polygons */}
            {POLAND_VOIVODESHIPS.map(geo => {
              const fillColor = getVoivodeshipColor(geo);
              const isHovered = hoveredVoivodeship?.id === geo.id;
              const isSelected = selectedVoivodeship?.id === geo.id;
              const stats = voivodeshipStats.get(geo.name.toLowerCase());

              return (
                <g key={geo.id} className="group">
                  <path
                    d={geo.path}
                    fill={fillColor}
                    stroke={isSelected ? '#ffffff' : isHovered ? '#38bdf8' : '#090d16'}
                    strokeWidth={isSelected ? '3.5' : isHovered ? '2.5' : '1.4'}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="transition-all duration-200 cursor-pointer hover:brightness-110 active:scale-[0.995]"
                    filter={isSelected ? 'url(#selected-glow)' : 'url(#voivodeship-shadow)'}
                    onMouseEnter={() => setHoveredVoivodeship(geo)}
                    onMouseLeave={() => setHoveredVoivodeship(null)}
                    onClick={() => handleOpenDrawer(geo)}
                  />

                  {/* Centroid Text Badge - Dynamically reflects active mode */}
                  <g className="pointer-events-none">
                    <rect
                      x={geo.labelX - 54}
                      y={geo.labelY - 16}
                      width="108"
                      height="36"
                      rx="8"
                      fill="rgba(8, 12, 22, 0.92)"
                      stroke={
                        isSelected 
                          ? '#38bdf8' 
                          : isHovered 
                          ? '#60a5fa' 
                          : colorMode === 'ms' 
                          ? '#ea580c' 
                          : colorMode === 'rms' 
                          ? '#a855f7' 
                          : 'rgba(255, 255, 255, 0.25)'
                      }
                      strokeWidth={isSelected ? '2.5' : '1'}
                    />

                    <text
                      x={geo.labelX}
                      y={geo.labelY - 2}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="11.5"
                      fontWeight="800"
                      className="tracking-wide"
                    >
                      {geo.name}
                    </text>
                    
                    <text
                      x={geo.labelX}
                      y={geo.labelY + 12}
                      textAnchor="middle"
                      fill={
                        colorMode === 'ms' 
                          ? '#fdba74' 
                          : colorMode === 'rms' 
                          ? '#d8b4fe' 
                          : colorMode === 'gwp' 
                          ? '#34d399' 
                          : '#38bdf8'
                      }
                      fontSize="9"
                      fontWeight="800"
                    >
                      {colorMode === 'ms'
                        ? (stats?.dominantMs ? `MS: ${stats.dominantMs.replace(/^MS\s*/, '')}` : 'Brak MS')
                        : colorMode === 'rms'
                        ? (stats?.dominantRms ? `RMS: ${stats.dominantRms.replace(/^RMS\s*/, '').replace(/\s*\(.*?\)/, '')}` : 'Brak RMS')
                        : colorMode === 'gwp'
                        ? formatPLN(stats?.gwp2026 || 0)
                        : colorMode === 'dkp'
                        ? `DKP: ${stats?.ofwcaCount ? Math.round((stats.dkpCount / stats.ofwcaCount) * 100) : 0}%`
                        : `${stats?.ofwcaCount || 0} OFWCA`
                      }
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Dynamic Map Legend Bar */}
          <div className="mt-3 p-3 bg-slate-950/90 rounded-xl border border-slate-800">
            {colorMode === 'ms' && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    <span>Legenda Koordynatorów Sprzedaży (MS):</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">Kliknij MS, aby przejść do inspektora powiatów</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  {msList.map(m => {
                    let domCount = 0;
                    voivodeshipStats.forEach(v => {
                      if (v.dominantMs === m.name) domCount++;
                    });
                    return (
                      <div
                        key={m.name}
                        onClick={() => {
                          setSelectedInspectorMs(m.name);
                          setEngineMode('ms_territory');
                        }}
                        className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-orange-500/40 transition cursor-pointer"
                        title="Kliknij, aby otworzyć inspektor powiatów tego MS"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: m.color }}
                        />
                        <div className="truncate">
                          <span className="font-semibold text-white truncate block">{m.name}</span>
                          <span className="text-[9px] text-slate-400">{domCount} województw</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {colorMode === 'rms' && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>Legenda Dyrektorów Regionalnych (RMS):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {rmsList.map(r => {
                    let domCount = 0;
                    let totalGwp = 0;
                    let totalOfwca = 0;
                    voivodeshipStats.forEach(v => {
                      const vRms = (v.dominantRms || '').toLowerCase();
                      if (
                        vRms === r.name.toLowerCase() ||
                        vRms.includes(r.region.toLowerCase()) ||
                        vRms.includes(r.name.toLowerCase()) ||
                        r.name.toLowerCase().includes(vRms)
                      ) {
                        domCount++;
                        totalGwp += v.gwp2026;
                        totalOfwca += v.ofwcaCount;
                      }
                    });
                    return (
                      <div
                        key={r.name}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-purple-500/25 shadow-sm"
                      >
                        <span
                          className="w-4 h-4 rounded-lg shrink-0 shadow-md"
                          style={{ backgroundColor: r.color }}
                        />
                        <div className="truncate">
                          <span className="font-bold text-white text-xs block truncate">{r.name}</span>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {domCount} województw • {totalOfwca} OFWCA • <span className="text-emerald-400 font-semibold">{formatPLN(totalGwp)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {colorMode === 'gwp' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-300">Skala Przypisu GWP 2026:</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400">Niski (&lt;1 mln zł)</span>
                  <div className="h-3 w-40 rounded-full bg-gradient-to-r from-slate-700 via-indigo-600 via-sky-600 to-emerald-500 shadow-inner" />
                  <span className="text-[10px] text-emerald-400 font-bold">Wysoki (&gt;10 mln zł)</span>
                </div>
              </div>
            )}

            {colorMode === 'ofwca' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-300">Gęstość Liczby OFWCA:</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400">Poniżej 3 agentów</span>
                  <div className="h-3 w-40 rounded-full bg-gradient-to-r from-slate-700 via-rose-600 via-orange-500 to-amber-400 shadow-inner" />
                  <span className="text-[10px] text-amber-300 font-bold">Powyżej 8 agentów</span>
                </div>
              </div>
            )}

            {colorMode === 'dkp' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-300">Udział Placówek Własnych (DKP %):</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-cyan-400 font-bold">&lt;30% DKP</span>
                  <div className="h-3 w-40 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 shadow-inner" />
                  <span className="text-[10px] text-purple-400 font-bold">&gt;60% DKP</span>
                </div>
              </div>
            )}
          </div>

          {/* Floating Hover Tooltip */}
          {hoveredVoivodeship && (() => {
            const stats = voivodeshipStats.get(hoveredVoivodeship.name.toLowerCase());
            if (!stats) return null;
            return (
              <div className="absolute top-4 left-4 z-20 pointer-events-none rounded-xl bg-slate-900/95 border border-slate-700/80 p-3 shadow-2xl backdrop-blur-md text-xs text-slate-200 max-w-xs animate-in fade-in zoom-in-95">
                <div className="font-bold text-white text-sm mb-1 flex items-center justify-between">
                  <span>Woj. {hoveredVoivodeship.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {hoveredVoivodeship.capital}
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300 mt-2">
                  <div className="flex justify-between">
                    <span>Koordynator (MS):</span>
                    <strong className="text-white">{stats.dominantMs || 'Brak'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Region / RMS:</span>
                    <span className="text-slate-300">{stats.dominantRms || 'Brak'}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800">
                    <span>GWP 2026:</span>
                    <strong className="text-emerald-400">{formatPLN(stats.gwp2026)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>OFWCA (Aktywni):</span>
                    <strong className="text-white">{stats.activeOfwcaCount} / {stats.ofwcaCount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Struktura:</span>
                    <span className="text-violet-400 font-semibold">{stats.dkpCount} DKP / {stats.dpdCount} DPD</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Podział administracyjny:</span>
                    <span>{(hoveredVoivodeship.administrativePowiaty || []).length} powiatów</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right Inspection & Drilldown Drawer */}
        <div className="lg:col-span-4 bg-slate-950/90 rounded-2xl border border-slate-800/80 p-4 shadow-xl flex flex-col min-h-[580px]">
          {selectedVoivodeship ? (
            (() => {
              const data = voivodeshipStats.get(selectedVoivodeship.name.toLowerCase());
              const powiatyCount = (selectedVoivodeship.administrativePowiaty || []).length;
              return (
                <div className="space-y-4 flex-1 flex flex-col">
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">
                          Woj. {selectedVoivodeship.name}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                          {selectedVoivodeship.capital}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {powiatyCount} powiatów administracyjnych
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedVoivodeship(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">OFWCA Łącznie:</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {data?.ofwcaCount || 0}
                      </div>
                      <div className="text-[10px] text-violet-300 mt-0.5">
                        {data?.dkpCount || 0} DKP • {data?.dpdCount || 0} DPD
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400">GWP 2026:</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">
                        {formatPLN(data?.gwp2026 || 0)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Agencji: {data?.agentCount || 0}
                      </div>
                    </div>
                  </div>

                  {/* Drawer Navigation Tabs */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
                    <button
                      onClick={() => setDrawerTab('ms_breakdown')}
                      className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer text-center ${
                        drawerTab === 'ms_breakdown'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Obszary MS (Teren/Poza)
                    </button>
                    <button
                      onClick={() => setDrawerTab('powiaty')}
                      className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer text-center ${
                        drawerTab === 'powiaty'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Powiaty ({powiatyCount})
                    </button>
                    <button
                      onClick={() => setDrawerTab('reassign')}
                      className={`flex-1 py-1.5 rounded-lg font-semibold transition cursor-pointer text-center ${
                        drawerTab === 'reassign'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Przenieś rejon
                    </button>
                  </div>

                  {/* DRAWER TAB 1: OBSZARY MS: TEREN VS POZA Z PODZIAŁEM DKP/DPD */}
                  {drawerTab === 'ms_breakdown' && (
                    <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
                      <div className="text-[11px] text-slate-300 font-semibold flex items-center justify-between">
                        <span>Koordynatorzy w woj. {selectedVoivodeship.name}:</span>
                        <span className="text-[10px] text-slate-500">Z terenu vs Z poza</span>
                      </div>

                      <div className="overflow-y-auto max-h-[340px] pr-1 space-y-2">
                        {selectedVoivodeshipMsBreakdown.length === 0 ? (
                          <div className="p-4 rounded-xl bg-slate-900/60 text-center text-slate-500 text-xs">
                            Brak przypisanych koordynatorów do tego województwa.
                          </div>
                        ) : (
                          selectedVoivodeshipMsBreakdown.map(row => (
                            <div
                              key={row.msName}
                              className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2 hover:border-slate-700 transition"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: row.color }}
                                  />
                                  <strong className="text-white text-xs">{row.msName}</strong>
                                </div>
                                {row.isHomeTerritory ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                                    Teren Macierzysty
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                                    Obsługa Zewnętrzna
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-slate-800/80">
                                {/* Z terenu breakdown */}
                                <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                                  <div className="font-bold text-emerald-400">
                                    Z terenu: {row.inTerritoryOfwca} OFWCA
                                  </div>
                                  <div className="text-slate-400 mt-0.5">
                                    <span className="text-violet-300 font-semibold">{row.inTerritoryDkp} DKP</span> / <span className="text-sky-300 font-semibold">{row.inTerritoryDpd} DPD</span>
                                  </div>
                                </div>

                                {/* Z poza breakdown - interactive click */}
                                <div 
                                  onClick={() => {
                                    if (row.outOfTerritoryOfwca > 0 && selectedVoivodeship) {
                                      setOutOfTerritoryModalData({
                                        msName: row.msName,
                                        voivodeshipName: selectedVoivodeship.name,
                                        records: row.outOfTerritoryRecords
                                      });
                                    }
                                  }}
                                  className={`p-2 rounded-lg border transition ${
                                    row.outOfTerritoryOfwca > 0
                                      ? 'bg-amber-950/30 border-amber-500/40 hover:bg-amber-950/60 hover:border-amber-400 cursor-pointer shadow-sm group'
                                      : 'bg-slate-900 border-slate-800 opacity-60'
                                  }`}
                                  title={row.outOfTerritoryOfwca > 0 ? 'Kliknij, aby zobaczyć z jakich powiatów i agencji pochodzą ci OFWCA' : ''}
                                >
                                  <div className="font-bold text-amber-400 flex items-center justify-between">
                                    <span>Z poza: {row.outOfTerritoryOfwca} OFWCA</span>
                                    {row.outOfTerritoryOfwca > 0 && (
                                      <span className="text-[9px] text-amber-300 font-normal underline group-hover:text-white">
                                        Szczegóły &rarr;
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-slate-400 mt-0.5">
                                    <span className="text-violet-300 font-semibold">{row.outOfTerritoryDkp} DKP</span> / <span className="text-sky-300 font-semibold">{row.outOfTerritoryDpd} DPD</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                                <span>GWP w tym woj.: <strong className="text-white">{formatPLN(row.gwp2026InVoivodeship)}</strong></span>
                                <button
                                  onClick={() => {
                                    setSelectedInspectorMs(row.msName);
                                    setEngineMode('ms_territory');
                                    setSelectedVoivodeship(null);
                                  }}
                                  className="px-2 py-0.5 rounded bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 font-semibold border border-blue-500/20 flex items-center gap-1 transition cursor-pointer"
                                  title={`Zobacz pełny zasięg terytorialny ${row.msName} we wszystkich powiatach`}
                                >
                                  <Compass className="w-3 h-3" />
                                  <span>Zasięg w powiatach</span>
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* DRAWER TAB 2: POWIATY ADMINISTRACYJNE */}
                  {drawerTab === 'powiaty' && (
                    <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Szukaj powiatu lub kodu TERYT..."
                          value={powiatSearchTerm}
                          onChange={e => setPowiatSearchTerm(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="overflow-y-auto max-h-[330px] pr-1 space-y-2">
                        {selectedVoivodeshipPowiaty.map(p => (
                          <div
                            key={p.terytCode}
                            className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5 hover:border-slate-700 transition"
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-white text-[11px]">
                                {p.name}
                              </div>
                              <span className="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-[9px] text-slate-400 border border-slate-800">
                                TERYT: {p.terytCode}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>Stolica: <strong className="text-slate-300">{p.capital}</strong> ({p.type})</span>
                              <span>Koordynator: <strong className="text-blue-400">{p.dominantMs}</strong></span>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                              <span className="text-slate-300 font-semibold">
                                {p.totalOfwca} OFWCA (<span className="text-violet-300">{p.dkpCount} DKP</span> / <span className="text-sky-300">{p.dpdCount} DPD</span>)
                              </span>
                              <span className="text-emerald-400 font-bold">
                                {formatPLN(p.gwp2026)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* DRAWER TAB 3: REASSIGN WHOLE VOIVODESHIP */}
                  {drawerTab === 'reassign' && (
                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200 leading-relaxed">
                          Możesz hurtowo przenieść wszystkich {data?.ofwcaCount || 0} sprzedawców z województwa <strong>{selectedVoivodeship.name}</strong> do nowego koordynatora (MS).
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                            Docelowy Koordynator (MS):
                          </label>
                          <select
                            value={targetMsForVoivodeship}
                            onChange={e => setTargetMsForVoivodeship(e.target.value)}
                            className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                          >
                            {msList.map(m => (
                              <option key={m.id} value={m.name}>
                                {m.name} ({m.rms}{m.region ? ` • ${m.region}` : ''})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={handleApplyVoivodeshipReassignment}
                        disabled={!targetMsForVoivodeship || (data?.ofwcaCount || 0) === 0}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                        <span>Przenieś woj. {selectedVoivodeship.name} do {targetMsForVoivodeship}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Wybierz województwo na mapie</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Kliknij w dowolny region, aby wyświetlić pełny podział na powiaty, obsadę koordynatorów oraz analizę OFWCA z terenu vs z poza (DKP/DPD).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Out of Territory Details Modal */}
      {outOfTerritoryModalData && (
        <OutOfTerritoryModal
          isOpen={true}
          onClose={() => setOutOfTerritoryModalData(null)}
          msName={outOfTerritoryModalData.msName}
          voivodeshipName={outOfTerritoryModalData.voivodeshipName}
          records={outOfTerritoryModalData.records}
          msList={msList}
          onReassign={onReassignBatch}
        />
      )}
    </div>
  );
};

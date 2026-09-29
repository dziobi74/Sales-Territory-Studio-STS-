import React, { useState, useMemo, useEffect } from 'react';
import { 
  APIProvider, 
  Map as GoogleMap, 
  AdvancedMarker, 
  Pin, 
  InfoWindow 
} from '@vis.gl/react-google-maps';
import { OFWCARecord, CoordinatorMS, CoordinatorRMS } from '../types';
import { POLAND_VOIVODESHIPS, VoivodeshipGeo, PowiatGeoInfo } from '../data/polandGeo';
import { 
  POLAND_MAP_CENTER, 
  VOIVODESHIP_COORDINATES, 
  getCoordinatesForPowiat 
} from '../data/polandCoordinates';
import { matchRecordToVoivodeship, matchRecordToPowiat } from '../utils/geoMatcher';
import { 
  MapPin, 
  Layers, 
  Search, 
  Compass, 
  ArrowRightLeft, 
  X, 
  CheckCircle2, 
  Building2, 
  AlertTriangle,
  Key,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface GoogleTerritoryMapProps {
  apiKey: string;
  onSaveApiKey: (newKey: string) => void;
  records: OFWCARecord[];
  msList: CoordinatorMS[];
  rmsList: CoordinatorRMS[];
  onReassignBatch: (recordIds: string[], targetMsName: string, reason?: string) => void;
  onSwitchToSvgMap: () => void;
}

export const GoogleTerritoryMap: React.FC<GoogleTerritoryMapProps> = ({
  apiKey,
  onSaveApiKey,
  records,
  msList,
  rmsList,
  onReassignBatch,
  onSwitchToSvgMap
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [selectedVoivodeship, setSelectedVoivodeship] = useState<VoivodeshipGeo | null>(null);
  const [selectedPowiat, setSelectedPowiat] = useState<{
    name: string;
    teryt: string;
    capital: string;
    voivodeship: string;
    dominantMs: string;
    dominantRms: string;
    dominantColor: string;
    ofwcaCount: number;
    dkpCount: number;
    dpdCount: number;
    gwp2026: number;
    recs: OFWCARecord[];
    lat: number;
    lng: number;
  } | null>(null);

  const [activeInfoWindow, setActiveInfoWindow] = useState<string | null>(null);
  const [powiatSearchQuery, setPowiatSearchQuery] = useState('');
  const [targetMsName, setTargetMsName] = useState(msList[0]?.name || '');
  const [showOnlyWithRecords, setShowOnlyWithRecords] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);

  // Intercept Google Maps Authentication Failure (ApiNotActivatedMapError, etc.)
  useEffect(() => {
    const prevAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      setMapLoadError('ApiNotActivatedMapError');
      if (typeof prevAuthFailure === 'function') {
        try { prevAuthFailure(); } catch {}
      }
    };

    const handleWindowError = (e: ErrorEvent) => {
      if (e.message && (e.message.includes('ApiNotActivatedMapError') || e.message.includes('google.maps'))) {
        e.preventDefault();
        setMapLoadError('ApiNotActivatedMapError');
      }
    };

    window.addEventListener('error', handleWindowError);
    return () => {
      window.removeEventListener('error', handleWindowError);
      (window as any).gm_authFailure = prevAuthFailure;
    };
  }, []);

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey]);

  const msMap = useMemo(() => new Map(msList.map(m => [m.name, m])), [msList]);

  // Aggregate stats per Voivodeship using robust matcher
  const voivodeshipStats = useMemo(() => {
    const stats = new Map<string, {
      totalOfwca: number;
      activeOfwca: number;
      totalGwp2026: number;
      dkpCount: number;
      dpdCount: number;
      dominantMs: string;
      dominantRms: string;
      color: string;
      records: OFWCARecord[];
    }>();

    POLAND_VOIVODESHIPS.forEach(v => {
      stats.set(v.name.toLowerCase(), {
        totalOfwca: 0,
        activeOfwca: 0,
        totalGwp2026: 0,
        dkpCount: 0,
        dpdCount: 0,
        dominantMs: 'Brak',
        dominantRms: 'Brak',
        color: '#3b82f6',
        records: []
      });
    });

    const msCountMap = new Map<string, Map<string, number>>();

    records.forEach(r => {
      const matchedV = matchRecordToVoivodeship(r, POLAND_VOIVODESHIPS);
      const vKey = matchedV ? matchedV.name.toLowerCase() : (r.wojewodztwo || '').toLowerCase();

      let item = stats.get(vKey);
      if (!item) {
        item = {
          totalOfwca: 0,
          activeOfwca: 0,
          totalGwp2026: 0,
          dkpCount: 0,
          dpdCount: 0,
          dominantMs: 'Brak',
          dominantRms: 'Brak',
          color: '#3b82f6',
          records: []
        };
        stats.set(vKey, item);
      }

      item.records.push(r);
      item.totalOfwca++;
      if (r.isActive) item.activeOfwca++;
      item.totalGwp2026 += r.gwp2026Total;
      if (r.isDkp) item.dkpCount++;
      else item.dpdCount++;

      if (!msCountMap.has(vKey)) msCountMap.set(vKey, new Map());
      const counts = msCountMap.get(vKey)!;
      counts.set(r.currentMs, (counts.get(r.currentMs) || 0) + 1);
    });

    // Compute dominant coordinator per voivodeship
    stats.forEach((item, key) => {
      const counts = msCountMap.get(key);
      if (counts && counts.size > 0) {
        let max = -1;
        let domMs = '';
        counts.forEach((c, ms) => {
          if (c > max) {
            max = c;
            domMs = ms;
          }
        });
        item.dominantMs = domMs;
        const coordinator = msMap.get(domMs);
        if (coordinator) {
          item.dominantRms = coordinator.rms;
          item.color = coordinator.color;
        }
      }
    });

    return stats;
  }, [records, msMap]);

  // Aggregate stats per Powiat with robust matching against records
  const allPowiatyStats = useMemo(() => {
    const list: Array<{
      name: string;
      teryt: string;
      capital: string;
      voivodeship: string;
      dominantMs: string;
      dominantRms: string;
      dominantColor: string;
      ofwcaCount: number;
      dkpCount: number;
      dpdCount: number;
      gwp2026: number;
      recs: OFWCARecord[];
      lat: number;
      lng: number;
    }> = [];

    // Pre-group records by matched voivodeship
    const recordsByVoivodeship = new Map<string, OFWCARecord[]>();
    records.forEach(r => {
      const v = matchRecordToVoivodeship(r, POLAND_VOIVODESHIPS);
      const key = v ? v.id : 'inne';
      const arr = recordsByVoivodeship.get(key) || [];
      arr.push(r);
      recordsByVoivodeship.set(key, arr);
    });

    POLAND_VOIVODESHIPS.forEach(v => {
      const vRecords = recordsByVoivodeship.get(v.id) || [];
      const powiaty = v.administrativePowiaty || [];

      powiaty.forEach(p => {
        // Find all records that belong to this powiat
        const matchedRecs = vRecords.filter(r => {
          const matchedP = matchRecordToPowiat(r, powiaty);
          return matchedP ? matchedP.terytCode === p.terytCode : false;
        });

        // Determine dominant MS in this powiat
        const msFreq = new Map<string, number>();
        matchedRecs.forEach(r => {
          msFreq.set(r.currentMs, (msFreq.get(r.currentMs) || 0) + 1);
        });
        let dominantMs = 'Brak';
        let dominantRms = 'Brak';
        let dominantColor = '#3b82f6';
        let max = 0;
        msFreq.forEach((c, ms) => {
          if (c > max) {
            max = c;
            dominantMs = ms;
          }
        });

        const coordinator = msMap.get(dominantMs);
        if (coordinator) {
          dominantRms = coordinator.rms;
          dominantColor = coordinator.color;
        }

        const dkpCount = matchedRecs.filter(r => r.isDkp).length;
        const coords = getCoordinatesForPowiat(p.capital || p.name, v.name);

        list.push({
          name: p.name,
          teryt: p.terytCode,
          capital: p.capital,
          voivodeship: v.name,
          dominantMs,
          dominantRms,
          dominantColor,
          ofwcaCount: matchedRecs.length,
          dkpCount,
          dpdCount: matchedRecs.length - dkpCount,
          gwp2026: matchedRecs.reduce((s, r) => s + r.gwp2026Total, 0),
          recs: matchedRecs,
          lat: coords.lat,
          lng: coords.lng
        });
      });
    });

    return list;
  }, [records, msMap]);

  // Filtered powiaty for search and selected region
  const filteredPowiaty = useMemo(() => {
    let result = allPowiatyStats;

    if (selectedVoivodeship) {
      result = result.filter(p => p.voivodeship.toLowerCase() === selectedVoivodeship.name.toLowerCase());
    }

    if (showOnlyWithRecords) {
      result = result.filter(p => p.ofwcaCount > 0);
    }

    if (powiatSearchQuery) {
      const q = powiatSearchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.teryt.includes(q) ||
        p.capital.toLowerCase().includes(q) ||
        p.dominantMs.toLowerCase().includes(q) ||
        p.voivodeship.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allPowiatyStats, selectedVoivodeship, showOnlyWithRecords, powiatSearchQuery]);

  const totalPowiatyWithRecords = useMemo(() => {
    return allPowiatyStats.filter(p => p.ofwcaCount > 0).length;
  }, [allPowiatyStats]);

  const formatPLN = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)} mln zł`;
    return `${(val / 1_000).toFixed(0)} tys. zł`;
  };

  const handleApplyKey = () => {
    if (!inputKey.trim()) return;
    setMapLoadError(null);
    onSaveApiKey(inputKey.trim());
  };

  const handleSelectPowiat = (powiat: typeof allPowiatyStats[0]) => {
    setSelectedPowiat(powiat);
    setActiveInfoWindow(powiat.teryt);
  };

  const handleReassignPowiat = () => {
    if (!selectedPowiat || !targetMsName || selectedPowiat.recs.length === 0) return;
    onReassignBatch(
      selectedPowiat.recs.map(r => r.id),
      targetMsName,
      `Przeniesienie powiatu ${selectedPowiat.name} (${selectedPowiat.voivodeship}) do ${targetMsName}`
    );
    setSelectedPowiat(null);
    setActiveInfoWindow(null);
  };

  return (
    <div className="space-y-4">
      {/* Direct Google API Key Input Bar */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Key className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Twój Klucz Google API (Maps + AI):</span>
              {apiKey ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Aktywny w aplikacji</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[10px]">
                  Wymagany do załadowania Google Maps
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Wpisz lub zmień klucz bezpośrednio w tym polu. Zapisuje się lokalnie na Twoim komputerze PC.
            </p>
          </div>
        </div>

        {/* Input & Action */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="password"
            placeholder="Wpisz klucz np. AIzaSy..."
            value={inputKey}
            onChange={e => setInputKey(e.target.value)}
            className="w-full sm:w-72 font-mono text-xs px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleApplyKey}
            disabled={!inputKey.trim()}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer whitespace-nowrap"
          >
            Zapisz i Załaduj
          </button>
        </div>
      </div>

      {/* Map Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
            <Compass className="w-4 h-4" />
          </span>
          <span className="font-bold text-white">Google Maps GIS • Podział Administracyjny Polski</span>

          <span className="text-[11px] text-slate-400 hidden md:inline">
            (Naniesiono <strong>{totalPowiatyWithRecords}</strong> powiatów z pliku / <strong>{records.length}</strong> OFWCA)
          </span>

          {selectedVoivodeship && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 flex items-center gap-1.5">
              <span>Woj. {selectedVoivodeship.name}</span>
              <button 
                onClick={() => setSelectedVoivodeship(null)}
                className="hover:text-white cursor-pointer"
                title="Wyczyść filtr województwa"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {/* Map Type & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Powiat Search */}
          <div className="relative w-48">
            <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Szukaj powiatu / TERYT..."
              value={powiatSearchQuery}
              onChange={e => setPowiatSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <label className="flex items-center gap-1.5 text-slate-300 text-[11px] cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyWithRecords}
              onChange={e => setShowOnlyWithRecords(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span>Tylko z OFWCA</span>
          </label>

          {/* Map Layer Type */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px]">
            <button
              onClick={() => setMapType('roadmap')}
              className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                mapType === 'roadmap' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mapa
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                mapType === 'satellite' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satelita
            </button>
            <button
              onClick={() => setMapType('hybrid')}
              className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                mapType === 'hybrid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hybryda
            </button>
            <button
              onClick={() => setMapType('terrain')}
              className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                mapType === 'terrain' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Teren
            </button>
          </div>
        </div>
      </div>

      {/* Main Google Maps View or Fallback */}
      {!apiKey ? (
        <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Key className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Wprowadź swój Google Maps API Key</h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1">
              Do załadowania satelitarnych map Google oraz pełnego podziału administracyjnego na 380 powiatów TERYT wpisz swój klucz API w pasku powyżej i kliknij <strong>„Zapisz i Załaduj”</strong>.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onSwitchToSvgMap}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer"
            >
              Przełącz na Wektorową Mapę ODL (nie wymaga klucza)
            </button>
          </div>
        </div>
      ) : mapLoadError ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-amber-500/40 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-lg mx-auto">
            <h3 className="text-base font-bold text-white">
              Usługa Google Maps JavaScript API nie jest aktywna dla tego klucza
            </h3>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-mono border border-rose-500/30">
              Kod błędu: ApiNotActivatedMapError
            </span>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              Podany klucz Google API działa poprawnie (np. dla sztucznej inteligencji <strong>Gemini AI</strong>), ale w Twoim projekcie Google Cloud nie włączono jeszcze usługi <strong>Maps JavaScript API</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left max-w-lg mx-auto text-xs space-y-2">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <span>Jak to szybko naprawić:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
              <li>Otwórz <a href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold inline-flex items-center gap-1">konsolę Google Cloud Console <ExternalLink className="w-3 h-3 inline" /></a>.</li>
              <li>Wybierz swój projekt i kliknij niebieski przycisk <strong>„WŁĄCZ” (Enable)</strong> dla Maps JavaScript API.</li>
              <li>Po włączeniu mapy załadują się automatycznie lub możesz od razu korzystać z bezpłatnej mapy wektorowej poniżej:</li>
            </ol>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onSwitchToSvgMap}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition cursor-pointer flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Przełącz na Wektorową Mapę ODL (16 woj. / 380 powiatów)</span>
            </button>

            <button
              onClick={() => setMapLoadError(null)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
            >
              Spróbuj ponownie
            </button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl h-[620px] w-full bg-slate-950">
          <APIProvider 
            apiKey={apiKey}
            onError={(e) => {
              console.error('Google Maps Load Error:', e);
              setMapLoadError('Nie udało się zainicjalizować Google Maps. Upewnij się, że klucz API ma włączone "Maps JavaScript API" w konsoli Google Cloud.');
            }}
          >
            <GoogleMap
              key={apiKey}
              mapId="DEMO_MAP_ID"
              defaultCenter={{
                lat: selectedVoivodeship ? VOIVODESHIP_COORDINATES[selectedVoivodeship.id]?.lat || POLAND_MAP_CENTER.lat : POLAND_MAP_CENTER.lat,
                lng: selectedVoivodeship ? VOIVODESHIP_COORDINATES[selectedVoivodeship.id]?.lng || POLAND_MAP_CENTER.lng : POLAND_MAP_CENTER.lng
              }}
              defaultZoom={selectedVoivodeship ? VOIVODESHIP_COORDINATES[selectedVoivodeship.id]?.zoom || 8 : POLAND_MAP_CENTER.zoom}
              mapTypeId={mapType}
              gestureHandling="greedy"
              disableDefaultUI={false}
              internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
              className="w-full h-full"
            >
              {/* 16 Voivodeship Centroid Badges */}
              {POLAND_VOIVODESHIPS.map(v => {
                const coords = VOIVODESHIP_COORDINATES[v.id];
                const stats = voivodeshipStats.get(v.name.toLowerCase());
                if (!coords) return null;

                return (
                  <AdvancedMarker
                    key={v.id}
                    position={{ lat: coords.lat, lng: coords.lng }}
                    onClick={() => {
                      setSelectedVoivodeship(v);
                      setActiveInfoWindow(v.id);
                    }}
                    title={`Województwo ${v.name}`}
                  >
                    <div className="group cursor-pointer transform hover:scale-110 transition-transform">
                      <div 
                        className="px-2.5 py-1 rounded-xl text-white text-[10px] font-bold shadow-2xl flex items-center gap-1.5 border border-white/40 backdrop-blur-md"
                        style={{ backgroundColor: stats?.color || '#3b82f6' }}
                      >
                        <span className="font-extrabold">{v.code}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        <span>{stats?.totalOfwca || 0} OFWCA</span>
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* County (Powiat) Markers */}
              {filteredPowiaty.map(p => {
                const hasOfwca = p.ofwcaCount > 0;
                return (
                  <AdvancedMarker
                    key={p.teryt}
                    position={{ lat: p.lat, lng: p.lng }}
                    onClick={() => handleSelectPowiat(p)}
                    title={`${p.name} (TERYT: ${p.teryt}) • ${p.ofwcaCount} OFWCA`}
                  >
                    <Pin
                      background={hasOfwca ? p.dominantColor : '#475569'}
                      borderColor="#ffffff"
                      glyphColor="#ffffff"
                      scale={hasOfwca ? 1.05 : 0.65}
                    />
                  </AdvancedMarker>
                );
              })}

              {/* InfoWindow for selected powiat */}
              {selectedPowiat && activeInfoWindow === selectedPowiat.teryt && (
                <InfoWindow
                  position={{ lat: selectedPowiat.lat, lng: selectedPowiat.lng }}
                  onCloseClick={() => {
                    setSelectedPowiat(null);
                    setActiveInfoWindow(null);
                  }}
                >
                  <div className="p-1.5 text-slate-900 text-xs min-w-[240px] space-y-2">
                    <div className="border-b pb-1.5">
                      <div className="font-bold text-sm text-slate-900 flex items-center justify-between">
                        <span>{selectedPowiat.name}</span>
                        <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                          TERYT: {selectedPowiat.teryt}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Stolica: <strong>{selectedPowiat.capital}</strong> • Woj. <strong>{selectedPowiat.voivodeship}</strong>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded">
                        <span className="text-slate-600">Dominujący Koordynator:</span>
                        <strong className="text-blue-700 font-bold">{selectedPowiat.dominantMs}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Liczba OFWCA:</span>
                        <strong className="text-slate-900">{selectedPowiat.ofwcaCount} sprzedawców</strong>
                      </div>
                      <div className="flex justify-between text-indigo-700 font-medium">
                        <span>Podział DKP / DPD:</span>
                        <span><strong>{selectedPowiat.dkpCount}</strong> DKP / <strong>{selectedPowiat.dpdCount}</strong> DPD</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-bold border-t pt-1">
                        <span>Przypis GWP 2026:</span>
                        <span>{formatPLN(selectedPowiat.gwp2026)}</span>
                      </div>
                    </div>

                    {selectedPowiat.ofwcaCount > 0 ? (
                      <div className="pt-2 border-t space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-700 block">
                          Przenieś wszystkich {selectedPowiat.ofwcaCount} OFWCA z tego powiatu:
                        </label>
                        <div className="flex items-center gap-1.5">
                          <select
                            value={targetMsName}
                            onChange={e => setTargetMsName(e.target.value)}
                            className="flex-1 text-[11px] p-1.5 rounded border border-slate-300 bg-white font-medium"
                          >
                            {msList.map(m => (
                              <option key={m.id} value={m.name}>{m.name} ({m.rms})</option>
                            ))}
                          </select>
                          <button
                            onClick={handleReassignPowiat}
                            className="px-2.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Przenieś
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 italic pt-1">
                        Brak aktywnych OFWCA w tym powiecie w aktualnym zbiorze danych.
                      </div>
                    )}
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </APIProvider>

          {/* Floating County Summary HUD */}
          <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs text-slate-300 shadow-2xl space-y-1 max-w-xs">
            <div className="font-bold text-white text-[11px] flex items-center justify-between">
              <span>Podział Administracyjny Polski</span>
              <span className="text-[10px] text-blue-400 font-mono">16 woj. / 380 pow.</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Kliknij dowolny znacznik powiatu, aby sprawdzić liczbę OFWCA, strukturę DKP/DPD oraz dokonać transferu terytorium.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

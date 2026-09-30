import React, { useState, useMemo } from 'react';
import { OFWCARecord, CoordinatorMS, CoordinatorRMS } from '../types';
import { 
  GitBranch, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Building2, 
  User, 
  TrendingUp, 
  BarChart3,
  MapPin,
  Map as MapIcon,
  Search,
  CheckCircle2,
  FolderOpen,
  Folder,
  UserCheck,
  ShieldCheck,
  Network,
  Compass,
  ArrowRight,
  Filter,
  Download
} from 'lucide-react';

interface HierarchyAnalyticsProps {
  records: OFWCARecord[];
  msList: CoordinatorMS[];
  rmsList: CoordinatorRMS[];
}

export interface HierarchyNode {
  id: string;
  name: string;
  type: 'oddzial' | 'region_oddzial' | 'region_wojewodztwo' | 'wojewodztwo' | 'powiat' | 'ofwca';
  level: number; // 1 to 6
  typeLabel: string;
  gwp2024: number;
  gwp2025: number;
  gwp2026: number;
  detal2026: number;
  eduPs2026: number;
  ofwcaCount: number;
  dkpCount: number;
  dpdCount: number;
  activeMsSet: Set<string>;
  activeRmsSet: Set<string>;
  children: Record<string, HierarchyNode>;
  breadcrumb: { type: string; name: string; id: string }[];
  record?: OFWCARecord;
  descendantRecords: OFWCARecord[];
}

export const HierarchyAnalytics: React.FC<HierarchyAnalyticsProps> = ({
  records,
  msList,
  rmsList,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMs, setFilterMs] = useState<string>('all');
  const [filterChannel, setFilterChannel] = useState<'all' | 'dkp' | 'dpd'>('all');
  const [activeAnalysisView, setActiveAnalysisView] = useState<'hierarchy' | 'wojewodztwa' | 'products'>('hierarchy');

  const msMap = useMemo(() => new Map(msList.map(m => [m.name, m])), [msList]);
  const rmsMap = useMemo(() => new Map(rmsList.map(r => [r.name, r])), [rmsList]);

  const formatPLN = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)} mln zł`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)} tys. zł`;
    return `${val.toFixed(0)} zł`;
  };

  // Filter records if channel or MS filter applied
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (filterMs !== 'all' && r.currentMs !== filterMs) return false;
      if (filterChannel === 'dkp' && !r.isDkp) return false;
      if (filterChannel === 'dpd' && r.isDkp) return false;
      return true;
    });
  }, [records, filterMs, filterChannel]);

  // Construct the full 6-level Tree Structure:
  // Level 1: Oddział
  // Level 2: Region_oddział
  // Level 3: Region_województwo
  // Level 4: Województwo
  // Level 5: Powiat
  // Level 6: OFWCA
  const { tree, flatNodeMap } = useMemo(() => {
    const rootNodes: Record<string, HierarchyNode> = {};
    const nodeMap = new Map<string, HierarchyNode>();

    filteredRecords.forEach(r => {
      const oddzName = r.oddzial || 'Oddział Główny';
      const regOddzName = r.regionOddzial || 'Region 1';
      const regWojName = r.regionWojewodztwo || 'Obszar Centralny';
      const wojName = r.wojewodztwo || 'Nieokreślone';
      const powName = r.powiat || 'Brak powiatu';
      const ofwcaName = `${r.nazwaAgenta} (${r.numerOfwca})`;

      // Level 1: Oddział
      const id1 = `lvl1_${oddzName}`;
      if (!rootNodes[oddzName]) {
        rootNodes[oddzName] = {
          id: id1,
          name: oddzName,
          type: 'oddzial',
          level: 1,
          typeLabel: 'Oddział',
          gwp2024: 0,
          gwp2025: 0,
          gwp2026: 0,
          detal2026: 0,
          eduPs2026: 0,
          ofwcaCount: 0,
          dkpCount: 0,
          dpdCount: 0,
          activeMsSet: new Set(),
          activeRmsSet: new Set(),
          children: {},
          breadcrumb: [{ type: 'Oddział', name: oddzName, id: id1 }],
          descendantRecords: []
        };
        nodeMap.set(id1, rootNodes[oddzName]);
      }
      const n1 = rootNodes[oddzName];
      n1.gwp2025 += r.gwp2025Total;
      n1.gwp2026 += r.gwp2026Total;
      n1.detal2026 += r.gwp2026Detal;
      n1.eduPs2026 += r.gwp2026EduPs;
      n1.ofwcaCount++;
      if (r.isDkp) n1.dkpCount++;
      else n1.dpdCount++;
      n1.activeMsSet.add(r.currentMs);
      n1.activeRmsSet.add(r.currentRms);
      n1.descendantRecords.push(r);

      // Level 2: Region_oddział
      const id2 = `${id1}___${regOddzName}`;
      if (!n1.children[regOddzName]) {
        n1.children[regOddzName] = {
          id: id2,
          name: regOddzName,
          type: 'region_oddzial',
          level: 2,
          typeLabel: 'Region Oddziału',
          gwp2024: 0,
          gwp2025: 0,
          gwp2026: 0,
          detal2026: 0,
          eduPs2026: 0,
          ofwcaCount: 0,
          dkpCount: 0,
          dpdCount: 0,
          activeMsSet: new Set(),
          activeRmsSet: new Set(),
          children: {},
          breadcrumb: [...n1.breadcrumb, { type: 'Region Oddziału', name: regOddzName, id: id2 }],
          descendantRecords: []
        };
        nodeMap.set(id2, n1.children[regOddzName]);
      }
      const n2 = n1.children[regOddzName];
      n2.gwp2025 += r.gwp2025Total;
      n2.gwp2026 += r.gwp2026Total;
      n2.detal2026 += r.gwp2026Detal;
      n2.eduPs2026 += r.gwp2026EduPs;
      n2.ofwcaCount++;
      if (r.isDkp) n2.dkpCount++;
      else n2.dpdCount++;
      n2.activeMsSet.add(r.currentMs);
      n2.activeRmsSet.add(r.currentRms);
      n2.descendantRecords.push(r);

      // Level 3: Region_województwo
      const id3 = `${id2}___${regWojName}`;
      if (!n2.children[regWojName]) {
        n2.children[regWojName] = {
          id: id3,
          name: regWojName,
          type: 'region_wojewodztwo',
          level: 3,
          typeLabel: 'Region Województwa',
          gwp2024: 0,
          gwp2025: 0,
          gwp2026: 0,
          detal2026: 0,
          eduPs2026: 0,
          ofwcaCount: 0,
          dkpCount: 0,
          dpdCount: 0,
          activeMsSet: new Set(),
          activeRmsSet: new Set(),
          children: {},
          breadcrumb: [...n2.breadcrumb, { type: 'Region Województwa', name: regWojName, id: id3 }],
          descendantRecords: []
        };
        nodeMap.set(id3, n2.children[regWojName]);
      }
      const n3 = n2.children[regWojName];
      n3.gwp2025 += r.gwp2025Total;
      n3.gwp2026 += r.gwp2026Total;
      n3.detal2026 += r.gwp2026Detal;
      n3.eduPs2026 += r.gwp2026EduPs;
      n3.ofwcaCount++;
      if (r.isDkp) n3.dkpCount++;
      else n3.dpdCount++;
      n3.activeMsSet.add(r.currentMs);
      n3.activeRmsSet.add(r.currentRms);
      n3.descendantRecords.push(r);

      // Level 4: Województwo
      const id4 = `${id3}___${wojName}`;
      if (!n3.children[wojName]) {
        n3.children[wojName] = {
          id: id4,
          name: wojName,
          type: 'wojewodztwo',
          level: 4,
          typeLabel: 'Województwo',
          gwp2024: 0,
          gwp2025: 0,
          gwp2026: 0,
          detal2026: 0,
          eduPs2026: 0,
          ofwcaCount: 0,
          dkpCount: 0,
          dpdCount: 0,
          activeMsSet: new Set(),
          activeRmsSet: new Set(),
          children: {},
          breadcrumb: [...n3.breadcrumb, { type: 'Województwo', name: wojName, id: id4 }],
          descendantRecords: []
        };
        nodeMap.set(id4, n3.children[wojName]);
      }
      const n4 = n3.children[wojName];
      n4.gwp2025 += r.gwp2025Total;
      n4.gwp2026 += r.gwp2026Total;
      n4.detal2026 += r.gwp2026Detal;
      n4.eduPs2026 += r.gwp2026EduPs;
      n4.ofwcaCount++;
      if (r.isDkp) n4.dkpCount++;
      else n4.dpdCount++;
      n4.activeMsSet.add(r.currentMs);
      n4.activeRmsSet.add(r.currentRms);
      n4.descendantRecords.push(r);

      // Level 5: Powiat
      const id5 = `${id4}___${powName}`;
      if (!n4.children[powName]) {
        n4.children[powName] = {
          id: id5,
          name: powName,
          type: 'powiat',
          level: 5,
          typeLabel: 'Powiat',
          gwp2024: 0,
          gwp2025: 0,
          gwp2026: 0,
          detal2026: 0,
          eduPs2026: 0,
          ofwcaCount: 0,
          dkpCount: 0,
          dpdCount: 0,
          activeMsSet: new Set(),
          activeRmsSet: new Set(),
          children: {},
          breadcrumb: [...n4.breadcrumb, { type: 'Powiat', name: powName, id: id5 }],
          descendantRecords: []
        };
        nodeMap.set(id5, n4.children[powName]);
      }
      const n5 = n4.children[powName];
      n5.gwp2025 += r.gwp2025Total;
      n5.gwp2026 += r.gwp2026Total;
      n5.detal2026 += r.gwp2026Detal;
      n5.eduPs2026 += r.gwp2026EduPs;
      n5.ofwcaCount++;
      if (r.isDkp) n5.dkpCount++;
      else n5.dpdCount++;
      n5.activeMsSet.add(r.currentMs);
      n5.activeRmsSet.add(r.currentRms);
      n5.descendantRecords.push(r);

      // Level 6: OFWCA (Leaf node)
      const id6 = `${id5}___${r.id}`;
      const n6: HierarchyNode = {
        id: id6,
        name: ofwcaName,
        type: 'ofwca',
        level: 6,
        typeLabel: 'OFWCA',
        gwp2024: 0,
        gwp2025: r.gwp2025Total,
        gwp2026: r.gwp2026Total,
        detal2026: r.gwp2026Detal,
        eduPs2026: r.gwp2026EduPs,
        ofwcaCount: 1,
        dkpCount: r.isDkp ? 1 : 0,
        dpdCount: r.isDkp ? 0 : 1,
        activeMsSet: new Set([r.currentMs]),
        activeRmsSet: new Set([r.currentRms]),
        children: {},
        breadcrumb: [...n5.breadcrumb, { type: 'OFWCA', name: ofwcaName, id: id6 }],
        record: r,
        descendantRecords: [r]
      };
      n5.children[r.id] = n6;
      nodeMap.set(id6, n6);
    });

    return { tree: rootNodes, flatNodeMap: nodeMap };
  }, [filteredRecords]);

  // Initial selection: first oddział or root
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) {
      const firstOddz = Object.values(tree)[0];
      return firstOddz || null;
    }
    return flatNodeMap.get(selectedNodeId) || null;
  }, [selectedNodeId, flatNodeMap, tree]);

  // Auto-expand on search
  React.useEffect(() => {
    if (!searchQuery.trim()) return;
    const term = searchQuery.toLowerCase();
    const newExpanded = new Set<string>();

    flatNodeMap.forEach((node, id) => {
      if (
        node.name.toLowerCase().includes(term) ||
        (node.record && node.record.numerAgencji.toLowerCase().includes(term)) ||
        (node.record && node.record.numerOfwca.toLowerCase().includes(term))
      ) {
        // Expand all parents in breadcrumb
        node.breadcrumb.forEach(b => newExpanded.add(b.id));
      }
    });

    setExpandedNodes(prev => new Set([...prev, ...newExpanded]));
  }, [searchQuery, flatNodeMap]);

  // Toggle node expand/collapse
  const toggleNode = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  // Expand levels helpers
  const handleExpandToLevel = (targetLevel: number) => {
    const next = new Set<string>();
    flatNodeMap.forEach((node, id) => {
      if (node.level < targetLevel) {
        next.add(id);
      }
    });
    setExpandedNodes(next);
  };

  const handleCollapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Node type styles
  const getNodeBadge = (type: HierarchyNode['type']) => {
    switch (type) {
      case 'oddzial':
        return { bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: Building2, label: 'Oddział' };
      case 'region_oddzial':
        return { bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Network, label: 'Region Oddz.' };
      case 'region_wojewodztwo':
        return { bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', icon: Layers, label: 'Region Woj.' };
      case 'wojewodztwo':
        return { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: MapIcon, label: 'Województwo' };
      case 'powiat':
        return { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: MapPin, label: 'Powiat' };
      case 'ofwca':
        return { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30', icon: UserCheck, label: 'OFWCA' };
    }
  };

  // Render individual tree item recursively
  const renderTreeNode = (node: HierarchyNode) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode?.id === node.id;
    const hasChildren = Object.keys(node.children).length > 0;
    const badge = getNodeBadge(node.type);
    const Icon = badge.icon;

    // Filter check for search
    const matchesSearch = searchQuery.trim() !== '' && (
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (node.record && node.record.numerAgencji.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
      <div key={node.id} className="relative select-none">
        <div
          onClick={() => {
            setSelectedNodeId(node.id);
            if (hasChildren && !isExpanded) {
              toggleNode(node.id);
            }
          }}
          className={`flex items-center justify-between p-2 rounded-xl transition cursor-pointer gap-2 border text-xs ${
            isSelected
              ? 'bg-blue-600/25 border-blue-500 text-white shadow-md shadow-blue-500/10'
              : matchesSearch
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
              : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
          }`}
          style={{ marginLeft: `${(node.level - 1) * 16}px` }}
        >
          <div className="flex items-center gap-2 truncate">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => toggleNode(node.id, e)}
                className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white shrink-0"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-blue-400" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-5 shrink-0" />
            )}

            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 flex items-center gap-1 ${badge.bg}`}>
              <Icon className="w-3 h-3" />
              <span>{badge.label}</span>
            </span>

            <span className={`truncate font-semibold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
              {node.name}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[11px]">
            <span className="font-bold text-emerald-400">
              {formatPLN(node.gwp2026)}
            </span>
            <span className="text-slate-400 text-[10px] hidden sm:inline">
              ({node.ofwcaCount} OFWCA)
            </span>
          </div>
        </div>

        {/* Child branches */}
        {isExpanded && hasChildren && (
          <div className="mt-1 space-y-1 relative">
            <div
              className="absolute left-0 top-0 bottom-0 border-l border-slate-800"
              style={{ left: `${(node.level - 1) * 16 + 10}px` }}
            />
            {Object.values(node.children).map(childNode => renderTreeNode(childNode))}
          </div>
        )}
      </div>
    );
  };

  // Voivodeship rankings view
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <GitBranch className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Graf Struktury Organizacyjnej (6 Poziomów Powiązań)
            </h3>
            <p className="text-xs text-slate-400">
              Oddział → Region_oddział → Region_województwo → Województwo → Powiat → OFWCA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveAnalysisView('hierarchy')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeAnalysisView === 'hierarchy'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Graf Struktury</span>
          </button>
          <button
            onClick={() => setActiveAnalysisView('wojewodztwa')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeAnalysisView === 'wojewodztwa'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
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
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Detal vs EDU PS</span>
          </button>
        </div>
      </div>

      {/* 1. Main Hierarchy View */}
      {activeAnalysisView === 'hierarchy' && (
        <div className="space-y-4">
          {/* Tree Controls Toolbar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Szukaj w strukturze (OFWCA, powiat...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* MS Filter */}
              <select
                value={filterMs}
                onChange={(e) => setFilterMs(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-purple-500"
              >
                <option value="all">Wszyscy Koordynatorzy (MS)</option>
                {msList.map(m => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>

              {/* Channel Filter */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                <button
                  onClick={() => setFilterChannel('all')}
                  className={`px-2 py-0.5 rounded-lg ${filterChannel === 'all' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  Wszystkie
                </button>
                <button
                  onClick={() => setFilterChannel('dkp')}
                  className={`px-2 py-0.5 rounded-lg ${filterChannel === 'dkp' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  Tylko DKP
                </button>
                <button
                  onClick={() => setFilterChannel('dpd')}
                  className={`px-2 py-0.5 rounded-lg ${filterChannel === 'dpd' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  Tylko DPD
                </button>
              </div>
            </div>

            {/* Expand / Collapse Quick Level Presets */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] text-slate-400 font-medium">Rozwiń:</span>
              <button
                onClick={() => handleExpandToLevel(7)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-purple-300 font-semibold border border-purple-500/30 transition cursor-pointer"
                title="Rozwija wszystkie poziomy aż do konkretnych OFWCA"
              >
                Do OFWCA
              </button>
              <button
                onClick={() => handleExpandToLevel(6)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-300 font-semibold border border-slate-700 transition cursor-pointer"
                title="Rozwija gałęzie do poziomu powiatów"
              >
                Do Powiatów
              </button>
              <button
                onClick={() => handleExpandToLevel(5)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-emerald-300 font-semibold border border-slate-700 transition cursor-pointer"
                title="Rozwija gałęzie do poziomu województw"
              >
                Do Województw
              </button>
              <button
                onClick={handleCollapseAll}
                className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
              >
                Zwiń wszystko
              </button>
            </div>
          </div>

          {/* Main 2-Column Split: Structure Tree + Detail Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Visual Structure Tree */}
            <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
                <span className="font-semibold text-slate-200">
                  Drzewo Jednostek ({Object.keys(tree).length} Oddziałów)
                </span>
                <span>Kliknij jednostkę, aby zobaczyć szczegóły</span>
              </div>

              <div className="space-y-1 max-h-[640px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                {Object.values(tree).map(oddzNode => renderTreeNode(oddzNode))}
              </div>
            </div>

            {/* Right Column: Node Details Panel */}
            <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-5 sticky top-20">
              {selectedNode ? (
                <div className="space-y-5">
                  {/* Node Header */}
                  <div className="pb-4 border-b border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const badge = getNodeBadge(selectedNode.type);
                        const Icon = badge.icon;
                        return (
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${badge.bg}`}>
                            <Icon className="w-3.5 h-3.5" />
                            <span>{selectedNode.typeLabel}</span>
                          </span>
                        );
                      })()}
                      <span className="text-[10px] text-slate-500 font-mono">
                        Poziom {selectedNode.level}/6
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-white tracking-wide">
                      {selectedNode.name}
                    </h4>

                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                      {selectedNode.breadcrumb.map((crumb, idx) => (
                        <React.Fragment key={crumb.id}>
                          {idx > 0 && <span className="text-slate-600">/</span>}
                          <button
                            onClick={() => setSelectedNodeId(crumb.id)}
                            className="hover:text-purple-300 transition text-slate-400 font-medium"
                          >
                            {crumb.name}
                          </button>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Financial Metrics Badges */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="text-[10px] uppercase text-slate-400 font-bold">
                        Plan GWP 2026
                      </div>
                      <div className="text-lg font-bold text-emerald-400">
                        {formatPLN(selectedNode.gwp2026)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        2025: {formatPLN(selectedNode.gwp2025)}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="text-[10px] uppercase text-slate-400 font-bold">
                        Liczba OFWCA
                      </div>
                      <div className="text-lg font-bold text-white">
                        {selectedNode.ofwcaCount}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <span className="text-cyan-400 font-medium">DKP: {selectedNode.dkpCount}</span>
                        <span>•</span>
                        <span className="text-purple-400 font-medium">DPD: {selectedNode.dpdCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Product breakdown (Detal vs EduPs) */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Podział Produktowy (2026):
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400">GWP Detal:</span>
                        <div className="font-bold text-slate-200">{formatPLN(selectedNode.detal2026)}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">GWP EDU PS:</span>
                        <div className="font-bold text-slate-200">{formatPLN(selectedNode.eduPs2026)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Coordinators involved in this node */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Aktywni Koordynatorzy ({selectedNode.activeMsSet.size}):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(selectedNode.activeMsSet).map(msName => {
                        const coord = msMap.get(msName);
                        return (
                          <span
                            key={msName}
                            className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5"
                          >
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: coord?.color || '#3b82f6' }}
                            />
                            <span>{msName}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* If OFWCA: Agent Dossier */}
                  {selectedNode.record && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-indigo-950/40 border border-purple-500/30 space-y-3">
                      <div className="font-bold text-purple-300 text-xs flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4" />
                        <span>Karta Doradcy OFWCA</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <div>
                          <span className="text-slate-500">Numer Agencji:</span>
                          <div className="font-mono font-bold text-white">{selectedNode.record.numerAgencji}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Numer OFWCA:</span>
                          <div className="font-mono font-bold text-white">{selectedNode.record.numerOfwca}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Powiat:</span>
                          <div className="font-semibold text-white">{selectedNode.record.powiat}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Województwo:</span>
                          <div className="font-semibold text-white">{selectedNode.record.wojewodztwo}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Przypisany MS:</span>
                          <div className="font-semibold text-blue-400">{selectedNode.record.currentMs}</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Status:</span>
                          <div>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              selectedNode.record.isDkp
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : 'bg-purple-500/20 text-purple-300'
                            }`}>
                              {selectedNode.record.isDkp ? 'DKP (Placówka własna)' : 'DPD (Agencja partnerska)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* If Parent: List of Direct Children */}
                  {Object.keys(selectedNode.children).length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        Podległe Jednostki ({Object.keys(selectedNode.children).length}):
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {Object.values(selectedNode.children).map(child => (
                          <div
                            key={child.id}
                            onClick={() => setSelectedNodeId(child.id)}
                            className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800/70 border border-slate-800 text-xs flex items-center justify-between cursor-pointer transition"
                          >
                            <span className="text-slate-200 font-semibold truncate pr-2">
                              {child.name}
                            </span>
                            <div className="text-right shrink-0">
                              <span className="text-emerald-400 font-bold">{formatPLN(child.gwp2026)}</span>
                              <span className="text-[10px] text-slate-500 ml-1.5">({child.ofwcaCount})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Wybierz dowolną jednostkę z drzewa, aby wyświetlić jej szczegóły.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Voivodeship Ranking View */}
      {activeAnalysisView === 'wojewodztwa' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
          <div className="mb-4 pb-3 border-b border-slate-800 flex items-center justify-between">
            <h4 className="font-bold text-white text-sm">
              Ranking Województw wg Przypisu Składki 2026
            </h4>
            <span className="text-xs text-slate-400">16 województw Polski</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Województwo</th>
                  <th className="p-3 text-right">OFWCA</th>
                  <th className="p-3 text-right">DKP / DPD</th>
                  <th className="p-3 text-right">GWP 2025</th>
                  <th className="p-3 text-right">Plan GWP 2026</th>
                  <th className="p-3 text-right">Dynamika %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {voivodeshipRankings.map((v, i) => {
                  const growth = v.gwp2025 > 0 ? ((v.gwp2026 - v.gwp2025) / v.gwp2025) * 100 : 0;
                  return (
                    <tr key={v.woj} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono text-slate-500">{i + 1}</td>
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <MapIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span>{v.woj}</span>
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-200">{v.ofwcaCount}</td>
                      <td className="p-3 text-right">
                        <span className="text-cyan-400">{v.dkpCount} DKP</span>
                        <span className="text-slate-600"> / </span>
                        <span className="text-purple-400">{v.dpdCount} DPD</span>
                      </td>
                      <td className="p-3 text-right text-slate-400 font-mono">{formatPLN(v.gwp2025)}</td>
                      <td className="p-3 text-right font-bold text-emerald-400 font-mono">{formatPLN(v.gwp2026)}</td>
                      <td className="p-3 text-right font-semibold text-emerald-400">+{growth.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Products Detal vs EDU PS View */}
      {activeAnalysisView === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <BarChart3 className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-bold text-white text-sm">GWP Detal</h4>
                <p className="text-xs text-slate-400">Kluczowy segment sprzedaży detalicznej</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Plan 2026:</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {formatPLN(productTotals.gwp2026Detal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Wykonanie 2025:</span>
                <span className="text-sm font-semibold text-slate-300 font-mono">
                  {formatPLN(productTotals.gwp2025Detal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-400">Dynamika wzrostu:</span>
                <span className="text-sm font-bold text-emerald-400">
                  +{productTotals.growthDetal.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                <TrendingUp className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-bold text-white text-sm">GWP EDU PS</h4>
                <p className="text-xs text-slate-400">Programy edukacyjne i partnerskie</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Plan 2026:</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {formatPLN(productTotals.gwp2026EduPs)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Wykonanie 2025:</span>
                <span className="text-sm font-semibold text-slate-300 font-mono">
                  {formatPLN(productTotals.gwp2025EduPs)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-400">Dynamika wzrostu:</span>
                <span className="text-sm font-bold text-emerald-400">
                  +{productTotals.growthEduPs.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

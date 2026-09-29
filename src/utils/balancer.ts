import { OFWCARecord, CoordinatorMS, CoordinatorRMS, TerritoryBalanceMetric, RMSBalanceMetric, VoivodeshipMSTerritoryBreakdown, DataAuditReport } from '../types';
import { POLAND_VOIVODESHIPS } from '../data/polandGeo';

export function calculateTerritoryMetrics(
  records: OFWCARecord[],
  msList: CoordinatorMS[],
  rmsList: CoordinatorRMS[]
): {
  metrics: TerritoryBalanceMetric[];
  rmsMetrics: RMSBalanceMetric[];
  gwpStdDevInitial: number;
  gwpStdDevCurrent: number;
  ofwcaStdDevInitial: number;
  ofwcaStdDevCurrent: number;
  averageGwp2026: number;
  averageActiveOfwca: number;
} {
  const msMap = new Map<string, CoordinatorMS>();
  msList.forEach(ms => msMap.set(ms.name, ms));

  const rmsMap = new Map<string, CoordinatorRMS>();
  rmsList.forEach(rms => rmsMap.set(rms.name, rms));

  // Initialize accumulator for each MS
  const data = new Map<string, {
    msName: string;
    rmsName: string;
    color: string;
    initialOfwca: OFWCARecord[];
    currentOfwca: OFWCARecord[];
  }>();

  msList.forEach(ms => {
    data.set(ms.name, {
      msName: ms.name,
      rmsName: ms.rms,
      color: ms.color,
      initialOfwca: [],
      currentOfwca: []
    });
  });

  // Assign records
  records.forEach(r => {
    if (data.has(r.initialMs)) {
      data.get(r.initialMs)!.initialOfwca.push(r);
    }
    if (data.has(r.currentMs)) {
      data.get(r.currentMs)!.currentOfwca.push(r);
    } else {
      // New MS not yet in list
      data.set(r.currentMs, {
        msName: r.currentMs,
        rmsName: r.currentRms || 'RMS Standard',
        color: '#64748b',
        initialOfwca: [],
        currentOfwca: [r]
      });
    }
  });

  // Calculate totals for averages
  let totalGwp2026 = 0;
  let totalActiveOfwca = 0;

  records.forEach(r => {
    totalGwp2026 += r.gwp2026Total;
    if (r.isActive) totalActiveOfwca++;
  });

  const msCount = Math.max(1, data.size);
  const avgGwp = totalGwp2026 / msCount;
  const avgActiveOfwca = totalActiveOfwca / msCount;

  // Build TerritoryBalanceMetric for each MS
  const metrics: TerritoryBalanceMetric[] = Array.from(data.values()).map(item => {
    const coordinator = msMap.get(item.msName);

    // Initial calculations
    const initTotal = item.initialOfwca.length;
    const initActive = item.initialOfwca.filter(r => r.isActive).length;
    const initAgents = new Set(item.initialOfwca.map(r => r.numerAgencji)).size;
    const initGwp2025 = item.initialOfwca.reduce((s, r) => s + r.gwp2025Total, 0);
    const initGwp2026 = item.initialOfwca.reduce((s, r) => s + r.gwp2026Total, 0);
    const initDetal = item.initialOfwca.reduce((s, r) => s + r.gwp2026Detal, 0);
    const initEduPs = item.initialOfwca.reduce((s, r) => s + r.gwp2026EduPs, 0);
    const initDkp = item.initialOfwca.filter(r => r.isDkp).length;
    const initDpd = initTotal - initDkp;

    // Current (modeled) calculations
    const curTotal = item.currentOfwca.length;
    const curActive = item.currentOfwca.filter(r => r.isActive).length;
    const curAgents = new Set(item.currentOfwca.map(r => r.numerAgencji)).size;
    const curGwp2025 = item.currentOfwca.reduce((s, r) => s + r.gwp2025Total, 0);
    const curGwp2026 = item.currentOfwca.reduce((s, r) => s + r.gwp2026Total, 0);
    const curDetal = item.currentOfwca.reduce((s, r) => s + r.gwp2026Detal, 0);
    const curEduPs = item.currentOfwca.reduce((s, r) => s + r.gwp2026EduPs, 0);
    const curDkp = item.currentOfwca.filter(r => r.isDkp).length;
    const curDpd = curTotal - curDkp;

    const curDkpGwp2026 = item.currentOfwca.filter(r => r.isDkp).reduce((s, r) => s + r.gwp2026Total, 0);
    const curDpdGwp2026 = curGwp2026 - curDkpGwp2026;
    const initDkpGwp2026 = item.initialOfwca.filter(r => r.isDkp).reduce((s, r) => s + r.gwp2026Total, 0);
    const initDpdGwp2026 = initGwp2026 - initDkpGwp2026;

    // Geographic coverage
    const powiaty = new Set<string>();
    const wojewodztwa = new Set<string>();
    item.currentOfwca.forEach(r => {
      if (r.powiat) powiaty.add(r.powiat);
      if (r.wojewodztwo) wojewodztwa.add(r.wojewodztwo);
    });

    // Workload Index
    const gwpFactor = avgGwp > 0 ? curGwp2026 / avgGwp : 1;
    const ofwcaFactor = avgActiveOfwca > 0 ? curActive / avgActiveOfwca : 1;
    const workloadIndex = (gwpFactor * 0.5 + ofwcaFactor * 0.5) * 100;

    let workloadStatus: 'Niedociążony' | 'Optymalny' | 'Przeładowany' = 'Optymalny';
    if (workloadIndex < 85) workloadStatus = 'Niedociążony';
    else if (workloadIndex > 115) workloadStatus = 'Przeładowany';

    const deltaGwp = curGwp2026 - initGwp2026;
    const deltaGwpPercent = initGwp2026 > 0 ? (deltaGwp / initGwp2026) * 100 : 0;

    const curDkpActive = item.currentOfwca.filter(r => r.isDkp && r.isActive).length;
    const curDpdActive = curActive - curDkpActive;

    return {
      msName: item.msName,
      rmsName: coordinator ? coordinator.rms : item.rmsName,
      color: item.color,
      initialOfwcaCount: initTotal,
      initialActiveOfwcaCount: initActive,
      initialAgentCount: initAgents,
      initialGwp2025: initGwp2025,
      initialGwp2026: initGwp2026,
      initialDetal2026: initDetal,
      initialEduPs2026: initEduPs,
      initialDkpCount: initDkp,
      initialDpdCount: initDpd,
      initialDkpGwp2026: initDkpGwp2026,
      initialDpdGwp2026: initDpdGwp2026,

      currentOfwcaCount: curTotal,
      currentActiveOfwcaCount: curActive,
      currentAgentCount: curAgents,
      currentGwp2025: curGwp2025,
      currentGwp2026: curGwp2026,
      currentDetal2026: curDetal,
      currentEduPs2026: curEduPs,
      currentDkpCount: curDkp,
      currentDpdCount: curDpd,
      currentDkpGwp2026: curDkpGwp2026,
      currentDpdGwp2026: curDpdGwp2026,
      currentDkpActiveCount: curDkpActive,
      currentDpdActiveCount: curDpdActive,

      deltaOfwca: curTotal - initTotal,
      deltaActiveOfwca: curActive - initActive,
      deltaGwp2026: deltaGwp,
      deltaGwpPercent: deltaGwpPercent,
      deltaDkp: curDkp - initDkp,
      deltaDpd: curDpd - initDpd,
      workloadIndex,
      workloadStatus,
      powiatyCount: powiaty.size,
      wojewodztwa: Array.from(wojewodztwa)
    };
  });

  // Calculate RMS metrics
  const rmsMetricsMap = new Map<string, {
    rmsName: string;
    region: string;
    color: string;
    msNames: Set<string>;
    initialOfwca: OFWCARecord[];
    currentOfwca: OFWCARecord[];
  }>();

  rmsList.forEach(r => {
    rmsMetricsMap.set(r.name, {
      rmsName: r.name,
      region: r.region,
      color: r.color,
      msNames: new Set(r.subordinateMs || []),
      initialOfwca: [],
      currentOfwca: []
    });
  });

  records.forEach(r => {
    const initRms = r.initialRms || 'RMS Standard';
    const curRms = r.currentRms || 'RMS Standard';

    if (!rmsMetricsMap.has(initRms)) {
      rmsMetricsMap.set(initRms, {
        rmsName: initRms,
        region: 'Region',
        color: '#0284c7',
        msNames: new Set(),
        initialOfwca: [],
        currentOfwca: []
      });
    }
    rmsMetricsMap.get(initRms)!.initialOfwca.push(r);

    if (!rmsMetricsMap.has(curRms)) {
      rmsMetricsMap.set(curRms, {
        rmsName: curRms,
        region: 'Region',
        color: '#0284c7',
        msNames: new Set(),
        initialOfwca: [],
        currentOfwca: []
      });
    }
    rmsMetricsMap.get(curRms)!.currentOfwca.push(r);
    rmsMetricsMap.get(curRms)!.msNames.add(r.currentMs);
  });

  const totalRmsGwp = totalGwp2026;
  const avgRmsGwp = totalRmsGwp / Math.max(1, rmsMetricsMap.size);

  const rmsMetrics: RMSBalanceMetric[] = Array.from(rmsMetricsMap.values()).map(item => {
    const initTotal = item.initialOfwca.length;
    const initActive = item.initialOfwca.filter(r => r.isActive).length;
    const initAgents = new Set(item.initialOfwca.map(r => r.numerAgencji)).size;
    const initGwp2025 = item.initialOfwca.reduce((s, r) => s + r.gwp2025Total, 0);
    const initGwp2026 = item.initialOfwca.reduce((s, r) => s + r.gwp2026Total, 0);
    const initDkp = item.initialOfwca.filter(r => r.isDkp).length;
    const initDpd = initTotal - initDkp;

    const curTotal = item.currentOfwca.length;
    const curActive = item.currentOfwca.filter(r => r.isActive).length;
    const curAgents = new Set(item.currentOfwca.map(r => r.numerAgencji)).size;
    const curGwp2025 = item.currentOfwca.reduce((s, r) => s + r.gwp2025Total, 0);
    const curGwp2026 = item.currentOfwca.reduce((s, r) => s + r.gwp2026Total, 0);
    const curDkp = item.currentOfwca.filter(r => r.isDkp).length;
    const curDpd = curTotal - curDkp;
    const curDkpGwp2026 = item.currentOfwca.filter(r => r.isDkp).reduce((s, r) => s + r.gwp2026Total, 0);
    const curDpdGwp2026 = curGwp2026 - curDkpGwp2026;

    const powiaty = new Set<string>();
    const wojewodztwa = new Set<string>();
    item.currentOfwca.forEach(r => {
      if (r.powiat) powiaty.add(r.powiat);
      if (r.wojewodztwo) wojewodztwa.add(r.wojewodztwo);
    });

    const workloadIndex = avgRmsGwp > 0 ? (curGwp2026 / avgRmsGwp) * 100 : 100;
    let workloadStatus: 'Niedociążony' | 'Optymalny' | 'Przeładowany' = 'Optymalny';
    if (workloadIndex < 85) workloadStatus = 'Niedociążony';
    else if (workloadIndex > 115) workloadStatus = 'Przeładowany';

    const deltaGwp = curGwp2026 - initGwp2026;
    const deltaGwpPercent = initGwp2026 > 0 ? (deltaGwp / initGwp2026) * 100 : 0;

    const curDkpActive = item.currentOfwca.filter(r => r.isDkp && r.isActive).length;
    const curDpdActive = curActive - curDkpActive;

    return {
      rmsName: item.rmsName,
      region: item.region,
      color: item.color,
      msCount: item.msNames.size,
      msNames: Array.from(item.msNames),
      initialOfwcaCount: initTotal,
      initialActiveOfwcaCount: initActive,
      initialAgentCount: initAgents,
      initialGwp2025: initGwp2025,
      initialGwp2026: initGwp2026,
      initialDkpCount: initDkp,
      initialDpdCount: initDpd,
      currentOfwcaCount: curTotal,
      currentActiveOfwcaCount: curActive,
      currentAgentCount: curAgents,
      currentGwp2025: curGwp2025,
      currentGwp2026: curGwp2026,
      currentDkpCount: curDkp,
      currentDpdCount: curDpd,
      currentDkpActiveCount: curDkpActive,
      currentDpdActiveCount: curDpdActive,
      currentDkpGwp2026: curDkpGwp2026,
      currentDpdGwp2026: curDpdGwp2026,
      deltaOfwca: curTotal - initTotal,
      deltaActiveOfwca: curActive - initActive,
      deltaGwp2026: deltaGwp,
      deltaGwpPercent: deltaGwpPercent,
      deltaDkp: curDkp - initDkp,
      deltaDpd: curDpd - initDpd,
      workloadIndex,
      workloadStatus,
      powiatyCount: powiaty.size,
      wojewodztwa: Array.from(wojewodztwa)
    };
  });

  // Calculate standard deviations
  const calcStdDev = (vals: number[]) => {
    if (vals.length <= 1) return 0;
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const sqDiffs = vals.map(v => Math.pow(v - mean, 2));
    const avgSqDiff = sqDiffs.reduce((a, b) => a + b, 0) / vals.length;
    return Math.sqrt(avgSqDiff);
  };

  const gwpInitialVals = metrics.map(m => m.initialGwp2026);
  const gwpCurrentVals = metrics.map(m => m.currentGwp2026);
  const ofwcaInitialVals = metrics.map(m => m.initialActiveOfwcaCount);
  const ofwcaCurrentVals = metrics.map(m => m.currentActiveOfwcaCount);

  return {
    metrics,
    rmsMetrics,
    gwpStdDevInitial: calcStdDev(gwpInitialVals),
    gwpStdDevCurrent: calcStdDev(gwpCurrentVals),
    ofwcaStdDevInitial: calcStdDev(ofwcaInitialVals),
    ofwcaStdDevCurrent: calcStdDev(ofwcaCurrentVals),
    averageGwp2026: avgGwp,
    averageActiveOfwca: avgActiveOfwca
  };
}

/**
 * Calculates MS areas within all 16 Polish Voivodeships, distinguishing:
 * - OFWCA "Z ich terenu" (home territory of that MS)
 * - OFWCA "Z poza" (external/cross-territory leakage)
 * with complete breakdown into DKP and DPD!
 */
export function calculateVoivodeshipTerritoryBreakdown(
  records: OFWCARecord[],
  msList: CoordinatorMS[]
): Array<{
  voivodeship: string;
  totalOfwca: number;
  totalDkp: number;
  totalDpd: number;
  totalGwp2026: number;
  territoryCompactnessPercent: number;
  msRows: Array<{
    msName: string;
    rmsName: string;
    color: string;
    isPrimaryTerritory: boolean;
    totalOfwcaInVoivodeship: number;
    inTerritoryOfwca: number;
    inTerritoryDkp: number;
    inTerritoryDpd: number;
    outOfTerritoryOfwca: number;
    outOfTerritoryDkp: number;
    outOfTerritoryDpd: number;
    gwp2026InVoivodeship: number;
  }>;
}> {
  // Pre-build map of each MS to their primary/home voivodeship
  const msHomeMap = new Map<string, string>();
  msList.forEach(ms => {
    if (ms.primaryVoivodeship) {
      msHomeMap.set(ms.name, ms.primaryVoivodeship.toLowerCase().trim());
    }
  });

  // For any MS missing primary voivodeship, compute based on where they have the most initial records
  msList.forEach(ms => {
    if (!msHomeMap.has(ms.name)) {
      const msAllRecords = records.filter(r => r.initialMs === ms.name);
      const counts = new Map<string, number>();
      msAllRecords.forEach(r => {
        const w = (r.wojewodztwo || '').toLowerCase().trim();
        if (w) counts.set(w, (counts.get(w) || 0) + 1);
      });
      let bestWoj = '';
      let maxCount = -1;
      counts.forEach((c, w) => {
        if (c > maxCount) {
          maxCount = c;
          bestWoj = w;
        }
      });
      msHomeMap.set(ms.name, bestWoj);
    }
  });

  // Calculate breakdown for each voivodeship in Poland
  return POLAND_VOIVODESHIPS.map(geo => {
    const normWoj = geo.name.toLowerCase().trim();
    const wojRecords = records.filter(r => {
      const w = (r.wojewodztwo || '').toLowerCase().trim();
      return w === normWoj || w.includes(geo.id) || geo.id.includes(w);
    });

    const msInWojMap = new Map<string, {
      inRecs: OFWCARecord[];
      outRecs: OFWCARecord[];
    }>();

    wojRecords.forEach(rec => {
      const msName = rec.currentMs;
      if (!msInWojMap.has(msName)) {
        msInWojMap.set(msName, { inRecs: [], outRecs: [] });
      }
      const item = msInWojMap.get(msName)!;

      const homeWoj = msHomeMap.get(msName) || '';
      const isHome = homeWoj.includes(normWoj) || normWoj.includes(homeWoj) || homeWoj.includes(geo.id);

      if (isHome) {
        item.inRecs.push(rec);
      } else {
        item.outRecs.push(rec);
      }
    });

    const msRows = Array.from(msInWojMap.entries()).map(([msName, { inRecs, outRecs }]) => {
      const coordinator = msList.find(m => m.name === msName);
      const homeWoj = msHomeMap.get(msName) || '';
      const isHome = homeWoj.includes(normWoj) || normWoj.includes(homeWoj) || homeWoj.includes(geo.id);

      const inDkp = inRecs.filter(r => r.isDkp).length;
      const inDpd = inRecs.length - inDkp;
      const inGwp = inRecs.reduce((s, r) => s + r.gwp2026Total, 0);

      const outDkp = outRecs.filter(r => r.isDkp).length;
      const outDpd = outRecs.length - outDkp;
      const outGwp = outRecs.reduce((s, r) => s + r.gwp2026Total, 0);

      const totalOfwca = inRecs.length + outRecs.length;
      const totalGwp = inGwp + outGwp;

      return {
        msName,
        rmsName: coordinator ? coordinator.rms : 'RMS Standard',
        color: coordinator ? coordinator.color : '#3b82f6',
        isPrimaryTerritory: isHome,
        totalOfwcaInVoivodeship: totalOfwca,
        inTerritoryOfwca: inRecs.length,
        inTerritoryDkp: inDkp,
        inTerritoryDpd: inDpd,
        outOfTerritoryOfwca: outRecs.length,
        outOfTerritoryDkp: outDkp,
        outOfTerritoryDpd: outDpd,
        gwp2026InVoivodeship: totalGwp,
      };
    }).sort((a, b) => b.totalOfwcaInVoivodeship - a.totalOfwcaInVoivodeship);

    const totalOfwca = wojRecords.length;
    const totalDkp = wojRecords.filter(r => r.isDkp).length;
    const totalDpd = totalOfwca - totalDkp;
    const totalGwp2026 = wojRecords.reduce((s, r) => s + r.gwp2026Total, 0);

    const totalIn = msRows.reduce((s, row) => s + row.inTerritoryOfwca, 0);
    const compactness = totalOfwca > 0 ? (totalIn / totalOfwca) * 100 : 100;

    return {
      voivodeship: geo.name,
      totalOfwca,
      totalDkp,
      totalDpd,
      totalGwp2026,
      territoryCompactnessPercent: compactness,
      msRows
    };
  });
}

export function generateAuditReport(records: OFWCARecord[]): DataAuditReport {
  const uniqueOfwcaSet = new Set<string>();
  const uniqueAgentsSet = new Set<string>();
  const terminatedList: OFWCARecord[] = [];
  const missingLocationList: OFWCARecord[] = [];
  const duplicatesList: OFWCARecord[] = [];
  const missingGwpList: OFWCARecord[] = [];

  let dkpCount = 0;
  let dpdCount = 0;
  let activeCount = 0;
  let totalGwp2025 = 0;
  let totalGwp2026 = 0;

  // Track ofwca number frequency to detect potential duplicates
  const ofwcaOccurrences = new Map<string, OFWCARecord[]>();

  records.forEach(r => {
    uniqueOfwcaSet.add(r.numerOfwca);
    uniqueAgentsSet.add(r.numerAgencji);

    if (r.isDkp) dkpCount++;
    else dpdCount++;

    if (r.isActive) activeCount++;
    else terminatedList.push(r);

    totalGwp2025 += r.gwp2025Total;
    totalGwp2026 += r.gwp2026Total;

    // Check location
    if (!r.powiat || r.powiat.trim() === '' || !r.wojewodztwo || r.wojewodztwo.trim() === '') {
      missingLocationList.push(r);
    }

    // Check GWP
    if (r.gwp2025Total === 0 && r.gwp2026Total === 0) {
      missingGwpList.push(r);
    }

    // Accumulate for duplicates
    const list = ofwcaOccurrences.get(r.numerOfwca) || [];
    list.push(r);
    ofwcaOccurrences.set(r.numerOfwca, list);
  });

  ofwcaOccurrences.forEach((list, ofwcaNum) => {
    if (list.length > 1) {
      // OFWCA appears across multiple agency codes or rows
      list.forEach(r => duplicatesList.push(r));
    }
  });

  return {
    totalRecords: records.length,
    uniqueOfwcaCount: uniqueOfwcaSet.size,
    uniqueAgentsCount: uniqueAgentsSet.size,
    terminatedCount: terminatedList.length,
    missingLocationCount: missingLocationList.length,
    duplicatesCount: duplicatesList.length,
    missingGwpCount: missingGwpList.length,
    dkpCount,
    dpdCount,
    activeCount,
    totalGwp2025,
    totalGwp2026,
    terminatedList,
    missingLocationList,
    duplicatesList,
    missingGwpList
  };
}

export interface BalanceProposal {
  id: string;
  sourceMs: string;
  targetMs: string;
  sourceRms: string;
  targetRms: string;
  powiat: string;
  wojewodztwo: string;
  ofwcaCount: number;
  gwp2026: number;
  dkpCount: number;
  dpdCount: number;
  recordIds: string[];
  reason: string;
}

/**
 * Intelligent Algorithm to generate balancing proposals.
 * Identifies Overloaded MS (>115%) and pairs them with Underloaded MS (<85%) in nearby or matching voivodeships.
 */
export function computeBalancingProposals(
  records: OFWCARecord[],
  metrics: TerritoryBalanceMetric[],
  averageGwp2026: number
): BalanceProposal[] {
  const proposals: BalanceProposal[] = [];

  const overloaded = metrics.filter(m => m.workloadStatus === 'Przeładowany')
    .sort((a, b) => b.workloadIndex - a.workloadIndex);
  const underloaded = metrics.filter(m => m.workloadStatus === 'Niedociążony')
    .sort((a, b) => a.workloadIndex - b.workloadIndex);

  if (overloaded.length === 0 || underloaded.length === 0) {
    return proposals;
  }

  // Group records by MS and Powiat
  const msPowiatMap = new Map<string, Map<string, OFWCARecord[]>>();
  records.forEach(r => {
    if (!msPowiatMap.has(r.currentMs)) {
      msPowiatMap.set(r.currentMs, new Map());
    }
    const pMap = msPowiatMap.get(r.currentMs)!;
    const pList = pMap.get(r.powiat) || [];
    pList.push(r);
    pMap.set(r.powiat, pList);
  });

  // For each overloaded MS, find candidate powiats that can be transferred
  overloaded.forEach(source => {
    const powiatsOfSource = msPowiatMap.get(source.msName);
    if (!powiatsOfSource) return;

    // Sort powiats by size (prefer reasonable sized transfers that don't overwhelm target)
    const sortedPowiats = Array.from(powiatsOfSource.entries()).map(([pName, recs]) => {
      const gwp = recs.reduce((s, r) => s + r.gwp2026Total, 0);
      const dkp = recs.filter(r => r.isDkp).length;
      const woj = recs[0]?.wojewodztwo || 'Nieokreślone';
      return {
        powiat: pName,
        recs,
        gwp,
        dkp,
        dpd: recs.length - dkp,
        wojewodztwo: woj
      };
    }).sort((a, b) => a.gwp - b.gwp);

    sortedPowiats.forEach(cand => {
      // Find best underloaded target in same or neighboring region
      const suitableTarget = underloaded.find(target => {
        // Prefer target in same RMS or already having records in same voivodeship
        const sameRms = target.rmsName === source.rmsName;
        const sameWoj = target.wojewodztwa.includes(cand.wojewodztwo);
        return sameRms || sameWoj;
      }) || underloaded[0];

      if (suitableTarget && cand.recs.length > 0) {
        proposals.push({
          id: `prop_${source.msName}_${cand.powiat}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          sourceMs: source.msName,
          targetMs: suitableTarget.msName,
          sourceRms: source.rmsName,
          targetRms: suitableTarget.rmsName,
          powiat: cand.powiat,
          wojewodztwo: cand.wojewodztwo,
          ofwcaCount: cand.recs.length,
          gwp2026: cand.gwp,
          dkpCount: cand.dkp,
          dpdCount: cand.dpd,
          recordIds: cand.recs.map(r => r.id),
          reason: `Wyrównanie obciążenia: Odciążenie ${source.msName} (${Math.round(source.workloadIndex)}%) na rzecz ${suitableTarget.msName} (${Math.round(suitableTarget.workloadIndex)}%) w woj. ${cand.wojewodztwo}`
        });
      }
    });
  });

  return proposals.slice(0, 15); // Return top 15 proposals
}

export interface OFWCARecord {
  id: string; // unique ID
  numerOfwca: string;
  nazwaAgenta: string;
  numerAgencji: string;
  oddzial: string;
  regionOddzial: string;
  regionWojewodztwo: string;
  wojewodztwo: string;
  powiat: string;
  kodPocztowy: string;
  ofwcaDkpRaw: string;
  isDkp: boolean; // TAK -> true (DKP), otherwise -> false (DPD)
  pracujeDo: string; // If not empty -> zakończony / wymaga weryfikacji
  isActive: boolean; // true if pracujeDo is empty or date in future
  gwp2025Detal: number;
  gwp2026Detal: number;
  gwp2025EduPs: number;
  gwp2026EduPs: number;
  gwp2025Total: number;
  gwp2026Total: number;
  initialMs: string; // MS z pliku bazowego lub MS_lista
  currentMs: string; // MS po modelowaniu
  initialRms: string; // RMS z RMS_lista
  currentRms: string; // RMS po modelowaniu
  hasLocationIssue?: boolean;
  hasGwpIssue?: boolean;
  isDuplicate?: boolean;
  isTerminated?: boolean;
  warnings?: string[];
}

export interface CoordinatorMS {
  id: string;
  name: string;
  rms: string;
  region?: string;
  primaryVoivodeship?: string;
  color: string;
}

export interface CoordinatorRMS {
  id: string;
  name: string;
  region: string;
  subordinateMs?: string[];
  color: string;
}

export interface TerritoryBalanceMetric {
  msName: string;
  rmsName: string;
  color: string;
  // Przed modelowaniem
  initialOfwcaCount: number;
  initialActiveOfwcaCount: number;
  initialAgentCount: number;
  initialGwp2025: number;
  initialGwp2026: number;
  initialDkpCount: number;
  initialDpdCount: number;
  // Po modelowaniu
  currentOfwcaCount: number;
  currentActiveOfwcaCount: number;
  currentAgentCount: number;
  currentGwp2025: number;
  currentGwp2026: number;
  currentDkpCount: number;
  currentDpdCount: number;
  currentDkpGwp2026: number;
  currentDpdGwp2026: number;
  currentDkpActiveCount: number;
  currentDpdActiveCount: number;
  // Delty
  deltaOfwca: number;
  deltaGwp2026: number;
  deltaGwpPercent: number;
  deltaDkp: number;
  deltaDpd: number;
  // Workload status
  workloadStatus: 'Niedociążony' | 'Optymalny' | 'Przeładowany';
  workloadIndex: number; // 100 = średnia
  powiatyCount: number;
  wojewodztwa: string[];
}

export interface RMSBalanceMetric {
  rmsName: string;
  region: string;
  color: string;
  msCount: number;
  msNames: string[];
  // Initial
  initialOfwcaCount: number;
  initialDkpCount: number;
  initialDpdCount: number;
  initialGwp2025: number;
  initialGwp2026: number;
  // Current
  currentOfwcaCount: number;
  currentActiveOfwcaCount: number;
  currentAgentCount: number;
  currentDkpCount: number;
  currentDpdCount: number;
  currentDkpActiveCount: number;
  currentDpdActiveCount: number;
  currentGwp2025: number;
  currentGwp2026: number;
  currentDkpGwp2026: number;
  currentDpdGwp2026: number;
  // Deltas
  deltaOfwca: number;
  deltaGwp2026: number;
  deltaGwpPercent: number;
  deltaDkp: number;
  deltaDpd: number;
  // Workload
  workloadStatus: 'Niedociążony' | 'Optymalny' | 'Przeładowany';
  workloadIndex: number;
  powiatyCount: number;
  wojewodztwa: string[];
}

export interface VoivodeshipMSTerritoryBreakdown {
  msName: string;
  rmsName: string;
  color: string;
  isHomeMs: boolean; // whether this voivodeship is the primary assigned territory for this MS
  // Z terenu (In-territory)
  inTerritoryOfwcaTotal: number;
  inTerritoryDkpCount: number;
  inTerritoryDpdCount: number;
  inTerritoryGwp2026: number;
  // Z poza terenu (Cross-territory / out-of-territory)
  outTerritoryOfwcaTotal: number;
  outTerritoryDkpCount: number;
  outTerritoryDpdCount: number;
  outTerritoryGwp2026: number;
  // Total
  totalOfwcaInWoj: number;
  totalGwp2026InWoj: number;
  territoryCompactnessPercent: number; // % z terenu
  inTerritoryRecordIds: string[];
  outTerritoryRecordIds: string[];
}

export interface DataAuditReport {
  totalRecords: number;
  uniqueOfwcaCount: number;
  uniqueAgentsCount: number;
  activeCount: number;
  terminatedCount: number;
  missingLocationCount: number;
  missingGwpCount: number;
  duplicatesCount: number;
  dkpCount: number;
  dpdCount: number;
  totalGwp2025: number;
  totalGwp2026: number;
  terminatedList: OFWCARecord[];
  missingLocationList: OFWCARecord[];
  duplicatesList: OFWCARecord[];
  missingGwpList: OFWCARecord[];
}

export interface ModelingHistoryStep {
  id: string;
  timestamp: number;
  description: string;
  changesCount: number;
  previousMsMap: Record<string, string>; // ofwcaId -> msName
}

export interface AppSettings {
  googleApiKey: string;
  geminiApiKey: string;
  mapType: 'svg_odl' | 'google_roadmap' | 'google_satellite' | 'google_hybrid' | 'google_terrain';
  activeLayer: 'ms' | 'rms' | 'gwp' | 'ofwca' | 'dkp';
  autoSaveToDb: boolean;
  lastBackupDate?: string;
  theme?: 'dark' | 'slate';
}

export interface AIRecommendation {
  id: string;
  title: string;
  sourceMs: string;
  targetMs: string;
  voivodeship: string;
  powiat: string;
  rationale: string;
  estimatedGwpShift: number;
  estimatedOfwcaCount: number;
  estimatedWorkloadImpact: string;
  recordIds: string[];
}

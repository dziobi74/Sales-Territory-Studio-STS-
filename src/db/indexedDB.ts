import Dexie, { Table } from 'dexie';
import { OFWCARecord, CoordinatorMS, CoordinatorRMS, ModelingHistoryStep, AppSettings } from '../types';

export interface StoredSetting {
  key: string;
  value: any;
}

export interface BackupPackage {
  id: string;
  name: string;
  timestamp: number;
  dateStr: string;
  version: string;
  recordsCount: number;
  msCount: number;
  rmsCount: number;
  records: OFWCARecord[];
  msList: CoordinatorMS[];
  rmsList: CoordinatorRMS[];
  history: ModelingHistoryStep[];
  settings?: Partial<AppSettings>;
}

export class STSLocalDatabase extends Dexie {
  records!: Table<OFWCARecord, string>;
  coordinatorsMs!: Table<CoordinatorMS, string>;
  coordinatorsRms!: Table<CoordinatorRMS, string>;
  historySteps!: Table<ModelingHistoryStep, string>;
  settings!: Table<StoredSetting, string>;
  backups!: Table<BackupPackage, string>;

  constructor() {
    super('STSLocalDatabase_v1');

    this.version(1).stores({
      records: 'id, numerOfwca, numerAgencji, currentMs, initialMs, currentRms, wojewodztwo, powiat, isDkp, isActive, gwp2026Total',
      coordinatorsMs: 'id, name, rms, region',
      coordinatorsRms: 'id, name, region',
      historySteps: 'id, timestamp',
      settings: 'key',
      backups: 'id, timestamp, name'
    });
  }
}

export const localDb = new STSLocalDatabase();

/**
 * High-performance bulk persistence for OFWCA records using IndexedDB transactions.
 */
export async function persistAllRecords(records: OFWCARecord[]): Promise<void> {
  if (!records || records.length === 0) return;
  await localDb.transaction('rw', localDb.records, async () => {
    await localDb.records.clear();
    await localDb.records.bulkPut(records);
  });
}

/**
 * Retrieve all OFWCA records from IndexedDB.
 */
export async function loadAllRecords(): Promise<OFWCARecord[]> {
  return await localDb.records.toArray();
}

/**
 * Persist coordinators (MS & RMS) in IndexedDB.
 */
export async function persistCoordinators(
  msList: CoordinatorMS[],
  rmsList: CoordinatorRMS[]
): Promise<void> {
  await localDb.transaction('rw', [localDb.coordinatorsMs, localDb.coordinatorsRms], async () => {
    if (msList.length > 0) {
      await localDb.coordinatorsMs.clear();
      await localDb.coordinatorsMs.bulkPut(msList);
    }
    if (rmsList.length > 0) {
      await localDb.coordinatorsRms.clear();
      await localDb.coordinatorsRms.bulkPut(rmsList);
    }
  });
}

/**
 * Retrieve coordinators from IndexedDB.
 */
export async function loadCoordinators(): Promise<{
  msList: CoordinatorMS[];
  rmsList: CoordinatorRMS[];
}> {
  const [msList, rmsList] = await Promise.all([
    localDb.coordinatorsMs.toArray(),
    localDb.coordinatorsRms.toArray()
  ]);
  return { msList, rmsList };
}

/**
 * Save modeling history steps.
 */
export async function persistHistory(steps: ModelingHistoryStep[]): Promise<void> {
  await localDb.transaction('rw', localDb.historySteps, async () => {
    await localDb.historySteps.clear();
    if (steps.length > 0) {
      await localDb.historySteps.bulkPut(steps);
    }
  });
}

/**
 * Load history steps.
 */
export async function loadHistory(): Promise<ModelingHistoryStep[]> {
  return await localDb.historySteps.orderBy('timestamp').toArray();
}

/**
 * App Settings persistence
 */
export async function saveAppSetting<T>(key: string, value: T): Promise<void> {
  await localDb.settings.put({ key, value });
}

export async function getAppSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const item = await localDb.settings.get(key);
    return item ? (item.value as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Storage metrics and statistics
 */
export async function getDatabaseMetrics(): Promise<{
  recordsCount: number;
  msCount: number;
  rmsCount: number;
  historyCount: number;
  backupsCount: number;
  estimatedStorageBytes: number;
  isIndexedDbSupported: boolean;
}> {
  const isSupported = typeof window !== 'undefined' && 'indexedDB' in window;
  if (!isSupported) {
    return {
      recordsCount: 0,
      msCount: 0,
      rmsCount: 0,
      historyCount: 0,
      backupsCount: 0,
      estimatedStorageBytes: 0,
      isIndexedDbSupported: false
    };
  }

  const [recordsCount, msCount, rmsCount, historyCount, backupsCount] = await Promise.all([
    localDb.records.count(),
    localDb.coordinatorsMs.count(),
    localDb.coordinatorsRms.count(),
    localDb.historySteps.count(),
    localDb.backups.count()
  ]);

  let estimatedStorageBytes = 0;
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      estimatedStorageBytes = estimate.usage || 0;
    } catch {
      estimatedStorageBytes = recordsCount * 450; // approximate bytes per record
    }
  } else {
    estimatedStorageBytes = recordsCount * 450;
  }

  return {
    recordsCount,
    msCount,
    rmsCount,
    historyCount,
    backupsCount,
    estimatedStorageBytes,
    isIndexedDbSupported: true
  };
}

/**
 * Exports complete package (records, coordinators, history, settings) to a downloadable file.
 */
export async function exportLocalDataPackage(
  records: OFWCARecord[],
  msList: CoordinatorMS[],
  rmsList: CoordinatorRMS[],
  history: ModelingHistoryStep[],
  settings?: Partial<AppSettings>
): Promise<void> {
  const timestamp = Date.now();
  const dateStr = new Date(timestamp).toISOString().replace(/[:.]/g, '-').slice(0, 19);

  const pkg: BackupPackage = {
    id: `pkg_${timestamp}`,
    name: `STS_Paczka_Danych_${dateStr}`,
    timestamp,
    dateStr: new Date(timestamp).toLocaleString('pl-PL'),
    version: '1.0.4',
    recordsCount: records.length,
    msCount: msList.length,
    rmsCount: rmsList.length,
    records,
    msList,
    rmsList,
    history,
    settings
  };

  // Also store in backups table for instant local recovery
  await localDb.backups.put(pkg);

  // Trigger file download
  const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `STS_Paczka_Instalacyjna_${dateStr}.sts-pkg.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports a data package from JSON text or file.
 */
export async function importLocalDataPackage(jsonString: string): Promise<BackupPackage> {
  const pkg: BackupPackage = JSON.parse(jsonString);

  if (!pkg.records || !Array.isArray(pkg.records)) {
    throw new Error('Nieprawidłowy format paczki: brak tablicy rekordów OFWCA.');
  }

  // Persist directly into IndexedDB
  await persistAllRecords(pkg.records);
  if (pkg.msList && pkg.rmsList) {
    await persistCoordinators(pkg.msList, pkg.rmsList);
  }
  if (pkg.history) {
    await persistHistory(pkg.history);
  }

  // Store in backup snapshots list
  await localDb.backups.put({
    ...pkg,
    id: `pkg_imported_${Date.now()}`
  });

  return pkg;
}

/**
 * Reset local database.
 */
export async function wipeLocalDatabase(): Promise<void> {
  await Promise.all([
    localDb.records.clear(),
    localDb.coordinatorsMs.clear(),
    localDb.coordinatorsRms.clear(),
    localDb.historySteps.clear()
  ]);
}

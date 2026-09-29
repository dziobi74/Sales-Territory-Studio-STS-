import * as XLSX from 'xlsx';
import { OFWCARecord, CoordinatorMS, CoordinatorRMS } from '../types';
import { normalizeVoivodeshipName } from '../data/polandGeo';
import { COLOR_PALETTE } from './demoDataGenerator';

export interface ParseResult {
  records: OFWCARecord[];
  msList: CoordinatorMS[];
  rmsList: CoordinatorRMS[];
  sheetNamesFound: string[];
  totalRowsRead: number;
  warnings: string[];
}

// Clean string for header matching
function cleanHeader(header: string): string {
  return String(header || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics: ą -> a, ł -> l, etc.
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Parse string or number to safe float
function parseSafeNumber(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const str = String(val)
    .replace(/\s+/g, '')
    .replace(/zł/gi, '')
    .replace(/pln/gi, '')
    .replace(/,/g, '.');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
}

export function parseExcelWorkbook(data: ArrayBuffer): ParseResult {
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });
  const sheetNamesFound = workbook.SheetNames;
  const warnings: string[] = [];

  // Find 'baza' sheet (or best match)
  let bazaSheetName = sheetNamesFound.find(name => {
    const n = cleanHeader(name);
    return n === 'baza' || n.includes('baza') || n.includes('dane') || n.includes('ofwca');
  });

  if (!bazaSheetName && sheetNamesFound.length > 0) {
    bazaSheetName = sheetNamesFound[0]; // fallback to first sheet
    warnings.push(`Nie znaleziono arkusza o nazwie "baza". Wykorzystano pierwszy arkusz: "${bazaSheetName}".`);
  }

  if (!bazaSheetName) {
    throw new Error('Plik Excel nie zawiera żadnych arkuszy z danymi.');
  }

  // Find 'MS_lista' sheet if present
  const msSheetName = sheetNamesFound.find(name => {
    const n = cleanHeader(name);
    return n.includes('ms') || n.includes('koordynat') || n.includes('menedzer');
  });

  // Find 'RMS_lista' sheet if present
  const rmsSheetName = sheetNamesFound.find(name => {
    const n = cleanHeader(name);
    return n.includes('rms') || n.includes('dyrektor');
  });

  // Map of OFWCA -> MS from MS_lista
  const ofwcaToMsMap = new Map<string, string>();
  if (msSheetName) {
    const msSheet = workbook.Sheets[msSheetName];
    const msRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(msSheet, { defval: '' });
    msRows.forEach(row => {
      let ofwcaKey = '';
      let msVal = '';
      for (const [k, v] of Object.entries(row)) {
        const cleanedKey = cleanHeader(k);
        if (cleanedKey.includes('ofwca') || cleanedKey.includes('nrofwca') || cleanedKey.includes('id')) {
          ofwcaKey = String(v).trim();
        }
        if (cleanedKey === 'ms' || cleanedKey.includes('menedzer') || cleanedKey.includes('koordynator') || cleanedKey.includes('zwierzchnik')) {
          msVal = String(v).trim();
        }
      }
      if (ofwcaKey && msVal) {
        ofwcaToMsMap.set(ofwcaKey, msVal);
      }
    });
  }

  // Map of MS -> RMS from RMS_lista
  const msToRmsMap = new Map<string, string>();
  if (rmsSheetName) {
    const rmsSheet = workbook.Sheets[rmsSheetName];
    const rmsRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(rmsSheet, { defval: '' });
    rmsRows.forEach(row => {
      let msKey = '';
      let rmsVal = '';
      for (const [k, v] of Object.entries(row)) {
        const cleanedKey = cleanHeader(k);
        if (cleanedKey === 'ms' || cleanedKey.includes('menedzer') || cleanedKey.includes('koordynator')) {
          msKey = String(v).trim();
        }
        if (cleanedKey === 'rms' || cleanedKey.includes('dyrektor') || cleanedKey.includes('region')) {
          rmsVal = String(v).trim();
        }
      }
      if (msKey && rmsVal) {
        msToRmsMap.set(msKey, rmsVal);
      }
    });
  }

  // Read raw rows from 'baza'
  const bazaSheet = workbook.Sheets[bazaSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(bazaSheet, { defval: '' });

  if (rawRows.length === 0) {
    throw new Error(`Arkusz "${bazaSheetName}" jest pusty.`);
  }

  // Determine column mapping by header inspection
  const firstRow = rawRows[0];
  const colMap: Record<string, string> = {};

  for (const rawCol of Object.keys(firstRow)) {
    const c = cleanHeader(rawCol);
    if (c.includes('oddzial') && !c.includes('region')) colMap['oddzial'] = rawCol;
    else if (c.includes('regionoddzial') || (c.includes('region') && c.includes('oddz'))) colMap['regionOddzial'] = rawCol;
    else if (c.includes('regionwojew') || (c.includes('region') && c.includes('woj'))) colMap['regionWojewodztwo'] = rawCol;
    else if (c.includes('wojewodztwo') || c === 'woj') colMap['wojewodztwo'] = rawCol;
    else if (c.includes('powiat') || c === 'pow') colMap['powiat'] = rawCol;
    else if (c.includes('kodpocztowy') || c.includes('kod') || c === 'pna') colMap['kodPocztowy'] = rawCol;
    else if (c.includes('numeragencji') || c.includes('nragencji') || c.includes('idagencji')) colMap['numerAgencji'] = rawCol;
    else if (c.includes('nazwaagenta') || c.includes('agent') || c.includes('agencja')) colMap['nazwaAgenta'] = rawCol;
    else if (c.includes('numerofwca') || c.includes('nrofwca') || c.includes('ofwcaid') || c === 'ofwca') colMap['numerOfwca'] = rawCol;
    else if (c.includes('ofwcadkp') || c.includes('dkp')) colMap['ofwcaDkp'] = rawCol;
    else if (c.includes('pracujedo') || c.includes('zatrudnionydo') || c.includes('zakonczen')) colMap['pracujeDo'] = rawCol;
    else if (c.includes('gwp2025detal') || (c.includes('2025') && c.includes('detal'))) colMap['gwp2025Detal'] = rawCol;
    else if (c.includes('gwp2026detal') || (c.includes('2026') && c.includes('detal'))) colMap['gwp2026Detal'] = rawCol;
    else if (c.includes('gwp2025edu') || (c.includes('2025') && (c.includes('edu') || c.includes('ps')))) colMap['gwp2025EduPs'] = rawCol;
    else if (c.includes('gwp2026edu') || (c.includes('2026') && (c.includes('edu') || c.includes('ps')))) colMap['gwp2026EduPs'] = rawCol;
    else if (c.includes('ms') || c.includes('koordynator') || c.includes('menedzer')) colMap['directMs'] = rawCol;
  }

  // Count OFWCA occurrences for duplicate detection
  const ofwcaCountMap = new Map<string, number>();
  rawRows.forEach((r, idx) => {
    const rawVal = colMap['numerOfwca'] ? String(r[colMap['numerOfwca']] || '') : `OFWCA-${idx + 1}`;
    const id = rawVal.trim();
    if (id) {
      ofwcaCountMap.set(id, (ofwcaCountMap.get(id) || 0) + 1);
    }
  });

  const records: OFWCARecord[] = [];
  const discoveredMsNames = new Set<string>();
  const discoveredRmsNames = new Set<string>();

  rawRows.forEach((row, index) => {
    const numerOfwca = colMap['numerOfwca'] ? String(row[colMap['numerOfwca']] || '').trim() : `OFWCA-${index + 1}`;
    if (!numerOfwca) return; // Skip empty row

    const oddzial = colMap['oddzial'] ? String(row[colMap['oddzial']] || '').trim() : 'Oddział Główny';
    const regionOddzial = colMap['regionOddzial'] ? String(row[colMap['regionOddzial']] || '').trim() : 'Region 1';
    const regionWojewodztwo = colMap['regionWojewodztwo'] ? String(row[colMap['regionWojewodztwo']] || '').trim() : '';
    const rawWoj = colMap['wojewodztwo'] ? String(row[colMap['wojewodztwo']] || '').trim() : '';
    const wojewodztwo = normalizeVoivodeshipName(rawWoj);
    const powiat = colMap['powiat'] ? String(row[colMap['powiat']] || '').trim() : '';
    const kodPocztowy = colMap['kodPocztowy'] ? String(row[colMap['kodPocztowy']] || '').trim() : '';
    const numerAgencji = colMap['numerAgencji'] ? String(row[colMap['numerAgencji']] || '').trim() : `AG-${index + 1}`;
    const nazwaAgenta = colMap['nazwaAgenta'] ? String(row[colMap['nazwaAgenta']] || '').trim() : `Agent ${numerAgencji}`;
    const ofwcaDkpRaw = colMap['ofwcaDkp'] ? String(row[colMap['ofwcaDkp']] || '').trim() : '';
    const isDkp = ofwcaDkpRaw.toUpperCase() === 'TAK';

    // Pracuje do
    let pracujeDo = '';
    if (colMap['pracujeDo']) {
      const pDoVal = row[colMap['pracujeDo']];
      if (pDoVal instanceof Date) {
        pracujeDo = pDoVal.toISOString().split('T')[0];
      } else if (pDoVal !== undefined && pDoVal !== null) {
        pracujeDo = String(pDoVal).trim();
      }
    }
    const isTerminated = Boolean(pracujeDo && pracujeDo.length > 0 && pracujeDo !== '0');
    const isActive = !isTerminated;

    // GWP
    const gwp2025Detal = parseSafeNumber(colMap['gwp2025Detal'] ? row[colMap['gwp2025Detal']] : 0);
    const gwp2026Detal = parseSafeNumber(colMap['gwp2026Detal'] ? row[colMap['gwp2026Detal']] : 0);
    const gwp2025EduPs = parseSafeNumber(colMap['gwp2025EduPs'] ? row[colMap['gwp2025EduPs']] : 0);
    const gwp2026EduPs = parseSafeNumber(colMap['gwp2026EduPs'] ? row[colMap['gwp2026EduPs']] : 0);
    const gwp2025Total = gwp2025Detal + gwp2025EduPs;
    const gwp2026Total = gwp2026Detal + gwp2026EduPs;

    // Find coordinator MS: Priority 1: MS_lista sheet, Priority 2: direct column in baza, Priority 3: Fallback based on region/oddzial
    let initialMs = ofwcaToMsMap.get(numerOfwca) || '';
    if (!initialMs && colMap['directMs']) {
      initialMs = String(row[colMap['directMs']] || '').trim();
    }
    if (!initialMs) {
      initialMs = `MS ${regionOddzial || oddzial || 'Niezrzeszeni'}`;
    }
    discoveredMsNames.add(initialMs);

    // Find RMS
    let initialRms = msToRmsMap.get(initialMs) || '';
    if (!initialRms) {
      initialRms = regionOddzial ? `RMS ${regionOddzial}` : 'RMS Główny';
    }
    discoveredRmsNames.add(initialRms);

    // Warnings and Flags
    const hasLocationIssue = !powiat || powiat.length === 0;
    const hasGwpIssue = (gwp2025Total + gwp2026Total) === 0;
    const isDuplicate = (ofwcaCountMap.get(numerOfwca) || 0) > 1;

    const rowWarnings: string[] = [];
    if (isTerminated) rowWarnings.push(`Zakończony (Pracuje do: ${pracujeDo})`);
    if (hasLocationIssue) rowWarnings.push('Brak pełnej lokalizacji (powiat)');
    if (hasGwpIssue) rowWarnings.push('Brak lub zerowa wartość GWP');
    if (isDuplicate) rowWarnings.push('Wielokrotny rekord OFWCA w pliku');

    records.push({
      id: `rec_${index + 1}_${numerOfwca}`,
      numerOfwca,
      nazwaAgenta,
      numerAgencji,
      oddzial,
      regionOddzial,
      regionWojewodztwo,
      wojewodztwo,
      powiat,
      kodPocztowy,
      ofwcaDkpRaw,
      isDkp,
      pracujeDo,
      isActive,
      gwp2025Detal,
      gwp2026Detal,
      gwp2025EduPs,
      gwp2026EduPs,
      gwp2025Total,
      gwp2026Total,
      initialMs,
      currentMs: initialMs,
      initialRms,
      currentRms: initialRms,
      hasLocationIssue,
      hasGwpIssue,
      isDuplicate,
      isTerminated,
      warnings: rowWarnings
    });
  });

  // Build MS list
  const msList: CoordinatorMS[] = Array.from(discoveredMsNames).map((name, idx) => {
    const rms = msToRmsMap.get(name) || 'RMS Standard';
    return {
      id: `ms_${idx + 1}`,
      name,
      rms,
      color: COLOR_PALETTE[idx % COLOR_PALETTE.length]
    };
  });

  // Build RMS list
  const rmsList: CoordinatorRMS[] = Array.from(discoveredRmsNames).map((name, idx) => {
    return {
      id: `rms_${idx + 1}`,
      name,
      region: name,
      color: COLOR_PALETTE[(idx + 4) % COLOR_PALETTE.length]
    };
  });

  return {
    records,
    msList,
    rmsList,
    sheetNamesFound,
    totalRowsRead: records.length,
    warnings
  };
}

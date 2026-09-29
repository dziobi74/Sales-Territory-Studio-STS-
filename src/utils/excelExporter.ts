import * as XLSX from 'xlsx';
import { OFWCARecord, CoordinatorMS, CoordinatorRMS, TerritoryBalanceMetric } from '../types';
import { calculateVoivodeshipTerritoryBreakdown } from './balancer';

export function exportModeledWorkbook(
  records: OFWCARecord[],
  msList: CoordinatorMS[],
  rmsList: CoordinatorRMS[],
  balanceMetrics: TerritoryBalanceMetric[]
) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet: baza_po_modelowaniu
  const bazaRows = records.map(r => {
    const isMoved = r.currentMs !== r.initialMs;
    const gwpGrowth = r.gwp2025Total > 0 ? ((r.gwp2026Total - r.gwp2025Total) / r.gwp2025Total) * 100 : 0;

    return {
      'Oddział': r.oddzial,
      'Region_oddział': r.regionOddzial,
      'Region_województwo': r.regionWojewodztwo,
      'województwo': r.wojewodztwo,
      'Powiat': r.powiat,
      'Kod pocztowy': r.kodPocztowy,
      'Numer Agencji': r.numerAgencji,
      'nazwa agenta': r.nazwaAgenta,
      'Numer OFWCA': r.numerOfwca,
      'OFWCA_DKP': r.isDkp ? 'TAK' : 'NIE',
      'Klasyfikacja': r.isDkp ? 'DKP' : 'DPD',
      'Pracuje do': r.pracujeDo || '',
      'Status_Aktywności': r.isActive ? 'AKTYWNY' : 'ZAKOŃCZONY',
      'GWP 2025 detal': r.gwp2025Detal,
      'GWP 2025 EDU PS': r.gwp2025EduPs,
      'GWP 2025 SUMA': r.gwp2025Total,
      'GWP 2026 detal': r.gwp2026Detal,
      'GWP 2026 EDU PS': r.gwp2026EduPs,
      'GWP 2026 SUMA': r.gwp2026Total,
      'Dynamika Wzrostu %': Math.round(gwpGrowth * 10) / 10,
      'MS_Początkowy': r.initialMs,
      'MS_Docelowy': r.currentMs,
      'RMS_Początkowy': r.initialRms,
      'RMS_Docelowy': r.currentRms,
      'Status_Modelowania': isMoved ? 'PRZENIESIONY' : 'BEZ ZMIAN',
      'Uwagi_Audytowe': (r.warnings || []).join('; ')
    };
  });
  const wsBaza = XLSX.utils.json_to_sheet(bazaRows);
  XLSX.utils.book_append_sheet(wb, wsBaza, 'baza_po_modelowaniu');

  // 2. Sheet: Raport_Balansowania_MS
  const reportRows = balanceMetrics.map(m => ({
    'Koordynator (MS)': m.msName,
    'Regionalny (RMS)': m.rmsName,
    'Status Obciążenia': m.workloadStatus,
    'Indeks Obciążenia (100=śr)': Math.round(m.workloadIndex),
    'OFWCA Przed': m.initialOfwcaCount,
    'OFWCA Po': m.currentOfwcaCount,
    'OFWCA Zmiana (Δ)': m.deltaOfwca,
    'OFWCA Aktywni Po': m.currentActiveOfwcaCount,
    'DKP Po': m.currentDkpCount,
    'DPD Po': m.currentDpdCount,
    'Agenci Przed': m.initialAgentCount,
    'Agenci Po': m.currentAgentCount,
    'GWP 2025 Przed (PLN)': m.initialGwp2025,
    'GWP 2025 Po (PLN)': m.currentGwp2025,
    'GWP 2026 Przed (PLN)': m.initialGwp2026,
    'GWP 2026 Po (PLN)': m.currentGwp2026,
    'GWP 2026 Zmiana (PLN)': m.deltaGwp2026,
    'GWP 2026 Zmiana (%)': `${m.deltaGwpPercent > 0 ? '+' : ''}${Math.round(m.deltaGwpPercent * 10) / 10}%`,
    'GWP 2026 DKP (PLN)': m.currentDkpGwp2026,
    'GWP 2026 DPD (PLN)': m.currentDpdGwp2026,
    'Liczba Powiatów': m.powiatyCount,
    'Obsługiwane Województwa': m.wojewodztwa.join(', ')
  }));
  const wsReport = XLSX.utils.json_to_sheet(reportRows);
  XLSX.utils.book_append_sheet(wb, wsReport, 'Raport_Balansowania_MS');

  // 3. Sheet: Analiza_Wojewodztw_Teren_Poza
  const voivodeshipBreakdowns = calculateVoivodeshipTerritoryBreakdown(records, msList);
  const territoryRows: any[] = [];
  voivodeshipBreakdowns.forEach(vb => {
    vb.msRows.forEach(row => {
      territoryRows.push({
        'Województwo': vb.voivodeship,
        'Wskaźnik Zwartości Województwa %': Math.round(vb.territoryCompactnessPercent * 10) / 10,
        'Koordynator (MS)': row.msName,
        'Dyrektor (RMS)': row.rmsName,
        'Status Terytorium': row.isPrimaryTerritory ? 'Teren Macierzysty' : 'Obsługa Zewnętrzna',
        'OFWCA Łącznie w Województwie': row.totalOfwcaInVoivodeship,
        'Z Terenu: Łącznie': row.inTerritoryOfwca,
        'Z Terenu: DKP': row.inTerritoryDkp,
        'Z Terenu: DPD': row.inTerritoryDpd,
        'Z Poza Terenu: Łącznie': row.outOfTerritoryOfwca,
        'Z Poza Terenu: DKP': row.outOfTerritoryDkp,
        'Z Poza Terenu: DPD': row.outOfTerritoryDpd,
        'GWP 2026 w Województwie': row.gwp2026InVoivodeship
      });
    });
  });
  const wsTerritory = XLSX.utils.json_to_sheet(territoryRows);
  XLSX.utils.book_append_sheet(wb, wsTerritory, 'Analiza_Woj_Teren_vs_Poza');

  // 4. Sheet: MS_lista_docelowa
  const msUniqueOfwca = new Map<string, { ofwca: string; ms: string; agent: string; dkp: string; woj: string; pow: string }>();
  records.forEach(r => {
    if (!msUniqueOfwca.has(r.numerOfwca)) {
      msUniqueOfwca.set(r.numerOfwca, {
        ofwca: r.numerOfwca,
        ms: r.currentMs,
        agent: r.nazwaAgenta,
        dkp: r.isDkp ? 'DKP' : 'DPD',
        woj: r.wojewodztwo,
        pow: r.powiat
      });
    }
  });
  const msListRows = Array.from(msUniqueOfwca.values()).map(item => ({
    'Numer OFWCA': item.ofwca,
    'MS': item.ms,
    'Nazwa agenta': item.agent,
    'Klasyfikacja': item.dkp,
    'Województwo': item.woj,
    'Powiat': item.pow
  }));
  const wsMsList = XLSX.utils.json_to_sheet(msListRows);
  XLSX.utils.book_append_sheet(wb, wsMsList, 'MS_lista_docelowa');

  // 5. Sheet: RMS_lista_docelowa
  const rmsRows = msList.map(ms => ({
    'MS': ms.name,
    'RMS': ms.rms,
    'Region': ms.region || ''
  }));
  const wsRmsList = XLSX.utils.json_to_sheet(rmsRows);
  XLSX.utils.book_append_sheet(wb, wsRmsList, 'RMS_lista_docelowa');

  // 6. Sheet: Rekordy_Zmienione
  const changedRecords = records.filter(r => r.currentMs !== r.initialMs);
  const changedRows = changedRecords.map(r => ({
    'Numer OFWCA': r.numerOfwca,
    'Agent': r.nazwaAgenta,
    'Województwo': r.wojewodztwo,
    'Powiat': r.powiat,
    'Poprzedni MS': r.initialMs,
    'Nowy MS': r.currentMs,
    'Poprzedni RMS': r.initialRms,
    'Nowy RMS': r.currentRms,
    'GWP 2026': r.gwp2026Total,
    'Klasyfikacja': r.isDkp ? 'DKP' : 'DPD'
  }));
  if (changedRows.length > 0) {
    const wsChanged = XLSX.utils.json_to_sheet(changedRows);
    XLSX.utils.book_append_sheet(wb, wsChanged, 'Zmienione_Przypisania');
  }

  // Trigger file download
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  XLSX.writeFile(wb, `STS_Struktura_Po_Modelowaniu_${timestamp}.xlsx`);
}

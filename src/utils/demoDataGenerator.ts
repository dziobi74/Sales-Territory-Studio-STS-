import { OFWCARecord, CoordinatorMS, CoordinatorRMS } from '../types';
import * as XLSX from 'xlsx';

export const DEFAULT_RMS_LIST: CoordinatorRMS[] = [
  { id: 'rms_1', name: 'RMS Północ (Marek Zieliński)', region: 'Północ', color: '#0284c7' }, // Sky
  { id: 'rms_2', name: 'RMS Centrum (Agnieszka Szymańska)', region: 'Centrum', color: '#7c3aed' }, // Purple
  { id: 'rms_3', name: 'RMS Południe (Robert Jankowski)', region: 'Południe', color: '#059669' }, // Emerald
];

export const DEFAULT_MS_LIST: CoordinatorMS[] = [
  { id: 'ms_1', name: 'MS Jan Kowalski', rms: 'RMS Północ (Marek Zieliński)', region: 'Pomorskie / Kujawy', color: '#38bdf8' },
  { id: 'ms_2', name: 'MS Anna Nowak', rms: 'RMS Północ (Marek Zieliński)', region: 'Zachodniopomorskie', color: '#0ea5e9' },
  { id: 'ms_3', name: 'MS Piotr Wiśniewski', rms: 'RMS Centrum (Agnieszka Szymańska)', region: 'Mazowsze Północ', color: '#a855f7' },
  { id: 'ms_4', name: 'MS Katarzyna Lewandowska', rms: 'RMS Centrum (Agnieszka Szymańska)', region: 'Mazowsze Południe / Radom', color: '#8b5cf6' },
  { id: 'ms_5', name: 'MS Michał Kamiński', rms: 'RMS Centrum (Agnieszka Szymańska)', region: 'Łódzkie / Świętokrzyskie', color: '#6366f1' },
  { id: 'ms_6', name: 'MS Tomasz Wójcik', rms: 'RMS Południe (Robert Jankowski)', region: 'Wielkopolska / Lubuskie', color: '#10b981' },
  { id: 'ms_7', name: 'MS Magdalena Dąbrowska', rms: 'RMS Południe (Robert Jankowski)', region: 'Dolny Śląsk / Opole', color: '#14b8a6' },
  { id: 'ms_8', name: 'MS Paweł Kozłowski', rms: 'RMS Południe (Robert Jankowski)', region: 'Małopolska / Śląsk / Podkarpacie', color: '#f59e0b' },
];

export const COLOR_PALETTE = [
  '#38bdf8', '#0ea5e9', '#a855f7', '#8b5cf6', '#6366f1',
  '#10b981', '#14b8a6', '#f59e0b', '#ec4899', '#f97316',
  '#84cc16', '#06b6d4', '#d946ef', '#64748b'
];

interface RawSampleItem {
  oddzial: string;
  regionOddzial: string;
  regionWojewodztwo: string;
  wojewodztwo: string;
  powiat: string;
  kodPocztowy: string;
  numerAgencji: string;
  nazwaAgenta: string;
  numerOfwca: string;
  ofwcaDkpRaw: string;
  pracujeDo: string;
  gwp2025Detal: number;
  gwp2026Detal: number;
  gwp2025EduPs: number;
  gwp2026EduPs: number;
  assignedMs: string;
}

export function generateRealisticDataset(): {
  records: OFWCARecord[];
  msList: CoordinatorMS[];
  rmsList: CoordinatorRMS[];
} {
  const rawList: RawSampleItem[] = [
    // Mazowieckie (Warszawa & okolice)
    {
      oddzial: 'Oddział Warszawa',
      regionOddzial: 'Region Centrum',
      regionWojewodztwo: 'Centrum',
      wojewodztwo: 'Mazowieckie',
      powiat: 'Warszawa',
      kodPocztowy: '00-020',
      numerAgencji: 'AG-1001',
      nazwaAgenta: 'Vistula Ubezpieczenia Sp. z o.o.',
      numerOfwca: 'OFWCA-00101',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 850000,
      gwp2026Detal: 990000,
      gwp2025EduPs: 140000,
      gwp2026EduPs: 175000,
      assignedMs: 'MS Piotr Wiśniewski'
    },
    {
      oddzial: 'Oddział Warszawa',
      regionOddzial: 'Region Centrum',
      regionWojewodztwo: 'Centrum',
      wojewodztwo: 'Mazowieckie',
      powiat: 'Warszawa',
      kodPocztowy: '01-494',
      numerAgencji: 'AG-1001',
      nazwaAgenta: 'Vistula Ubezpieczenia Sp. z o.o.',
      numerOfwca: 'OFWCA-00102',
      ofwcaDkpRaw: 'NIE',
      pracujeDo: '',
      gwp2025Detal: 520000,
      gwp2026Detal: 610000,
      gwp2025EduPs: 90000,
      gwp2026EduPs: 110000,
      assignedMs: 'MS Piotr Wiśniewski'
    },
    {
      oddzial: 'Oddział Warszawa',
      regionOddzial: 'Region Centrum',
      regionWojewodztwo: 'Centrum',
      wojewodztwo: 'Mazowieckie',
      powiat: 'piaseczyński',
      kodPocztowy: '05-500',
      numerAgencji: 'AG-1002',
      nazwaAgenta: 'Kancelaria Finansowa Alfa',
      numerOfwca: 'OFWCA-00103',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 920000,
      gwp2026Detal: 1050000,
      gwp2025EduPs: 210000,
      gwp2026EduPs: 260000,
      assignedMs: 'MS Piotr Wiśniewski'
    },
    {
      oddzial: 'Oddział Warszawa',
      regionOddzial: 'Region Centrum',
      regionWojewodztwo: 'Centrum',
      wojewodztwo: 'Mazowieckie',
      powiat: 'Radom',
      kodPocztowy: '26-600',
      numerAgencji: 'AG-1003',
      nazwaAgenta: 'Radomski Dom Ubezpieczeniowy',
      numerOfwca: 'OFWCA-00104',
      ofwcaDkpRaw: '',
      pracujeDo: '',
      gwp2025Detal: 430000,
      gwp2026Detal: 480000,
      gwp2025EduPs: 80000,
      gwp2026EduPs: 95000,
      assignedMs: 'MS Katarzyna Lewandowska'
    },
    {
      oddzial: 'Oddział Warszawa',
      regionOddzial: 'Region Centrum',
      regionWojewodztwo: 'Centrum',
      wojewodztwo: 'Mazowieckie',
      powiat: 'Płock',
      kodPocztowy: '09-400',
      numerAgencji: 'AG-1004',
      nazwaAgenta: 'Partner Mazowsze Agencja',
      numerOfwca: 'OFWCA-00105',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 640000,
      gwp2026Detal: 730000,
      gwp2025EduPs: 130000,
      gwp2026EduPs: 160000,
      assignedMs: 'MS Katarzyna Lewandowska'
    },
    {
      oddzial: 'Oddział Warszawa',
      regionOddzial: 'Region Centrum',
      regionWojewodztwo: 'Centrum',
      wojewodztwo: 'Mazowieckie',
      powiat: 'pruszkowski',
      kodPocztowy: '05-800',
      numerAgencji: 'AG-1005',
      nazwaAgenta: 'Pruszków Asekuracja',
      numerOfwca: 'OFWCA-00106',
      ofwcaDkpRaw: '',
      pracujeDo: '2024-12-31', // Zakończony!
      gwp2025Detal: 180000,
      gwp2026Detal: 0,
      gwp2025EduPs: 20000,
      gwp2026EduPs: 0,
      assignedMs: 'MS Katarzyna Lewandowska'
    },
    {
      oddzial: 'Oddział Warszawa',
      regionOddzial: 'Region Centrum',
      regionWojewodztwo: 'Centrum',
      wojewodztwo: 'Mazowieckie',
      powiat: '', // Brak lokalizacji dla audytu
      kodPocztowy: '',
      numerAgencji: 'AG-1006',
      nazwaAgenta: 'Mobilny Doradca Centralny',
      numerOfwca: 'OFWCA-00107',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 410000,
      gwp2026Detal: 490000,
      gwp2025EduPs: 70000,
      gwp2026EduPs: 85000,
      assignedMs: 'MS Piotr Wiśniewski'
    },

    // Pomorskie (Gdańsk / Gdynia / Sopot)
    {
      oddzial: 'Oddział Gdańsk',
      regionOddzial: 'Region Północ',
      regionWojewodztwo: 'Północ',
      wojewodztwo: 'Pomorskie',
      powiat: 'Gdańsk',
      kodPocztowy: '80-001',
      numerAgencji: 'AG-2001',
      nazwaAgenta: 'Baltic Shield Brokers',
      numerOfwca: 'OFWCA-00201',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 1100000,
      gwp2026Detal: 1350000,
      gwp2025EduPs: 250000,
      gwp2026EduPs: 310000,
      assignedMs: 'MS Jan Kowalski'
    },
    {
      oddzial: 'Oddział Gdańsk',
      regionOddzial: 'Region Północ',
      regionWojewodztwo: 'Północ',
      wojewodztwo: 'Pomorskie',
      powiat: 'Gdynia',
      kodPocztowy: '81-300',
      numerAgencji: 'AG-2002',
      nazwaAgenta: 'Nordic Safe Sp. k.',
      numerOfwca: 'OFWCA-00202',
      ofwcaDkpRaw: '',
      pracujeDo: '',
      gwp2025Detal: 730000,
      gwp2026Detal: 850000,
      gwp2025EduPs: 110000,
      gwp2026EduPs: 140000,
      assignedMs: 'MS Jan Kowalski'
    },
    {
      oddzial: 'Oddział Gdańsk',
      regionOddzial: 'Region Północ',
      regionWojewodztwo: 'Północ',
      wojewodztwo: 'Pomorskie',
      powiat: 'kartuski',
      kodPocztowy: '83-300',
      numerAgencji: 'AG-2003',
      nazwaAgenta: 'Kaszuby Ubezpieczenia',
      numerOfwca: 'OFWCA-00203',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 390000,
      gwp2026Detal: 460000,
      gwp2025EduPs: 60000,
      gwp2026EduPs: 80000,
      assignedMs: 'MS Jan Kowalski'
    },
    {
      oddzial: 'Oddział Gdańsk',
      regionOddzial: 'Region Północ',
      regionWojewodztwo: 'Północ',
      wojewodztwo: 'Pomorskie',
      powiat: 'słupski',
      kodPocztowy: '76-200',
      numerAgencji: 'AG-2004',
      nazwaAgenta: 'Słupsk & Region Finanse',
      numerOfwca: 'OFWCA-00204',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 480000,
      gwp2026Detal: 540000,
      gwp2025EduPs: 75000,
      gwp2026EduPs: 90000,
      assignedMs: 'MS Jan Kowalski'
    },

    // Zachodniopomorskie (Szczecin / Koszalin)
    {
      oddzial: 'Oddział Szczecin',
      regionOddzial: 'Region Północ',
      regionWojewodztwo: 'Północ',
      wojewodztwo: 'Zachodniopomorskie',
      powiat: 'Szczecin',
      kodPocztowy: '70-100',
      numerAgencji: 'AG-3001',
      nazwaAgenta: 'Odra Brokers Group',
      numerOfwca: 'OFWCA-00301',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 960000,
      gwp2026Detal: 1120000,
      gwp2025EduPs: 190000,
      gwp2026EduPs: 230000,
      assignedMs: 'MS Anna Nowak'
    },
    {
      oddzial: 'Oddział Szczecin',
      regionOddzial: 'Region Północ',
      regionWojewodztwo: 'Północ',
      wojewodztwo: 'Zachodniopomorskie',
      powiat: 'Koszalin',
      kodPocztowy: '75-001',
      numerAgencji: 'AG-3002',
      nazwaAgenta: 'Pomorze Zachodnie Multiagencja',
      numerOfwca: 'OFWCA-00302',
      ofwcaDkpRaw: '',
      pracujeDo: '',
      gwp2025Detal: 510000,
      gwp2026Detal: 580000,
      gwp2025EduPs: 95000,
      gwp2026EduPs: 115000,
      assignedMs: 'MS Anna Nowak'
    },
    {
      oddzial: 'Oddział Szczecin',
      regionOddzial: 'Region Północ',
      regionWojewodztwo: 'Północ',
      wojewodztwo: 'Zachodniopomorskie',
      powiat: 'kołobrzeski',
      kodPocztowy: '78-100',
      numerAgencji: 'AG-3003',
      nazwaAgenta: 'Nadmorskie Centrum Asekuracji',
      numerOfwca: 'OFWCA-00303',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 620000,
      gwp2026Detal: 710000,
      gwp2025EduPs: 120000,
      gwp2026EduPs: 150000,
      assignedMs: 'MS Anna Nowak'
    },

    // Kujawsko-Pomorskie (Bydgoszcz / Toruń)
    {
      oddzial: 'Oddział Bydgoszcz',
      regionOddzial: 'Region Północ',
      regionWojewodztwo: 'Północ',
      wojewodztwo: 'Kujawsko-Pomorskie',
      powiat: 'Bydgoszcz',
      kodPocztowy: '85-001',
      numerAgencji: 'AG-4001',
      nazwaAgenta: 'Kujawia Finanse Sp. z o.o.',
      numerOfwca: 'OFWCA-00401',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 820000,
      gwp2026Detal: 950000,
      gwp2025EduPs: 160000,
      gwp2026EduPs: 195000,
      assignedMs: 'MS Jan Kowalski'
    },
    {
      oddzial: 'Oddział Bydgoszcz',
      regionOddzial: 'Region Północ',
      regionWojewodztwo: 'Północ',
      wojewodztwo: 'Kujawsko-Pomorskie',
      powiat: 'Toruń',
      kodPocztowy: '87-100',
      numerAgencji: 'AG-4002',
      nazwaAgenta: 'Copernicus Multiagencja',
      numerOfwca: 'OFWCA-00402',
      ofwcaDkpRaw: '',
      pracujeDo: '',
      gwp2025Detal: 590000,
      gwp2026Detal: 680000,
      gwp2025EduPs: 105000,
      gwp2026EduPs: 130000,
      assignedMs: 'MS Jan Kowalski'
    },

    // Łódzkie
    {
      oddzial: 'Oddział Łódź',
      regionOddzial: 'Region Centrum',
      regionWojewodztwo: 'Centrum',
      wojewodztwo: 'Łódzkie',
      powiat: 'Łódź',
      kodPocztowy: '90-001',
      numerAgencji: 'AG-5001',
      nazwaAgenta: 'Piotrkowska Ubezpieczenia',
      numerOfwca: 'OFWCA-00501',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 890000,
      gwp2026Detal: 1020000,
      gwp2025EduPs: 170000,
      gwp2026EduPs: 210000,
      assignedMs: 'MS Michał Kamiński'
    },
    {
      oddzial: 'Oddział Łódź',
      regionOddzial: 'Region Centrum',
      regionWojewodztwo: 'Centrum',
      wojewodztwo: 'Łódzkie',
      powiat: 'Piotrków Trybunalski',
      kodPocztowy: '97-300',
      numerAgencji: 'AG-5002',
      nazwaAgenta: 'Trybunał Finansowy',
      numerOfwca: 'OFWCA-00502',
      ofwcaDkpRaw: '',
      pracujeDo: '',
      gwp2025Detal: 440000,
      gwp2026Detal: 510000,
      gwp2025EduPs: 70000,
      gwp2026EduPs: 85000,
      assignedMs: 'MS Michał Kamiński'
    },
    {
      oddzial: 'Oddział Łódź',
      regionOddzial: 'Region Centrum',
      regionWojewodztwo: 'Centrum',
      wojewodztwo: 'Łódzkie',
      powiat: 'Pabianice',
      kodPocztowy: '95-200',
      numerAgencji: 'AG-5003',
      nazwaAgenta: 'Centrum Asekuracji Pabianice',
      numerOfwca: 'OFWCA-00503',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 350000,
      gwp2026Detal: 400000,
      gwp2025EduPs: 55000,
      gwp2026EduPs: 68000,
      assignedMs: 'MS Michał Kamiński'
    },

    // Wielkopolskie (Poznań / Kalisz / Konin)
    {
      oddzial: 'Oddział Poznań',
      regionOddzial: 'Region Południe',
      regionWojewodztwo: 'Zachód',
      wojewodztwo: 'Wielkopolskie',
      powiat: 'Poznań',
      kodPocztowy: '60-101',
      numerAgencji: 'AG-6001',
      nazwaAgenta: 'Warta & Lech Doradztwo',
      numerOfwca: 'OFWCA-00601',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 1250000,
      gwp2026Detal: 1480000,
      gwp2025EduPs: 280000,
      gwp2026EduPs: 350000,
      assignedMs: 'MS Tomasz Wójcik'
    },
    {
      oddzial: 'Oddział Poznań',
      regionOddzial: 'Region Południe',
      regionWojewodztwo: 'Zachód',
      wojewodztwo: 'Wielkopolskie',
      powiat: 'poznański',
      kodPocztowy: '62-020',
      numerAgencji: 'AG-6002',
      nazwaAgenta: 'Agencja Swarzędz i Okolice',
      numerOfwca: 'OFWCA-00602',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 670000,
      gwp2026Detal: 790000,
      gwp2025EduPs: 130000,
      gwp2026EduPs: 165000,
      assignedMs: 'MS Tomasz Wójcik'
    },
    {
      oddzial: 'Oddział Poznań',
      regionOddzial: 'Region Południe',
      regionWojewodztwo: 'Zachód',
      wojewodztwo: 'Wielkopolskie',
      powiat: 'Kalisz',
      kodPocztowy: '62-800',
      numerAgencji: 'AG-6003',
      nazwaAgenta: 'Prosna Multi-Ubezpieczenia',
      numerOfwca: 'OFWCA-00603',
      ofwcaDkpRaw: '',
      pracujeDo: '',
      gwp2025Detal: 480000,
      gwp2026Detal: 560000,
      gwp2025EduPs: 85000,
      gwp2026EduPs: 105000,
      assignedMs: 'MS Tomasz Wójcik'
    },

    // Lubuskie
    {
      oddzial: 'Oddział Poznań',
      regionOddzial: 'Region Południe',
      regionWojewodztwo: 'Zachód',
      wojewodztwo: 'Lubuskie',
      powiat: 'Zielona Góra',
      kodPocztowy: '65-001',
      numerAgencji: 'AG-6004',
      nazwaAgenta: 'Winny Gród Asekuracja',
      numerOfwca: 'OFWCA-00604',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 530000,
      gwp2026Detal: 620000,
      gwp2025EduPs: 90000,
      gwp2026EduPs: 115000,
      assignedMs: 'MS Tomasz Wójcik'
    },
    {
      oddzial: 'Oddział Poznań',
      regionOddzial: 'Region Południe',
      regionWojewodztwo: 'Zachód',
      wojewodztwo: 'Lubuskie',
      powiat: 'Gorzów Wielkopolski',
      kodPocztowy: '66-400',
      numerAgencji: 'AG-6005',
      nazwaAgenta: 'Warta Gorzowska Sp. z o.o.',
      numerOfwca: 'OFWCA-00605',
      ofwcaDkpRaw: '',
      pracujeDo: '',
      gwp2025Detal: 490000,
      gwp2026Detal: 570000,
      gwp2025EduPs: 78000,
      gwp2026EduPs: 95000,
      assignedMs: 'MS Tomasz Wójcik'
    },

    // Dolnośląskie (Wrocław / Legnica / Wałbrzych)
    {
      oddzial: 'Oddział Wrocław',
      regionOddzial: 'Region Południe',
      regionWojewodztwo: 'Dolny Śląsk',
      wojewodztwo: 'Dolnośląskie',
      powiat: 'Wrocław',
      kodPocztowy: '50-001',
      numerAgencji: 'AG-7001',
      nazwaAgenta: 'Silesia Prime Partners',
      numerOfwca: 'OFWCA-00701',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 1350000,
      gwp2026Detal: 1590000,
      gwp2025EduPs: 310000,
      gwp2026EduPs: 390000,
      assignedMs: 'MS Magdalena Dąbrowska'
    },
    {
      oddzial: 'Oddział Wrocław',
      regionOddzial: 'Region Południe',
      regionWojewodztwo: 'Dolny Śląsk',
      wojewodztwo: 'Dolnośląskie',
      powiat: 'wrocławski',
      kodPocztowy: '55-010',
      numerAgencji: 'AG-7002',
      nazwaAgenta: 'Kąty Wrocławskie Finanse',
      numerOfwca: 'OFWCA-00702',
      ofwcaDkpRaw: '',
      pracujeDo: '',
      gwp2025Detal: 580000,
      gwp2026Detal: 670000,
      gwp2025EduPs: 95000,
      gwp2026EduPs: 120000,
      assignedMs: 'MS Magdalena Dąbrowska'
    },
    {
      oddzial: 'Oddział Wrocław',
      regionOddzial: 'Region Południe',
      regionWojewodztwo: 'Dolny Śląsk',
      wojewodztwo: 'Dolnośląskie',
      powiat: 'Legnica',
      kodPocztowy: '59-220',
      numerAgencji: 'AG-7003',
      nazwaAgenta: 'Zagłębie Miedziowe Agencja',
      numerOfwca: 'OFWCA-00703',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 640000,
      gwp2026Detal: 750000,
      gwp2025EduPs: 120000,
      gwp2026EduPs: 155000,
      assignedMs: 'MS Magdalena Dąbrowska'
    },

    // Opolskie
    {
      oddzial: 'Oddział Wrocław',
      regionOddzial: 'Region Południe',
      regionWojewodztwo: 'Dolny Śląsk',
      wojewodztwo: 'Opolskie',
      powiat: 'Opole',
      kodPocztowy: '45-001',
      numerAgencji: 'AG-7004',
      nazwaAgenta: 'Piast Asekuracja Opole',
      numerOfwca: 'OFWCA-00704',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 520000,
      gwp2026Detal: 610000,
      gwp2025EduPs: 85000,
      gwp2026EduPs: 110000,
      assignedMs: 'MS Magdalena Dąbrowska'
    },

    // Małopolskie (Kraków / Tarnów)
    {
      oddzial: 'Oddział Kraków',
      regionOddzial: 'Region Południe',
      regionWojewodztwo: 'Małopolska',
      wojewodztwo: 'Małopolskie',
      powiat: 'Kraków',
      kodPocztowy: '30-001',
      numerAgencji: 'AG-8001',
      nazwaAgenta: 'Wawel Ubezpieczenia Sp. z o.o.',
      numerOfwca: 'OFWCA-00801',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 1420000,
      gwp2026Detal: 1680000,
      gwp2025EduPs: 330000,
      gwp2026EduPs: 420000,
      assignedMs: 'MS Paweł Kozłowski'
    },
    {
      oddzial: 'Oddział Kraków',
      regionOddzial: 'Region Południe',
      regionWojewodztwo: 'Małopolska',
      wojewodztwo: 'Małopolskie',
      powiat: 'krakowski',
      kodPocztowy: '32-050',
      numerAgencji: 'AG-8002',
      nazwaAgenta: 'Skawina & Podkrakowska Agencja',
      numerOfwca: 'OFWCA-00802',
      ofwcaDkpRaw: '',
      pracujeDo: '',
      gwp2025Detal: 610000,
      gwp2026Detal: 720000,
      gwp2025EduPs: 110000,
      gwp2026EduPs: 140000,
      assignedMs: 'MS Paweł Kozłowski'
    },
    {
      oddzial: 'Oddział Kraków',
      regionOddzial: 'Region Południe',
      regionWojewodztwo: 'Małopolska',
      wojewodztwo: 'Małopolskie',
      powiat: 'Tarnów',
      kodPocztowy: '33-100',
      numerAgencji: 'AG-8003',
      nazwaAgenta: 'Tarnowski Dom Brokerski',
      numerOfwca: 'OFWCA-00803',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 470000,
      gwp2026Detal: 550000,
      gwp2025EduPs: 80000,
      gwp2026EduPs: 100000,
      assignedMs: 'MS Paweł Kozłowski'
    },

    // Śląskie (Katowice / Gliwice / Bielsko-Biała)
    {
      oddzial: 'Oddział Katowice',
      regionOddzial: 'Region Południe',
      regionWojewodztwo: 'Śląsk',
      wojewodztwo: 'Śląskie',
      powiat: 'Katowice',
      kodPocztowy: '40-001',
      numerAgencji: 'AG-9001',
      nazwaAgenta: 'Metropolia Śląska Ubezpieczenia',
      numerOfwca: 'OFWCA-00901',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 1510000,
      gwp2026Detal: 1820000,
      gwp2025EduPs: 360000,
      gwp2026EduPs: 460000,
      assignedMs: 'MS Paweł Kozłowski'
    },
    {
      oddzial: 'Oddział Katowice',
      regionOddzial: 'Region Południe',
      regionWojewodztwo: 'Śląsk',
      wojewodztwo: 'Śląskie',
      powiat: 'Gliwice',
      kodPocztowy: '44-100',
      numerAgencji: 'AG-9002',
      nazwaAgenta: 'Techno-Asekuracja Gliwice',
      numerOfwca: 'OFWCA-00902',
      ofwcaDkpRaw: '',
      pracujeDo: '',
      gwp2025Detal: 780000,
      gwp2026Detal: 920000,
      gwp2025EduPs: 145000,
      gwp2026EduPs: 180000,
      assignedMs: 'MS Paweł Kozłowski'
    },
    {
      oddzial: 'Oddział Katowice',
      regionOddzial: 'Region Południe',
      regionWojewodztwo: 'Śląsk',
      wojewodztwo: 'Śląskie',
      powiat: 'Bielsko-Biała',
      kodPocztowy: '43-300',
      numerAgencji: 'AG-9003',
      nazwaAgenta: 'Beskidzka Grupa Brokerska',
      numerOfwca: 'OFWCA-00903',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 690000,
      gwp2026Detal: 810000,
      gwp2025EduPs: 130000,
      gwp2026EduPs: 165000,
      assignedMs: 'MS Paweł Kozłowski'
    },

    // Podkarpackie (Rzeszów)
    {
      oddzial: 'Oddział Rzeszów',
      regionOddzial: 'Region Południe',
      regionWojewodztwo: 'Południe',
      wojewodztwo: 'Podkarpackie',
      powiat: 'Rzeszów',
      kodPocztowy: '35-001',
      numerAgencji: 'AG-9501',
      nazwaAgenta: 'Podkarpacie Finanse',
      numerOfwca: 'OFWCA-00951',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 640000,
      gwp2026Detal: 750000,
      gwp2025EduPs: 110000,
      gwp2026EduPs: 145000,
      assignedMs: 'MS Paweł Kozłowski'
    },

    // Lubelskie (Lublin)
    {
      oddzial: 'Oddział Lublin',
      regionOddzial: 'Region Centrum',
      regionWojewodztwo: 'Wschód',
      wojewodztwo: 'Lubelskie',
      powiat: 'Lublin',
      kodPocztowy: '20-001',
      numerAgencji: 'AG-9801',
      nazwaAgenta: 'Koziołek Ubezpieczenia',
      numerOfwca: 'OFWCA-00981',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 680000,
      gwp2026Detal: 790000,
      gwp2025EduPs: 135000,
      gwp2026EduPs: 170000,
      assignedMs: 'MS Michał Kamiński'
    },
    // Podlaskie (Białystok)
    {
      oddzial: 'Oddział Białystok',
      regionOddzial: 'Region Północ',
      regionWojewodztwo: 'Wschód',
      wojewodztwo: 'Podlaskie',
      powiat: 'Białystok',
      kodPocztowy: '15-001',
      numerAgencji: 'AG-9901',
      nazwaAgenta: 'Żubr Ubezpieczenia',
      numerOfwca: 'OFWCA-00991',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 570000,
      gwp2026Detal: 670000,
      gwp2025EduPs: 95000,
      gwp2026EduPs: 120000,
      assignedMs: 'MS Anna Nowak'
    },
    // Warmińsko-Mazurskie (Olsztyn)
    {
      oddzial: 'Oddział Olsztyn',
      regionOddzial: 'Region Północ',
      regionWojewodztwo: 'Północ',
      wojewodztwo: 'Warmińsko-Mazurskie',
      powiat: 'Olsztyn',
      kodPocztowy: '10-001',
      numerAgencji: 'AG-9902',
      nazwaAgenta: 'Kraina Jezior Asekuracja',
      numerOfwca: 'OFWCA-00992',
      ofwcaDkpRaw: 'NIE',
      pracujeDo: '',
      gwp2025Detal: 520000,
      gwp2026Detal: 600000,
      gwp2025EduPs: 85000,
      gwp2026EduPs: 105000,
      assignedMs: 'MS Jan Kowalski'
    },
    // Świętokrzyskie (Kielce)
    {
      oddzial: 'Oddział Kielce',
      regionOddzial: 'Region Centrum',
      regionWojewodztwo: 'Centrum',
      wojewodztwo: 'Świętokrzyskie',
      powiat: 'Kielce',
      kodPocztowy: '25-001',
      numerAgencji: 'AG-9903',
      nazwaAgenta: 'Scyzoryk Finanse',
      numerOfwca: 'OFWCA-00993',
      ofwcaDkpRaw: 'TAK',
      pracujeDo: '',
      gwp2025Detal: 460000,
      gwp2026Detal: 530000,
      gwp2025EduPs: 75000,
      gwp2026EduPs: 92000,
      assignedMs: 'MS Michał Kamiński'
    },

    // Anomalia / Duplikat dla testu reguł projektu
    {
      oddzial: 'Oddział Warszawa',
      regionOddzial: 'Region Centrum',
      regionWojewodztwo: 'Centrum',
      wojewodztwo: 'Mazowieckie',
      powiat: 'Warszawa',
      kodPocztowy: '00-020',
      numerAgencji: 'AG-1099', // Inna agencja, ale ta sama osoba OFWCA-00101
      nazwaAgenta: 'Capital City Multiagencja',
      numerOfwca: 'OFWCA-00101', // Duplikat OFWCA!
      ofwcaDkpRaw: 'NIE',
      pracujeDo: '',
      gwp2025Detal: 210000,
      gwp2026Detal: 250000,
      gwp2025EduPs: 35000,
      gwp2026EduPs: 45000,
      assignedMs: 'MS Piotr Wiśniewski'
    },

    // Anomalia: Brak GWP
    {
      oddzial: 'Oddział Lublin',
      regionOddzial: 'Region Centrum',
      regionWojewodztwo: 'Wschód',
      wojewodztwo: 'Lubelskie',
      powiat: 'Chełm',
      kodPocztowy: '22-100',
      numerAgencji: 'AG-9802',
      nazwaAgenta: 'Nowy Agent Startowy',
      numerOfwca: 'OFWCA-00982',
      ofwcaDkpRaw: 'NIE',
      pracujeDo: '',
      gwp2025Detal: 0,
      gwp2026Detal: 0,
      gwp2025EduPs: 0,
      gwp2026EduPs: 0,
      assignedMs: 'MS Michał Kamiński'
    }
  ];

  // Convert to full OFWCARecord array
  const msMap = new Map<string, CoordinatorMS>();
  DEFAULT_MS_LIST.forEach(ms => msMap.set(ms.name, ms));

  // Count occurrences of OFWCA IDs to flag duplicates
  const ofwcaCountMap = new Map<string, number>();
  rawList.forEach(r => {
    ofwcaCountMap.set(r.numerOfwca, (ofwcaCountMap.get(r.numerOfwca) || 0) + 1);
  });

  const records: OFWCARecord[] = rawList.map((item, idx) => {
    const isDkp = (item.ofwcaDkpRaw || '').toUpperCase().trim() === 'TAK';
    const isTerminated = Boolean(item.pracujeDo && item.pracujeDo.trim().length > 0);
    const hasLocationIssue = !item.powiat || !item.kodPocztowy || item.powiat.trim() === '';
    const hasGwpIssue = (item.gwp2025Detal + item.gwp2026Detal + item.gwp2025EduPs + item.gwp2026EduPs) === 0;
    const isDuplicate = (ofwcaCountMap.get(item.numerOfwca) || 0) > 1;

    const warnings: string[] = [];
    if (isTerminated) warnings.push(`Pracuje do: ${item.pracujeDo} (zakończony)`);
    if (hasLocationIssue) warnings.push('Brak pełnej lokalizacji (powiat lub kod pocztowy)');
    if (hasGwpIssue) warnings.push('Brakujące lub zerowe wartości GWP');
    if (isDuplicate) warnings.push('Wielokrotny rekord OFWCA w różnych agencjach');

    const coordinator = msMap.get(item.assignedMs);
    const rmsName = coordinator ? coordinator.rms : 'RMS Nieprzypisany';

    return {
      id: `rec_${idx + 1}_${item.numerOfwca}`,
      numerOfwca: item.numerOfwca,
      nazwaAgenta: item.nazwaAgenta,
      numerAgencji: item.numerAgencji,
      oddzial: item.oddzial,
      regionOddzial: item.regionOddzial,
      regionWojewodztwo: item.regionWojewodztwo,
      wojewodztwo: item.wojewodztwo,
      powiat: item.powiat,
      kodPocztowy: item.kodPocztowy,
      ofwcaDkpRaw: item.ofwcaDkpRaw,
      isDkp,
      pracujeDo: item.pracujeDo,
      isActive: !isTerminated,
      gwp2025Detal: item.gwp2025Detal,
      gwp2026Detal: item.gwp2026Detal,
      gwp2025EduPs: item.gwp2025EduPs,
      gwp2026EduPs: item.gwp2026EduPs,
      gwp2025Total: item.gwp2025Detal + item.gwp2025EduPs,
      gwp2026Total: item.gwp2026Detal + item.gwp2026EduPs,
      initialMs: item.assignedMs,
      currentMs: item.assignedMs,
      initialRms: rmsName,
      currentRms: rmsName,
      hasLocationIssue,
      hasGwpIssue,
      isDuplicate,
      isTerminated,
      warnings
    };
  });

  return {
    records,
    msList: DEFAULT_MS_LIST,
    rmsList: DEFAULT_RMS_LIST
  };
}

/**
 * Creates and downloads a sample .xlsx template containing 'baza', 'MS_lista', and 'RMS_lista'
 */
export function exportSampleWorkbook(records: OFWCARecord[], msList: CoordinatorMS[], rmsList: CoordinatorRMS[]) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: baza
  const bazaRows = records.map(r => ({
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
    'Pracuje do': r.pracujeDo || '',
    'GWP 2025 detal': r.gwp2025Detal,
    'GWP 2026 detal': r.gwp2026Detal,
    'GWP 2025 EDU PS': r.gwp2025EduPs,
    'GWP 2026 EDU PS': r.gwp2026EduPs,
  }));
  const wsBaza = XLSX.utils.json_to_sheet(bazaRows);
  XLSX.utils.book_append_sheet(wb, wsBaza, 'baza');

  // Sheet 2: MS_lista
  const msRows = records.map(r => ({
    'Numer OFWCA': r.numerOfwca,
    'MS': r.currentMs,
    'nazwa agenta': r.nazwaAgenta
  }));
  // Deduplicate by Numer OFWCA for MS_lista
  const seenOfwca = new Set<string>();
  const uniqueMsRows = msRows.filter(row => {
    if (seenOfwca.has(row['Numer OFWCA'])) return false;
    seenOfwca.add(row['Numer OFWCA']);
    return true;
  });
  const wsMs = XLSX.utils.json_to_sheet(uniqueMsRows);
  XLSX.utils.book_append_sheet(wb, wsMs, 'MS_lista');

  // Sheet 3: RMS_lista
  const rmsRows = msList.map(ms => ({
    'MS': ms.name,
    'RMS': ms.rms,
    'Region': ms.region || ''
  }));
  const wsRms = XLSX.utils.json_to_sheet(rmsRows);
  XLSX.utils.book_append_sheet(wb, wsRms, 'RMS_lista');

  // Trigger browser download
  XLSX.writeFile(wb, 'ODL_Struktura_Sprzedazy_Szablon.xlsx');
}

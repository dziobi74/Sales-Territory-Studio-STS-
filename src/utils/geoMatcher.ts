import { OFWCARecord } from '../types';
import { normalizeVoivodeshipName, POLAND_VOIVODESHIPS, VoivodeshipGeo, PowiatGeoInfo } from '../data/polandGeo';

/**
 * Normalizes any geographical text (removing Polish accents, "powiat", "m.st.", punctuation)
 * e.g. "m. st. Warszawa" -> "warszawa"
 * e.g. "powiat poznański" -> "poznanski"
 * e.g. "Wrocław" -> "wroclaw"
 */
export function normalizeGeoText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents (ą -> a, ś -> s, ó -> o, etc.)
    .replace(/powiat/gi, '')
    .replace(/m\.\s*st\./gi, '')
    .replace(/m\.st\./gi, '')
    .replace(/m\./gi, '')
    .replace(/miasto/gi, '')
    .replace(/wojewodztwo/gi, '')
    .replace(/woj\./gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Matches an OFWCA record to a Voivodeship reliably.
 */
export function matchRecordToVoivodeship(record: OFWCARecord, voivodeships: VoivodeshipGeo[]): VoivodeshipGeo | undefined {
  const normWoj = normalizeVoivodeshipName(record.wojewodztwo).toLowerCase();
  
  // Direct name match
  let found = voivodeships.find(v => v.name.toLowerCase() === normWoj);
  if (found) return found;

  const cleanRecWoj = normalizeGeoText(record.wojewodztwo);
  if (!cleanRecWoj) return undefined;

  // Try slug / id / code match
  found = voivodeships.find(v => {
    const cleanVName = normalizeGeoText(v.name);
    const cleanVId = normalizeGeoText(v.id);
    return cleanRecWoj.includes(cleanVName) || 
           cleanVName.includes(cleanRecWoj) || 
           cleanRecWoj.includes(cleanVId) ||
           cleanVId.includes(cleanRecWoj) ||
           v.code.toLowerCase() === cleanRecWoj;
  });

  return found;
}

/**
 * Matches an OFWCA record to a specific Powiat within a voivodeship or globally.
 */
export function matchRecordToPowiat(record: OFWCARecord, powiaty: PowiatGeoInfo[]): PowiatGeoInfo | undefined {
  const cleanRecPowiat = normalizeGeoText(record.powiat);
  const cleanRecRegion = normalizeGeoText(record.regionOddzial || record.oddzial);
  if (!cleanRecPowiat && !cleanRecRegion) return undefined;

  // 1. Exact or normalized match
  for (const p of powiaty) {
    const cleanPName = normalizeGeoText(p.name);
    const cleanPCapital = normalizeGeoText(p.capital);

    if (cleanRecPowiat && (cleanRecPowiat === cleanPName || cleanRecPowiat === cleanPCapital)) {
      return p;
    }
  }

  // 2. Substring matching
  for (const p of powiaty) {
    const cleanPName = normalizeGeoText(p.name);
    const cleanPCapital = normalizeGeoText(p.capital);

    if (cleanRecPowiat) {
      if (cleanRecPowiat.includes(cleanPName) || cleanPName.includes(cleanRecPowiat)) {
        return p;
      }
      if (cleanPCapital && (cleanRecPowiat.includes(cleanPCapital) || cleanPCapital.includes(cleanRecPowiat))) {
        return p;
      }
    }

    // Try fallback against oddział or region if powiat is empty or generic
    if (cleanRecRegion && (cleanRecRegion.includes(cleanPCapital) || cleanPCapital.includes(cleanRecRegion))) {
      return p;
    }
  }

  // 3. TERYT code prefix match if powiat name has numbers
  const terytMatch = record.powiat.match(/\d{4}/);
  if (terytMatch) {
    const code = terytMatch[0];
    const foundByTeryt = powiaty.find(p => p.terytCode === code);
    if (foundByTeryt) return foundByTeryt;
  }

  return undefined;
}

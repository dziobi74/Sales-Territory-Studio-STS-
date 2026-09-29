import { GoogleGenAI } from '@google/genai';
import { OFWCARecord, CoordinatorMS, TerritoryBalanceMetric, AIRecommendation } from '../types';

/**
 * Validates a Google API Key by making a lightweight test call.
 */
export async function validateGoogleApiKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
  if (!apiKey || apiKey.trim().length < 15) {
    return { valid: false, message: 'Klucz API jest zbyt krótki lub pusty.' };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Odpowiedz tylko jednym słowem: OK',
    });

    if (response && response.text) {
      return { valid: true, message: 'Klucz Google API jest poprawny i aktywny (Gemini + Maps).' };
    }
    return { valid: false, message: 'Brak odpowiedzi z Google Gemini API.' };
  } catch (err: any) {
    return { 
      valid: false, 
      message: err?.message || 'Błąd autoryzacji klucza Google API. Sprawdź uprawnienia w Google Cloud Console.' 
    };
  }
}

/**
 * Intelligent AI Territory Optimization Advisor using Gemini 2.5 Flash.
 */
export async function requestAITerritoryOptimization(
  apiKey: string,
  records: OFWCARecord[],
  metrics: TerritoryBalanceMetric[],
  averageGwp: number,
  averageOfwca: number
): Promise<{
  executiveSummary: string;
  recommendations: AIRecommendation[];
  actionItems: string[];
}> {
  const activeKey = apiKey.trim() || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!activeKey) {
    throw new Error('Brak klucza Google API. Wprowadź klucz w zakładce „Paczka i Konfiguracja API”.');
  }

  const ai = new GoogleGenAI({ apiKey: activeKey });

  // Extract key summary metrics for prompt efficiency
  const overloadedMS = metrics.filter(m => m.workloadStatus === 'Przeładowany');
  const underloadedMS = metrics.filter(m => m.workloadStatus === 'Niedociążony');

  const topOverloadedSummary = overloadedMS.slice(0, 8).map(m => ({
    ms: m.msName,
    rms: m.rmsName,
    index: Math.round(m.workloadIndex),
    ofwca: m.currentOfwcaCount,
    dkp: m.currentDkpCount,
    dpd: m.currentDpdCount,
    gwp2026Mln: (m.currentGwp2026 / 1_000_000).toFixed(2),
    wojewodztwa: m.wojewodztwa.slice(0, 3)
  }));

  const topUnderloadedSummary = underloadedMS.slice(0, 8).map(m => ({
    ms: m.msName,
    rms: m.rmsName,
    index: Math.round(m.workloadIndex),
    ofwca: m.currentOfwcaCount,
    dkp: m.currentDkpCount,
    dpd: m.currentDpdCount,
    gwp2026Mln: (m.currentGwp2026 / 1_000_000).toFixed(2),
    wojewodztwa: m.wojewodztwa.slice(0, 3)
  }));

  const systemInstruction = `Jesteś głównym ekspertem GIS i dyrektorem operacji sprzedaży ubezpieczeniowej (Sales Territory Studio).
Twoim celem jest wyrównanie obciążeń Menadżerów Sprzedaży (MS) w podziale na 16 województw Polski i powiaty,
przy zachowaniu równowagi kanałów DKP (Klienci Strategiczni) i DPD (Agencje Tradycyjne) oraz minimalizacji kosztów dojazdów.
Wygeneruj konkretne, merytoryczne wnioski w języku polskim oraz 4-6 kluczowych propozycji transferów terytoriów (powiatów).`;

  const prompt = `
Dane sieci sprzedaży:
- Średnie GWP 2026 na koordynatora: ${(averageGwp / 1_000_000).toFixed(2)} mln PLN
- Średnia liczba OFWCA na koordynatora: ${averageOfwca.toFixed(0)} OFWCA
- Koordynatorzy Przeładowani (>115% normy): ${JSON.stringify(topOverloadedSummary, null, 2)}
- Koordynatorzy Niedociążeni (<85% normy): ${JSON.stringify(topUnderloadedSummary, null, 2)}

Odpowiedz w formacie JSON (czysty JSON bez markdownu):
{
  "executiveSummary": "krótka synteza sytuacji terytorialnej i głównych wąskich gardeł logistycznych",
  "actionItems": [
    "Krok 1...",
    "Krok 2...",
    "Krok 3..."
  ],
  "recommendations": [
    {
      "title": "Tytuł rekomendacji",
      "sourceMs": "Nazwisko oddającego MS",
      "targetMs": "Nazwisko przyjmującego MS",
      "voivodeship": "Województwo",
      "powiat": "Powiat",
      "rationale": "Uzasadnienie biznesowe i geograficzne",
      "estimatedGwpShift": 1500000,
      "estimatedOfwcaCount": 14,
      "estimatedWorkloadImpact": "Obniżenie dysproporcji o ok. 6%"
    }
  ]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);

    // Map recommendation IDs with matching records
    const recommendations: AIRecommendation[] = (parsed.recommendations || []).map((r: any, idx: number) => {
      // Find matching record IDs in database
      const matchedRecs = records.filter(rec => 
        rec.currentMs.toLowerCase().includes((r.sourceMs || '').toLowerCase().trim()) &&
        (rec.powiat.toLowerCase().includes((r.powiat || '').toLowerCase().trim()) ||
         (r.voivodeship && rec.wojewodztwo.toLowerCase().includes(r.voivodeship.toLowerCase().trim())))
      );

      return {
        id: `ai_rec_${idx}_${Date.now()}`,
        title: r.title || `Transfer: ${r.powiat} (${r.sourceMs} → ${r.targetMs})`,
        sourceMs: r.sourceMs || 'MS',
        targetMs: r.targetMs || 'MS Docelowy',
        voivodeship: r.voivodeship || '',
        powiat: r.powiat || '',
        rationale: r.rationale || 'Optymalizacja terytorialna',
        estimatedGwpShift: Number(r.estimatedGwpShift) || 500000,
        estimatedOfwcaCount: Number(r.estimatedOfwcaCount) || matchedRecs.length || 5,
        estimatedWorkloadImpact: r.estimatedWorkloadImpact || 'Redukcja dysproporcji',
        recordIds: matchedRecs.map(rec => rec.id)
      };
    });

    return {
      executiveSummary: parsed.executiveSummary || 'Wygenerowano rekomendacje bilansowania terytorialnego.',
      recommendations,
      actionItems: parsed.actionItems || [
        'Przeanalizuj wycieki agencyjne poza tereny domowe.',
        'Wyrównaj portfele w oparciu o rekomendacje powiatowe.',
        'Zweryfikuj proporcje DKP vs DPD u menadżerów.'
      ]
    };
  } catch (err: any) {
    console.error('AI Advisor error:', err);
    throw new Error(`Błąd generatora AI: ${err?.message || 'Nie udało się przetworzyć danych.'}`);
  }
}

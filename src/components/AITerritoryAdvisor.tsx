import React, { useState } from 'react';
import { 
  OFWCARecord, 
  CoordinatorMS, 
  TerritoryBalanceMetric, 
  AIRecommendation 
} from '../types';
import { requestAITerritoryOptimization, validateGoogleApiKey } from '../utils/aiAdvisor';
import { 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  TrendingUp, 
  Compass, 
  Key, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

interface AITerritoryAdvisorProps {
  apiKey: string;
  onSaveApiKey?: (newKey: string) => void;
  records: OFWCARecord[];
  metrics: TerritoryBalanceMetric[];
  averageGwp: number;
  averageOfwca: number;
  onApplyRecommendation: (recordIds: string[], targetMs: string, reason: string) => void;
  onOpenSettings: () => void;
}

export const AITerritoryAdvisor: React.FC<AITerritoryAdvisorProps> = ({
  apiKey,
  onSaveApiKey,
  records,
  metrics,
  averageGwp,
  averageOfwca,
  onApplyRecommendation,
  onOpenSettings,
}) => {
  const [inlineKey, setInlineKey] = useState(apiKey);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [executiveSummary, setExecutiveSummary] = useState<string | null>(null);
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [appliedRecIds, setAppliedRecIds] = useState<Set<string>>(new Set());
  const [copiedMemo, setCopiedMemo] = useState(false);

  const handleRunAnalysis = async () => {
    if (!apiKey) {
      onOpenSettings();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await requestAITerritoryOptimization(
        apiKey,
        records,
        metrics,
        averageGwp,
        averageOfwca
      );

      setExecutiveSummary(result.executiveSummary);
      setActionItems(result.actionItems);
      setRecommendations(result.recommendations);
    } catch (err: any) {
      setErrorMessage(err.message || 'Wystąpił błąd podczas analizy AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (rec: AIRecommendation) => {
    if (rec.recordIds.length === 0) {
      // Find matching records on the fly if needed
      const matchingRecs = records.filter(r => 
        r.currentMs.toLowerCase().includes(rec.sourceMs.toLowerCase()) &&
        (r.powiat.toLowerCase().includes(rec.powiat.toLowerCase()) || 
         r.wojewodztwo.toLowerCase().includes(rec.voivodeship.toLowerCase()))
      );
      if (matchingRecs.length > 0) {
        onApplyRecommendation(matchingRecs.map(r => r.id), rec.targetMs, rec.rationale);
      }
    } else {
      onApplyRecommendation(rec.recordIds, rec.targetMs, rec.rationale);
    }

    setAppliedRecIds(prev => new Set(prev).add(rec.id));
  };

  const handleCopyMemo = () => {
    if (!executiveSummary) return;
    const text = `RAPORT OPTYMALIZACJI TERYTORIALNEJ (STS v1.0 AI)\n\n${executiveSummary}\n\nRekomendowane kroki:\n${actionItems.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2000);
  };

  const formatPLN = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)} mln zł`;
    return `${(val / 1_000).toFixed(0)} tys. zł`;
  };

  return (
    <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 p-6 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                Doradca Terytorialny AI (Google Gemini 2.5 Flash)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                AI Studio Engine
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Automatyczna analiza wąskich gardeł, dysproporcji portfeli MS i wycieków logistycznych z powiatów z uwzględnieniem podziału na DKP i DPD.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!apiKey && (
            <div className="flex items-center gap-1.5">
              <input
                type="password"
                placeholder="Wklej Google API Key..."
                value={inlineKey}
                onChange={e => setInlineKey(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono w-48 focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (inlineKey.trim() && onSaveApiKey) {
                    onSaveApiKey(inlineKey.trim());
                  }
                }}
                disabled={!inlineKey.trim()}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer"
              >
                Zapisz
              </button>
            </div>
          )}

          <button
            onClick={handleRunAnalysis}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analizowanie sieci sprzedaży...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generuj plan optymalizacji AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={onOpenSettings}
            className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold text-[11px] cursor-pointer"
          >
            Zmień klucz API
          </button>
        </div>
      )}

      {/* Results View */}
      {executiveSummary && (
        <div className="space-y-6 pt-2">
          {/* Executive Memo Card */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                Synteza Operacyjna i Wnioski Strategiczne
              </span>
              <button
                onClick={handleCopyMemo}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs cursor-pointer font-medium"
              >
                {copiedMemo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMemo ? 'Skopiowano' : 'Kopiuj notatkę'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {executiveSummary}
            </p>

            {actionItems.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                  Zalecana sekwencja działań w terenie:
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {actionItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                        {i + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Concrete Recommendations Cards */}
          <div>
            <div className="text-xs font-bold text-white mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Rekomendowane Przeniesienia Powiatów i Sieci OFWCA ({recommendations.length}):</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map(rec => {
                const isApplied = appliedRecIds.has(rec.id);
                return (
                  <div
                    key={rec.id}
                    className={`p-4 rounded-xl border transition space-y-3 ${
                      isApplied
                        ? 'bg-emerald-950/20 border-emerald-500/40 opacity-75'
                        : 'bg-slate-950/70 border-slate-800 hover:border-indigo-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs">
                        {rec.title}
                      </h4>
                      {isApplied && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Zastosowano</span>
                        </span>
                      )}
                    </div>

                    {/* Source -> Target flow */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400">Oddający (MS):</div>
                        <strong className="text-rose-300">{rec.sourceMs}</strong>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                      <div>
                        <div className="text-[10px] text-slate-400">Przyjmujący (MS):</div>
                        <strong className="text-emerald-300">{rec.targetMs}</strong>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {rec.rationale}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                      <span>Województwo: <strong className="text-white">{rec.voivodeship}</strong></span>
                      <span>Powiat: <strong className="text-white">{rec.powiat}</strong></span>
                      <span className="text-cyan-300 font-semibold">{rec.estimatedWorkloadImpact}</span>
                    </div>

                    <button
                      onClick={() => handleApply(rec)}
                      disabled={isApplied}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        isApplied
                          ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isApplied ? 'Transfer wykonany' : 'Zastosuj rekomendację AI'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

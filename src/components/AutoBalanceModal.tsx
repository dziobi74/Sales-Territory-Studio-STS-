import React, { useState } from 'react';
import { BalanceProposal } from '../utils/balancer';
import { Sparkles, X, Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface AutoBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposals: BalanceProposal[];
  onApplyProposals: (proposalsToApply: BalanceProposal[]) => void;
}

export const AutoBalanceModal: React.FC<AutoBalanceModalProps> = ({
  isOpen,
  onClose,
  proposals,
  onApplyProposals,
}) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>(
    proposals.map((_, idx) => idx)
  );

  if (!isOpen) return null;

  const toggleProposal = (index: number) => {
    setSelectedIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleApply = () => {
    const toApply = proposals.filter((_, idx) => selectedIndices.includes(idx));
    onApplyProposals(toApply);
    onClose();
  };

  const formatPLN = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)} mln zł`;
    return `${(val / 1_000).toFixed(0)} tys. zł`;
  };

  const totalGwpProposed = proposals
    .filter((_, idx) => selectedIndices.includes(idx))
    .reduce((s, p) => s + p.gwp2026, 0);

  const totalOfwcaProposed = proposals
    .filter((_, idx) => selectedIndices.includes(idx))
    .reduce((s, p) => s + p.ofwcaCount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col max-h-[90vh] text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Asystent Wyrównania Obciążenia (ODL Auto-Balancer)
              </h2>
              <p className="text-xs text-slate-400">
                Inteligentna propozycja transferów powiatów od koordynatorów przeciążonych do niedociążonych.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {proposals.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <div className="font-bold text-white text-sm">Struktura jest już optymalnie zbalansowana!</div>
              <p className="mt-1 text-xs text-slate-500">
                Żaden koordynator nie przekracza dopuszczalnego progu odchylenia obciążenia (±15%).
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="text-slate-300">
                  Wybrano <strong className="text-indigo-400">{selectedIndices.length}</strong> z {proposals.length} propozycji
                  (Suma GWP: <strong className="text-emerald-400">{formatPLN(totalGwpProposed)}</strong>, OFWCA: {totalOfwcaProposed})
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedIndices(proposals.map((_, i) => i))}
                    className="text-indigo-400 hover:underline cursor-pointer"
                  >
                    Zaznacz wszystkie
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => setSelectedIndices([])}
                    className="text-slate-400 hover:underline cursor-pointer"
                  >
                    Odznacz
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {proposals.map((prop, idx) => {
                  const isChecked = selectedIndices.includes(idx);

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleProposal(idx)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-4 ${
                        isChecked
                          ? 'bg-indigo-950/30 border-indigo-500/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-1 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 font-bold text-white">
                            <span>Powiat {prop.powiat}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              (woj. {prop.wojewodztwo})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                            <span className="text-rose-400 font-semibold">{prop.sourceMs}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-emerald-400 font-semibold">{prop.targetMs}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {prop.reason}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold text-emerald-400 text-sm">
                          {formatPLN(prop.gwp2026)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {prop.ofwcaCount} OFWCA
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            Anuluj
          </button>
          <button
            onClick={handleApply}
            disabled={selectedIndices.length === 0}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Zastosuj wybrane optymalizacje ({selectedIndices.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

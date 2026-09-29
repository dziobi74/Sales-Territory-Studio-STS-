import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Monitor, CheckCircle, Info, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Aplikacja PC aktywna</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          if (isInstallable) {
            install();
          } else {
            setShowGuide(true);
          }
        }}
        title="Zainstaluj aplikację lokalnie na pulpicie PC (działa offline)"
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition-all border border-blue-400/30 active:scale-95 cursor-pointer"
      >
        <Monitor className="w-3.5 h-3.5" />
        <Download className="w-3 h-3" />
        <span>Zainstaluj na PC</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Instalacja aplikacji lokalnie na PC</h3>
                <p className="text-xs text-slate-400">ODL Sales Territory Studio jako natywna aplikacja</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold shrink-0">1</span>
                <div>
                  <strong className="text-white">W przeglądarce Chrome / Edge:</strong> Kliknij ikonkę <span className="font-semibold text-blue-400">Instaluj aplikację</span> w prawym rogu paska adresu URL (lub menu ⋮ &gt; &quot;Zainstaluj ODL Studio&quot;).
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold shrink-0">2</span>
                <div>
                  <strong className="text-white">Skrót na pulpicie:</strong> Aplikacja uruchomi się w osobnym oknie bez pasków przeglądarki i zyska skrót na pulpicie PC.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold shrink-0">3</span>
                <div>
                  <strong className="text-white">100% Prywatności i Offline:</strong> Wszystkie dane z plików Excel są przetwarzane wyłącznie lokalnie w pamięci Twojego komputera.
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition cursor-pointer"
              >
                Rozumiem
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

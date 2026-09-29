import React, { useState } from 'react';
import { 
  BookOpen, 
  FileSpreadsheet, 
  Scale, 
  Map, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  HelpCircle, 
  Terminal, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Database,
  Compass,
  Cpu
} from 'lucide-react';

export const DocumentationTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('intro');

  const sections = [
    { id: 'intro', title: '1. O aplikacji STS v1.0', icon: BookOpen },
    { id: 'excel_structure', title: '2. Struktura Danych Excel', icon: FileSpreadsheet },
    { id: 'business_rules', title: '3. Reguły Biznesowe i DKP/DPD', icon: ShieldCheck },
    { id: 'balancing_algo', title: '4. Algorytm Wyrównywania Obciążenia', icon: Scale },
    { id: 'territory_rules', title: '5. Obszary: Teren vs Poza Terenem', icon: Compass },
    { id: 'map_guide', title: '6. Mapa i Podział Administracyjny', icon: Map },
    { id: 'offline_pwa', title: '7. Instalacja Lokalna PC (PWA & Offline)', icon: Cpu },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Dokumentacja Techniczno-Biznesowa • Sales Territory Studio (STS v1.0)
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Kompletny podręcznik użytkownika, specyfikacja struktur danych wejściowych z pliku Excel, zasady klasyfikacji OFWCA (DKP vs DPD), matematyczne wskaźniki bilansowania portfeli koordynatorów (MS / RMS) oraz algorytmy delimitacji terytorialnej bazujące na wzorcach Open Door Logistics Studio.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Wersja dokumentu: STS-PL-1.0.4
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2 sticky top-20">
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-xl space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
              Spis Treści Podręcznika
            </div>
            {sections.map(sec => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{sec.title}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition ${isActive ? 'translate-x-0.5 text-white' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Quick Info Box */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 text-xs space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Gwarancja Prywatności</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Aplikacja działa w 100% lokalnie w przeglądarce PC. Żadne dane sprzedażowe, numery agencji czy dane osobowe OFWCA nie opuszczają Twojego komputera.
            </p>
          </div>
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-9 space-y-6">
          {/* SECTION 1: Intro */}
          {activeSection === 'intro' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">1. O aplikacji Sales Territory Studio (STS v1.0)</h3>
                <p className="text-xs text-slate-400 mt-1">Geneza, koncepcja i przeznaczenie systemu terytorialnego</p>
              </div>

              <div className="text-xs text-slate-300 space-y-4 leading-relaxed">
                <p>
                  <strong>Sales Territory Studio (STS v1.0)</strong> to zaawansowana aplikacja internetowa (PWA) przeznaczona do instalacji lokalnej na komputerze osobistym bez konieczności konfiguracji zewnętrznych serwerów czy baz danych SQL. Powstała z inspiracji projektem <strong>Open Door Logistics Studio (ODL Studio)</strong> – wiodącym systemem GIS open-source do modelowania terytoriów handlowych, podziału rejonów oraz balansowania obciążeń zespołów w terenie.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-blue-400 font-bold mb-1 flex items-center gap-1.5">
                      <Scale className="w-4 h-4" /> Balansowanie Sił
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Wyrównywanie wartości przypisu składki (GWP) oraz liczby aktywnych OFWCA pomiędzy Menadżerami Sprzedaży (MS).
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-purple-400 font-bold mb-1 flex items-center gap-1.5">
                      <Layers className="w-4 h-4" /> Segmentacja DKP / DPD
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Równoległe śledzenie i modelowanie struktur DKP (Departament Klientów Strategicznych) oraz DPD (Departament Sprzedaży Agencyjnej).
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                      <Compass className="w-4 h-4" /> Spójność Geograficzna
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Eliminowanie anomalii, gdzie koordynator obsługuje pojedynczych agentów z odległych województw („Z terenu” vs „Z poza”).
                    </p>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white pt-2">Hierarchia Organizacyjna</h4>
                <p>
                  Aplikacja odzwierciedla naturalną hierarchię sieci ubezpieczeniowej:
                </p>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-indigo-300 flex flex-wrap items-center gap-2">
                  <span>Oddział</span>
                  <span className="text-slate-600">→</span>
                  <span>Region_oddział (RMS)</span>
                  <span className="text-slate-600">→</span>
                  <span>Region_województwo</span>
                  <span className="text-slate-600">→</span>
                  <span>Województwo</span>
                  <span className="text-slate-600">→</span>
                  <span>Powiat</span>
                  <span className="text-slate-600">→</span>
                  <span>Agencja</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-emerald-400 font-bold">OFWCA</span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Excel structure */}
          {activeSection === 'excel_structure' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">2. Struktura Danych Wejściowych (Plik Excel .xlsx)</h3>
                <p className="text-xs text-slate-400 mt-1">Wymagane i opcjonalne arkusze oraz nazwy kolumn</p>
              </div>

              <div className="text-xs text-slate-300 space-y-4">
                <p>
                  System jest <strong>odporny na braki danych</strong> (tolerant parser). Jeśli plik nie zawiera pewnych kolumn lub wartości są puste, aplikacja nie zawiesza się, lecz podstawia bezpieczne wartości domyślne i rejestruje uwagi w module Kontroli Jakości.
                </p>

                <h4 className="text-sm font-bold text-white mt-4">Arkusz Główny: <code className="text-blue-400 bg-slate-950 px-2 py-0.5 rounded">baza</code></h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Kolumna w Excel</th>
                        <th className="py-2.5 px-3">Typ danych</th>
                        <th className="py-2.5 px-3">Wymagana?</th>
                        <th className="py-2.5 px-3">Opis i znaczenie biznesowe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-[11px]">
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-white">Oddział</td>
                        <td className="py-2 px-3 text-slate-400">Tekst</td>
                        <td className="py-2 px-3 text-amber-400">Opcjonalna</td>
                        <td className="py-2 px-3">Centrala lub oddział regionalny spółki (np. Centrala Warszawa).</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-white">Region_oddział</td>
                        <td className="py-2 px-3 text-slate-400">Tekst</td>
                        <td className="py-2 px-3 text-emerald-400 font-semibold">Zalecana</td>
                        <td className="py-2 px-3">Region dyrektora RMS (np. Region Północny, Region Mazowsze).</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-white">Region_województwo</td>
                        <td className="py-2 px-3 text-slate-400">Tekst</td>
                        <td className="py-2 px-3 text-slate-400">Opcjonalna</td>
                        <td className="py-2 px-3">Makroregion łączący województwa.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-white">województwo</td>
                        <td className="py-2 px-3 text-slate-400">Tekst</td>
                        <td className="py-2 px-3 text-emerald-400 font-semibold">Kluczowa</td>
                        <td className="py-2 px-3">Jedno z 16 polskich województw. Parsowane z automatyczną normalizacją literówek.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-white">Powiat</td>
                        <td className="py-2 px-3 text-slate-400">Tekst</td>
                        <td className="py-2 px-3 text-emerald-400 font-semibold">Kluczowa</td>
                        <td className="py-2 px-3">Jednostka podziału administracyjnego. Używana do hurtowego przenoszenia terytoriów.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-white">Numer Agencji</td>
                        <td className="py-2 px-3 text-slate-400">Tekst / Liczba</td>
                        <td className="py-2 px-3 text-emerald-400 font-semibold">Kluczowa</td>
                        <td className="py-2 px-3">Unikalny identyfikator agenta / multiagencji w TU.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-white">nazwa agenta</td>
                        <td className="py-2 px-3 text-slate-400">Tekst</td>
                        <td className="py-2 px-3 text-slate-400">Opcjonalna</td>
                        <td className="py-2 px-3">Nazwa podmiotu agencyjnego.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-white">Numer OFWCA</td>
                        <td className="py-2 px-3 text-slate-400">Tekst / Liczba</td>
                        <td className="py-2 px-3 text-emerald-400 font-semibold">Kluczowa</td>
                        <td className="py-2 px-3">Numer licencji KNF / OFWCA (Osoba Fizyczna Wykonująca Czynności Agencyjne).</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-white">OFWCA_DKP</td>
                        <td className="py-2 px-3 text-slate-400">Tekst</td>
                        <td className="py-2 px-3 text-emerald-400 font-semibold">Kluczowa</td>
                        <td className="py-2 px-3">
                          Wartość <span className="text-violet-400 font-bold">TAK</span> kwalifikuje rekord jako <strong>DKP</strong>. Wszystkie inne wartości lub puste pole oznaczają <strong>DPD</strong>.
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-white">Kod pocztowy</td>
                        <td className="py-2 px-3 text-slate-400">Tekst</td>
                        <td className="py-2 px-3 text-slate-400">Opcjonalna</td>
                        <td className="py-2 px-3">Kod pocztowy siedziby (format np. 00-001). Sprawdzany w module kontroli jakości.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-white">Pracuje do</td>
                        <td className="py-2 px-3 text-slate-400">Data / Tekst</td>
                        <td className="py-2 px-3 text-slate-400">Opcjonalna</td>
                        <td className="py-2 px-3">
                          Jeśli pole <strong>nie jest puste</strong>, rekord jest oznaczany jako <em>zakończony / nieaktywny</em> i nie obciąża wskaźnika siły sprzedażowej.
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-white">GWP 2025 detal / GWP 2026 detal</td>
                        <td className="py-2 px-3 text-slate-400">Liczba (PLN)</td>
                        <td className="py-2 px-3 text-emerald-400 font-semibold">Kluczowa</td>
                        <td className="py-2 px-3">Przypis składki brutto w segmencie detalicznym za dany rok.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-mono font-bold text-white">GWP 2025 EDU PS / GWP 2026 EDU PS</td>
                        <td className="py-2 px-3 text-slate-400">Liczba (PLN)</td>
                        <td className="py-2 px-3 text-emerald-400 font-semibold">Kluczowa</td>
                        <td className="py-2 px-3">Przypis składki brutto z ubezpieczeń szkolnych i programów specjalnych.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <h5 className="font-bold text-white text-xs mb-1">Arkusz pomocniczy: <code className="text-cyan-400">MS_lista</code></h5>
                    <p className="text-[11px] text-slate-400 mb-2">
                      Służy do precyzyjnego mapowania zwierzchnika: <strong>Numer OFWCA → MS (Zwierzchnik)</strong>. Może także definiować kolory i regiony MS.
                    </p>
                    <div className="text-[10px] font-mono text-slate-500">Kolumny: Numer OFWCA, MS_Nazwisko, Region_MS, Kolor_HEX</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <h5 className="font-bold text-white text-xs mb-1">Arkusz pomocniczy: <code className="text-cyan-400">RMS_lista</code></h5>
                    <p className="text-[11px] text-slate-400 mb-2">
                      Zawiera wykaz Dyrektorów Regionalnych (RMS), ich regiony oraz podległych Menadżerów Sprzedaży (MS).
                    </p>
                    <div className="text-[10px] font-mono text-slate-500">Kolumny: RMS_Nazwisko, Region, Kod_Regionu</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Business rules */}
          {activeSection === 'business_rules' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">3. Reguły Biznesowe, Klasyfikacja DKP/DPD oraz Audyt</h3>
                <p className="text-xs text-slate-400 mt-1">Zasady logiki biznesowej zaimplementowane w silniku STS</p>
              </div>

              <div className="text-xs text-slate-300 space-y-4 leading-relaxed">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                    Zasada Klasyfikacji Struktury: DKP vs DPD
                  </h4>
                  <p>
                    W branży ubezpieczeniowej kanał sprzedaży dzieli się na dwa odrębne piony o innej specyfice portfela:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                    <li><strong className="text-violet-300">DKP (Departament Klientów Strategicznych)</strong>: kwalifikowany gdy <code className="bg-slate-900 px-1 text-white">OFWCA_DKP = "TAK"</code> (bez względu na wielkość liter i białe znaki). Cechuje się zazwyczaj wyższym średnim przypisem na rekord.</li>
                    <li><strong className="text-sky-300">DPD (Departament Sprzedaży Agencyjnej / Tradycyjnej)</strong>: każda inna wartość (np. "NIE", puste pole, kreska). Cechuje się szerszą siecią agentów terenowych.</li>
                  </ul>
                  <p className="text-slate-400 text-[11px] pt-1">
                    System STS v1.0 przelicza wskaźniki DKP i DPD na każdym poziomie: dla pojedynczego MS, dla dyrektora RMS, dla poszczególnych województw i powiatów.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    Reguła pola „Pracuje do” (Zakończone umowy i aktywność)
                  </h4>
                  <p>
                    Jeśli pole <code className="bg-slate-900 px-1 text-white">Pracuje do</code> zawiera jakąkolwiek datę lub wpis tekstowy:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                    <li>Rekord otrzymuje status <strong className="text-rose-300">Nieaktywny / Zakończony</strong>.</li>
                    <li>Liczony jest w łącznej liczbie OFWCA, lecz wykluczany z <em>Aktywnych OFWCA</em> wpływających na obciążenie operacyjne koordynatora.</li>
                    <li>Pojawia się w module <strong>Kontroli i Audytu Danych</strong> w dedykowanej sekcji do weryfikacji przez administratora.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    Agregacja sumarycznego GWP
                  </h4>
                  <p>
                    Dla każdego rekordu automatycznie sumowane są składki:
                  </p>
                  <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-amber-300">
                    GWP 2025 Total = GWP 2025 Detal + GWP 2025 EDU PS<br />
                    GWP 2026 Total = GWP 2026 Detal + GWP 2026 EDU PS
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Balancing Algo */}
          {activeSection === 'balancing_algo' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">4. Algorytm Wyrównywania Sił Sprzedażowych i Obciążenia</h3>
                <p className="text-xs text-slate-400 mt-1">Matematyka bilansowania portfeli koordynatorów (MS / RMS)</p>
              </div>

              <div className="text-xs text-slate-300 space-y-4 leading-relaxed">
                <p>
                  Głównym celem systemu jest eliminacja zjawiska tzw. <em>„Koordynatorów Przeładowanych”</em> (mających np. 150 agentów i 30 mln zł składki) oraz <em>„Niedociążonych”</em> (mających 20 agentów i 4 mln zł).
                </p>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider text-blue-400">
                    Wzór Wskaźnika Obciążenia (Workload Index)
                  </h4>
                  <div className="p-3 bg-slate-900 rounded-xl font-mono text-[12px] text-emerald-300 leading-relaxed border border-slate-800">
                    WorkloadIndex = 50% * (GWP_2026_MS / Średnia_GWP) + 50% * (Aktywni_OFWCA_MS / Średnia_OFWCA) * 100%
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Dzięki zrównoważeniu 50/50 model uwzględnia zarówno wartość finansową (GWP), jak i wysiłek operacyjny związany z obsługą i szkoleniem ludzi (liczba OFWCA).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <div className="text-rose-400 font-bold mb-1">Przeładowany (&gt; 115%)</div>
                    <p className="text-[11px] text-slate-400">
                      Wskaźnik przekracza 115% średniej. Koordynator wymaga odciążenia poprzez przeniesienie części powiatów lub agencji.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-emerald-400 font-bold mb-1">Optymalny (85% - 115%)</div>
                    <p className="text-[11px] text-slate-400">
                      Portfel zrównoważony. Siły sprzedażowe i obciążenie operacyjne w granicach zdrowej normy rynkowej.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="text-amber-400 font-bold mb-1">Niedociążony (&lt; 85%)</div>
                    <p className="text-[11px] text-slate-400">
                      Koordynator posiada wolne moce przerobowe i może przejąć dodatkowe tereny lub OFWCA od kolegów z sąsiedztwa.
                    </p>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white pt-2">Odchylenie Standardowe (Std Dev) i Miernik Sukcesu Modelu</h4>
                <p>
                  Sukces reorganizacji mierzony jest <strong>spadkiem odchylenia standardowego</strong> (dysproporcji) pomiędzy koordynatorami:
                </p>
                <div className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-slate-300 border border-slate-800">
                  Redukcja Dysproporcji % = [(StdDev_Przed - StdDev_Po) / StdDev_Przed] * 100%
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: Territory Home vs Out */}
          {activeSection === 'territory_rules' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">5. Analiza Terytorialna: „Z terenu” vs „Z poza terenu” z podziałem DKP/DPD</h3>
                <p className="text-xs text-slate-400 mt-1">Zarządzanie terytorialnością koordynatorów i spójnością rejonów</p>
              </div>

              <div className="text-xs text-slate-300 space-y-4 leading-relaxed">
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                  <h4 className="font-bold text-white text-xs mb-2">Definicja Terytorium Domowego („Z terenu”)</h4>
                  <p className="text-slate-300">
                    Dla każdego Koordynatora (MS) system wyznacza jego <strong>Terytorium Domowe</strong> – województwo, w którym posiada największą koncentrację podległych OFWCA i agencji (bądź województwo zadeklarowane w arkuszu MS_lista).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="font-bold text-emerald-400 text-xs mb-1">OFWCA „Z terenu” (Home Territory)</div>
                    <p className="text-[11px] text-slate-400">
                      Sprzedawcy i agencje zlokalizowani w głównym województwie przypisanym do danego MS. Oznacza efektywny koszt logistyczny dojazdów na spotkania i szkolenia.
                    </p>
                    <div className="mt-2 text-[10px] text-slate-500 font-mono">
                      Wskaźnik: DKP z terenu / DPD z terenu
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="font-bold text-amber-400 text-xs mb-1">OFWCA „Z poza terenu” (Out-of-Territory)</div>
                    <p className="text-[11px] text-slate-400">
                      Sprzedawcy przypisani do danego MS, którzy fizycznie znajdują się w innym województwie (np. koordynator z Poznania obsługujący agenta z Rzeszowa).
                    </p>
                    <div className="mt-2 text-[10px] text-slate-500 font-mono">
                      Wskaźnik: DKP z poza / DPD z poza
                    </div>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white pt-2">Jak interpretować wyniki w STS v1.0?</h4>
                <p>
                  W zakładce <strong>„Bilans i Wyrównanie”</strong> przełącz na widok <em>„Analiza Terytoriów Wojewódzkich”</em>. Zobaczysz:
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-2">
                  <li>Listę koordynatorów aktywnych w danym województwie.</li>
                  <li>Liczbę OFWCA lokalnych (w tym rozbicie na DKP i DPD).</li>
                  <li>Liczbę OFWCA „z zewnątrz” (w tym rozbicie na DKP i DPD).</li>
                  <li><strong>Wskaźnik Zwartości Terytorialnej (Compactness Index %)</strong>: procentowy udział sprzedaży lokalnej. Wartości powyżej 80% oznaczają wzorcową spójność rejonu handlowego.</li>
                </ul>
              </div>
            </div>
          )}

          {/* SECTION 6: Map & Admin Division */}
          {activeSection === 'map_guide' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">6. Interaktywna Mapa Polski z Podziałem Administracyjnym</h3>
                <p className="text-xs text-slate-400 mt-1">Obsługa mapy wektorowej, filtrowanie i hurtowe przenoszenie</p>
              </div>

              <div className="text-xs text-slate-300 space-y-4 leading-relaxed">
                <p>
                  Aplikacja oferuje dwa silniki kartograficzne: wbudowaną <strong>Wektorową Mapę ODL (SVG)</strong> o wiernych obrysach geograficznych oraz interaktywne <strong>Google Maps GIS</strong> z warstwami satelitarnymi.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <h5 className="font-bold text-white text-xs mb-1">Wektorowa Mapa ODL (100% Offline)</h5>
                    <p className="text-slate-400 text-[11px] mb-2">
                      Autentyczny, wierny obrys 16 województw Polski i 380 powiatów TERYT. Nie wymaga połączenia z internetem ani żadnych kluczy API.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                      <li><strong>Wg Koordynatora (MS)</strong>: barwa dominującego MS.</li>
                      <li><strong>Wg Dyrektora (RMS)</strong>: podział na makroregiony RMS.</li>
                      <li><strong>Wg GWP 2026</strong>: mapa ciepła (choropleth) składki.</li>
                      <li><strong>Liczba OFWCA</strong>: zagęszczenie sieci sprzedaży.</li>
                      <li><strong>Udział DKP %</strong>: nasycenie kanałem DKP vs DPD.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <h5 className="font-bold text-white text-xs mb-1">Google Maps GIS i Klucz API</h5>
                    <p className="text-slate-400 text-[11px] mb-2">
                      Warstwy satelitarne, hybrydowe i terenowe z bezpośrednim wprowadzaniem własnego klucza w aplikacji:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                      <li>Wpisz klucz bezpośrednio w pasku nad mapą – zapisze się w pamięci lokalnej PC.</li>
                      <li>Wymaga aktywacji usługi <em>„Maps JavaScript API”</em> w Google Cloud Console.</li>
                      <li>Jeśli wystąpi błąd <code>ApiNotActivatedMapError</code>, aplikacja automatycznie wyświetla instrukcję naprawy i pozwala natychmiast wrócić do mapy wektorowej ODL.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: Offline & PWA */}
          {activeSection === 'offline_pwa' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">7. Instalacja Lokalna na Komputerze PC (PWA & Offline)</h3>
                <p className="text-xs text-slate-400 mt-1">Jak uruchomić STS v1.0 jako niezależną aplikację desktopową</p>
              </div>

              <div className="text-xs text-slate-300 space-y-4 leading-relaxed">
                <p>
                  <strong>Sales Territory Studio</strong> zostało zaprojektowane w standardzie <em>Progressive Web App (PWA)</em>. Oznacza to, że możesz zainstalować aplikację bezpośrednio na swoim komputerze z systemem Windows, macOS lub Linux:
                </p>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-white text-xs">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[11px]">1</span>
                    Krok 1: Przycisk w nagłówku
                  </div>
                  <p className="text-[11px] text-slate-400 pl-7">
                    W prawym górnym rogu ekranu kliknij przycisk <strong>„Zainstaluj na PC”</strong>. Jeśli korzystasz z przeglądarki Chrome lub Edge, pojawi się okno dialogowe z pytaniem o instalację STS v1.0.
                  </p>

                  <div className="flex items-center gap-2 font-bold text-white text-xs pt-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[11px]">2</span>
                    Krok 2: Skrót na pulpicie i w Menu Start
                  </div>
                  <p className="text-[11px] text-slate-400 pl-7">
                    Po kliknięciu „Zainstaluj”, system operacyjny utworzy ikonę programu STS na Twoim pulpicie oraz w menu Start/Aplikacje. Program otworzy się w osobnym, dedykowanym oknie pozbawionym pasków przeglądarki.
                  </p>

                  <div className="flex items-center gap-2 font-bold text-white text-xs pt-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[11px]">3</span>
                    Krok 3: Praca bez połączenia z Internetem (100% Offline)
                  </div>
                  <p className="text-[11px] text-slate-400 pl-7">
                    Aplikacja korzysta z lokalnego Service Workera i pamięci LocalStorage komputera. Nawet po odłączeniu kabla sieciowego lub w podróży służbowej bez zasięgu, wszystkie funkcje modelowania, wczytywania i generowania plików Excel działają nieprzerwanie.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

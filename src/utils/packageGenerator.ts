import JSZip from 'jszip';
import { OFWCARecord, CoordinatorMS, CoordinatorRMS, ModelingHistoryStep } from '../types';

export async function generatePcInstallationZip(
  records: OFWCARecord[],
  msList: CoordinatorMS[],
  rmsList: CoordinatorRMS[],
  history: ModelingHistoryStep[],
  appUrl: string = window.location.href
): Promise<Blob> {
  const zip = new JSZip();

  // 1. Data Backup JSON
  const dataBackup = {
    appName: 'Sales Territory Studio (STS v1.0)',
    exportedAt: new Date().toISOString(),
    version: '1.0.4',
    summary: {
      recordsCount: records.length,
      msCount: msList.length,
      rmsCount: rmsList.length,
      historyStepsCount: history.length,
    },
    records,
    msList,
    rmsList,
    history,
  };
  zip.file('dane_poczatkowe_baza_sts.json', JSON.stringify(dataBackup, null, 2));

  // 2. Windows 1-Click Desktop Launcher (.bat)
  const batchScript = `@echo off
chcp 65001 >nul
title Sales Territory Studio (STS v1.0) - Uruchamianie
cls
echo =====================================================================
echo    SALES TERRITORY STUDIO (STS v1.0) - PAKIET INSTALACYJNY PC
echo =====================================================================
echo.
echo [1/2] Sprawdzanie srodowiska Windows...
echo [2/2] Uruchamianie aplikacji w dedykowanym oknie Desktop (PWA)...
echo.

set APP_URL=${appUrl}

REM Sprawdz Microsoft Edge (domyslnie obecny w kazdym Windows 10 i 11)
if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%APP_URL%"
    echo Uruchomiono pomyslnie w Microsoft Edge (Tryb aplikacji PC).
    exit /b 0
)
if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" (
    start "" "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" --app="%APP_URL%"
    echo Uruchomiono pomyslnie w Microsoft Edge (Tryb aplikacji PC).
    exit /b 0
)

REM Sprawdz Google Chrome
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app="%APP_URL%"
    echo Uruchomiono pomyslnie w Google Chrome (Tryb aplikacji PC).
    exit /b 0
)
if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" (
    start "" "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" --app="%APP_URL%"
    echo Uruchomiono pomyslnie w Google Chrome (Tryb aplikacji PC).
    exit /b 0
)

REM Domyslna przegladarka jako fallback
start "" "%APP_URL%"
echo Aplikacja zostala otwarta w Twojej domyslnej przegladarce.
exit /b 0
`;
  zip.file('URUCHOM_STS_NA_PC.bat', batchScript);

  // 3. VBS script to create Desktop Shortcut on Windows
  const vbsScript = `' Skrypt tworzacy skrot na pulpicie Windows do Sales Territory Studio
Set WshShell = CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")
Set oLink = WshShell.CreateShortcut(strDesktop & "\\Sales Territory Studio (STS).lnk")

' Sprawdz sciezke do Edge lub Chrome
Set fso = CreateObject("Scripting.FileSystemObject")
strEdge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
If Not fso.FileExists(strEdge) Then
    strEdge = "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
End If

If fso.FileExists(strEdge) Then
    oLink.TargetPath = strEdge
    oLink.Arguments = "--app=${appUrl}"
Else
    oLink.TargetPath = "${appUrl}"
End If

oLink.WindowStyle = 1
oLink.Description = "Sales Territory Studio (STS v1.0) - Modelowanie Struktur i Terytoriow"
oLink.Save

WScript.Echo "Skrot 'Sales Territory Studio (STS)' zostal utworzony na Twoim Pulpicie!"
`;
  zip.file('UTWORZ_SKROT_NA_PULPICIE.vbs', vbsScript);

  // 4. Detailed Polish Instruction manual
  const instructionTxt = `=====================================================================
  SALES TERRITORY STUDIO (STS v1.0) - INSTRUKCJA INSTALACJI NA PC
=====================================================================

Dziekujemy za pobranie pakietu instalacyjnego Sales Territory Studio!
Aplikacja dziala w nowoczesnym standardzie PWA (Progressive Web App)
oraz lokalnej bazy danych IndexedDB w pamieci Twojego komputera.

---------------------------------------------------------------------
SPOSOB 1: Szybkie uruchomienie z tego katalogu (ZALECANE)
---------------------------------------------------------------------
1. Rozpakuj caly plik ZIP w dowolnym folderze na dysku (np. C:\\STS).
2. Kliknij dwukrotnie plik:
   -> URUCHOM_STS_NA_PC.bat
3. Program otworzy sie w dedykowanym, eleganckim oknie bez paskow przegladarki
   (dziala dokladnie jak natywny program Windows .exe).
4. Opcjonalnie: kliknij dwukrotnie plik "UTWORZ_SKROT_NA_PULPICIE.vbs", 
   aby natychmiast dodac ikone STS na swoj Pulpit Windows!

---------------------------------------------------------------------
SPOSOB 2: Trwala instalacja w systemie Windows (Natywna PWA)
---------------------------------------------------------------------
1. Otworz aplikacje w przegladarce Google Chrome lub Microsoft Edge:
   ${appUrl}
2. W prawym gornym rogu paska adresu URL kliknij ikonke:
   - W Google Chrome: ikonka monitora ze strzalka w dol ("Zainstaluj aplikacje STS")
   - W Microsoft Edge: ikonka trzech okienek z plusem ("Dostepna aplikacja")
   LUB kliknij przycisk "Zainstaluj na PC" w gornym pasku aplikacji STS.
3. Kliknij "Zainstaluj".
4. Program pojawi sie na Twoim Pulpicie oraz w Menu Start systemu Windows.

---------------------------------------------------------------------
PRACA OFFLINE (BEZ INTERNETU)
---------------------------------------------------------------------
- Po pierwszym otwarciu wbudowany Service Worker zapisuje powloke programu w pamieci podrecznej.
- Baza danych modeli, koordynatorow (MS/RMS) oraz agentow (OFWCA) jest
  przechowywana w lokalnej bazie IndexedDB na Twoim dysku PC.
- Wbudowana Wektorowa Mapa ODL (16 wojewodztw, 380 powiatow) dziala
  w 100% lokalnie i nie wymaga polaczenia z internetem ani kluczy API.
- W pakiecie znajduje sie plik "dane_poczatkowe_baza_sts.json" zawierajacy
  kopie zapasowa biezacego stanu modelowania, ktora mozesz w kazdej chwili
  wczytac przez przycisk "Wczytaj Paczke (.json)" w oknie bazy.

Wsparcie i dokumentacja: zakladka "Dokumentacja" w menu glownym aplikacji STS.
`;
  zip.file('INSTRUKCJA_INSTALACJI_PC.txt', instructionTxt);

  // Generate and return Blob
  const blob = await zip.generateAsync({ type: 'blob' });
  return blob;
}

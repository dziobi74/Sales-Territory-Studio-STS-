export interface PowiatGeoInfo {
  terytCode: string;
  name: string;
  type: 'powiat ziemski' | 'miasto na prawach powiatu';
  capital: string;
  gridX?: number; // relative coordinate for county grid map
  gridY?: number;
}

export interface VoivodeshipGeo {
  id: string; // lowercased standard key (e.g. 'mazowieckie')
  name: string; // full display name (e.g. 'Mazowieckie')
  code: string; // e.g. 'MZ', 'WP'
  teryt: string; // TERYT woj: 14 for Mazowieckie, 02 for Dolnośląskie etc.
  capital: string;
  path: string; // SVG path normalized for 800x700 viewBox
  labelX: number;
  labelY: number;
  powiatyExamples: string[];
  administrativePowiaty: PowiatGeoInfo[];
  powiaty?: PowiatGeoInfo[];
}

// 16 Voivodeships of Poland with administrative county divisions
export const POLAND_VOIVODESHIPS: VoivodeshipGeo[] = [
  {
    id: 'pomorskie',
    name: 'Pomorskie',
    code: 'PM',
    teryt: '22',
    capital: 'Gdańsk',
    labelX: 407,
    labelY: 120,
    path: 'M524.8 99.1l0.4-1.6-2.4 0.3-8.8-1.1-2.4 2.8-0.7 5.8 2.2 6.5 2 3.6 1.1 4.3-1.2 3.1-1.5 2.8-4.4 4.4-1.6 2.4 0.3 3.3 1.8 7.3 3.4 5.5 4.8 2.9 5.1 0.6 2.6 3.6-2 6.6 3.6 1.8 9.8-0.8 5 1.3-0.4 2.8 0 2.8-1.2 2.2-1.8 1.9-1.6 4.8-1.2 1.9-0.2 2.7-5.6 2.5-8-0.6-4.2 2.7-3.5 3.8-14.7 27.5-5.4 2.4-11.4 0.7-5.4-2.2-3.1-2-6.5-6.8-1.7-1-1.3-1.6-2-1.2-8.1-1.1-5.7 2.1-3.7 2.4-8.5-5.1-17.9-3-3.3-3.1-2.9-3.7-3.5-0.4-16.9 2.6-12.7-2.5-2.7 2.1-4 7.5-6.9 2.5-3.2 3-0.5 2.2-0.4 2.4-0.1 3.6-6.2 2.5-13.8-3.7-3.7 0.4-2.7 3.9-2.5 5.3-3 10.5-2.8 1.7-4.4-5.3-5.3-2.9-20.3-0.8-5.8-3.6-4.1-7.3-4.8-5.9-1.8-18.3 4.2-4.2 3-5.3-1.2-3.6-1.7-2.8-2-1-0.1-3.3 5-2.4 5.5 0.8-1.9-4.1-2.3-3.3-2.8-2.5-3.7-7.6-2.4-2.9-4.3-3.1 0-9.3-0.8-9.4-6.3-19.3 13.9-3.4 1.6-2.5-0.4-4.2-1.9-2.7-1.1-2.4 0.7-3.1 2.7-2.7 1-4.6-0.7-8.2-3.1-6.3-8.2-11.9-7.1-14.4 7.4-2.9 4.2-0.8 3.8-1.3 9.5-10.5 30.1-14.2 37.7-7.1 16.9-5.8 26.6-2.5 16.4 0 2.2 0.8 3.6 3.2 1.4 0.7 2 0.5 34.1 20.4 6.2 8.1 1 1.9 1 2.7 0.1 2.3-1.8 0.8-1.5-3-1.8-1.3-1.2-3.3-1.7-2.1-4.7-8-0.9-0.5-3.5-0.7-0.9-0.4-1-1.6-2.8-1-5.9-4.1-5.9-2.8-0.9-1.3-3.3-2.5-0.8-0.4-1.2 0.5-0.7 0.9-1.4 4.9-0.2 1.2 0 2.5 0.6 0.6 2.4 1.1 1.7 2.8 1.4 3.1-0.4 2.5 0 1.1 1.2 1.3-0.6 3.3 1.1 1.5 1.9-0.4 1.7-2.2-0.6 2.9 0.8 2.3 1.2 1.9 2.6 7.8 0.7 1.7-0.4 3.9 0.1 6.8 0.7 6.4 1.4 2.9 1.5 0.5 3.1 2.3 1.5 0.6 1.4 0.1 1.6 0.5 1.5 1 0.6 1.5 1.6 2.3 16.8 5.5 3.7 0.2 3.2-1.7 0.8 0.9 1.2 0.6 2.7 0.9 37.4-5.6 8.2-4 3.9-1 3.2-1.4 6.1-6.4 1.7-0.8 1.1 0.9-17.7 13.7-4.3 2.2-4.2 1.2-8.7 0.8-4.1 1.6 0 1 2.3 3.1 1.1 0.6-1.1 1-0.3 2.4 2.5 1.5 8.8 1.1 2.4-0.3 0 1.3-0.4 0.3z',
    powiatyExamples: ['gdański', 'Gdańsk', 'Gdynia', 'Sopot', 'kartuski', 'wejherowski', 'tczewski', 'starogardzki', 'słupski', 'chojnicki', 'kwidzyński', 'malborski'],
    administrativePowiaty: [
      { terytCode: '2261', name: 'Gdańsk', type: 'miasto na prawach powiatu', capital: 'Gdańsk' },
      { terytCode: '2262', name: 'Gdynia', type: 'miasto na prawach powiatu', capital: 'Gdynia' },
      { terytCode: '2264', name: 'Sopot', type: 'miasto na prawach powiatu', capital: 'Sopot' },
      { terytCode: '2263', name: 'Słupsk', type: 'miasto na prawach powiatu', capital: 'Słupsk' },
      { terytCode: '2204', name: 'gdański', type: 'powiat ziemski', capital: 'Pruszcz Gdański' },
      { terytCode: '2215', name: 'wejherowski', type: 'powiat ziemski', capital: 'Wejherowo' },
      { terytCode: '2205', name: 'kartuski', type: 'powiat ziemski', capital: 'Kartuzy' },
      { terytCode: '2214', name: 'tczewski', type: 'powiat ziemski', capital: 'Tczew' },
      { terytCode: '2213', name: 'starogardzki', type: 'powiat ziemski', capital: 'Starogard Gdański' },
      { terytCode: '2211', name: 'pucki', type: 'powiat ziemski', capital: 'Puck' },
      { terytCode: '2212', name: 'słupski', type: 'powiat ziemski', capital: 'Słupsk' },
      { terytCode: '2202', name: 'chojnicki', type: 'powiat ziemski', capital: 'Chojnice' },
      { terytCode: '2207', name: 'kwidzyński', type: 'powiat ziemski', capital: 'Kwidzyn' },
      { terytCode: '2209', name: 'malborski', type: 'powiat ziemski', capital: 'Malbork' },
      { terytCode: '2201', name: 'bytowski', type: 'powiat ziemski', capital: 'Bytów' },
      { terytCode: '2203', name: 'człuchowski', type: 'powiat ziemski', capital: 'Człuchów' },
      { terytCode: '2206', name: 'kościerski', type: 'powiat ziemski', capital: 'Kościerzyna' },
      { terytCode: '2208', name: 'lęborski', type: 'powiat ziemski', capital: 'Lębork' },
      { terytCode: '2210', name: 'nowodworski', type: 'powiat ziemski', capital: 'Nowy Dwór Gdański' },
      { terytCode: '2216', name: 'sztumski', type: 'powiat ziemski', capital: 'Sztum' }
    ]
  },
  {
    id: 'zachodniopomorskie',
    name: 'Zachodniopomorskie',
    code: 'ZP',
    teryt: '32',
    capital: 'Szczecin',
    labelX: 147,
    labelY: 212,
    path: 'M282.3 214.1l-3.8-1.2-3.8 0.1-3.5 1.6-2.6 4.6-2 5.5-2.5 10.7-3 0.5-18.3-0.4-2.3 3.2 0.1 6.6 1.6 6 6.2 6.1 7.5 1.9 3.7 1.9 3.1 4 0.7 4.8-3.1 3.8-2.3 4.2-2.9 2.7-7.4 2.3-14.4 8.5-8 12.7-9.7 9.1-6.1 2.4-6.2 0.8-6.1-3.6-5.5-1.9 1.8-7.8-2.6-8.2-5-1.1-5.4 0.8-5.2 4.1-9 11.5-5 3.7-20.5-0.1-16.9 5.8-5.7 0.3 2 2.7 2.7 0.5-3.7 7.2-6.2 7.1-5.2 0.8-16.6-5.5-9.7 5.4-6.4 13.9-7.8 11-5 2.1-8.5 1.4-2.1 3.3-2.5 8.8-5.8-6.6-5.9-2.3-2.9-4-1.9-0.9-1-1-3.4-6.7-1.6-1.8-10.6-7.9-2.7-1.4-3.2-3.9-2-0.9-2.2-0.1-2.1-0.7-1.8-1.4-1.1-2.3 2.6-2.3 1.1-2 0.4-3.1-0.2-2.1-1.3-5.8-0.6-1.7 0-1 4.9-3.6 6-3.2 5.9-4.7 3.1-3.2 1.3-3 0.3-1.4 3-9.4-0.2-2.4-0.6-2.4-0.4-2.7 0.3-2.2 0.7-2 1-1.5 1-0.6 0.8-1 2.5-5.2-1.3-1.2-0.3-0.9-1.6-1.3-0.6-1.1-0.3-1.6-0.2-4.4-2.8-12.9-1-8.7-2.1-3.5-1-3.5-2.4-3.8-0.8-3.4 0-3.7 0.2-6.2-0.2-1.6-2-6.6-1.5-3.3 0.4-2.6-0.2-4.7 1-0.1 1.8-0.8 1.3-1.2 0.2-1.4-1.8-1.2 1-0.6 0-1.2-1-0.5 0.6-1.3 0.9 0.9 2.7 1.6 1.1 3.3 1.4 1.1 2.8 1.3 2 2.1 1.1 0.9 4.3 0.8 5.4 1.9 1.8 1.5 1.6 2.2 3.2 6.3 1.2 1.5 0.5-0.5 0.1-2.7 0.5-1.6 0.8-1 1.4-1.1 0-2.3-1.1-0.3-2.5-0.2-1.2-0.6-3.1-7.5 0.7-3.7 2.4-7.3 1.2 1 2-1 1.6 0-0.7-4.3 0.4-3.4 0.6-3 0.4-3.2-0.7 0-0.3 2-0.7 1.4-2.4 2.4-1 0.3-1.1-1.5 2.1-2.3-1.4-2.8-2.4-1.4-11-1.1-1.6-1.8 1.3-3.3-0.6-1.1-1 1.7-0.8 0.2-2-0.8-0.9 0.4-2.2 3 3 0.6 1.6 0.7 0.9 1.1-0.2 2.1-1.1 1.5-1.2 0.5-0.9-0.6-2.8 1.7-2.7 0.6 0 1.1 1.3 0.6-1.3 0.6-1-0.1-1.6-0.9-1.1-0.2-1.7-1.1-4.8-6.9-2.5-1.1-0.8-2.6-1.8-2.2 1.8-0.8 1.7-4.6 1.6 0.8 1.1 0.9 3.1 1.1 9.8 0.9 4-0.9 3.8-2 7.2-5.3 26.3-11.8 22.8-6 27.7-11.7 17.9-4.8 19.7-5.3 19.3-8.8 16-2 11.1-3.7-1.3 1.2-4.9 2.3 2.1 1.5 8.8-1.5-0.7-1.1 0-1.3 4.8 0-0.7-1.1 0.2-2.8-2.3-0.1-5.4 1.7 3.4-1.7 4.1-2.7 6.2-7.3-1.2 2.6-2.3 2.3 0.1 1 1.8-0.4 1.6-0.7 1.3-1.6 3.5-1.7 1.3-1.5-1.2-2.5-1.9 0-2.4 2.5 4.2-7.3 11.6-14.9 0 1.1-0.6 1.6 1 0.5 1.7-0.6 1.2-1.5 0.7-2.3-0.6-0.7-1.3 0.5-1.5 1.4 2-4.1 3.5-3.5 6.8-4.2 20.8-3.1 0.7-0.3 7.1 14.4 8.2 11.9 3.1 6.3 0.7 8.2-1 4.6-2.7 2.7-0.7 3.1 1.1 2.4 1.9 2.7 0.4 4.2-1.6 2.5-13.9 3.4 6.3 19.3 0.8 9.4 0 9.3 4.3 3.1 2.4 2.9 3.7 7.6 2.8 2.5 2.3 3.3 1.9 4.1-5.5-0.8-5 2.4 0.1 3.3 2 1 1.7 2.8 1.2 3.6-3 5.3-4.2 4.2 1.8 18.3z',
    powiatyExamples: ['Szczecin', 'Koszalin', 'kołobrzeski', 'stargardzki', 'goleniowski', 'gryfiński', 'policki', 'świnoujski', 'wałecki', 'myśliborski'],
    administrativePowiaty: [
      { terytCode: '3262', name: 'Szczecin', type: 'miasto na prawach powiatu', capital: 'Szczecin' },
      { terytCode: '3261', name: 'Koszalin', type: 'miasto na prawach powiatu', capital: 'Koszalin' },
      { terytCode: '3263', name: 'Świnoujście', type: 'miasto na prawach powiatu', capital: 'Świnoujście' },
      { terytCode: '3208', name: 'kołobrzeski', type: 'powiat ziemski', capital: 'Kołobrzeg' },
      { terytCode: '3214', name: 'stargardzki', type: 'powiat ziemski', capital: 'Stargard' },
      { terytCode: '3204', name: 'goleniowski', type: 'powiat ziemski', capital: 'Goleniów' },
      { terytCode: '3206', name: 'gryfiński', type: 'powiat ziemski', capital: 'Gryfino' },
      { terytCode: '3211', name: 'policki', type: 'powiat ziemski', capital: 'Police' },
      { terytCode: '3217', name: 'wałecki', type: 'powiat ziemski', capital: 'Wałcz' },
      { terytCode: '3210', name: 'myśliborski', type: 'powiat ziemski', capital: 'Myślibórz' },
      { terytCode: '3215', name: 'szczecinecki', type: 'powiat ziemski', capital: 'Szczecinek' },
      { terytCode: '3201', name: 'białogardzki', type: 'powiat ziemski', capital: 'Białogard' },
      { terytCode: '3202', name: 'choszczeński', type: 'powiat ziemski', capital: 'Choszczno' },
      { terytCode: '3203', name: 'drawski', type: 'powiat ziemski', capital: 'Drawsko Pomorskie' },
      { terytCode: '3205', name: 'gryficki', type: 'powiat ziemski', capital: 'Gryfice' },
      { terytCode: '3207', name: 'kamieński', type: 'powiat ziemski', capital: 'Kamień Pomorski' },
      { terytCode: '3212', name: 'pyrzycki', type: 'powiat ziemski', capital: 'Pyrzyce' },
      { terytCode: '3213', name: 'sławieński', type: 'powiat ziemski', capital: 'Sławno' },
      { terytCode: '3216', name: 'świdwiński', type: 'powiat ziemski', capital: 'Świdwin' },
      { terytCode: '3218', name: 'łobeski', type: 'powiat ziemski', capital: 'Łobez' }
    ]
  },
  {
    id: 'warminsko-mazurskie',
    name: 'Warmińsko-Mazurskie',
    code: 'WN',
    teryt: '28',
    capital: 'Olsztyn',
    labelX: 683,
    labelY: 184,
    path: 'M866.3 77.7l0.3 1.3-2.5 8.3-5.7 6-6.6 4.5-22.2 3.1-9.4 13.3 10.1 13.5 0.5 5.1 1.1 4.7 5 5 10.6 14.8-0.4 7.9-4 7.8-3.5 9.8-5.7 6.1-27.8 17.3-9.6 10.9-17.2 11.9-7.5 1.1-3.1 1.3-2.9 2.4-6.3 2.2-14.2-0.9-7.3 3.2-12 1-2.5 1.3-2.8 5.6-4.1 2.9-4.5 0.7-8.9-0.8-7.5 9-9 2.9-9.5 0-7.3 4.2-6.3 1.3-7.2-0.1-3.6 2.9-3.3 4-13.9 8.1-3.7 1-3.8-0.4-3.1 2.5-1.6 5.6-2.6 3-3 1.5-7.5 1.4-31.5-4.9-0.9-1-0.6-1.5-1.6-1.1-1.7-0.3-3.9 1.2-2.6 5.1-2.9 2.4-3.4 0.9-1.5-15.2-5.1-13-5.6-3.9-11.4-3-10.6-6.5-7.6-2.5-1.9-0.1-2.4-1-1.5-2.2-3-5.8-2.5-7.1-8.6-16.9 14.7-27.5 3.5-3.8 4.2-2.7 8 0.6 5.6-2.5 0.2-2.7 1.2-1.9 1.6-4.8 1.8-1.9 1.2-2.2 0-2.8 0.4-2.8-5-1.3-9.8 0.8-3.6-1.8 2-6.6-2.6-3.6-5.1-0.6-4.8-2.9-3.4-5.5-1.8-7.3-0.3-3.3 1.6-2.4 4.4-4.4 1.5-2.8 1.2-3.1-1.1-4.3-2-3.6-2.2-6.5 0.7-5.8 2.4-2.8 8.8 1.1 2.4-0.3-0.4 1.6-0.9 1.3-0.4 0.8-0.4 2.1 0 2.5 1.4-1.6 1.7-4.4 0.4-0.5 0.8-1 2.5-4.1 2.6-2.5 2-1 0.6-0.2 7.7-4.9 1.7-0.7 3.9-0.5 6.4-4.8 1.4-0.5 1.4-0.2 0.6-0.6 0.4-0.8 0.8-2.2 1-1 0.8-0.6-0.1-0.9-0.4-2.1 1.5-0.1 59.2 3.1 57.5 3.1 35.6 1.9 43.2 2.3 55.4 3 42 2.2 6.8-2.3 1.9-1.5 2.5-4.7z',
    powiatyExamples: ['Olsztyn', 'Elbląg', 'olsztyński', 'ostródzki', 'iławski', 'ełcki', 'giżycki', 'szczycieński', 'kętrzyński', 'mrągowski'],
    administrativePowiaty: [
      { terytCode: '2862', name: 'Olsztyn', type: 'miasto na prawach powiatu', capital: 'Olsztyn' },
      { terytCode: '2861', name: 'Elbląg', type: 'miasto na prawach powiatu', capital: 'Elbląg' },
      { terytCode: '2814', name: 'olsztyński', type: 'powiat ziemski', capital: 'Olsztyn' },
      { terytCode: '2815', name: 'ostródzki', type: 'powiat ziemski', capital: 'Ostróda' },
      { terytCode: '2807', name: 'iławski', type: 'powiat ziemski', capital: 'Iława' },
      { terytCode: '2805', name: 'ełcki', type: 'powiat ziemski', capital: 'Ełk' },
      { terytCode: '2806', name: 'giżycki', type: 'powiat ziemski', capital: 'Giżycko' },
      { terytCode: '2817', name: 'szczycieński', type: 'powiat ziemski', capital: 'Szczytno' },
      { terytCode: '2808', name: 'kętrzyński', type: 'powiat ziemski', capital: 'Kętrzyn' },
      { terytCode: '2810', name: 'mrągowski', type: 'powiat ziemski', capital: 'Mrągowo' },
      { terytCode: '2801', name: 'bartoszycki', type: 'powiat ziemski', capital: 'Bartoszyce' },
      { terytCode: '2802', name: 'braniewski', type: 'powiat ziemski', capital: 'Braniewo' },
      { terytCode: '2803', name: 'działdowski', type: 'powiat ziemski', capital: 'Działdowo' },
      { terytCode: '2804', name: 'elbląski', type: 'powiat ziemski', capital: 'Elbląg' },
      { terytCode: '2809', name: 'lidzbarski', type: 'powiat ziemski', capital: 'Lidzbark Warmiński' },
      { terytCode: '2811', name: 'nidzicki', type: 'powiat ziemski', capital: 'Nidzica' },
      { terytCode: '2812', name: 'nowomiejski', type: 'powiat ziemski', capital: 'Nowe Miasto Lubawskie' },
      { terytCode: '2813', name: 'olecki', type: 'powiat ziemski', capital: 'Olecko' },
      { terytCode: '2816', name: 'piski', type: 'powiat ziemski', capital: 'Pisz' },
      { terytCode: '2818', name: 'gołdapski', type: 'powiat ziemski', capital: 'Gołdap' },
      { terytCode: '2819', name: 'węgorzewski', type: 'powiat ziemski', capital: 'Węgorzewo' }
    ]
  },
  {
    id: 'podlaskie',
    name: 'Podlaskie',
    code: 'PD',
    teryt: '20',
    capital: 'Białystok',
    labelX: 858,
    labelY: 253,
    path: 'M902.7 429.6l-0.8 0.5-1.8 0-3.1-1.9-1.9-0.4-1.3 0.6-1.5 1-1.6 0.5-1.7-1 0.8-2.5 0.5-0.8-2.8-3.4-1.8-1.1-2.1 1.1-1-3.7-2.2-2.2-3-1-7.7 1.1-15.5-3.2-5.3 0.3-2.4-0.6-1.2-1.9-1.7 0.7-2-1.5-1.7-2.4-0.7-1.8 0.6-5.4-0.3-0.8-1.4-0.2-0.8-0.8-0.5-1.3-0.3-2.1 0.1-1.5 0.7-2.6-0.2-1.6-0.7-1-2.2-1.9-2.1-2.9-5.5-5.9 0.3-3.6-0.4-6.1-1.2-5.8-0.6-8.6-1.5-7.7-5.8 1.6-5.6 2.8-3.1-2.2-2.5-3.5 1.5-9.1-4.8-3.7-4.9 5.4-7.6 1.2-7.1-3.7-2.6-4.9-1.4-6-1.5-4.1-2.4-2.6-3.8-2.1-2.5-4.5-0.5-4.2 1.7-3-4.6-3.6-5.5-0.8-5.3-2.8-3.6-7.1-5.6-14-2.5-19.2-1.6-6.6-2.3-5.4-1.3-5.8 7.3-3.2 14.2 0.9 6.3-2.2 2.9-2.4 3.1-1.3 7.5-1.1 17.2-11.9 9.6-10.9 27.8-17.3 5.7-6.1 3.5-9.8 4-7.8 0.4-7.9-10.6-14.8-5-5-1.1-4.7-0.5-5.1-10.1-13.5 9.4-13.3 22.2-3.1 6.6-4.5 5.7-6 2.5-8.3-0.3-1.3 2.7-1.4 2.1 0.3 5.9 3.1 1.1 0.1 2.3-0.5 1 0.3 1.1 1.1 1 2.6 0.6 1.1 1.1 0.8 3.4 0.4 0.7 0.9-1 3.6 0 1.8 1.8 2.5 2.3 0 2.4-1 2-0.4 1.8 0.8 6.2 5.2 3.8 2.4 8 3 3.8 3.3 1 1.5 1.8 3.5 0.9 1.3 1.1 0.7 2.1 0.6 0.9 0.5 1.7 2.5 1.3 3.4 1.1 3.8 0.8 3.6 1.5 7.9 0 3.9-1.5 2.6-1.2 1-1 1.4-0.1 1.8 0.4 1.5 0.8 1.3 1.1 0.9 0.9 1.6-0.5 1.9 0.1 4.9 1.1 4.2 1.3 3.9 1 4.2 0.9 9 1.1 3.5 2.4 3.5 0.2 10.4 2.4 11.7 8.4 26.1 4.7 9.8 2 5.3 4 15.7 1.8 4.8 1.8 2.4 1 2.3 0.7 2.5 1.2 2.5 1.8 2 1.7 1.3 1 2-0.2 4.1-0.9 2.4-1.2 2-0.9 2.2-0.2 3.3 0.9 2.8 3 3.9 1.1 2.4 0.2 1.3-0.2 3.1 0.8 4.6-0.2 2.3-1.1 2.2-0.3 1.3 0.1 1.8 0.7 1.8 0.3 1.3 1 24.9-1.3 7.1-4 4.9-13.2 9-16.7 4.8-8.8 5.2-8.8 7.3-12.1 18.7-4 4.9-1.8 2.9-4.7 9.5 1.1 0.7z',
    powiatyExamples: ['Białystok', 'Łomża', 'Suwałki', 'białostocki', 'sokólski', 'augustowski', 'bielski', 'wysokomazowiecki', 'hajnowski'],
    administrativePowiaty: [
      { terytCode: '2061', name: 'Białystok', type: 'miasto na prawach powiatu', capital: 'Białystok' },
      { terytCode: '2062', name: 'Łomża', type: 'miasto na prawach powiatu', capital: 'Łomża' },
      { terytCode: '2063', name: 'Suwałki', type: 'miasto na prawach powiatu', capital: 'Suwałki' },
      { terytCode: '2002', name: 'białostocki', type: 'powiat ziemski', capital: 'Białystok' },
      { terytCode: '2011', name: 'sokólski', type: 'powiat ziemski', capital: 'Sokółka' },
      { terytCode: '2001', name: 'augustowski', type: 'powiat ziemski', capital: 'Augustów' },
      { terytCode: '2003', name: 'bielski', type: 'powiat ziemski', capital: 'Bielsk Podlaski' },
      { terytCode: '2012', name: 'suwalski', type: 'powiat ziemski', capital: 'Suwałki' },
      { terytCode: '2013', name: 'wysokomazowiecki', type: 'powiat ziemski', capital: 'Wysokie Mazowieckie' },
      { terytCode: '2005', name: 'hajnowski', type: 'powiat ziemski', capital: 'Hajnówka' },
      { terytCode: '2007', name: 'łomżyński', type: 'powiat ziemski', capital: 'Łomża' },
      { terytCode: '2004', name: 'grajewski', type: 'powiat ziemski', capital: 'Grajewo' },
      { terytCode: '2006', name: 'kolneński', type: 'powiat ziemski', capital: 'Kolno' },
      { terytCode: '2008', name: 'moniecki', type: 'powiat ziemski', capital: 'Mońki' },
      { terytCode: '2009', name: 'sejneński', type: 'powiat ziemski', capital: 'Sejny' },
      { terytCode: '2010', name: 'siemiatycki', type: 'powiat ziemski', capital: 'Siemiatycze' },
      { terytCode: '2014', name: 'zambrowski', type: 'powiat ziemski', capital: 'Zambrów' }
    ]
  },
  {
    id: 'kujawsko-pomorskie',
    name: 'Kujawsko-Pomorskie',
    code: 'KP',
    teryt: '04',
    capital: 'Bydgoszcz / Toruń',
    labelX: 439,
    labelY: 313,
    path: 'M499.5 219.5l8.6 16.9 2.5 7.1 3 5.8 1.5 2.2 2.4 1 1.9 0.1 7.6 2.5 10.6 6.5 11.4 3 5.6 3.9 5.1 13 1.5 15.2-4.8 3.9-5.1 2.4 0.6 3.1 0.1 3.3 0.8 4.9-0.3 3.2-0.5 3.3-1 2.8-1.9-0.3-1.8-1.3-1.9-0.8-2.2 2.1-1.8 2.8-4.2 3.5-4.8-0.6 1.5 6.7-0.5 6.1-2 2.2-0.8 3.4 1.1 3.4 1.6 3.1 2.9 7 0.1 5.4-4.3 1.2-6.7 19.5-2.6 5.4-0.6 6.3 2.1 2.1 0.4 3-7.4 12.2-0.4 2.8-0.6 2.8-2-0.1-1.9 0.3-1.2 1.9-0.9 1.8-3.8 1.2-12.3 0.2-1.7 1-0.7 1.5-1 1.2-9.5-7.2-3.5 0.5-10.4 4.4-3.6 0.3-2.7-6.2-16.5-13.5-3-3.6-3.5-1.6-1.9 0.2-1.8 0.8-1 1.8-1.5 0.9-2.4-0.8-1.9-2.8-1.2-2.6-0.8-3-1.4-1-1.9-0.5-5.8 6.8-3.4 1.5-10.1-2.6-3.2-3.1-2.9-3.6-3.4-1.4-3.7-0.2-3.5-1.9-10.2-9.3-7.5-4.1-6.9-0.4-6.4-2.2-1.1-0.6-0.8-1-0.4-2.7-0.9-2.2-3.1-2.7-1.8 1.6-4 1.4-4-0.8-2-3.2-1.5-3.9-3.6-3.4 0.6-4.3 1.7-1.2 1.8 0.1 1.6-0.6 1.2-2.3 2.1-11.6-4.9-10.8-7.5-5.7-8.1-2.9 4.5-10.4 1.4-10.3-3.1-5.9-0.9-7.1 9.1-7.7-4.8-10.8-8.4-6.6-1.2-5 7.2-9.5 2.7-6.2 2.8-1.7 3-10.5 2.5-5.3 2.7-3.9 3.7-0.4 13.8 3.7 6.2-2.5 0.1-3.6 0.4-2.4 0.5-2.2 3.2-3 6.9-2.5 4-7.5 2.7-2.1 12.7 2.5 16.9-2.6 3.5 0.4 2.9 3.7 3.3 3.1 17.9 3 8.5 5.1 3.7-2.4 5.7-2.1 8.1 1.1 2 1.2 1.3 1.6 1.7 1 6.5 6.8 3.1 2 5.4 2.2 11.4-0.7 5.4-2.4z',
    powiatyExamples: ['Bydgoszcz', 'Toruń', 'Włocławek', 'Grudziądz', 'inowrocławski', 'toruński', 'bydgoski', 'świecki', 'nakielski'],
    administrativePowiaty: [
      { terytCode: '0461', name: 'Bydgoszcz', type: 'miasto na prawach powiatu', capital: 'Bydgoszcz' },
      { terytCode: '0463', name: 'Toruń', type: 'miasto na prawach powiatu', capital: 'Toruń' },
      { terytCode: '0464', name: 'Włocławek', type: 'miasto na prawach powiatu', capital: 'Włocławek' },
      { terytCode: '0462', name: 'Grudziądz', type: 'miasto na prawach powiatu', capital: 'Grudziądz' },
      { terytCode: '0407', name: 'inowrocławski', type: 'powiat ziemski', capital: 'Inowrocław' },
      { terytCode: '0415', name: 'toruński', type: 'powiat ziemski', capital: 'Toruń' },
      { terytCode: '0403', name: 'bydgoski', type: 'powiat ziemski', capital: 'Bydgoszcz' },
      { terytCode: '0414', name: 'świecki', type: 'powiat ziemski', capital: 'Świecie' },
      { terytCode: '0410', name: 'nakielski', type: 'powiat ziemski', capital: 'Nakło nad Notecią' },
      { terytCode: '0418', name: 'włocławski', type: 'powiat ziemski', capital: 'Włocławek' },
      { terytCode: '0401', name: 'aleksandrowski', type: 'powiat ziemski', capital: 'Aleksandrów Kujawski' },
      { terytCode: '0402', name: 'brodnicki', type: 'powiat ziemski', capital: 'Brodnica' },
      { terytCode: '0404', name: 'chełmiński', type: 'powiat ziemski', capital: 'Chełmno' },
      { terytCode: '0405', name: 'golubsko-dobrzyński', type: 'powiat ziemski', capital: 'Golub-Dobrzyń' },
      { terytCode: '0406', name: 'grudziądzki', type: 'powiat ziemski', capital: 'Grudziądz' },
      { terytCode: '0408', name: 'lipnowski', type: 'powiat ziemski', capital: 'Lipno' },
      { terytCode: '0409', name: 'mogileński', type: 'powiat ziemski', capital: 'Mogilno' },
      { terytCode: '0411', name: 'radziejowski', type: 'powiat ziemski', capital: 'Radziejów' },
      { terytCode: '0412', name: 'rypiński', type: 'powiat ziemski', capital: 'Rypin' },
      { terytCode: '0413', name: 'sępoleński', type: 'powiat ziemski', capital: 'Sępólno Krajeńskie' },
      { terytCode: '0416', name: 'tucholski', type: 'powiat ziemski', capital: 'Tuchola' },
      { terytCode: '0417', name: 'wąbrzeski', type: 'powiat ziemski', capital: 'Wąbrzeźno' },
      { terytCode: '0419', name: 'żniński', type: 'powiat ziemski', capital: 'Żnin' }
    ]
  },
  {
    id: 'lubuskie',
    name: 'Lubuskie',
    code: 'LB',
    teryt: '08',
    capital: 'Gorzów Wlkp. / Zielona Góra',
    labelX: 134,
    labelY: 433,
    path: 'M191.7 311l-2 9.6 0.4 10.5-9.7 12.5 3 2.8 2.2 8.2-1 2.5-1.9 1.3-9.4 3-1.6-0.2-0.7 1.5-0.1 3.7-0.4 3.5 0.4 9.2 3.5 9.7 1.2 5.7 0.8 6 0 4.9-2.7 0-2.1 1.5 4.2 7.5 2 4.8 0.2 10.1-3.2 9.5-0.5 2.4-0.2 2.5-1.2 4.8 0 5.4 0.7 5.1 2.4 3.5 2.7 2.8 5.5 3 1.8 5 2.3 4.2 3.5 3.6 3.7 0.1 1.7-0.8 1.7 1.1 0.1 3.2-0.9 3.1-0.4 5.6 1.4 4.3 4.3 2.9 4.5 1.5 7.3-4.9 6.5 7.1 3.1 12-4.8 8-6.1 5.3-7.9 1.8-5.5-7.1-0.4-5.6-2.6-2.9-15.1-2.8-2 2.7-1.4 4.2-3 3-3.5 1.2-2.2 1.6-9.8 19.2-11 14.6-7.1 1.7-14-7.7-7.3 2.5-3.3 4-5 8.7-2.9-0.2-5.9-5.1-2.8 0-16 8.4-1.9 1.1-0.3-4.2 0.8-2-1-2.2-1.9-2-1.5-1.2-2.3-1.1-4.6-1.4-2.3-1.3-2.1-1.5-6.5-2.2-2.2-2.3-0.6-2.8 0.8-3.2 2-3 1.2-3.2-0.2-4.3-1-4.1-1.3-2.7-4.8-4.1-2.3-2.6-1-4.1-0.4-4.3-1.4-1.8-1.8-1.3-1.6-2.5-0.3-3.4 1.3-2.8 5.7-5.8 1.9-2.5 1.5-2.9 0.8-3.2 0.4-9.8 0.5-1.6 2.2-3.9 0.4-1.6 0.5-2.9 0.8-1.4 1.8-2.3-6.5-4.8-1-2.4 0.6-4.2 1.1-2.9 0.4-2.4-1.5-2.2 0-1 2-2.6 0-3.3-1.5-2.9-2.8-1.2-2.8-0.7-3.4-1.7-2.3-2.5 0.6-3-2-4.7-2.4-7.2-0.6-6.5 5.2-4.5 2.4-3.9 1.6-3.8-0.4-1.7-1.9-1.8 0.8-3.8 2.8-5.8-3.1-2.6-0.6-0.6 2.5-8.8 2.1-3.3 8.5-1.4 5-2.1 7.8-11 6.4-13.9 9.7-5.4 16.6 5.5 5.2-0.8 6.2-7.1 3.7-7.2-2.7-0.5-2-2.7 5.7-0.3 16.9-5.8 20.5 0.1 5-3.7 9-11.5 5.2-4.1 5.4-0.8 5 1.1 2.6 8.2-1.8 7.8z',
    powiatyExamples: ['Zielona Góra', 'Gorzów Wielkopolski', 'nowosolski', 'żarski', 'żagański', 'świebodziński', 'międzyrzecki'],
    administrativePowiaty: [
      { terytCode: '0862', name: 'Zielona Góra', type: 'miasto na prawach powiatu', capital: 'Zielona Góra' },
      { terytCode: '0861', name: 'Gorzów Wielkopolski', type: 'miasto na prawach powiatu', capital: 'Gorzów Wielkopolski' },
      { terytCode: '0804', name: 'nowosolski', type: 'powiat ziemski', capital: 'Nowa Sól' },
      { terytCode: '0811', name: 'żarski', type: 'powiat ziemski', capital: 'Żary' },
      { terytCode: '0810', name: 'żagański', type: 'powiat ziemski', capital: 'Żagań' },
      { terytCode: '0808', name: 'świebodziński', type: 'powiat ziemski', capital: 'Świebodzin' },
      { terytCode: '0803', name: 'międzyrzecki', type: 'powiat ziemski', capital: 'Międzyrzecz' },
      { terytCode: '0801', name: 'gorzowski', type: 'powiat ziemski', capital: 'Gorzów Wielkopolski' },
      { terytCode: '0809', name: 'zielonogórski', type: 'powiat ziemski', capital: 'Zielona Góra' },
      { terytCode: '0802', name: 'krośnieński', type: 'powiat ziemski', capital: 'Krosno Odrzańskie' },
      { terytCode: '0805', name: 'słubicki', type: 'powiat ziemski', capital: 'Słubice' },
      { terytCode: '0806', name: 'strzelecko-drezdenecki', type: 'powiat ziemski', capital: 'Strzelce Krajeńskie' },
      { terytCode: '0807', name: 'sulęciński', type: 'powiat ziemski', capital: 'Sulęcin' },
      { terytCode: '0812', name: 'wschowski', type: 'powiat ziemski', capital: 'Wschowa' }
    ]
  },
  {
    id: 'wielkopolskie',
    name: 'Wielkopolskie',
    code: 'WP',
    teryt: '30',
    capital: 'Poznań',
    labelX: 332,
    labelY: 419,
    path: 'M282.3 214.1l4.8 5.9 4.1 7.3 5.8 3.6 20.3 0.8 5.3 2.9 4.4 5.3-2.7 6.2-7.2 9.5 1.2 5 8.4 6.6 4.8 10.8-9.1 7.7 0.9 7.1 3.1 5.9-1.4 10.3-4.5 10.4 8.1 2.9 7.5 5.7 4.9 10.8-2.1 11.6-1.2 2.3-1.6 0.6-1.8-0.1-1.7 1.2-0.6 4.3 3.6 3.4 1.5 3.9 2 3.2 4 0.8 4-1.4 1.8-1.6 3.1 2.7 0.9 2.2 0.4 2.7 0.8 1 1.1 0.6 6.4 2.2 6.9 0.4 7.5 4.1 10.2 9.3 3.5 1.9 3.7 0.2 3.4 1.4 2.9 3.6 3.2 3.1 10.1 2.6 3.4-1.5 5.8-6.8 1.9 0.5 1.4 1 0.8 3 1.2 2.6 1.9 2.8 2.4 0.8 1.5-0.9 1-1.8 1.8-0.8 1.9-0.2 3.5 1.6 3 3.6 16.5 13.5 2.7 6.2 3.6-0.3 10.4-4.4 3.5-0.5 9.5 7.2 0.2 5.3 1.9 4.1 1.5 0.4 0.2 1.6-6.1 5.9-10 4.3-1 4.5-0.9 10.2-5.1 5.9-6.6 1.6-3.5-0.4-3.1 0.3-1.4 5-0.7 5.5 1.1 5.7 1.9 5.2-0.4 5.1-4.8 8.4-1.1 1.3-14.5-1.6-5.7 2.7-2.5 3.5-4.7 11.1-2.5 9.8-0.5 10.6 1 8.8 0.1 8.5-2.8 7.6-4.7 3.4-5.4-2.7-5 1.6-1.7 5-2.5 3.9-7.2 1.7-1.6 3.5 0.2 5.2 1.9 4.4 5.7 5.1 1 4.3 0.6 7.5-11.3 6.8-11.8 4.3-6.4-0.3-5.2-4.3-0.6-3.8-1.3-3.5-3.3-1.7-3.4 0.2-1.3-7.9-1.2-16.3 2.8-6.7-3.5-2.9-3.8-1.1-6.1 1.3-5.9-1.4-2.3-5.9-0.6-6.9 1.3-3.4 2.5-1.6 1.3-4 1-4.6-9.9-6.4-11-3-11.7-0.1-4.2 0.9-3.7 8.6-20.6 3.6-11.5-4.1-5.4-6-9.7-5.4-4.3-7.7-0.3-5.2-1.8-4-11.2-6.2-4.1-1-8.7 1.6-3.1-12-6.5-7.1-7.3 4.9-4.5-1.5-4.3-2.9-1.4-4.3 0.4-5.6 0.9-3.1-0.1-3.2-1.7-1.1-1.7 0.8-3.7-0.1-3.5-3.6-2.3-4.2-1.8-5-5.5-3-2.7-2.8-2.4-3.5-0.7-5.1 0-5.4 1.2-4.8 0.2-2.5 0.5-2.4 3.2-9.5-0.2-10.1-2-4.8-4.2-7.5 2.1-1.5 2.7 0 0-4.9-0.8-6-1.2-5.7-3.5-9.7-0.4-9.2 0.4-3.5 0.1-3.7 0.7-1.5 1.6 0.2 9.4-3 1.9-1.3 1-2.5-2.2-8.2-3-2.8 9.7-12.5-0.4-10.5 2-9.6 5.5 1.9 6.1 3.6 6.2-0.8 6.1-2.4 9.7-9.1 8-12.7 14.4-8.5 7.4-2.3 2.9-2.7 2.3-4.2 3.1-3.8-0.7-4.8-3.1-4-3.7-1.9-7.5-1.9-6.2-6.1-1.6-6-0.1-6.6 2.3-3.2 18.3 0.4 3-0.5 2.5-10.7 2-5.5 2.6-4.6 3.5-1.6 3.8-0.1 3.8 1.2z',
    powiatyExamples: ['Poznań', 'poznański', 'Kalisz', 'Konin', 'Leszno', 'gnieźnieński', 'pilski', 'ostrowski', 'krotoszyński', 'szamotulski'],
    administrativePowiaty: [
      { terytCode: '3064', name: 'Poznań', type: 'miasto na prawach powiatu', capital: 'Poznań' },
      { terytCode: '3061', name: 'Kalisz', type: 'miasto na prawach powiatu', capital: 'Kalisz' },
      { terytCode: '3062', name: 'Konin', type: 'miasto na prawach powiatu', capital: 'Konin' },
      { terytCode: '3063', name: 'Leszno', type: 'miasto na prawach powiatu', capital: 'Leszno' },
      { terytCode: '3021', name: 'poznański', type: 'powiat ziemski', capital: 'Poznań' },
      { terytCode: '3003', name: 'gnieźnieński', type: 'powiat ziemski', capital: 'Gniezno' },
      { terytCode: '3019', name: 'pilski', type: 'powiat ziemski', capital: 'Piła' },
      { terytCode: '3017', name: 'ostrowski', type: 'powiat ziemski', capital: 'Ostrów Wielkopolski' },
      { terytCode: '3011', name: 'krotoszyński', type: 'powiat ziemski', capital: 'Krotoszyn' },
      { terytCode: '3024', name: 'szamotulski', type: 'powiat ziemski', capital: 'Szamotuły' },
      { terytCode: '3008', name: 'koniński', type: 'powiat ziemski', capital: 'Konin' },
      { terytCode: '3007', name: 'kaliski', type: 'powiat ziemski', capital: 'Kalisz' },
      { terytCode: '3013', name: 'leszczyński', type: 'powiat ziemski', capital: 'Leszno' },
      { terytCode: '3027', name: 'wrzesiński', type: 'powiat ziemski', capital: 'Września' },
      { terytCode: '3023', name: 'średzki', type: 'powiat ziemski', capital: 'Środa Wielkopolska' },
      { terytCode: '3025', name: 'śremski', type: 'powiat ziemski', capital: 'Śrem' },
      { terytCode: '3010', name: 'kościański', type: 'powiat ziemski', capital: 'Kościan' },
      { terytCode: '3009', name: 'kozielski', type: 'powiat ziemski', capital: 'Koło' },
      { terytCode: '3026', name: 'turecki', type: 'powiat ziemski', capital: 'Turek' },
      { terytCode: '3006', name: 'jarociński', type: 'powiat ziemski', capital: 'Jarocin' },
      { terytCode: '3020', name: 'pleszewski', type: 'powiat ziemski', capital: 'Pleszew' },
      { terytCode: '3022', name: 'rawicki', type: 'powiat ziemski', capital: 'Rawicz' },
      { terytCode: '3028', name: 'złotowski', type: 'powiat ziemski', capital: 'Złotów' },
      { terytCode: '3001', name: 'chodzieski', type: 'powiat ziemski', capital: 'Chodzież' },
      { terytCode: '3002', name: 'czarnkowsko-trzcianecki', type: 'powiat ziemski', capital: 'Czarnków' }
    ]
  },
  {
    id: 'mazowieckie',
    name: 'Mazowieckie',
    code: 'MZ',
    teryt: '14',
    capital: 'Warszawa',
    labelX: 705,
    labelY: 436,
    path: 'M893.8 428.4l-3.2 6-9.5 14-2.8 6.7-3.3 4.2-3.9 1.5-11.7-6.1-4-0.9-1.8 1.2-1.7 1.8-0.6 2-0.5 2.4-5.5 4.6-11-1.1-3.8 0.5-9.5 7.1-3.5 1.1-5.1-0.9-13.6 2.7-14.4-0.1-7.6 2.2-7.1 5.3 0.6 4.1 1.6 4.5 2 4.2 0.4 4.3 2.4 6 3.5 5.3-5.5 3.4-3.8 5.4 5 7.7-0.6 3.7-2.5 2.4-7.1 2.5-7.2-1.2-3.6-1.4-3.6 0.9-1 4.1 0.1 1.7 1.3 2.1 1.4 1.8 2.8 1.3 5.1 1 1.8-0.1 2.4-1.1 1 0.1 1.5 1 0.4 1.4-0.1 1.9 0.2 2.2 1.8 2.8 0.3 2-1.5 1.8 0 1.1 3.1 0.3-0.1 6.5-2.4 3.4-2.4 1.9-0.2 3.9 4 4.8-0.6 4.5-1.2 4.9 0.2 3.3-1.1 0.2-0.9 0.8-1.3 2.5-1.8 9.9-1.2 3.7-0.1 1.8 0.2 1.3 0.9 2.8 0.8 5.1 2.4 6.1-31.8 6.7-16.5-5.2-7.7-0.7-6.8-4.4-0.6-2.4-0.4-2.7-3-3.3-0.9-5.4-3-1-3.1 3-2.9 4-3.3 1.9-13.9 2.2-12-2.5-2.6-1.9-2.1-3.4-2.3-2.6-16.4-10.1-3-7.5-5.5-2-0.3-4.7 1.3-4.3 6.4-6 1.6-4.4 0-5.2-1.3-1.4-3.6-1.8-0.8-2.6-0.4-5.1-0.9-4.9-3-7.1 2.6-9.1 7.8 0 5.9 3.3 7.3 1 1.2-2.7 0.3-3.8-1.5-4.1-5.4-5.6-0.9-4.6 0.5-2 1-1.5 0.9-1.9-0.6-2.6-5.9-7.9-7.2-5.6-6.6-3-10.6 1.2-3.6-1.2-0.9-2.6 0.3-3-2.4-3.6-2.7-3.1-0.8-3.4 3.3-2 1.1-8.1-1.4-1.7-3.9-2.6-6.8-2.8-1.6 0.4-1.4-0.8-2-4.5-0.4-5.7-1.2-4.2-2.8-1.9-3.5-1-3.1-1.7-2.4-4.1-2.7-3.5-3.7 0.3-3.2 3.3-20.7 4.3-9.2-7.5-5.1-2.4-10.5-2.2-9.6-6.6 0.6-2.8 0.4-2.8 7.4-12.2-0.4-3-2.1-2.1 0.6-6.3 2.6-5.4 6.7-19.5 4.3-1.2-0.1-5.4-2.9-7-1.6-3.1-1.1-3.4 0.8-3.4 2-2.2 0.5-6.1-1.5-6.7 4.8 0.6 4.2-3.5 1.8-2.8 2.2-2.1 1.9 0.8 1.8 1.3 1.9 0.3 1-2.8 0.5-3.3 0.3-3.2-0.8-4.9-0.1-3.3-0.6-3.1 5.1-2.4 4.8-3.9 3.4-0.9 2.9-2.4 2.6-5.1 3.9-1.2 1.7 0.3 1.6 1.1 0.6 1.5 0.9 1 31.5 4.9 7.5-1.4 3-1.5 2.6-3 1.6-5.6 3.1-2.5 3.8 0.4 3.7-1 13.9-8.1 3.3-4 3.6-2.9 7.2 0.1 6.3-1.3 7.3-4.2 9.5 0 9-2.9 7.5-9 8.9 0.8 4.5-0.7 4.1-2.9 2.8-5.6 2.5-1.3 12-1 1.3 5.8 2.3 5.4 1.6 6.6 2.5 19.2 5.6 14 3.6 7.1 5.3 2.8 5.5 0.8 4.6 3.6-1.7 3 0.5 4.2 2.5 4.5 3.8 2.1 2.4 2.6 1.5 4.1 1.4 6 2.6 4.9 7.1 3.7 7.6-1.2 4.9-5.4 4.8 3.7-1.5 9.1 2.5 3.5 3.1 2.2 5.6-2.8 5.8-1.6 1.5 7.7 0.6 8.6 1.2 5.8 0.4 6.1-0.3 3.6 5.5 5.9 2.1 2.9 2.2 1.9 0.7 1 0.2 1.6-0.7 2.6-0.1 1.5 0.3 2.1 0.5 1.3 0.8 0.8 1.4 0.2 0.3 0.8-0.6 5.4 0.7 1.8 1.7 2.4 2 1.5 1.7-0.7 1.2 1.9 2.4 0.6 5.3-0.3 15.5 3.2 7.7-1.1 3 1 2.2 2.2 1 3.7 2.1-1.1 1.8 1.1 2.8 3.4-0.5 0.8-0.8 2.5 1.7 1 1.6-0.5 1.5-1z',
    powiatyExamples: ['Warszawa', 'Radom', 'Płock', 'Siedlce', 'Ostrołęka', 'piaseczyński', 'wołomiński', 'pruszkowski', 'legionowski', 'otwocki', 'miński'],
    administrativePowiaty: [
      { terytCode: '1465', name: 'Warszawa', type: 'miasto na prawach powiatu', capital: 'Warszawa' },
      { terytCode: '1463', name: 'Radom', type: 'miasto na prawach powiatu', capital: 'Radom' },
      { terytCode: '1462', name: 'Płock', type: 'miasto na prawach powiatu', capital: 'Płock' },
      { terytCode: '1464', name: 'Siedlce', type: 'miasto na prawach powiatu', capital: 'Siedlce' },
      { terytCode: '1461', name: 'Ostrołęka', type: 'miasto na prawach powiatu', capital: 'Ostrołęka' },
      { terytCode: '1418', name: 'piaseczyński', type: 'powiat ziemski', capital: 'Piaseczno' },
      { terytCode: '1434', name: 'wołomiński', type: 'powiat ziemski', capital: 'Wołomin' },
      { terytCode: '1421', name: 'pruszkowski', type: 'powiat ziemski', capital: 'Pruszków' },
      { terytCode: '1408', name: 'legionowski', type: 'powiat ziemski', capital: 'Legionowo' },
      { terytCode: '1417', name: 'otwocki', type: 'powiat ziemski', capital: 'Otwock' },
      { terytCode: '1412', name: 'miński', type: 'powiat ziemski', capital: 'Mińsk Mazowiecki' },
      { terytCode: '1432', name: 'warszawski zachodni', type: 'powiat ziemski', capital: 'Ożarów Mazowiecki' },
      { terytCode: '1405', name: 'grodziski', type: 'powiat ziemski', capital: 'Grodzisk Mazowiecki' },
      { terytCode: '1414', name: 'nowodworski', type: 'powiat ziemski', capital: 'Nowy Dwór Mazowiecki' },
      { terytCode: '1425', name: 'radomski', type: 'powiat ziemski', capital: 'Radom' },
      { terytCode: '1419', name: 'płocki', type: 'powiat ziemski', capital: 'Płock' },
      { terytCode: '1426', name: 'siedlecki', type: 'powiat ziemski', capital: 'Siedlce' },
      { terytCode: '1415', name: 'ostrołęcki', type: 'powiat ziemski', capital: 'Ostrołęka' },
      { terytCode: '1402', name: 'ciechanowski', type: 'powiat ziemski', capital: 'Ciechanów' },
      { terytCode: '1428', name: 'sochaczewski', type: 'powiat ziemski', capital: 'Sochaczew' },
      { terytCode: '1435', name: 'wyszkowski', type: 'powiat ziemski', capital: 'Wyszków' },
      { terytCode: '1420', name: 'płoński', type: 'powiat ziemski', capital: 'Płońsk' },
      { terytCode: '1406', name: 'grójecki', type: 'powiat ziemski', capital: 'Grójec' }
    ]
  },
  {
    id: 'dolnoslaskie',
    name: 'Dolnośląskie',
    code: 'DS',
    teryt: '02',
    capital: 'Wrocław',
    labelX: 214,
    labelY: 646,
    path: 'M224.8 516.3l8.7-1.6 4.1 1 11.2 6.2 1.8 4 0.3 5.2 4.3 7.7 9.7 5.4 5.4 6 11.5 4.1 20.6-3.6 3.7-8.6 4.2-0.9 11.7 0.1 11 3 9.9 6.4-1 4.6-1.3 4-2.5 1.6-1.3 3.4 0.6 6.9 2.3 5.9 5.9 1.4 6.1-1.3 3.8 1.1 3.5 2.9-2.8 6.7 1.2 16.3 1.3 7.9-3.3 2.1-3.5 0.8-3.4-0.2-3.3 1.1-2.6 2.8-5.8 13.3-1 3.9-0.6 4.1-1.6 4.8-3.2 2.1-4.7 6.2-3.6 8.3-8.3 12.3-7.2 13.7-2.3 8.8-3.5 6.2-6.1 1-5.2 4-7.2 17.9-0.4 1.9-2.8-1.7-2.3-0.3-2.7 1.7 0 2.1 3.2 4.8 1.1 2.8 0.8 3.3 1 3.1 1.8 1.9 2.5 1.4 1.8 2 1 2.8 0.2 3.8 1.3 1.7 0.2 2.1-0.7 1.3-1.2-0.4-1.5-2.6-0.6-0.4-1.5 0-0.2 0.4 0 1.9-1.2 0.6-1.8-0.6-0.9 0-1.2 0.8-1.6 2.3-1 0.9-2.3 0.6-2-0.2-2 0.3-2.2 1.9-1.8 2.8-1.1 2.1-1.2 1.7-2.2 1.6-3.1 4.2-4 0.3-4.2-2.2-3.4-3.1-1.8-2.3-0.9-2-1.2-5.3-1-2.9-3-3.2-1.3-2.3-1.5-2-2.5-4.6-1.4-2-2.2-1.6-4.5-1.6-1.7-2.4-0.3-1.3 0-2.9-0.7-1.4-0.9-0.3-4.6 0-2.6 1.1-1.3-1-0.4-0.9-1.3-4-3.2-0.6-1-2.8 0.8-2.5 2 0.5-0.7-2.3 2.1-0.8 1.5-1.3 1.8-1.1 1.5-1.2 0.7-2.1 1.6-0.5 3.2 0.9 1.7-0.4 0.9-1.3 2.1-2 0.6-1.1 0.2-2.9 0.7-1.4-0.3-1.7 3.1-1.3-0.9-3-8.5-9-3.1-1.7-3.2-0.9-3.6 0-1.3 0.2-1.5 3.6-1.2 1.6-1.6 0.3-1.6-0.7-3.1-2.4-4.2-0.4-6.2 6-4.2 0.8-0.3-1 0.3-1 1.4-1.2 0.2-1.9-0.5-2.1-0.9-2.2-1.3-2.4-1.3-1.3-1.7-0.3-5.9 2.3-2.7 0-0.7-0.2-5-8.6-0.5-2-2.5-0.2-8.3 2-1-0.4-0.7-0.7-1.4-2-1.1-0.8-19.9-7-4.2 0.4-0.9 1.1-1 1.7-1.1 1.2-1.4-0.5-0.6-1.3 0.4-3.1-0.1-1.5-1.2-2.9-1.5-1.3-1.8-0.8-2-1.6-1-1.7-1.2-2.6-0.9-2.8-0.3-2.3 0.7-2.9 0.8-1.6 0.1-1.6-1.6-2.5-2.6-1.4-5.7-0.1-0.9-2.3-0.5-2.4-1.1-0.6-1.3 0.9-0.9 2.1-0.4 1.6-1.1 0.3-1.4-0.7-1.2-1.2-0.8-1.6-5-1.1-1.9-1.7-0.8 2-1.4 1.1-1.2 0.4-0.9 0.9 0.4 1.8 1.6 1.3 1.5 2.2 0.1 4.6-1.2 1.9-0.4 1.4 0.2 1.1 0.1 5.5-0.2 1.3-11.4-0.8-3.6 1-2.1-0.1 0-2.9 1.4-2.3 3.5-4 5.1-12 4.4-11.3 0.3-1.8 0-3.1 0.2-1.5 0.5-1.1 1.5-1.8 0.2-2.1 0.1-4 0.8-4.4 1.4-4.3 1.7-3.3-0.8-1 0.5-4.6-1.4-3.1-2.3-2.7-1.8-3.2-0.8-4.1-0.6-6.8 1.9-1.1 16-8.4 2.8 0 5.9 5.1 2.9 0.2 5-8.7 3.3-4 7.3-2.5 14 7.7 7.1-1.7 11-14.6 9.8-19.2 2.2-1.6 3.5-1.2 3-3 1.4-4.2 2-2.7 15.1 2.8 2.6 2.9 0.4 5.6 5.5 7.1 7.9-1.8 6.1-5.3 4.8-8z',
    powiatyExamples: ['Wrocław', 'wrocławski', 'Wałbrzych', 'Legnica', 'Jelenia Góra', 'lubiński', 'świdnicki', 'kłodzki', 'oleśnicki', 'głogowski'],
    administrativePowiaty: [
      { terytCode: '0264', name: 'Wrocław', type: 'miasto na prawach powiatu', capital: 'Wrocław' },
      { terytCode: '0265', name: 'Wałbrzych', type: 'miasto na prawach powiatu', capital: 'Wałbrzych' },
      { terytCode: '0262', name: 'Legnica', type: 'miasto na prawach powiatu', capital: 'Legnica' },
      { terytCode: '0261', name: 'Jelenia Góra', type: 'miasto na prawach powiatu', capital: 'Jelenia Góra' },
      { terytCode: '0223', name: 'wrocławski', type: 'powiat ziemski', capital: 'Wrocław' },
      { terytCode: '0211', name: 'lubiński', type: 'powiat ziemski', capital: 'Lubin' },
      { terytCode: '0219', name: 'świdnicki', type: 'powiat ziemski', capital: 'Świdnica' },
      { terytCode: '0208', name: 'kłodzki', type: 'powiat ziemski', capital: 'Kłodzko' },
      { terytCode: '0214', name: 'oleśnicki', type: 'powiat ziemski', capital: 'Oleśnica' },
      { terytCode: '0203', name: 'głogowski', type: 'powiat ziemski', capital: 'Głogów' },
      { terytCode: '0209', name: 'legnicki', type: 'powiat ziemski', capital: 'Legnica' },
      { terytCode: '0201', name: 'bolesławiecki', type: 'powiat ziemski', capital: 'Bolesławiec' },
      { terytCode: '0205', name: 'jaworski', type: 'powiat ziemski', capital: 'Jawor' },
      { terytCode: '0202', name: 'dzierżoniowski', type: 'powiat ziemski', capital: 'Dzierżoniów' },
      { terytCode: '0215', name: 'oławski', type: 'powiat ziemski', capital: 'Oława' },
      { terytCode: '0216', name: 'polkowicki', type: 'powiat ziemski', capital: 'Polkowice' },
      { terytCode: '0218', name: 'średzki', type: 'powiat ziemski', capital: 'Środa Śląska' },
      { terytCode: '0220', name: 'trzebnicki', type: 'powiat ziemski', capital: 'Trzebnica' },
      { terytCode: '0221', name: 'wałbrzyski', type: 'powiat ziemski', capital: 'Wałbrzych' },
      { terytCode: '0225', name: 'zgorzelecki', type: 'powiat ziemski', capital: 'Zgorzelec' }
    ]
  },
  {
    id: 'lodzkie',
    name: 'Łódzkie',
    code: 'LD',
    teryt: '10',
    capital: 'Łódź',
    labelX: 523,
    labelY: 544,
    path: 'M516.2 421.6l9.6 6.6 10.5 2.2 5.1 2.4 9.2 7.5 20.7-4.3 3.2-3.3 3.7-0.3 2.7 3.5 2.4 4.1 3.1 1.7 3.5 1 2.8 1.9 1.2 4.2 0.4 5.7 2 4.5 1.4 0.8 1.6-0.4 6.8 2.8 3.9 2.6 1.4 1.7-1.1 8.1-3.3 2 0.8 3.4 2.7 3.1 2.4 3.6-0.3 3 0.9 2.6 3.6 1.2 10.6-1.2 6.6 3 7.2 5.6 5.9 7.9 0.6 2.6-0.9 1.9-1 1.5-0.5 2 0.9 4.6 5.4 5.6 1.5 4.1-0.3 3.8-1.2 2.7-7.3-1-5.9-3.3-7.8 0-2.6 9.1 3 7.1 0.9 4.9 0.4 5.1 0.8 2.6 3.6 1.8 1.3 1.4 0 5.2-1.6 4.4-6.4 6-1.3 4.3 0.3 4.7-2.8 2.1-3.7 9.1-3.3 1.5-3.3 0.5-3.2 1.6-6.9 6.6-3.2 0.9-11-1.6-3.1 1.2-2.4 3.2-2.5 9.6 4.5 6.9 3.1 2.5 1 5.3-0.8 5.1-2.3 2.7-13.1-9.6-3.5 0.6-1.3 5.1-0.1 5.1 0.4 4.9-1.7 4.8-3.4 2.3-2.9 2.7-2.3 3.9-10.9-5.5-9.9 0.5-3.4-1-9.3-14.9-6-5.5-6.7-1.3-3.4 3-8 0.1-6.4-1.4-13.1-7-3-3.1-3.5-0.7-3.2 2.2-3.2 1.5-14.1 0.5-5 2.4-7.5-6-2.3-4.6-2.7-3.2-1.2 0.6-0.9 1.7-1.3 1.1-7 0.2-22.3-5.7-2.9-2.4-2.3-4-0.6-7.5-1-4.3-5.7-5.1-1.9-4.4-0.2-5.2 1.6-3.5 7.2-1.7 2.5-3.9 1.7-5 5-1.6 5.4 2.7 4.7-3.4 2.8-7.6-0.1-8.5-1-8.8 0.5-10.6 2.5-9.8 4.7-11.1 2.5-3.5 5.7-2.7 14.5 1.6 1.1-1.3 4.8-8.4 0.4-5.1-1.9-5.2-1.1-5.7 0.7-5.5 1.4-5 3.1-0.3 3.5 0.4 6.6-1.6 5.1-5.9 0.9-10.2 1-4.5 10-4.3 6.1-5.9-0.2-1.6-1.5-0.4-1.9-4.1-0.2-5.3 1-1.2 0.7-1.5 1.7-1 12.3-0.2 3.8-1.2 0.9-1.8 1.2-1.9 1.9-0.3 2 0.1z',
    powiatyExamples: ['Łódź', 'Piotrków Trybunalski', 'Pabianice', 'zgierski', 'Tomaszów Mazowiecki', 'bełchatowski', 'radomszczański', 'zgierski', 'kutnowski'],
    administrativePowiaty: [
      { terytCode: '1061', name: 'Łódź', type: 'miasto na prawach powiatu', capital: 'Łódź' },
      { terytCode: '1062', name: 'Piotrków Trybunalski', type: 'miasto na prawach powiatu', capital: 'Piotrków Trybunalski' },
      { terytCode: '1063', name: 'Skierniewice', type: 'miasto na prawach powiatu', capital: 'Skierniewice' },
      { terytCode: '1008', name: 'pabianicki', type: 'powiat ziemski', capital: 'Pabianice' },
      { terytCode: '1020', name: 'zgierski', type: 'powiat ziemski', capital: 'Zgierz' },
      { terytCode: '1016', name: 'tomaszowski', type: 'powiat ziemski', capital: 'Tomaszów Mazowiecki' },
      { terytCode: '1001', name: 'bełchatowski', type: 'powiat ziemski', capital: 'Bełchatów' },
      { terytCode: '1012', name: 'radomszczański', type: 'powiat ziemski', capital: 'Radomsko' },
      { terytCode: '1002', name: 'kutnowski', type: 'powiat ziemski', capital: 'Kutno' },
      { terytCode: '1010', name: 'piotrkowski', type: 'powiat ziemski', capital: 'Piotrków Trybunalski' },
      { terytCode: '1014', name: 'sieradzki', type: 'powiat ziemski', capital: 'Sieradz' },
      { terytCode: '1006', name: 'łódzki wschodni', type: 'powiat ziemski', capital: 'Łódź' },
      { terytCode: '1011', name: 'poddębicki', type: 'powiat ziemski', capital: 'Poddębice' },
      { terytCode: '1007', name: 'opoczyński', type: 'powiat ziemski', capital: 'Opoczno' },
      { terytCode: '1018', name: 'wieluński', type: 'powiat ziemski', capital: 'Wieluń' },
      { terytCode: '1004', name: 'łowicki', type: 'powiat ziemski', capital: 'Łowicz' },
      { terytCode: '1015', name: 'skierniewicki', type: 'powiat ziemski', capital: 'Skierniewice' },
      { terytCode: '1003', name: 'łaski', type: 'powiat ziemski', capital: 'Łask' }
    ]
  },
  {
    id: 'lubelskie',
    name: 'Lubelskie',
    code: 'LU',
    teryt: '06',
    capital: 'Lublin',
    labelX: 875,
    labelY: 586,
    path: 'M902.7 429.6l0.7 0.6 1.1 1.6 0.3 2.1-0.8 2.9 2.3 1.5 7.1 1.9 1.6-0.6 1.3 1.3 6.2 2.4 2.1 0.2 0 1-0.8 1.5 1.7-0.3 1.3 0.6 0.9 0.9 0.9 0.2 1.4-1.7 0.4 0.7 1.6 1.6 1.7-1.6 0.4 1.2-0.3 2-0.4 0.5 2.8 5.6 1.9 0.6 4.7-0.1 1.9 1.1 1.8 3.6 2.1 1.3 0.4 1.8 0.1 1.9 0.9 2 1.4 6.1 1.1 2.8-1.6 1.2-1.3 2-1.8 4.5-0.7 3-0.1 5.2-0.6 1.9 0.7 1.1-1.2 0.6-0.4 3.5-1.1 1.4 1.5 2.9 1.9 2.5-1.2 3.7-1.9 1.9-2.1 1.3-1.7 2-0.8 2.9-0.5 3.7 1 1.9 0.2 1-1.3 0.9 0.3 1.1 1.1 1.8-1.2 1.6-1.5 0.4 0 1.2 1.1 1.3 0.1 1.5-0.5 4.4 0.4 2.3 0.8 2.2 2.2 3.8-1.4 0 1.3 2.5 1.6 0.6 1.3 0.8 0.6 3.1 0.7 2.3 1.5 1.1 1.8 0.6 1.4 1-1.5 3.2 0.1 1 4.1 6 0.8 1.9-1.1 0.6-0.7 1.1-0.2 1.6 0.6 2.2-1.8 0.7-1.7 1.9-1.4 2.3-0.5 2.2 0.6 3.3 1.6 0.9 1.9 0 1.7 1.1 5.5 12.1 2.3 2.8 5 3.2 4.8 4.8 1.1 2-1.7 0.8-0.4 1.5 1.5 3.1 2.6 4.1 0.9 2.1 1.2 6.6-0.5 2.3 0.8 0.6 2.5 1.4 1.1 1.7 0.3 2.7 0.6 2.1 1.5 2.4 6.7 6.3 8.3 4.6 1.3 2-1.2 2.7-3.1 0.6-3.3 0.1-2 0.9-2.6-1.5-2.8 0.3-2.3 1.8-1.2 2.7 0.2 3 1.5 2 2.3 1.1 2.8 0.4 0 0.9-1.3 2.8 1.4 2.4 2.7 1.7 2.7 0.7-0.6 3.5 0.8 3.4 2.5 6.1-2.3 4 1 7.5 1.1 2.9-1.2 1.8-1.9 2-6.4 3.3-0.3 1.9 0.2 3-0.2 2.1-0.4 1.7-2.2 5.1-5.3 2.2-18 0.2-3.4 1.1-1.8 0.9-1.3 1.3-1.1 2.3-1.3 4.2-10-5.9-3.2-4.9-6.3-4-7.3-0.8-5.7 0.5-2.6 1.2-8.2 9.3-6.5 5.2-7.5 1.6-22.4-0.7-13.6-3.9-1-2.3 3.4-0.8 1.5-0.9-2.6-1.9-13.9 2.8-3.5-1.6-2.6-4-0.7-3.9 1.6-3.3 2.5-3.3 3.1-1 3.1 0.4 2.8-1.6-1.2-3.8-2.3-4.4-0.3-2.2 0.1-2.1-0.9-1.5-15.7-8.4-23.2-5.9-1.9-3.3 4.6-8.5 1.4-4-3.2-2.8-3.5-2.2-3.9-1.5-3.9 0.2-6.6 4.6-7.4-0.4-13.2-8.9-0.5-3.4-2.5-9.7-0.4-2-1-0.7-0.1-1.9 0.7-1.3 0.7-6.8-0.3-3.1-1.8-1.4 0-1.1 1.5-0.5 1.2-1.6-0.4-2.2-2.4-6.1-0.8-5.1-0.9-2.8-0.2-1.3 0.1-1.8 1.2-3.7 1.8-9.9 1.3-2.5 0.9-0.8 1.1-0.2-0.2-3.3 1.2-4.9 0.6-4.5-4-4.8 0.2-3.9 2.4-1.9 2.4-3.4 0.1-6.5-3.1-0.3 0-1.1 1.5-1.8-0.3-2-1.8-2.8-0.2-2.2 0.1-1.9-0.4-1.4-1.5-1-1-0.1-2.4 1.1-1.8 0.1-5.1-1-2.8-1.3-1.4-1.8-1.3-2.1-0.1-1.7 1-4.1 3.6-0.9 3.6 1.4 7.2 1.2 7.1-2.5 2.5-2.4 0.6-3.7-5-7.7 3.8-5.4 5.5-3.4-3.5-5.3-2.4-6-0.4-4.3-2-4.2-1.6-4.5-0.6-4.1 7.1-5.3 7.6-2.2 14.4 0.1 13.6-2.7 5.1 0.9 3.5-1.1 9.5-7.1 3.8-0.5 11 1.1 5.5-4.6 0.5-2.4 0.6-2 1.7-1.8 1.8-1.2 4 0.9 11.7 6.1 3.9-1.5 3.3-4.2 2.8-6.7 9.5-14 3.2-6 1.3-0.6 1.9 0.4 3.1 1.9 1.8 0 0.8-0.5z',
    powiatyExamples: ['Lublin', 'Zamość', 'Chełm', 'Biała Podlaska', 'lubelski', 'puławski', 'świdnicki', 'kraśnicki', 'łukowski', 'biłgorajski'],
    administrativePowiaty: [
      { terytCode: '0663', name: 'Lublin', type: 'miasto na prawach powiatu', capital: 'Lublin' },
      { terytCode: '0664', name: 'Zamość', type: 'miasto na prawach powiatu', capital: 'Zamość' },
      { terytCode: '0662', name: 'Chełm', type: 'miasto na prawach powiatu', capital: 'Chełm' },
      { terytCode: '0661', name: 'Biała Podlaska', type: 'miasto na prawach powiatu', capital: 'Biała Podlaska' },
      { terytCode: '0609', name: 'lubelski', type: 'powiat ziemski', capital: 'Lublin' },
      { terytCode: '0614', name: 'puławski', type: 'powiat ziemski', capital: 'Puławy' },
      { terytCode: '0617', name: 'świdnicki', type: 'powiat ziemski', capital: 'Świdnik' },
      { terytCode: '0607', name: 'kraśnicki', type: 'powiat ziemski', capital: 'Kraśnik' },
      { terytCode: '0611', name: 'łukowski', type: 'powiat ziemski', capital: 'Łuków' },
      { terytCode: '0602', name: 'biłgorajski', type: 'powiat ziemski', capital: 'Biłgoraj' },
      { terytCode: '0620', name: 'zamojski', type: 'powiat ziemski', capital: 'Zamość' },
      { terytCode: '0603', name: 'chełmski', type: 'powiat ziemski', capital: 'Chełm' },
      { terytCode: '0601', name: 'bialski', type: 'powiat ziemski', capital: 'Biała Podlaska' },
      { terytCode: '0608', name: 'lubartowski', type: 'powiat ziemski', capital: 'Lubartów' },
      { terytCode: '0610', name: 'łęczyński', type: 'powiat ziemski', capital: 'Łęczna' },
      { terytCode: '0615', name: 'radzyński', type: 'powiat ziemski', capital: 'Radzyń Podlaski' },
      { terytCode: '0618', name: 'tomaszowski', type: 'powiat ziemski', capital: 'Tomaszów Lubelski' },
      { terytCode: '0613', name: 'parczewski', type: 'powiat ziemski', capital: 'Parczew' },
      { terytCode: '0612', name: 'opolski', type: 'powiat ziemski', capital: 'Opole Lubelskie' }
    ]
  },
  {
    id: 'opolskie',
    name: 'Opolskie',
    code: 'OP',
    teryt: '16',
    capital: 'Opole',
    labelX: 367,
    labelY: 705,
    path: 'M402 614.4l2.3 4 2.9 2.4 22.3 5.7 7-0.2 1.3-1.1 0.9-1.7 1.2-0.6 2.7 3.2 2.3 4.6 7.5 6-3.4 12.2-1.3 1.5-0.7 2.4 0.6 3.6 1.3 2.9-0.7 5.6-7.8 5.1-2.6 5.6-1.8 9.8-2.4 6.5 1.9 5.9 2.7 3.6 3.2 2.5 3.2 3.4 1.1 5.7-14.4-0.1-3 0.7-1.3 3.5 1.1 2.7-0.2 2.9-2.2 1-2.1 0.4-0.9 3.2 1.7 20.1-0.1 7.9-1.1 4.6-9.6 4.5-6 4.5-12.5 2.7-6 11.6-0.1 2.6-1.7-0.4 0.5 3.5 0.5 0.2 1.6-0.2 0.7 1.1 0.2 1.5-0.5 0.7-3.2 1-4 0.1-1.8 0.5-3 2.6-3.6 1.1-3.6-0.8-6.5-6.4-1.1-1.6-0.8-1.8-1.2-3.7-2-2.2-0.4-0.9 1.3-2.2-1.4-0.3-2.7-1.3-1.3-0.4-2.9 0.9-1.6-0.7-4.8-6.1-0.2-1.2 0.7-1.5 1.1-0.6 4.8-0.2 2.7-1 4.2-2.6 2-1.7 0.9-2.4-1.5-2.8-1.1-1.1-0.2-1.6 0.2-1.4 1.3-3.4 0-0.9-2-2.8-0.6-0.5-1.7-0.7-0.6 0.4-0.8 2.4-3 4.1-1.7 1.4-2.3 0.6-8.9-1.6-4.8 0.4-2.9 3.6-1 0.5-1.1-0.5-0.9-2.9-2.2-1.8-2.2 0.2-1.1 2.9-1.3-1-0.7-1.6-0.2-2 0.2-2.1-1.5-1.9 1.8-0.8-2.1-0.8-4.6 0.1-2.4-0.7-3.5-2.2-1-1.1-0.6-1.3-0.9-3.7-1-0.8-3 0.6-1.4 0-1.3-0.7-2.3-2-1.1-0.6-10.2-2.9-2.3 0.3-1.5-0.9 0.4-1.9 7.2-17.9 5.2-4 6.1-1 3.5-6.2 2.3-8.8 7.2-13.7 8.3-12.3 3.6-8.3 4.7-6.2 3.2-2.1 1.6-4.8 0.6-4.1 1-3.9 5.8-13.3 2.6-2.8 3.3-1.1 3.4 0.2 3.5-0.8 3.3-2.1 3.4-0.2 3.3 1.7 1.3 3.5 0.6 3.8 5.2 4.3 6.4 0.3 11.8-4.3 11.3-6.8z',
    powiatyExamples: ['Opole', 'opolski', 'kędzierzyńsko-kozielski', 'nyski', 'brzeski', 'kluczborski', 'prudnicki', 'krapkowicki'],
    administrativePowiaty: [
      { terytCode: '1661', name: 'Opole', type: 'miasto na prawach powiatu', capital: 'Opole' },
      { terytCode: '1609', name: 'opolski', type: 'powiat ziemski', capital: 'Opole' },
      { terytCode: '1603', name: 'kędzierzyńsko-kozielski', type: 'powiat ziemski', capital: 'Kędzierzyn-Koźle' },
      { terytCode: '1607', name: 'nyski', type: 'powiat ziemski', capital: 'Nysa' },
      { terytCode: '1601', name: 'brzeski', type: 'powiat ziemski', capital: 'Brzeg' },
      { terytCode: '1604', name: 'kluczborski', type: 'powiat ziemski', capital: 'Kluczbork' },
      { terytCode: '1610', name: 'prudnicki', type: 'powiat ziemski', capital: 'Prudnik' },
      { terytCode: '1605', name: 'krapkowicki', type: 'powiat ziemski', capital: 'Krapkowice' },
      { terytCode: '1611', name: 'strzelecki', type: 'powiat ziemski', capital: 'Strzelce Opolskie' },
      { terytCode: '1608', name: 'oleski', type: 'powiat ziemski', capital: 'Olesno' },
      { terytCode: '1606', name: 'namysłowski', type: 'powiat ziemski', capital: 'Namysłów' },
      { terytCode: '1602', name: 'głubczycki', type: 'powiat ziemski', capital: 'Głubczyce' }
    ]
  },
  {
    id: 'slaskie',
    name: 'Śląskie',
    code: 'SL',
    teryt: '24',
    capital: 'Katowice',
    labelX: 486,
    labelY: 759,
    path: 'M561.5 666.9l8.5 1.6 1.2 0.7 0.4 1.8 0 1.9-0.5 1.3-6.8 1.1-3.7 7.1 2.7 3.3 7.5 2.1 3.5 2.7 2.7 6.2 4.8 5.8-4 0.6-6.9 5.8-2 4.3 3.5 1.8 6.8 1 2.8 1.1 0.6 3.4 0.3 2.8-12.6 8-3.2 0.5-5.5-0.5-5.5 0.9-8.8 6.8-2.6 0.6-2.5 0-5.5-3.2-2.7 4-2.8 5.6-4.3 6.2-6.7-0.9-3.1 2.4 5.3 5.3 4.6 6.4-23.6 26.6-2.2 3.3-2.2 4.5-1.1 5.2 2 2.6 2.6 0.3 2.2 2.7 0.2 5.2 3 5.3 5 2 2.1 3.7 1.5 4.8 3.2 3 3.7 1.7 6.8 1.2-0.4 4-1.7 3.5-0.8 3.2 1.2 2.8 2.4 1.6 0.5 1.7-1.1 0.1-0.4 0.7-8.6 9.6-0.8 0.6-2.4 0.8-3.1-0.1-1.9 0.5-1.6 0.8-1.5 1.3-1.3 2.2-1.6 5 0.7 1.4-0.7 1.3-1.5 0.1-0.7 3-0.3 1.9-0.7 1.2-3.1 1.3-2.5 0.5-1-0.1-3-1.9-0.9-0.4-2.1 0.6-3.9 2.2-2.5 0.2-2-0.4-0.5-1.7 0.4-5-0.3-2.3-0.4-2.1-0.1-2.2 0.8-2.5-2.9-1.8-9.8-0.9 0.4-2.6-0.3-3.2-1.4-6.5-1.6-4.1-0.5-1.5-0.7-5.3-0.4-1.2-1.5-1.1-1.5 0.3-1.6 0.7-1.4 0.1-1.3-0.8-1.9-2.3-1.3-1-1.5-0.5-3-0.2-1.4-1-0.6-1.1-1-4.5-2.3-4.9-1.8-4.7 0-4.1 2.7-3.2-2.6-1.4-0.4-1.9 0.2-2.4-0.6-2.8-1.5-0.9-3.9 2.5-2.3 0-7.4-4.1-3.9-1.3-3.6 0.5 0.3 0.5-2.8 2.4-1.5 0.3-2-1.6-0.5-1.1-1.1-3.2-1.2-0.9-2.3-0.5-1.2-0.5-3.2-2.7-1.5-0.9-6.3-1.2-1.3-1.5 0.6-2.8-5.8-3.9-1.4-0.3 0.1-2.6 6-11.6 12.5-2.7 6-4.5 9.6-4.5 1.1-4.6 0.1-7.9-1.7-20.1 0.9-3.2 2.1-0.4 2.2-1 0.2-2.9-1.1-2.7 1.3-3.5 3-0.7 14.4 0.1-1.1-5.7-3.2-3.4-3.2-2.5-2.7-3.6-1.9-5.9 2.4-6.5 1.8-9.8 2.6-5.6 7.8-5.1 0.7-5.6-1.3-2.9-0.6-3.6 0.7-2.4 1.3-1.5 3.4-12.2 5-2.4 14.1-0.5 3.2-1.5 3.2-2.2 3.5 0.7 3 3.1 13.1 7 6.4 1.4 8-0.1 3.4-3 6.7 1.3 6 5.5 9.3 14.9 3.4 1 9.9-0.5 10.9 5.5z',
    powiatyExamples: ['Katowice', 'Częstochowa', 'Sosnowiec', 'Gliwice', 'Zabrze', 'Bielsko-Biała', 'Bytom', 'Rybnik', 'Ruda Śląska', 'Tychy', 'Dąbrowa Górnicza', 'cieszyński'],
    administrativePowiaty: [
      { terytCode: '2469', name: 'Katowice', type: 'miasto na prawach powiatu', capital: 'Katowice' },
      { terytCode: '2464', name: 'Częstochowa', type: 'miasto na prawach powiatu', capital: 'Częstochowa' },
      { terytCode: '2475', name: 'Sosnowiec', type: 'miasto na prawach powiatu', capital: 'Sosnowiec' },
      { terytCode: '2466', name: 'Gliwice', type: 'miasto na prawach powiatu', capital: 'Gliwice' },
      { terytCode: '2478', name: 'Zabrze', type: 'miasto na prawach powiatu', capital: 'Zabrze' },
      { terytCode: '2461', name: 'Bielsko-Biała', type: 'miasto na prawach powiatu', capital: 'Bielsko-Biała' },
      { terytCode: '2462', name: 'Bytom', type: 'miasto na prawach powiatu', capital: 'Bytom' },
      { terytCode: '2473', name: 'Rybnik', type: 'miasto na prawach powiatu', capital: 'Rybnik' },
      { terytCode: '2472', name: 'Ruda Śląska', type: 'miasto na prawach powiatu', capital: 'Ruda Śląska' },
      { terytCode: '2477', name: 'Tychy', type: 'miasto na prawach powiatu', capital: 'Tychy' },
      { terytCode: '2465', name: 'Dąbrowa Górnicza', type: 'miasto na prawach powiatu', capital: 'Dąbrowa Górnicza' },
      { terytCode: '2463', name: 'Chorzów', type: 'miasto na prawach powiatu', capital: 'Chorzów' },
      { terytCode: '2467', name: 'Jastrzębie-Zdrój', type: 'miasto na prawach powiatu', capital: 'Jastrzębie-Zdrój' },
      { terytCode: '2468', name: 'Jaworzno', type: 'miasto na prawach powiatu', capital: 'Jaworzno' },
      { terytCode: '2470', name: 'Mysłowice', type: 'miasto na prawach powiatu', capital: 'Mysłowice' },
      { terytCode: '2471', name: 'Piekary Śląskie', type: 'miasto na prawach powiatu', capital: 'Piekary Śląskie' },
      { terytCode: '2474', name: 'Siemianowice Śląskie', type: 'miasto na prawach powiatu', capital: 'Siemianowice Śląskie' },
      { terytCode: '2476', name: 'Świętochłowice', type: 'miasto na prawach powiatu', capital: 'Świętochłowice' },
      { terytCode: '2479', name: 'Żory', type: 'miasto na prawach powiatu', capital: 'Żory' },
      { terytCode: '2403', name: 'cieszyński', type: 'powiat ziemski', capital: 'Cieszyn' },
      { terytCode: '2402', name: 'bielski', type: 'powiat ziemski', capital: 'Bielsko-Biała' },
      { terytCode: '2405', name: 'gliwicki', type: 'powiat ziemski', capital: 'Gliwice' },
      { terytCode: '2414', name: 'tarnogórski', type: 'powiat ziemski', capital: 'Tarnowskie Góry' },
      { terytCode: '2417', name: 'żywiecki', type: 'powiat ziemski', capital: 'Żywiec' },
      { terytCode: '2410', name: 'pszczyński', type: 'powiat ziemski', capital: 'Pszczyna' },
      { terytCode: '2415', name: 'wodzisławski', type: 'powiat ziemski', capital: 'Wodzisław Śląski' },
      { terytCode: '2401', name: 'będziński', type: 'powiat ziemski', capital: 'Będzin' },
      { terytCode: '2416', name: 'zawierciański', type: 'powiat ziemski', capital: 'Zawiercie' },
      { terytCode: '2404', name: 'częstochowski', type: 'powiat ziemski', capital: 'Częstochowa' }
    ]
  },
  {
    id: 'swietokrzyskie',
    name: 'Świętokrzyskie',
    code: 'SK',
    teryt: '26',
    capital: 'Kielce',
    labelX: 665,
    labelY: 678,
    path: 'M767.1 627.2l0.4 2.2-1.2 1.6-1.5 0.5 0 1.1 1.8 1.4 0.3 3.1-0.7 6.8-0.7 1.3 0.1 1.9 1 0.7 0.4 2 2.5 9.7 0.5 3.4 0.3 2.1 0.1 5.8-0.8 6.2-0.7 2.5-1.2 2.8-1.5 2.4-1.8 0.9-2.6 0.4-1.7 1.3-2.8 4.8-4.8 5.6-0.7 2.4-0.5 3.1-1.2 2.4-3.1 3.7-1.8 1.6-6.4 1.6-9.5 4.3 1.3 3.2-1.9 2-2.5 1.5-2.5 0.5-1.9-0.8-6.1 5.3-0.4 0.2-1.8 0.2 0.1 1.9-1.2 0.8-0.6 0-1-0.8-0.5 2.2-1.2 1.1-1.1 0.6-0.6 0.8-0.1 1.3-1.6 0.9-1.7 2.4-1.8 0.7-1.9-2.1-1.4-0.5-1 0.2-4.1 2-3 2.8-1.5 0.4-7.4 0.2-1 0.4-1.8 2-1 0.6-2.7 0.2-1.3 0.9-1.6-1-1.3 0.9-1.4 1.4-1.6 0.8-3.8-3.7-0.7 1-0.6 2.7-2.1 2.1-1.2 0.2-0.8 1.1-0.4 2.5-1.4 1.3-3.2 1.6-1.2 1.9-0.4 1.7-3 3.1-13.1-0.3-7.3-4.4-1.9-4-4.5-6.4-1.7-3.6-1.7-7.2-4.5-9-7.7-5.2-8.4-2.6-3.3-3.5-3.9-2.1-9.4-0.1-2.8-1.1-6.8-1-3.5-1.8 2-4.3 6.9-5.8 4-0.6-4.8-5.8-2.7-6.2-3.5-2.7-7.5-2.1-2.7-3.3 3.7-7.1 6.8-1.1 0.5-1.3 0-1.9-0.4-1.8-1.2-0.7-8.5-1.6 2.3-3.9 2.9-2.7 3.4-2.3 1.7-4.8-0.4-4.9 0.1-5.1 1.3-5.1 3.5-0.6 13.1 9.6 2.3-2.7 0.8-5.1-1-5.3-3.1-2.5-4.5-6.9 2.5-9.6 2.4-3.2 3.1-1.2 11 1.6 3.2-0.9 6.9-6.6 3.2-1.6 3.3-0.5 3.3-1.5 3.7-9.1 2.8-2.1 5.5 2 3 7.5 16.4 10.1 2.3 2.6 2.1 3.4 2.6 1.9 12 2.5 13.9-2.2 3.3-1.9 2.9-4 3.1-3 3 1 0.9 5.4 3 3.3 0.4 2.7 0.6 2.4 6.8 4.4 7.7 0.7 16.5 5.2 31.8-6.7z',
    powiatyExamples: ['Kielce', 'kielecki', 'ostrowiecki', 'starachowicki', 'skarżyski', 'sandomierski', 'konecki', 'buski'],
    administrativePowiaty: [
      { terytCode: '2661', name: 'Kielce', type: 'miasto na prawach powiatu', capital: 'Kielce' },
      { terytCode: '2604', name: 'kielecki', type: 'powiat ziemski', capital: 'Kielce' },
      { terytCode: '2607', name: 'ostrowiecki', type: 'powiat ziemski', capital: 'Ostrowiec Świętokrzyski' },
      { terytCode: '2611', name: 'starachowicki', type: 'powiat ziemski', capital: 'Starachowice' },
      { terytCode: '2610', name: 'skarżyski', type: 'powiat ziemski', capital: 'Skarżysko-Kamienna' },
      { terytCode: '2609', name: 'sandomierski', type: 'powiat ziemski', capital: 'Sandomierz' },
      { terytCode: '2605', name: 'konecki', type: 'powiat ziemski', capital: 'Końskie' },
      { terytCode: '2601', name: 'buski', type: 'powiat ziemski', capital: 'Busko-Zdrój' },
      { terytCode: '2602', name: 'jędrzejowski', type: 'powiat ziemski', capital: 'Jędrzejów' },
      { terytCode: '2612', name: 'staszowski', type: 'powiat ziemski', capital: 'Staszów' },
      { terytCode: '2608', name: 'pińczowski', type: 'powiat ziemski', capital: 'Pińczów' },
      { terytCode: '2613', name: 'włoszczowski', type: 'powiat ziemski', capital: 'Włoszczowa' },
      { terytCode: '2606', name: 'opatowski', type: 'powiat ziemski', capital: 'Opatów' },
      { terytCode: '2603', name: 'kazimierski', type: 'powiat ziemski', capital: 'Kazimierza Wielka' }
    ]
  },
  {
    id: 'malopolskie',
    name: 'Małopolskie',
    code: 'MA',
    teryt: '12',
    capital: 'Kraków',
    labelX: 618,
    labelY: 818,
    path: 'M715.3 728.7l-1.1 13.1-3 7.4-3.7 6.4-0.7 8.8 2.7 23.4-0.8 6.9-0.1 6 0.9 1.7 0.8 2.2 2.1 2.5 2.9 0.2 3.7 2 1.3 4.5-9.9 7.6-1.7 3.9 3 2.7 10.7 4.6 6 6.5 3.4 10.7 0.4 5.4-0.6 5.4 1.8 11.2 3.8 10.6-1.9 0.8-1.4-0.4-3.7 0.8-1.7 0-9.7-2.8-5.6-3-1.3-0.3-1.8 1.3-3.1 4.6-1.8 1.6-2.1 0.3-1.5-1-1.4-1.6-1.8-1.2-1.6-0.2-4 0.8-1.6 0.8-2 2.2 1.2 1.4 2.3 1.4 1.3 2.3-0.9 1.4-1.8 0.4-2.1 0-1.6 0.4-2 2-3.3 4.7-2.1 1.9-2.4 0.9-1.8-0.4-1.6-1.2-1.6-1.7-1.9-1.4-1.6-0.2-1.7 0.1-2.2-0.3-1.6-1.2-8.8-10.6-1.6-0.3-3.7 0.6-3.1-0.2-1 0.6-1.6 1.9-1.1 1.1-2.4 0.8-2.2-0.5-8.4-4.3-1.6 0.4 0.1 2.6-5.2 0.2-4.1-1.6-1.2 0.1-1 0.7-0.3 1-0.8 3.6-0.7 2.1-0.5 0.7-7.7 0.7-1.5 0.8-2.1 2.6-1 0.9-2.2-0.2-0.8 0.5-1.9 4.3-1.3 3.5-1.2 1.5-0.6 5.3-1 3.8-2 1.5-3.3-1.6-5.1-4.8-2.8-1.5-3.2 0.4-1.8 1.3-3.3 3.5-2.2 0.8-4.6-0.3-2.5-1-1.3-1.7 0.4-2.1 3.8-6.1 1.6-0.9 0.1-1.5-1-1.3-1.4-1-0.3-1.2 0.9-1.7-0.5-7.4-0.6-2.6-0.9-2.9-0.9-0.7-3.3 1.4-2 0.2-2.2-0.2-5.7-2 0.2-1.9-0.1-2.3 0.6-1.8-4-0.1-2-0.5-1.7-1.4-0.6-1.1-1.6-4.8-1.8-7.8-1.2-3.1-2.3-1.5-0.8-0.8-1.6-3-0.9-0.4-0.5-1.7-2.4-1.6-1.2-2.8 0.8-3.2 1.7-3.5 0.4-4-6.8-1.2-3.7-1.7-3.2-3-1.5-4.8-2.1-3.7-5-2-3-5.3-0.2-5.2-2.2-2.7-2.6-0.3-2-2.6 1.1-5.2 2.2-4.5 2.2-3.3 23.6-26.6-4.6-6.4-5.3-5.3 3.1-2.4 6.7 0.9 4.3-6.2 2.8-5.6 2.7-4 5.5 3.2 2.5 0 2.6-0.6 8.8-6.8 5.5-0.9 5.5 0.5 3.2-0.5 12.6-8-0.3-2.8-0.6-3.4 9.4 0.1 3.9 2.1 3.3 3.5 8.4 2.6 7.7 5.2 4.5 9 1.7 7.2 1.7 3.6 4.5 6.4 1.9 4 7.3 4.4 13.1 0.3 3-3.1 0.4-1.7 1.2-1.9 3.2-1.6 1.4-1.3 0.4-2.5 0.8-1.1 1.2-0.2 2.1-2.1 0.6-2.7 0.7-1 3.8 3.7 1.6-0.8 1.4-1.4 1.3-0.9 1.6 1 1.3-0.9 2.7-0.2 1-0.6 1.8-2 1-0.4 7.4-0.2 1.5-0.4 3-2.8 4.1-2 1-0.2 1.4 0.5 1.9 2.1 1.8-0.7 1.7-2.4 1.6-0.9 0.1-1.3 0.6-0.8 1.1-0.6 1.2-1.1 0.5-2.2 1 0.8 0.6 0 1.2-0.8-0.1-1.9 1.8-0.2z',
    powiatyExamples: ['Kraków', 'krakowski', 'Tarnów', 'Nowy Sącz', 'oświęcimski', 'wielicki', 'nowotarski', 'chrzanowski', 'myślenicki', 'tatrzański'],
    administrativePowiaty: [
      { terytCode: '1261', name: 'Kraków', type: 'miasto na prawach powiatu', capital: 'Kraków' },
      { terytCode: '1263', name: 'Tarnów', type: 'miasto na prawach powiatu', capital: 'Tarnów' },
      { terytCode: '1262', name: 'Nowy Sącz', type: 'miasto na prawach powiatu', capital: 'Nowy Sącz' },
      { terytCode: '1206', name: 'krakowski', type: 'powiat ziemski', capital: 'Kraków' },
      { terytCode: '1213', name: 'oświęcimski', type: 'powiat ziemski', capital: 'Oświęcim' },
      { terytCode: '1219', name: 'wielicki', type: 'powiat ziemski', capital: 'Wieliczka' },
      { terytCode: '1211', name: 'nowotarski', type: 'powiat ziemski', capital: 'Nowy Targ' },
      { terytCode: '1203', name: 'chrzanowski', type: 'powiat ziemski', capital: 'Chrzanów' },
      { terytCode: '1209', name: 'myślenicki', type: 'powiat ziemski', capital: 'Myślenice' },
      { terytCode: '1217', name: 'tatrzański', type: 'powiat ziemski', capital: 'Zakopane' },
      { terytCode: '1210', name: 'nowosądecki', type: 'powiat ziemski', capital: 'Nowy Sącz' },
      { terytCode: '1216', name: 'tarnowski', type: 'powiat ziemski', capital: 'Tarnów' },
      { terytCode: '1218', name: 'wadowicki', type: 'powiat ziemski', capital: 'Wadowice' },
      { terytCode: '1201', name: 'bocheński', type: 'powiat ziemski', capital: 'Bochnia' },
      { terytCode: '1202', name: 'brzeski', type: 'powiat ziemski', capital: 'Brzesko' },
      { terytCode: '1212', name: 'olkuski', type: 'powiat ziemski', capital: 'Olkusz' },
      { terytCode: '1205', name: 'gorlicki', type: 'powiat ziemski', capital: 'Gorlice' },
      { terytCode: '1207', name: 'limanowski', type: 'powiat ziemski', capital: 'Limanowa' },
      { terytCode: '1214', name: 'proszowicki', type: 'powiat ziemski', capital: 'Proszowice' },
      { terytCode: '1208', name: 'miechowski', type: 'powiat ziemski', capital: 'Miechów' },
      { terytCode: '1204', name: 'dąbrowski', type: 'powiat ziemski', capital: 'Dąbrowa Tarnowska' },
      { terytCode: '1215', name: 'suski', type: 'powiat ziemski', capital: 'Sucha Beskidzka' }
    ]
  },
  {
    id: 'podkarpackie',
    name: 'Podkarpackie',
    code: 'PK',
    teryt: '18',
    capital: 'Rzeszów',
    labelX: 829,
    labelY: 805,
    path: 'M950.7 741.8l-1.4 2.2-7.9 8.6-2.9 2.3-9.9 7.7-22.8 24.8-3 4.6-3.6 2.9-4 4.4-10.8 15.9-4.1 4.3-0.6 1.2-0.8 3.2-0.4 1.1-0.9 0.8-1.8 0.7-0.8 0.6-1 1.2-6.1 11.1-1.7 1.7-1.1 0.5-2.1 0.4-1.2 1-0.7 1.3-1.7 4.9-7.6 10.2-2.4 5.9 1.9 5.5 0.6 2.3 0.7 6.5 0.6 2.6 1.3 2 2.2 2.3 0.5 1.2 0.5 2.4 1.3 14-0.4 2.3-1.6 4.6-1.5 5.4-1.5 3.3-0.6 1.9 1.1 0.5 1.3-1.7 1.1 1.3 3.2 2.2 2.9 3.9 1.9 1.4 4.4 2.5 1.2 1.5 0 1.3-0.9 3-0.1 2 0.4 1.5 2 3.6-1.2 2.4-2-0.9-2.2-2-2.9-1.3-1.8-2.5-1-1-1.1-0.1-2.3 0.7-3.6-0.3-2.1 0.2-2.1-0.3-2.5-1.6-3.7-4.2-2-0.6-2.1 2-3.5-1.7-7.8-0.3-3.6-1.2-5.1-5-2.1-0.9-5.5 0.2-4.7-1.4-0.7-0.6-0.2-1 0.2-2.1-1.1-1.2-0.8-0.1-2.4 0.3-2.1-0.6-3.3-2.1-7-1.4-2.8-2-0.7-4.9-1.3-5.4-2.8-4.6-3.6-3.4-5.4-2.7-3.6-3.4-1.8-1-2.1 0.3-1.7 1.6-1.4 1.7-1 0.7-1.6-1.2-3.3-5.2-1.7-1.7-1-0.3-1.5 0.3-1.8-0.8-1.8-1.8-1-0.7-1.9-0.5-7.1 0.8-1.5 0.6-3.8-10.6-1.8-11.2 0.6-5.4-0.4-5.4-3.4-10.7-6-6.5-10.7-4.6-3-2.7 1.7-3.9 9.9-7.6-1.3-4.5-3.7-2-2.9-0.2-2.1-2.5-0.8-2.2-0.9-1.7 0.1-6 0.8-6.9-2.7-23.4 0.7-8.8 3.7-6.4 3-7.4 1.1-13.1 0.4-0.2 6.1-5.3 1.9 0.8 2.5-0.5 2.5-1.5 1.9-2-1.3-3.2 9.5-4.3 6.4-1.6 1.8-1.6 3.1-3.7 1.2-2.4 0.5-3.1 0.7-2.4 4.8-5.6 2.8-4.8 1.7-1.3 2.6-0.4 1.8-0.9 1.5-2.4 1.2-2.8 0.7-2.5 0.8-6.2-0.1-5.8-0.3-2.1 13.2 8.9 7.4 0.4 6.6-4.6 3.9-0.2 3.9 1.5 3.5 2.2 3.2 2.8-1.4 4-4.6 8.5 1.9 3.3 23.2 5.9 15.7 8.4 0.9 1.5-0.1 2.1 0.3 2.2 2.3 4.4 1.2 3.8-2.8 1.6-3.1-0.4-3.1 1-2.5 3.3-1.6 3.3 0.7 3.9 2.6 4 3.5 1.6 13.9-2.8 2.6 1.9-1.5 0.9-3.4 0.8 1 2.3 13.6 3.9 22.4 0.7 7.5-1.6 6.5-5.2 8.2-9.3 2.6-1.2 5.7-0.5 7.3 0.8 6.3 4 3.2 4.9 10 5.9z',
    powiatyExamples: ['Rzeszów', 'rzeszowski', 'Przemyśl', 'Tarnobrzeg', 'Krosno', 'mielecki', 'stalowowolski', 'jasielski', 'dębicki', 'sanocki'],
    administrativePowiaty: [
      { terytCode: '1863', name: 'Rzeszów', type: 'miasto na prawach powiatu', capital: 'Rzeszów' },
      { terytCode: '1862', name: 'Przemyśl', type: 'miasto na prawach powiatu', capital: 'Przemyśl' },
      { terytCode: '1864', name: 'Tarnobrzeg', type: 'miasto na prawach powiatu', capital: 'Tarnobrzeg' },
      { terytCode: '1861', name: 'Krosno', type: 'miasto na prawach powiatu', capital: 'Krosno' },
      { terytCode: '1816', name: 'rzeszowski', type: 'powiat ziemski', capital: 'Rzeszów' },
      { terytCode: '1811', name: 'mielecki', type: 'powiat ziemski', capital: 'Mielec' },
      { terytCode: '1818', name: 'stalowowolski', type: 'powiat ziemski', capital: 'Stalowa Wola' },
      { terytCode: '1805', name: 'jasielski', type: 'powiat ziemski', capital: 'Jasło' },
      { terytCode: '1803', name: 'dębicki', type: 'powiat ziemski', capital: 'Dębica' },
      { terytCode: '1817', name: 'sanocki', type: 'powiat ziemski', capital: 'Sanok' },
      { terytCode: '1807', name: 'krośnieński', type: 'powiat ziemski', capital: 'Krosno' },
      { terytCode: '1804', name: 'jarosławski', type: 'powiat ziemski', capital: 'Jarosław' },
      { terytCode: '1813', name: 'przemyski', type: 'powiat ziemski', capital: 'Przemyśl' },
      { terytCode: '1819', name: 'strzyżowski', type: 'powiat ziemski', capital: 'Strzyżów' },
      { terytCode: '1814', name: 'przeworski', type: 'powiat ziemski', capital: 'Przeworsk' },
      { terytCode: '1808', name: 'leski', type: 'powiat ziemski', capital: 'Lesko' },
      { terytCode: '1801', name: 'bieszczadzki', type: 'powiat ziemski', capital: 'Ustrzyki Dolne' },
      { terytCode: '1802', name: 'brzozowski', type: 'powiat ziemski', capital: 'Brzozów' },
      { terytCode: '1806', name: 'kolbuszowski', type: 'powiat ziemski', capital: 'Kolbuszowa' },
      { terytCode: '1809', name: 'leżajski', type: 'powiat ziemski', capital: 'Leżajsk' },
      { terytCode: '1810', name: 'lubaczowski', type: 'powiat ziemski', capital: 'Lubaczów' },
      { terytCode: '1812', name: 'niżański', type: 'powiat ziemski', capital: 'Nisko' },
      { terytCode: '1815', name: 'ropczycko-sędziszowski', type: 'powiat ziemski', capital: 'Ropczyce' },
      { terytCode: '1820', name: 'tarnobrzeski', type: 'powiat ziemski', capital: 'Tarnobrzeg' }
    ]
  }
];

// Helper to normalize voivodeship names from user input or excel
export function normalizeVoivodeshipName(input: string | undefined | null): string {
  if (!input) return 'Nieokreślone';
  const clean = input.toLowerCase().trim()
    .replace(/województwo\s*/gi, '')
    .replace(/wojewodztwo\s*/gi, '')
    .replace(/woj\.\s*/gi, '')
    .replace(/woj\s*/gi, '');

  if (clean.includes('mazow')) return 'Mazowieckie';
  if (clean.includes('wielkop')) return 'Wielkopolskie';
  if (clean.includes('małop') || clean.includes('malop')) return 'Małopolskie';
  if (clean.includes('śląsk') || clean.includes('slask')) return 'Śląskie';
  if (clean.includes('dolnośl') || clean.includes('dolnosl')) return 'Dolnośląskie';
  if (clean.includes('pomor') && !clean.includes('kujaw') && !clean.includes('zachod')) return 'Pomorskie';
  if (clean.includes('kujaw')) return 'Kujawsko-Pomorskie';
  if (clean.includes('zachod')) return 'Zachodniopomorskie';
  if (clean.includes('łódz') || clean.includes('lodz')) return 'Łódzkie';
  if (clean.includes('lubel')) return 'Lubelskie';
  if (clean.includes('lubus')) return 'Lubuskie';
  if (clean.includes('podkar')) return 'Podkarpackie';
  if (clean.includes('podlas')) return 'Podlaskie';
  if (clean.includes('święto') || clean.includes('swieto')) return 'Świętokrzyskie';
  if (clean.includes('opol')) return 'Opolskie';
  if (clean.includes('warmi') || clean.includes('mazur')) return 'Warmińsko-Mazurskie';

  return input.trim();
}

// Geographic coordinates for Poland, Voivodeships, and County Seats (Powiaty)

export const POLAND_MAP_CENTER = {
  lat: 52.0693,
  lng: 19.4803,
  zoom: 6.5
};

export const VOIVODESHIP_COORDINATES: Record<string, { lat: number; lng: number; zoom: number; capital: string }> = {
  'pomorskie': { lat: 54.352, lng: 18.646, zoom: 8.2, capital: 'Gdańsk' },
  'zachodniopomorskie': { lat: 53.428, lng: 14.552, zoom: 8.0, capital: 'Szczecin' },
  'warminsko-mazurskie': { lat: 53.778, lng: 20.480, zoom: 8.0, capital: 'Olsztyn' },
  'podlaskie': { lat: 53.132, lng: 23.168, zoom: 8.0, capital: 'Białystok' },
  'kujawsko-pomorskie': { lat: 53.123, lng: 18.008, zoom: 8.3, capital: 'Bydgoszcz' },
  'wielkopolskie': { lat: 52.406, lng: 16.925, zoom: 8.0, capital: 'Poznań' },
  'lubuskie': { lat: 51.935, lng: 15.506, zoom: 8.2, capital: 'Zielona Góra' },
  'dolnoslaskie': { lat: 51.107, lng: 17.038, zoom: 8.2, capital: 'Wrocław' },
  'opolskie': { lat: 50.675, lng: 17.921, zoom: 8.6, capital: 'Opole' },
  'slaskie': { lat: 50.264, lng: 19.023, zoom: 8.5, capital: 'Katowice' },
  'malopolskie': { lat: 50.064, lng: 19.945, zoom: 8.4, capital: 'Kraków' },
  'podkarpackie': { lat: 50.041, lng: 21.999, zoom: 8.2, capital: 'Rzeszów' },
  'swietokrzyskie': { lat: 50.866, lng: 20.628, zoom: 8.4, capital: 'Kielce' },
  'lubelskie': { lat: 51.246, lng: 22.568, zoom: 8.0, capital: 'Lublin' },
  'mazowieckie': { lat: 52.229, lng: 21.012, zoom: 7.7, capital: 'Warszawa' },
  'lodzkie': { lat: 51.759, lng: 19.456, zoom: 8.4, capital: 'Łódź' },
};

// Known coordinates for major powiat seats and cities in Poland
export const POWIAT_SEATS_COORDS: Record<string, { lat: number; lng: number }> = {
  // Mazowieckie
  'warszawa': { lat: 52.2297, lng: 21.0122 },
  'radom': { lat: 51.4027, lng: 21.1471 },
  'płock': { lat: 52.5463, lng: 19.7065 },
  'siedlce': { lat: 52.1674, lng: 22.2902 },
  'ostrołęka': { lat: 53.0841, lng: 21.5746 },
  'piaseczno': { lat: 52.0734, lng: 21.0264 },
  'pruszków': { lat: 52.1706, lng: 20.8122 },
  'legionowo': { lat: 52.4007, lng: 20.9332 },
  'wołomin': { lat: 52.3481, lng: 21.2427 },
  'otwock': { lat: 52.1065, lng: 21.2612 },
  'mińsk mazowiecki': { lat: 52.1793, lng: 21.5724 },
  'grodzisk mazowiecki': { lat: 52.1039, lng: 20.6308 },
  'nowy dwór mazowiecki': { lat: 52.4304, lng: 20.7176 },
  'ciechanów': { lat: 52.8809, lng: 20.6186 },
  'sochaczew': { lat: 52.2291, lng: 20.2384 },
  'żyrardów': { lat: 52.0573, lng: 20.4449 },
  'mława': { lat: 53.1132, lng: 20.3828 },
  'płońsk': { lat: 52.6247, lng: 20.3752 },
  'wyszków': { lat: 52.5937, lng: 21.4588 },
  'ostrów mazowiecka': { lat: 52.8028, lng: 21.8953 },
  'garwolin': { lat: 51.8973, lng: 21.6147 },
  'kozienice': { lat: 51.5843, lng: 21.5478 },
  'grójec': { lat: 51.8643, lng: 20.8674 },
  'pułtusk': { lat: 52.7042, lng: 21.0825 },
  'sierpc': { lat: 52.8552, lng: 19.6644 },
  'szydłowiec': { lat: 51.2299, lng: 20.8576 },
  'przasnysz': { lat: 53.0213, lng: 20.8814 },
  'węgrów': { lat: 52.3995, lng: 22.0163 },
  'gostynin': { lat: 52.4287, lng: 19.4616 },
  'lipsko': { lat: 51.1594, lng: 21.6548 },
  'maków mazowiecki': { lat: 52.8649, lng: 21.1005 },
  'przysucha': { lat: 51.3571, lng: 20.6272 },
  'sokołów podlaski': { lat: 52.4061, lng: 22.2536 },
  'żuromin': { lat: 53.0649, lng: 19.9094 },
  'zwoleń': { lat: 51.3563, lng: 21.5878 },
  'białobrzegi': { lat: 51.6496, lng: 20.9507 },
  'łosice': { lat: 52.2131, lng: 22.7171 },

  // Wielkopolskie
  'poznań': { lat: 52.4064, lng: 16.9252 },
  'kalisz': { lat: 51.7673, lng: 18.0853 },
  'konin': { lat: 52.2234, lng: 18.2512 },
  'leszno': { lat: 51.8403, lng: 16.5749 },
  'piła': { lat: 53.1514, lng: 16.7382 },
  'gniezno': { lat: 52.5348, lng: 17.5826 },
  'ostrów wielkopolski': { lat: 51.6550, lng: 17.8068 },
  'szamotuły': { lat: 52.6121, lng: 16.5786 },
  'krotoszyn': { lat: 51.6983, lng: 17.4374 },
  'jarocin': { lat: 51.9727, lng: 17.5026 },
  'września': { lat: 52.3251, lng: 17.5645 },
  'śrem': { lat: 52.0886, lng: 17.0152 },
  'turek': { lat: 52.0156, lng: 18.5009 },
  'kolo': { lat: 52.2008, lng: 18.6386 },
  'koło': { lat: 52.2008, lng: 18.6386 },
  'wągrowiec': { lat: 52.8081, lng: 17.2002 },
  'kępno': { lat: 51.2785, lng: 17.9877 },
  'rawicz': { lat: 51.6094, lng: 16.8582 },
  'gostyń': { lat: 51.8792, lng: 17.0125 },
  'złotów': { lat: 53.3619, lng: 17.0416 },
  'oborniki': { lat: 52.6469, lng: 16.8152 },
  'pleszew': { lat: 51.8962, lng: 17.7858 },
  'nowy tomyśl': { lat: 52.3168, lng: 16.1317 },
  'chodzież': { lat: 52.9912, lng: 16.9157 },
  'czarnków': { lat: 52.9022, lng: 16.5641 },
  'wolsztyn': { lat: 52.1154, lng: 16.1171 },
  'słupca': { lat: 52.2908, lng: 17.8718 },
  'grodzisk wielkopolski': { lat: 52.2274, lng: 16.3653 },
  'ostrzeszów': { lat: 51.4286, lng: 17.9261 },
  'międzychód': { lat: 52.5997, lng: 15.8943 },

  // Małopolskie
  'kraków': { lat: 50.0647, lng: 19.9450 },
  'tarnów': { lat: 50.0121, lng: 20.9858 },
  'nowy sącz': { lat: 49.6249, lng: 20.6974 },
  'oświęcim': { lat: 50.0344, lng: 19.2098 },
  'nowy targ': { lat: 49.4844, lng: 20.0323 },
  'chrzanów': { lat: 50.1372, lng: 19.4031 },
  'bochnia': { lat: 49.9685, lng: 20.4304 },
  'olkusz': { lat: 50.2801, lng: 19.5639 },
  'gorlice': { lat: 49.6549, lng: 21.1601 },
  'zakopane': { lat: 49.2992, lng: 19.9496 },
  'wadowice': { lat: 49.8833, lng: 19.4925 },
  'wieliczka': { lat: 49.9871, lng: 20.0647 },
  'myślenice': { lat: 49.8329, lng: 19.9416 },
  'limanowa': { lat: 49.7067, lng: 20.4241 },
  'brzesko': { lat: 49.9691, lng: 20.6053 },
  'sucha beskidzka': { lat: 49.7423, lng: 19.5938 },
  'miechów': { lat: 50.3578, lng: 20.0264 },
  'dąbrowa tarnowska': { lat: 50.1747, lng: 20.9859 },
  'proszowice': { lat: 50.1923, lng: 20.2929 },

  // Śląskie
  'katowice': { lat: 50.2649, lng: 19.0238 },
  'częstochowa': { lat: 50.8118, lng: 19.1203 },
  'sosnowiec': { lat: 50.2863, lng: 19.1041 },
  'gliwice': { lat: 50.2945, lng: 18.6714 },
  'zabrze': { lat: 50.3249, lng: 18.7857 },
  'bielsko-biała': { lat: 49.8224, lng: 19.0444 },
  'bytom': { lat: 50.3482, lng: 18.9328 },
  'ruda śląska': { lat: 50.2584, lng: 18.8559 },
  'rybnik': { lat: 50.0971, lng: 18.5418 },
  'tychy': { lat: 50.1261, lng: 18.9868 },
  'dąbrowa górnicza': { lat: 50.3204, lng: 19.1944 },
  'chorzów': { lat: 50.2975, lng: 18.9546 },
  'jaworzno': { lat: 50.2046, lng: 19.2745 },
  'jastrzębie-zdrój': { lat: 49.9511, lng: 18.5794 },
  'mysłowice': { lat: 50.2415, lng: 19.1396 },
  'siemianowice śląskie': { lat: 50.3005, lng: 19.0292 },
  'żory': { lat: 50.0463, lng: 18.6947 },
  'tarnowskie góry': { lat: 50.4439, lng: 18.8557 },
  'będzin': { lat: 50.3263, lng: 19.1278 },
  'piekary śląskie': { lat: 50.3708, lng: 18.9483 },
  'racibórz': { lat: 50.0921, lng: 18.2193 },
  'świętochłowice': { lat: 50.2941, lng: 18.9189 },
  'zawiercie': { lat: 50.4877, lng: 19.4168 },
  'wodzisław śląski': { lat: 50.0033, lng: 18.4632 },
  'mikołów': { lat: 50.1691, lng: 18.9056 },
  'cieszyn': { lat: 49.7497, lng: 18.6366 },
  'żywiec': { lat: 49.6883, lng: 19.1931 },
  'pszczyna': { lat: 49.9774, lng: 18.9427 },
  'kłobuck': { lat: 50.9031, lng: 18.9372 },
  'lubliniec': { lat: 50.6692, lng: 18.6825 },
  'myszków': { lat: 50.5752, lng: 19.3249 },
  'bieruń': { lat: 50.0911, lng: 19.0921 },

  // Dolnośląskie
  'wrocław': { lat: 51.1079, lng: 17.0385 },
  'wałbrzych': { lat: 50.7825, lng: 16.2847 },
  'legnica': { lat: 51.2070, lng: 16.1553 },
  'jelenia góra': { lat: 50.9044, lng: 15.7194 },
  'lubin': { lat: 51.3986, lng: 16.2006 },
  'głogów': { lat: 51.6636, lng: 16.0847 },
  'świdnica': { lat: 50.8436, lng: 16.4883 },
  'bolesławiec': { lat: 51.2638, lng: 15.5663 },
  'oleśnica': { lat: 51.2104, lng: 17.3828 },
  'zierżoniów': { lat: 50.7282, lng: 16.6508 },
  'dzierżoniów': { lat: 50.7282, lng: 16.6508 },
  'oława': { lat: 50.9419, lng: 17.2952 },
  'zgorzelec': { lat: 51.1494, lng: 15.0084 },
  'kłodzko': { lat: 50.4382, lng: 16.6548 },
  'jawor': { lat: 51.0507, lng: 16.1936 },
  'polkowice': { lat: 51.5033, lng: 16.0683 },
  'lubań': { lat: 51.1194, lng: 15.2891 },
  'kamienna góra': { lat: 50.7839, lng: 16.0319 },
  'trzebnica': { lat: 51.3117, lng: 17.0636 },
  'złotoryja': { lat: 51.1278, lng: 15.9189 },
  'strzelin': { lat: 50.7828, lng: 17.0706 },
  'milicz': { lat: 51.5283, lng: 17.2725 },
  'górowo iławeckie': { lat: 54.2863, lng: 20.4891 },
  'góra': { lat: 51.6664, lng: 16.5336 },

  // Pomorskie
  'gdańsk': { lat: 54.3520, lng: 18.6466 },
  'gdynia': { lat: 54.5189, lng: 18.5305 },
  'sopot': { lat: 54.4418, lng: 18.5600 },
  'słupsk': { lat: 54.4641, lng: 17.0285 },
  'tczew': { lat: 54.0924, lng: 18.7883 },
  'starogard gdański': { lat: 53.9638, lng: 18.5289 },
  'wejherowo': { lat: 54.6044, lng: 18.2347 },
  'chojnice': { lat: 53.6953, lng: 17.5574 },
  'kwidzyn': { lat: 53.7347, lng: 18.9317 },
  'malbork': { lat: 54.0359, lng: 19.0266 },
  'lębork': { lat: 54.5392, lng: 17.7478 },
  'kartuzy': { lat: 54.3342, lng: 18.1969 },
  'pruszcz gdański': { lat: 54.2608, lng: 18.6369 },
  'kościerzyna': { lat: 54.1225, lng: 17.9819 },
  'bytów': { lat: 54.1708, lng: 17.4914 },
  'puck': { lat: 54.7175, lng: 18.4086 },
  'sztum': { lat: 53.9219, lng: 19.0319 },
  'człuchów': { lat: 53.6644, lng: 17.3606 },
  'nowy dwór gdański': { lat: 54.2125, lng: 19.1172 },

  // Łódzkie
  'łódź': { lat: 51.7592, lng: 19.4560 },
  'piotrków trybunalski': { lat: 51.4052, lng: 19.7031 },
  'skierniewice': { lat: 51.9544, lng: 20.1436 },
  'pabianice': { lat: 51.6642, lng: 19.3556 },
  'tomaszów mazowiecki': { lat: 51.5311, lng: 20.0083 },
  'bełchatów': { lat: 51.3689, lng: 19.3703 },
  'zgiórz': { lat: 51.8569, lng: 19.4069 },
  'zgierz': { lat: 51.8569, lng: 19.4069 },
  'radomsko': { lat: 51.0664, lng: 19.4447 },
  'kutno': { lat: 52.2325, lng: 19.3639 },
  'sieradz': { lat: 51.5975, lng: 18.7297 },
  'zduńska wola': { lat: 51.5992, lng: 18.9406 },
  'łowisz': { lat: 52.1069, lng: 19.9408 },
  'łowic': { lat: 52.1069, lng: 19.9408 },
  'łowicze': { lat: 52.1069, lng: 19.9408 },
  'wieluń': { lat: 51.2217, lng: 18.5703 },
  'opoczno': { lat: 51.3769, lng: 20.2858 },
  'aleksandrów łódzki': { lat: 51.8197, lng: 19.3039 },
  'łask': { lat: 51.5908, lng: 19.1333 },
  'rawa mazowiecka': { lat: 51.7644, lng: 20.2547 },
  'łęczyca': { lat: 52.0592, lng: 19.2003 },
  'poddębice': { lat: 51.8953, lng: 18.9619 },
  'brzeziny': { lat: 51.8003, lng: 19.7508 },
  'wieruszów': { lat: 51.2942, lng: 18.1544 },
  'pajęczno': { lat: 51.1458, lng: 18.9986 }
};

export function getCoordinatesForPowiat(powiatName: string, voivodeshipName?: string): { lat: number; lng: number } {
  const clean = (powiatName || '').toLowerCase()
    .replace('powiat', '')
    .replace('m.', '')
    .replace('miasto', '')
    .trim();

  // Direct seat lookup
  if (POWIAT_SEATS_COORDS[clean]) {
    return POWIAT_SEATS_COORDS[clean];
  }

  // Try substring matches
  for (const [seat, coords] of Object.entries(POWIAT_SEATS_COORDS)) {
    if (clean.includes(seat) || seat.includes(clean)) {
      return coords;
    }
  }

  // Fallback to voivodeship center with minor randomized offset for separation
  if (voivodeshipName) {
    const vKey = voivodeshipName.toLowerCase().replace(/[^a-z]/g, '');
    for (const [key, vCoords] of Object.entries(VOIVODESHIP_COORDINATES)) {
      if (vKey.includes(key) || key.includes(vKey)) {
        // pseudo deterministic jitter based on string hash
        let hash = 0;
        for (let i = 0; i < clean.length; i++) hash = (hash << 5) - hash + clean.charCodeAt(i);
        const latJitter = ((hash % 100) / 1000) - 0.05;
        const lngJitter = (((hash >> 3) % 100) / 1000) - 0.05;
        return { lat: vCoords.lat + latJitter, lng: vCoords.lng + lngJitter };
      }
    }
  }

  return { lat: POLAND_MAP_CENTER.lat, lng: POLAND_MAP_CENTER.lng };
}

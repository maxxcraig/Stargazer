// Star catalog service for web environment
export interface Star {
  id: string;
  name: string;
  commonName?: string;
  ra: number; // Right ascension in degrees
  dec: number; // Declination in degrees
  magnitude: number; // Visual magnitude
  spectralClass?: string;
  constellation?: string;
}

export interface Constellation {
  id: string;
  name: string;
  abbreviation: string;
  stars: string[];
  lines: { from: string; to: string }[];
  mythology?: string;
}

export interface CelestialCoordinate {
  ra: number;
  dec: number;
}

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface Planet {
  id: string;
  name: string;
  commonName: string;
  type: 'planet' | 'sun';
  color: number; // Hex color for rendering
  radius: number; // Radius in pixels for rendering
  orbitalElements: {
    semiMajorAxis: number; // AU
    eccentricity: number;
    inclination: number; // degrees
    longitudeOfAscendingNode: number; // degrees
    argumentOfPeriapsis: number; // degrees
    meanAnomalyAtEpoch: number; // degrees
    epoch: number; // Julian day
    dailyMotion: number; // degrees per day
  };
  physicalData: {
    mass: number; // Earth masses
    diameter: number; // Earth diameters
    distanceFromSun: number; // AU average
    orbitalPeriod: number; // Earth days
    rotationPeriod: number; // Earth days
  };
}

export class StarCatalogService {
  private static instance: StarCatalogService;
  private stars: Map<string, Star> = new Map();
  private constellations: Map<string, Constellation> = new Map();
  private planets: Map<string, Planet> = new Map();
  private isInitialized = false;

  // Embedded star catalog (subset of bright stars)
  private readonly STAR_DATA = {
    stars: [
      {
        id: "hip_677",
        name: "Alpheratz",
        commonName: "Alpha Andromedae",
        ra: 2.096916,
        dec: 29.09043,
        magnitude: 2.06,
        spectralClass: "B8IVpMnHg",
        constellation: "Andromeda"
      },
      {
        id: "hip_113881",
        name: "Fomalhaut",
        commonName: "Alpha Piscis Austrini",
        ra: 344.41269,
        dec: -29.62224,
        magnitude: 1.16,
        spectralClass: "A3V",
        constellation: "Piscis Austrinus"
      },
      {
        id: "hip_21421",
        name: "Aldebaran",
        commonName: "Alpha Tauri",
        ra: 68.98016,
        dec: 16.50930,
        magnitude: 0.85,
        spectralClass: "K5III",
        constellation: "Taurus"
      },
      {
        id: "hip_25336",
        name: "Capella",
        commonName: "Alpha Aurigae",
        ra: 79.17232,
        dec: 45.99799,
        magnitude: 0.08,
        spectralClass: "G5III",
        constellation: "Auriga"
      },
      {
        id: "hip_27989",
        name: "Betelgeuse",
        commonName: "Alpha Orionis",
        ra: 88.79294,
        dec: 7.40706,
        magnitude: 0.50,
        spectralClass: "M1-M2Ia-Iab",
        constellation: "Orion"
      },
      {
        id: "hip_24436",
        name: "Bellatrix",
        commonName: "Gamma Orionis",
        ra: 81.28277,
        dec: 6.34970,
        magnitude: 1.64,
        spectralClass: "B2III",
        constellation: "Orion"
      },
      {
        id: "hip_25930",
        name: "Mintaka",
        commonName: "Delta Orionis",
        ra: 83.00171,
        dec: -0.29909,
        magnitude: 2.23,
        spectralClass: "O9.5II",
        constellation: "Orion"
      },
      {
        id: "hip_26311",
        name: "Alnilam",
        commonName: "Epsilon Orionis",
        ra: 84.05338,
        dec: -1.20191,
        magnitude: 1.70,
        spectralClass: "B0Ia",
        constellation: "Orion"
      },
      {
        id: "hip_26727",
        name: "Alnitak",
        commonName: "Zeta Orionis",
        ra: 85.18965,
        dec: -1.94258,
        magnitude: 1.79,
        spectralClass: "O9.7Ib",
        constellation: "Orion"
      },
      {
        id: "hip_32349",
        name: "Sirius",
        commonName: "Alpha Canis Majoris",
        ra: 101.28715,
        dec: -16.71611,
        magnitude: -1.46,
        spectralClass: "A1V",
        constellation: "Canis Major"
      },
      {
        id: "hip_37279",
        name: "Procyon",
        commonName: "Alpha Canis Minoris",
        ra: 114.82563,
        dec: 5.22499,
        magnitude: 0.38,
        spectralClass: "F5IV-V",
        constellation: "Canis Minor"
      },
      {
        id: "hip_69673",
        name: "Arcturus",
        commonName: "Alpha Bootis",
        ra: 213.91530,
        dec: 19.18241,
        magnitude: -0.05,
        spectralClass: "K1.5IIIFe-0.5",
        constellation: "Bootes"
      },
      {
        id: "hip_91262",
        name: "Vega",
        commonName: "Alpha Lyrae",
        ra: 279.23473,
        dec: 38.78369,
        magnitude: 0.03,
        spectralClass: "A0V",
        constellation: "Lyra"
      },
      {
        id: "hip_102098",
        name: "Deneb",
        commonName: "Alpha Cygni",
        ra: 310.35798,
        dec: 45.28034,
        magnitude: 1.25,
        spectralClass: "A2Ia",
        constellation: "Cygnus"
      },
      {
        id: "hip_97649",
        name: "Altair",
        commonName: "Alpha Aquilae",
        ra: 297.69582,
        dec: 8.86832,
        magnitude: 0.77,
        spectralClass: "A7V",
        constellation: "Aquila"
      },
      {
        id: "hip_61084",
        name: "Spica",
        commonName: "Alpha Virginis",
        ra: 201.29825,
        dec: -11.16132,
        magnitude: 1.04,
        spectralClass: "B1III-IV",
        constellation: "Virgo"
      },
      {
        id: "hip_68702",
        name: "Antares",
        commonName: "Alpha Scorpii",
        ra: 247.35191,
        dec: -26.43200,
        magnitude: 1.09,
        spectralClass: "M1.5Iab-Ib",
        constellation: "Scorpius"
      },
      
      // Big Dipper (Ursa Major) stars
      {
        id: "hip_54061",
        name: "Dubhe",
        commonName: "Alpha Ursae Majoris",
        ra: 165.93196,
        dec: 61.75103,
        magnitude: 1.79,
        spectralClass: "K0III",
        constellation: "Ursa Major"
      },
      {
        id: "hip_53910",
        name: "Merak",
        commonName: "Beta Ursae Majoris",
        ra: 165.46038,
        dec: 56.38245,
        magnitude: 2.37,
        spectralClass: "A1V",
        constellation: "Ursa Major"
      },
      {
        id: "hip_58001",
        name: "Phecda",
        commonName: "Gamma Ursae Majoris",
        ra: 178.45728,
        dec: 53.69476,
        magnitude: 2.44,
        spectralClass: "A0V",
        constellation: "Ursa Major"
      },
      {
        id: "hip_59774",
        name: "Megrez",
        commonName: "Delta Ursae Majoris",
        ra: 183.85657,
        dec: 57.03258,
        magnitude: 3.31,
        spectralClass: "A3V",
        constellation: "Ursa Major"
      },
      {
        id: "hip_62956",
        name: "Alioth",
        commonName: "Epsilon Ursae Majoris",
        ra: 193.50728,
        dec: 55.95982,
        magnitude: 1.77,
        spectralClass: "A1III-IVp",
        constellation: "Ursa Major"
      },
      {
        id: "hip_65378",
        name: "Mizar",
        commonName: "Zeta Ursae Majoris",
        ra: 200.98142,
        dec: 54.92535,
        magnitude: 2.27,
        spectralClass: "A2V",
        constellation: "Ursa Major"
      },
      {
        id: "hip_67301",
        name: "Alkaid",
        commonName: "Eta Ursae Majoris",
        ra: 206.88513,
        dec: 49.31324,
        magnitude: 1.86,
        spectralClass: "B3V",
        constellation: "Ursa Major"
      },
      
      // Little Dipper (Ursa Minor) stars
      {
        id: "hip_11767",
        name: "Polaris",
        commonName: "Alpha Ursae Minoris",
        ra: 37.95456,
        dec: 89.26411,
        magnitude: 1.98,
        spectralClass: "F7Ib",
        constellation: "Ursa Minor"
      },
      {
        id: "hip_85822",
        name: "Kochab",
        commonName: "Beta Ursae Minoris",
        ra: 222.67635,
        dec: 74.15550,
        magnitude: 2.08,
        spectralClass: "K4III",
        constellation: "Ursa Minor"
      },
      {
        id: "hip_82080",
        name: "Pherkad",
        commonName: "Gamma Ursae Minoris",
        ra: 230.18216,
        dec: 71.83402,
        magnitude: 3.05,
        spectralClass: "A3II-III",
        constellation: "Ursa Minor"
      },
      {
        id: "hip_77055",
        name: "Yildun",
        commonName: "Delta Ursae Minoris",
        ra: 211.09729,
        dec: 86.58638,
        magnitude: 4.35,
        spectralClass: "A1Vn",
        constellation: "Ursa Minor"
      },
      {
        id: "hip_75097",
        name: "Urodelus",
        commonName: "Epsilon Ursae Minoris",
        ra: 213.91192,
        dec: 82.03720,
        magnitude: 4.23,
        spectralClass: "G5III",
        constellation: "Ursa Minor"
      },
      {
        id: "hip_79822",
        name: "Ahfa al Farkadain",
        commonName: "Zeta Ursae Minoris",
        ra: 228.05758,
        dec: 77.79481,
        magnitude: 4.32,
        spectralClass: "A3Vn",
        constellation: "Ursa Minor"
      },
      {
        id: "hip_72607",
        name: "Anwar al Farkadain",
        commonName: "Eta Ursae Minoris",
        ra: 211.20944,
        dec: 73.28879,
        magnitude: 4.95,
        spectralClass: "F5V",
        constellation: "Ursa Minor"
      },

      // Cassiopeia stars
      {
        id: "hip_3179",
        name: "Caph",
        commonName: "Beta Cassiopeiae",
        ra: 10.12684,
        dec: 59.14978,
        magnitude: 2.27,
        spectralClass: "F2III-IV",
        constellation: "Cassiopeia"
      },
      {
        id: "hip_746",
        name: "Schedar",
        commonName: "Alpha Cassiopeiae",
        ra: 2.29716,
        dec: 56.53741,
        magnitude: 2.23,
        spectralClass: "K0IIIa",
        constellation: "Cassiopeia"
      },
      {
        id: "hip_4427",
        name: "Gamma Cassiopeiae",
        commonName: "Tsih",
        ra: 14.17713,
        dec: 60.71674,
        magnitude: 2.47,
        spectralClass: "B0IVe",
        constellation: "Cassiopeia"
      },
      {
        id: "hip_6686",
        name: "Ruchbah",
        commonName: "Delta Cassiopeiae",
        ra: 21.45343,
        dec: 60.23531,
        magnitude: 2.68,
        spectralClass: "A5V",
        constellation: "Cassiopeia"
      },
      {
        id: "hip_8886",
        name: "Segin",
        commonName: "Epsilon Cassiopeiae",
        ra: 28.59891,
        dec: 63.67007,
        magnitude: 3.38,
        spectralClass: "B3III",
        constellation: "Cassiopeia"
      },

      // Leo stars
      {
        id: "hip_49669",
        name: "Regulus",
        commonName: "Alpha Leonis",
        ra: 152.09296,
        dec: 11.96721,
        magnitude: 1.35,
        spectralClass: "B8IVn",
        constellation: "Leo"
      },
      {
        id: "hip_57632",
        name: "Denebola",
        commonName: "Beta Leonis",
        ra: 177.26499,
        dec: 14.57206,
        magnitude: 2.14,
        spectralClass: "A3V",
        constellation: "Leo"
      },
      {
        id: "hip_50583",
        name: "Algieba",
        commonName: "Gamma Leonis",
        ra: 154.99343,
        dec: 19.84186,
        magnitude: 2.08,
        spectralClass: "K1III",
        constellation: "Leo"
      },
      {
        id: "hip_54872",
        name: "Zosma",
        commonName: "Delta Leonis",
        ra: 168.52703,
        dec: 20.52426,
        magnitude: 2.56,
        spectralClass: "A4V",
        constellation: "Leo"
      },
      {
        id: "hip_47908",
        name: "Algenubi",
        commonName: "Epsilon Leonis",
        ra: 146.46707,
        dec: 23.77435,
        magnitude: 2.98,
        spectralClass: "G1II",
        constellation: "Leo"
      },
      {
        id: "hip_46750",
        name: "Adhafera",
        commonName: "Zeta Leonis",
        ra: 143.21396,
        dec: 23.41735,
        magnitude: 3.44,
        spectralClass: "F0III",
        constellation: "Leo"
      },
      {
        id: "hip_55642",
        name: "Chort",
        commonName: "Theta Leonis",
        ra: 170.83844,
        dec: 15.42958,
        magnitude: 3.34,
        spectralClass: "A2V",
        constellation: "Leo"
      },
      {
        id: "hip_54879",
        name: "Coxa",
        commonName: "Iota Leonis",
        ra: 168.56056,
        dec: 10.53272,
        magnitude: 3.94,
        spectralClass: "F3V",
        constellation: "Leo"
      },
      {
        id: "hip_56211",
        name: "Chertan",
        commonName: "Mu Leonis",
        ra: 172.49726,
        dec: 26.00677,
        magnitude: 3.88,
        spectralClass: "K2III",
        constellation: "Leo"
      },

      // Cygnus stars (Northern Cross)
      {
        id: "hip_100453",
        name: "Sadr",
        commonName: "Gamma Cygni",
        ra: 305.55715,
        dec: 40.25669,
        magnitude: 2.20,
        spectralClass: "F8Ib",
        constellation: "Cygnus"
      },
      {
        id: "hip_95947",
        name: "Gienah",
        commonName: "Epsilon Cygni",
        ra: 292.68035,
        dec: 33.97029,
        magnitude: 2.46,
        spectralClass: "K0III",
        constellation: "Cygnus"
      },
      {
        id: "hip_104732",
        name: "Albireo",
        commonName: "Beta Cygni",
        ra: 292.68035,
        dec: 27.95968,
        magnitude: 3.08,
        spectralClass: "K3II",
        constellation: "Cygnus"
      },
      {
        id: "hip_94779",
        name: "Fawaris",
        commonName: "Delta Cygni",
        ra: 289.24498,
        dec: 45.13081,
        magnitude: 2.87,
        spectralClass: "A0IV",
        constellation: "Cygnus"
      }
    ],
    constellations: [
      {
        id: "orion",
        name: "Orion",
        abbreviation: "Ori",
        stars: ["hip_27989", "hip_24436", "hip_25930", "hip_26311", "hip_26727"],
        lines: [
          // Orion's Belt (the three belt stars)
          { from: "hip_25930", to: "hip_26311" }, // Mintaka to Alnilam
          { from: "hip_26311", to: "hip_26727" }, // Alnilam to Alnitak
          // Shoulders and connections
          { from: "hip_24436", to: "hip_27989" }, // Bellatrix to Betelgeuse
          { from: "hip_24436", to: "hip_25930" }, // Bellatrix to Mintaka (belt)
          { from: "hip_27989", to: "hip_26311" }, // Betelgeuse to Alnilam (belt center)
        ],
        mythology: "The Hunter in Greek mythology"
      },
      {
        id: "canis_major",
        name: "Canis Major",
        abbreviation: "CMa",
        stars: ["hip_32349"],
        lines: [],
        mythology: "Orion's hunting dog"
      },
      {
        id: "summer_triangle",
        name: "Summer Triangle",
        abbreviation: "ST",
        stars: ["hip_91262", "hip_102098", "hip_97649"],
        lines: [
          { from: "hip_91262", to: "hip_102098" }, // Vega to Deneb
          { from: "hip_102098", to: "hip_97649" }, // Deneb to Altair
          { from: "hip_97649", to: "hip_91262" }   // Altair to Vega
        ],
        mythology: "Three bright stars forming a triangle in summer sky"
      },
      {
        id: "taurus",
        name: "Taurus",
        abbreviation: "Tau",
        stars: ["hip_21421"],
        lines: [],
        mythology: "The Bull - contains the bright star Aldebaran"
      },
      {
        id: "ursa_major",
        name: "Ursa Major",
        abbreviation: "UMa",
        stars: ["hip_54061", "hip_53910", "hip_58001", "hip_59774", "hip_62956", "hip_65378", "hip_67301"],
        lines: [
          // Big Dipper bowl
          { from: "hip_54061", to: "hip_53910" }, // Dubhe to Merak
          { from: "hip_53910", to: "hip_58001" }, // Merak to Phecda
          { from: "hip_58001", to: "hip_59774" }, // Phecda to Megrez
          { from: "hip_59774", to: "hip_54061" }, // Megrez to Dubhe (close bowl)
          // Big Dipper handle
          { from: "hip_59774", to: "hip_62956" }, // Megrez to Alioth
          { from: "hip_62956", to: "hip_65378" }, // Alioth to Mizar
          { from: "hip_65378", to: "hip_67301" }  // Mizar to Alkaid
        ],
        mythology: "The Great Bear - most recognizable constellation in northern sky"
      },
      {
        id: "ursa_minor",
        name: "Ursa Minor",
        abbreviation: "UMi",
        stars: ["hip_11767", "hip_85822", "hip_82080", "hip_77055", "hip_75097", "hip_79822", "hip_72607"],
        lines: [
          // Little Dipper bowl
          { from: "hip_85822", to: "hip_82080" }, // Kochab to Pherkad
          { from: "hip_82080", to: "hip_79822" }, // Pherkad to Zeta UMi
          { from: "hip_79822", to: "hip_72607" }, // Zeta UMi to Eta UMi
          { from: "hip_72607", to: "hip_85822" }, // Eta UMi to Kochab (close bowl)
          // Little Dipper handle
          { from: "hip_72607", to: "hip_75097" }, // Eta UMi to Epsilon UMi
          { from: "hip_75097", to: "hip_77055" }, // Epsilon UMi to Yildun
          { from: "hip_77055", to: "hip_11767" }  // Yildun to Polaris
        ],
        mythology: "The Little Bear - contains Polaris, the North Star"
      },
      {
        id: "cassiopeia",
        name: "Cassiopeia",
        abbreviation: "Cas",
        stars: ["hip_746", "hip_3179", "hip_4427", "hip_6686", "hip_8886"],
        lines: [
          // W-shape
          { from: "hip_746", to: "hip_3179" },   // Schedar to Caph
          { from: "hip_3179", to: "hip_4427" },  // Caph to Gamma Cas
          { from: "hip_4427", to: "hip_6686" },  // Gamma Cas to Ruchbah
          { from: "hip_6686", to: "hip_8886" }   // Ruchbah to Segin
        ],
        mythology: "The Queen - distinctive W-shaped constellation"
      },
      {
        id: "leo",
        name: "Leo",
        abbreviation: "Leo",
        stars: ["hip_49669", "hip_57632", "hip_50583", "hip_54872", "hip_47908", "hip_46750", "hip_55642", "hip_54879", "hip_56211"],
        lines: [
          // Leo's head (sickle)
          { from: "hip_49669", to: "hip_47908" }, // Regulus to Algenubi
          { from: "hip_47908", to: "hip_56211" }, // Algenubi to Chertan
          { from: "hip_56211", to: "hip_46750" }, // Chertan to Adhafera
          { from: "hip_46750", to: "hip_50583" }, // Adhafera to Algieba
          { from: "hip_50583", to: "hip_47908" }, // Algieba to Algenubi (close sickle)
          // Leo's body
          { from: "hip_49669", to: "hip_54872" }, // Regulus to Zosma
          { from: "hip_54872", to: "hip_55642" }, // Zosma to Chort
          { from: "hip_55642", to: "hip_57632" }, // Chort to Denebola
          // Connection from body to hindquarters
          { from: "hip_54872", to: "hip_54879" }  // Zosma to Coxa
        ],
        mythology: "The Lion - represents the Nemean Lion defeated by Hercules"
      },
      {
        id: "cygnus",
        name: "Cygnus",
        abbreviation: "Cyg",
        stars: ["hip_102098", "hip_100453", "hip_95947", "hip_104732", "hip_94779"],
        lines: [
          // Northern Cross
          { from: "hip_102098", to: "hip_100453" }, // Deneb to Sadr (vertical line top)
          { from: "hip_100453", to: "hip_104732" }, // Sadr to Albireo (vertical line bottom)
          { from: "hip_95947", to: "hip_94779" },   // Gienah to Fawaris (horizontal line)
          // Cross intersection at Sadr
          { from: "hip_95947", to: "hip_100453" },  // Gienah to Sadr
          { from: "hip_100453", to: "hip_94779" }   // Sadr to Fawaris
        ],
        mythology: "The Swan - also known as the Northern Cross"
      }
    ]
  };

  // Solar system planets and sun data with accurate orbital elements (J2000.0 epoch)
  private readonly PLANET_DATA = {
    planets: [
      {
        id: "sun",
        name: "Sun",
        commonName: "Sol",
        type: "sun" as const,
        color: 0xFFD700, // Golden yellow
        radius: 8.0, // Large for visibility
        orbitalElements: {
          semiMajorAxis: 0, // Sun is at center
          eccentricity: 0,
          inclination: 0,
          longitudeOfAscendingNode: 0,
          argumentOfPeriapsis: 0,
          meanAnomalyAtEpoch: 0,
          epoch: 2451545.0, // J2000.0
          dailyMotion: 0
        },
        physicalData: {
          mass: 333000, // Earth masses
          diameter: 109, // Earth diameters
          distanceFromSun: 0,
          orbitalPeriod: 0,
          rotationPeriod: 25.4 // days
        }
      },
      {
        id: "mercury",
        name: "Mercury",
        commonName: "Mercury",
        type: "planet" as const,
        color: 0xFFA500, // Orange for better visibility
        radius: 2.5, // Slightly larger for visibility
        orbitalElements: {
          semiMajorAxis: 0.38709927,
          eccentricity: 0.20563593,
          inclination: 7.00497902,
          longitudeOfAscendingNode: 48.33076593,
          argumentOfPeriapsis: 77.45779628,
          meanAnomalyAtEpoch: 252.25032350,
          epoch: 2451545.0,
          dailyMotion: 4.0923344368
        },
        physicalData: {
          mass: 0.055,
          diameter: 0.383,
          distanceFromSun: 0.39,
          orbitalPeriod: 87.97,
          rotationPeriod: 58.65
        }
      },
      {
        id: "venus",
        name: "Venus",
        commonName: "Venus",
        type: "planet" as const,
        color: 0xFF0000, // Red
        radius: 3.5,
        orbitalElements: {
          semiMajorAxis: 0.72333566,
          eccentricity: 0.00677672,
          inclination: 3.39467605,
          longitudeOfAscendingNode: 76.67984255,
          argumentOfPeriapsis: 131.60246718,
          meanAnomalyAtEpoch: 181.97909950,
          epoch: 2451545.0,
          dailyMotion: 1.6021302244
        },
        physicalData: {
          mass: 0.815,
          diameter: 0.949,
          distanceFromSun: 0.72,
          orbitalPeriod: 224.70,
          rotationPeriod: -243.02 // Retrograde
        }
      },
      {
        id: "earth",
        name: "Earth",
        commonName: "Earth",
        type: "planet" as const,
        color: 0x6B93D6, // Blue
        radius: 3.5,
        orbitalElements: {
          semiMajorAxis: 1.00000261,
          eccentricity: 0.01671123,
          inclination: -0.00001531,
          longitudeOfAscendingNode: 0.0,
          argumentOfPeriapsis: 102.93768193,
          meanAnomalyAtEpoch: 100.46457166,
          epoch: 2451545.0,
          dailyMotion: 0.9856002585
        },
        physicalData: {
          mass: 1.0,
          diameter: 1.0,
          distanceFromSun: 1.0,
          orbitalPeriod: 365.25,
          rotationPeriod: 1.0
        }
      },
      {
        id: "mars",
        name: "Mars",
        commonName: "Mars",
        type: "planet" as const,
        color: 0xFF0000, // Red
        radius: 3.0,
        orbitalElements: {
          semiMajorAxis: 1.52371034,
          eccentricity: 0.09339410,
          inclination: 1.84969142,
          longitudeOfAscendingNode: 49.55953891,
          argumentOfPeriapsis: -4.55343205,
          meanAnomalyAtEpoch: -4.55343205,
          epoch: 2451545.0,
          dailyMotion: 0.5240207766
        },
        physicalData: {
          mass: 0.107,
          diameter: 0.532,
          distanceFromSun: 1.52,
          orbitalPeriod: 686.98,
          rotationPeriod: 1.03
        }
      },
      {
        id: "jupiter",
        name: "Jupiter",
        commonName: "Jupiter",
        type: "planet" as const,
        color: 0x800080, // Purple
        radius: 6.0,
        orbitalElements: {
          semiMajorAxis: 5.20288700,
          eccentricity: 0.04838624,
          inclination: 1.30439695,
          longitudeOfAscendingNode: 100.47390909,
          argumentOfPeriapsis: 273.86740900,
          meanAnomalyAtEpoch: 19.89511400,
          epoch: 2451545.0,
          dailyMotion: 0.0831294023
        },
        physicalData: {
          mass: 317.8,
          diameter: 11.21,
          distanceFromSun: 5.20,
          orbitalPeriod: 4332.59,
          rotationPeriod: 0.41
        }
      },
      {
        id: "saturn",
        name: "Saturn",
        commonName: "Saturn",
        type: "planet" as const,
        color: 0xFF0000, // Red (will add rings separately)
        radius: 5.5,
        orbitalElements: {
          semiMajorAxis: 9.53667594,
          eccentricity: 0.05386179,
          inclination: 2.48599187,
          longitudeOfAscendingNode: 113.66242448,
          argumentOfPeriapsis: 339.39291900,
          meanAnomalyAtEpoch: 316.96735300,
          epoch: 2451545.0,
          dailyMotion: 0.0334442282
        },
        physicalData: {
          mass: 95.2,
          diameter: 9.45,
          distanceFromSun: 9.54,
          orbitalPeriod: 10759.22,
          rotationPeriod: 0.45
        }
      },
      {
        id: "uranus",
        name: "Uranus",
        commonName: "Uranus",
        type: "planet" as const,
        color: 0x0000FF, // Blue
        radius: 4.5,
        orbitalElements: {
          semiMajorAxis: 19.18916464,
          eccentricity: 0.04725744,
          inclination: 0.77263783,
          longitudeOfAscendingNode: 74.01692503,
          argumentOfPeriapsis: 96.99839200,
          meanAnomalyAtEpoch: 142.23851000,
          epoch: 2451545.0,
          dailyMotion: 0.0116771814
        },
        physicalData: {
          mass: 14.5,
          diameter: 4.01,
          distanceFromSun: 19.22,
          orbitalPeriod: 30688.5,
          rotationPeriod: -0.72 // Retrograde
        }
      },
      {
        id: "neptune",
        name: "Neptune",
        commonName: "Neptune",
        type: "planet" as const,
        color: 0x0000FF, // Blue
        radius: 4.3,
        orbitalElements: {
          semiMajorAxis: 30.06992276,
          eccentricity: 0.00859048,
          inclination: 1.77004347,
          longitudeOfAscendingNode: 131.78422574,
          argumentOfPeriapsis: 272.8461100,
          meanAnomalyAtEpoch: 260.2471152,
          epoch: 2451545.0,
          dailyMotion: 0.0060190454
        },
        physicalData: {
          mass: 17.1,
          diameter: 3.88,
          distanceFromSun: 30.05,
          orbitalPeriod: 60182,
          rotationPeriod: 0.67
        }
      }
    ]
  };

  private constructor() {}

  public static getInstance(): StarCatalogService {
    if (!StarCatalogService.instance) {
      StarCatalogService.instance = new StarCatalogService();
    }
    return StarCatalogService.instance;
  }

  /**
   * Initialize the star catalog
   */
  public async initialize(): Promise<void> {
    try {
      // Load embedded star data
      this.loadEmbeddedCatalog();
      // Load planetary data
      this.loadPlanetaryData();
      this.isInitialized = true;
      console.log(`Star catalog initialized with ${this.stars.size} stars, ${this.constellations.size} constellations, and ${this.planets.size} planets`);
    } catch (error) {
      console.error('Failed to initialize star catalog:', error);
      throw error;
    }
  }

  /**
   * Load the embedded star catalog data
   */
  private loadEmbeddedCatalog(): void {
    // Load stars
    for (const starData of this.STAR_DATA.stars) {
      this.stars.set(starData.id, starData as Star);
    }

    // Load constellations
    for (const constellationData of this.STAR_DATA.constellations) {
      this.constellations.set(constellationData.id, constellationData as Constellation);
    }
  }

  /**
   * Load the planetary data
   */
  private loadPlanetaryData(): void {
    for (const planetData of this.PLANET_DATA.planets) {
      this.planets.set(planetData.id, planetData as Planet);
    }
  }

  /**
   * Get stars visible from a location at current time
   */
  public getVisibleStars(
    location: GeolocationCoords,
    maxMagnitude: number = 4.0,
    timestamp: Date = new Date()
  ): Star[] {
    if (!this.isInitialized) {
      throw new Error('Star catalog not initialized');
    }

    const visibleStars: Star[] = [];

    for (const star of Array.from(this.stars.values())) {
      // Filter by magnitude
      if (star.magnitude > maxMagnitude) {
        continue;
      }

      // Check if star is above horizon
      if (this.isAboveHorizon(star, location, timestamp)) {
        visibleStars.push(star);
      }
    }

    // Sort by brightness (lower magnitude = brighter)
    return visibleStars.sort((a, b) => a.magnitude - b.magnitude);
  }

  /**
   * Get stars in a specific field of view
   */
  public getStarsInView(
    centerCoordinate: CelestialCoordinate,
    fieldOfViewDegrees: number,
    maxMagnitude: number = 4.0
  ): Star[] {
    if (!this.isInitialized) {
      throw new Error('Star catalog not initialized');
    }

    const starsInView: Star[] = [];
    const maxDistance = fieldOfViewDegrees / 2;

    for (const star of Array.from(this.stars.values())) {
      if (star.magnitude > maxMagnitude) {
        continue;
      }

      const distance = this.calculateAngularDistance(
        { ra: star.ra, dec: star.dec },
        centerCoordinate
      );

      if (distance <= maxDistance) {
        starsInView.push(star);
      }
    }

    return starsInView.sort((a, b) => a.magnitude - b.magnitude);
  }

  /**
   * Convert celestial coordinates to horizontal coordinates
   */
  public celestialToHorizontal(
    celestial: CelestialCoordinate,
    location: GeolocationCoords,
    timestamp: Date = new Date()
  ): { azimuth: number; altitude: number } {
    const { ra, dec } = celestial;
    const { latitude, longitude } = location;

    // Calculate Local Sidereal Time
    const lst = this.calculateLocalSiderealTime(longitude, timestamp);
    
    // Hour Angle
    const hourAngle = lst - ra;
    
    // Convert to radians
    const latRad = (latitude * Math.PI) / 180;
    const decRad = (dec * Math.PI) / 180;
    const haRad = (hourAngle * Math.PI) / 180;

    // Calculate altitude
    const sinAlt = Math.sin(decRad) * Math.sin(latRad) + 
                   Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
    const altitude = Math.asin(sinAlt) * 180 / Math.PI;

    // Calculate azimuth
    const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / 
                  (Math.cos(latRad) * Math.cos(Math.asin(sinAlt)));
    let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180 / Math.PI;

    // Adjust azimuth quadrant
    if (Math.sin(haRad) > 0) {
      azimuth = 360 - azimuth;
    }

    return { azimuth, altitude };
  }

  /**
   * Get a specific star by ID
   */
  public getStar(id: string): Star | undefined {
    return this.stars.get(id);
  }

  /**
   * Search stars by name
   */
  public searchStars(query: string): Star[] {
    if (!this.isInitialized) {
      throw new Error('Star catalog not initialized');
    }

    const sanitizedQuery = query.toLowerCase().trim();
    const results: Star[] = [];

    for (const star of Array.from(this.stars.values())) {
      const nameMatch = star.name.toLowerCase().includes(sanitizedQuery);
      const commonNameMatch = star.commonName?.toLowerCase().includes(sanitizedQuery);
      
      if (nameMatch || commonNameMatch) {
        results.push(star);
      }
    }

    return results.sort((a, b) => a.magnitude - b.magnitude);
  }

  /**
   * Get all constellations
   */
  public getConstellations(): Constellation[] {
    return Array.from(this.constellations.values());
  }

  /**
   * Get a specific constellation by ID
   */
  public getConstellation(id: string): Constellation | undefined {
    return this.constellations.get(id);
  }

  /**
   * Check if a star is above the horizon
   */
  private isAboveHorizon(star: Star, location: GeolocationCoords, timestamp: Date): boolean {
    const horizontal = this.celestialToHorizontal(
      { ra: star.ra, dec: star.dec },
      location,
      timestamp
    );
    
    // Consider atmospheric refraction - add small positive offset
    return horizontal.altitude > -0.5;
  }

  /**
   * Calculate Local Sidereal Time
   */
  private calculateLocalSiderealTime(longitude: number, timestamp: Date): number {
    const jd = this.dateToJulianDay(timestamp);
    const t = (jd - 2451545.0) / 36525.0;
    
    let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 
               0.000387933 * t * t - t * t * t / 38710000.0;
    
    gmst = this.normalizeAngle(gmst);
    const lst = gmst + longitude;
    
    return this.normalizeAngle(lst);
  }

  /**
   * Convert Date to Julian Day Number
   */
  private dateToJulianDay(date: Date): number {
    const a = Math.floor((14 - (date.getUTCMonth() + 1)) / 12);
    const y = date.getUTCFullYear() + 4800 - a;
    const m = (date.getUTCMonth() + 1) + 12 * a - 3;
    
    const jdn = date.getUTCDate() + Math.floor((153 * m + 2) / 5) + 365 * y + 
                Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    
    const jd = jdn + (date.getUTCHours() - 12) / 24 + 
               date.getUTCMinutes() / 1440 + date.getUTCSeconds() / 86400;
    
    return jd;
  }

  /**
   * Calculate angular distance between two celestial coordinates
   */
  private calculateAngularDistance(coord1: CelestialCoordinate, coord2: CelestialCoordinate): number {
    const ra1Rad = (coord1.ra * Math.PI) / 180;
    const dec1Rad = (coord1.dec * Math.PI) / 180;
    const ra2Rad = (coord2.ra * Math.PI) / 180;
    const dec2Rad = (coord2.dec * Math.PI) / 180;

    const deltaRa = ra2Rad - ra1Rad;

    const distance = Math.acos(
      Math.sin(dec1Rad) * Math.sin(dec2Rad) + 
      Math.cos(dec1Rad) * Math.cos(dec2Rad) * Math.cos(deltaRa)
    );

    return (distance * 180) / Math.PI;
  }

  /**
   * Normalize angle to 0-360 degrees
   */
  private normalizeAngle(angle: number): number {
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
  }

  /**
   * Get all planets
   */
  public getPlanets(): Planet[] {
    return Array.from(this.planets.values());
  }

  /**
   * Get a specific planet by ID
   */
  public getPlanet(id: string): Planet | undefined {
    return this.planets.get(id);
  }

  /**
   * Calculate current celestial coordinates for a planet
   */
  public calculatePlanetPosition(planet: Planet, timestamp: Date = new Date()): CelestialCoordinate {
    if (planet.type === 'sun') {
      // Sun position calculation - simplified approximation
      return this.calculateSunPosition(timestamp);
    }

    // Calculate planetary position using orbital elements
    const jd = this.dateToJulianDay(timestamp);
    const t = (jd - planet.orbitalElements.epoch) / 365.25; // Years since epoch
    
    // Calculate mean anomaly
    const meanAnomaly = this.normalizeAngle(
      planet.orbitalElements.meanAnomalyAtEpoch + 
      planet.orbitalElements.dailyMotion * (jd - planet.orbitalElements.epoch)
    );
    
    // Solve Kepler's equation for eccentric anomaly (simplified)
    const eccentricAnomaly = this.solveKeplerEquation(meanAnomaly, planet.orbitalElements.eccentricity);
    
    // Calculate true anomaly
    const trueAnomaly = this.calculateTrueAnomaly(eccentricAnomaly, planet.orbitalElements.eccentricity);
    
    // Calculate heliocentric coordinates
    const helioCoords = this.calculateHeliocentricCoordinates(planet, trueAnomaly);
    
    // Convert to geocentric coordinates
    const sunPos = this.calculateSunPosition(timestamp);
    const geoCoords = this.heliocentricToGeocentric(helioCoords, sunPos, timestamp);
    
    return geoCoords;
  }

  /**
   * Calculate simplified sun position (apparent geocentric coordinates)
   */
  private calculateSunPosition(timestamp: Date): CelestialCoordinate {
    const jd = this.dateToJulianDay(timestamp);
    const n = jd - 2451545.0; // Days since J2000.0
    
    // Mean longitude of the Sun
    const L = this.normalizeAngle(280.460 + 0.9856474 * n);
    
    // Mean anomaly of the Sun
    const g = this.normalizeAngle(357.528 + 0.9856003 * n) * Math.PI / 180;
    
    // Ecliptic longitude
    const lambda = this.normalizeAngle(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));
    
    // Convert to RA/Dec (simplified - ignoring nutation and aberration)
    const lambdaRad = lambda * Math.PI / 180;
    const obliquity = 23.439 * Math.PI / 180; // Obliquity of ecliptic
    
    const ra = Math.atan2(Math.cos(obliquity) * Math.sin(lambdaRad), Math.cos(lambdaRad)) * 180 / Math.PI;
    const dec = Math.asin(Math.sin(obliquity) * Math.sin(lambdaRad)) * 180 / Math.PI;
    
    return {
      ra: this.normalizeAngle(ra),
      dec: dec
    };
  }

  /**
   * Solve Kepler's equation iteratively
   */
  private solveKeplerEquation(meanAnomaly: number, eccentricity: number): number {
    const M = meanAnomaly * Math.PI / 180;
    let E = M; // Initial guess
    
    // Newton-Raphson iteration
    for (let i = 0; i < 10; i++) {
      const dE = (E - eccentricity * Math.sin(E) - M) / (1 - eccentricity * Math.cos(E));
      E -= dE;
      if (Math.abs(dE) < 1e-8) break;
    }
    
    return E * 180 / Math.PI;
  }

  /**
   * Calculate true anomaly from eccentric anomaly
   */
  private calculateTrueAnomaly(eccentricAnomaly: number, eccentricity: number): number {
    const E = eccentricAnomaly * Math.PI / 180;
    const nu = 2 * Math.atan2(
      Math.sqrt(1 + eccentricity) * Math.sin(E / 2),
      Math.sqrt(1 - eccentricity) * Math.cos(E / 2)
    );
    return this.normalizeAngle(nu * 180 / Math.PI);
  }

  /**
   * Calculate heliocentric coordinates
   */
  private calculateHeliocentricCoordinates(planet: Planet, trueAnomaly: number): {x: number, y: number, z: number} {
    const nu = trueAnomaly * Math.PI / 180;
    const omega = planet.orbitalElements.argumentOfPeriapsis * Math.PI / 180;
    const Omega = planet.orbitalElements.longitudeOfAscendingNode * Math.PI / 180;
    const i = planet.orbitalElements.inclination * Math.PI / 180;
    const e = planet.orbitalElements.eccentricity;
    const a = planet.orbitalElements.semiMajorAxis;
    
    // Distance from sun
    const r = a * (1 - e * e) / (1 + e * Math.cos(nu));
    
    // Position in orbital plane
    const xOrb = r * Math.cos(nu);
    const yOrb = r * Math.sin(nu);
    
    // Transform to heliocentric coordinates
    const x = xOrb * (Math.cos(omega) * Math.cos(Omega) - Math.sin(omega) * Math.sin(Omega) * Math.cos(i)) +
              yOrb * (-Math.sin(omega) * Math.cos(Omega) - Math.cos(omega) * Math.sin(Omega) * Math.cos(i));
    
    const y = xOrb * (Math.cos(omega) * Math.sin(Omega) + Math.sin(omega) * Math.cos(Omega) * Math.cos(i)) +
              yOrb * (-Math.sin(omega) * Math.sin(Omega) + Math.cos(omega) * Math.cos(Omega) * Math.cos(i));
    
    const z = xOrb * (Math.sin(omega) * Math.sin(i)) +
              yOrb * (Math.cos(omega) * Math.sin(i));
    
    return { x, y, z };
  }

  /**
   * Convert heliocentric to geocentric coordinates
   */
  private heliocentricToGeocentric(
    helioCoords: {x: number, y: number, z: number}, 
    sunPos: CelestialCoordinate,
    timestamp: Date
  ): CelestialCoordinate {
    // Simplified conversion - in reality this would involve Earth's position
    // For now, we'll use the heliocentric coordinates directly and convert to RA/Dec
    
    const x = helioCoords.x;
    const y = helioCoords.y;
    const z = helioCoords.z;
    
    // Convert to spherical coordinates
    const distance = Math.sqrt(x * x + y * y + z * z);
    const longitude = Math.atan2(y, x) * 180 / Math.PI;
    const latitude = Math.asin(z / distance) * 180 / Math.PI;
    
    // Convert ecliptic to equatorial coordinates (simplified)
    const obliquity = 23.439 * Math.PI / 180;
    const lambdaRad = longitude * Math.PI / 180;
    const betaRad = latitude * Math.PI / 180;
    
    const ra = Math.atan2(
      Math.cos(obliquity) * Math.sin(lambdaRad) - Math.sin(obliquity) * Math.tan(betaRad),
      Math.cos(lambdaRad)
    ) * 180 / Math.PI;
    
    const dec = Math.asin(
      Math.sin(obliquity) * Math.sin(lambdaRad) + Math.cos(obliquity) * Math.sin(betaRad)
    ) * 180 / Math.PI;
    
    return {
      ra: this.normalizeAngle(ra),
      dec: dec
    };
  }

  /**
   * Get visible planets from a location at current time
   */
  public getVisiblePlanets(
    location: GeolocationCoords,
    timestamp: Date = new Date()
  ): Array<Planet & { position: CelestialCoordinate; horizontal: { azimuth: number; altitude: number } }> {
    if (!this.isInitialized) {
      throw new Error('Star catalog not initialized');
    }

    const visiblePlanets: Array<Planet & { position: CelestialCoordinate; horizontal: { azimuth: number; altitude: number } }> = [];

    for (const planet of Array.from(this.planets.values())) {
      const position = this.calculatePlanetPosition(planet, timestamp);
      const horizontal = this.celestialToHorizontal(position, location, timestamp);
      
      // Check if planet is above horizon (considering atmospheric refraction)
      if (horizontal.altitude > -0.5) {
        visiblePlanets.push({
          ...planet,
          position,
          horizontal
        });
      }
    }

    return visiblePlanets;
  }

  /**
   * Get catalog statistics
   */
  public getStatistics(): {
    totalStars: number;
    totalConstellations: number;
    totalPlanets: number;
    brightestStar: Star | null;
  } {
    const stars = Array.from(this.stars.values());
    const brightestStar = stars.reduce((brightest, star) => 
      star.magnitude < brightest.magnitude ? star : brightest, 
      stars[0] || null
    );

    return {
      totalStars: this.stars.size,
      totalConstellations: this.constellations.size,
      totalPlanets: this.planets.size,
      brightestStar
    };
  }
}
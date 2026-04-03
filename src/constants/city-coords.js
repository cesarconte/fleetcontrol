/**
 * FleetControl — Spanish City Coordinates
 *
 * Approximate lat/lng for major Spanish cities and logistics hubs.
 * Used by MockGpsProvider to generate realistic GPS positions.
 *
 * @see docs/plans/feature-mapa-plan.md — Tarea 3
 */

export const CITY_COORDS = Object.freeze({
  // Madrid
  madrid: { lat: 40.4168, lng: -3.7038 },
  'alcala de henares': { lat: 40.4817, lng: -3.3649 },
  getafe: { lat: 40.3057, lng: -3.7327 },
  mostoles: { lat: 40.3231, lng: -3.8644 },
  fuenlabrada: { lat: 40.2842, lng: -3.7945 },
  leganes: { lat: 40.3272, lng: -3.7636 },
  coslada: { lat: 40.4208, lng: -3.5607 },
  torrejon: { lat: 40.4567, lng: -3.4798 },

  // Barcelona
  barcelona: { lat: 41.3874, lng: 2.1686 },
  'l hospitalet': { lat: 41.3598, lng: 2.1001 },
  'hospitalet de llobregat': { lat: 41.3598, lng: 2.1001 },
  badalona: { lat: 41.4502, lng: 2.247 },
  terrassa: { lat: 41.5633, lng: 2.0087 },
  sabadell: { lat: 41.5433, lng: 2.1089 },

  // Valencia
  valencia: { lat: 39.4699, lng: -0.3763 },
  paterna: { lat: 39.5047, lng: -0.4417 },
  torrent: { lat: 39.437, lng: -0.4649 },

  // Sevilla
  sevilla: { lat: 37.3891, lng: -5.9845 },
  'dos hermanas': { lat: 37.282, lng: -5.9207 },
  'alcala de guadaira': { lat: 37.4716, lng: -5.8459 },

  // Zaragoza
  zaragoza: { lat: 41.6488, lng: -0.8891 },

  // Malaga
  malaga: { lat: 36.7213, lng: -4.4214 },
  marbella: { lat: 36.5101, lng: -4.885 },

  // Murcia
  murcia: { lat: 37.9922, lng: -1.1307 },
  cartagena: { lat: 37.6, lng: -0.9865 },

  // Palma
  'palma de mallorca': { lat: 39.5696, lng: 2.6502 },
  palma: { lat: 39.5696, lng: 2.6502 },

  // Bilbao
  bilbao: { lat: 43.263, lng: -2.935 },
  barakaldo: { lat: 43.298, lng: -2.988 },
  getxo: { lat: 43.3478, lng: -3.0098 },

  // Alicante
  alicante: { lat: 38.3452, lng: -0.4815 },
  elche: { lat: 38.2622, lng: -0.7011 },

  // Cordoba
  cordoba: { lat: 37.8882, lng: -4.7794 },

  // Valladolid
  valladolid: { lat: 41.6523, lng: -4.7245 },

  // Vigo
  vigo: { lat: 42.2406, lng: -8.7207 },

  // Gijon
  gijon: { lat: 43.5322, lng: -5.6611 },
  oviedo: { lat: 43.3619, lng: -5.8594 },

  // A Coruna
  'a coruna': { lat: 43.3623, lng: -8.4115 },
  coruna: { lat: 43.3623, lng: -8.4115 },
  santiago: { lat: 42.8805, lng: -8.5457 },

  // Granada
  granada: { lat: 37.1773, lng: -3.5986 },

  // Vitoria
  'vitoria-gasteiz': { lat: 42.8467, lng: -2.6716 },
  vitoria: { lat: 42.8467, lng: -2.6716 },

  // Pamplona
  pamplona: { lat: 42.8125, lng: -1.6458 },

  // Almeria
  almeria: { lat: 36.8381, lng: -2.4597 },

  // San Sebastian
  'san sebastian': { lat: 43.3183, lng: -1.9812 },
  donostia: { lat: 43.3183, lng: -1.9812 },

  // Burgos
  burgos: { lat: 42.3439, lng: -3.6969 },

  // Albacete
  albacete: { lat: 38.9943, lng: -1.8585 },

  // Santander
  santander: { lat: 43.4623, lng: -3.81 },

  // Castellon
  castellon: { lat: 39.9864, lng: -0.0513 },

  // Badajoz
  badajoz: { lat: 38.8794, lng: -6.9706 },

  // Salamanca
  salamanca: { lat: 40.9701, lng: -5.6635 },

  // Huelva
  huelva: { lat: 37.2614, lng: -6.9447 },

  // Tarragona
  tarragona: { lat: 41.1189, lng: 1.2445 },
  reus: { lat: 41.156, lng: 1.107 },

  // Leon
  leon: { lat: 42.5987, lng: -5.5671 },

  // Lleida
  lleida: { lat: 41.6176, lng: 0.62 },

  // Cadiz
  cadiz: { lat: 36.5271, lng: -6.2886 },
  jerez: { lat: 36.6866, lng: -6.1362 },

  // Jaen
  jaen: { lat: 37.7796, lng: -3.7849 },

  // Ourense
  ourense: { lat: 42.336, lng: -7.864 },

  // Toledo
  toledo: { lat: 39.8628, lng: -4.0273 },

  // Logrono
  logrono: { lat: 42.4627, lng: -2.445 },

  // Caceres
  caceres: { lat: 39.4753, lng: -6.3724 },

  // Teruel
  teruel: { lat: 40.3456, lng: -1.1065 },

  // Guadalajara
  guadalajara: { lat: 40.6331, lng: -3.1672 },

  // Avila
  avila: { lat: 40.656, lng: -4.6817 },

  // Soria
  soria: { lat: 41.7665, lng: -2.479 },

  // Cuenca
  cuenca: { lat: 40.0704, lng: -2.1374 },

  // Segovia
  segovia: { lat: 40.9429, lng: -4.1088 },

  // Palencia
  palencia: { lat: 42.0096, lng: -4.5288 },

  // Zamora
  zamora: { lat: 41.5034, lng: -5.7467 },

  // Lugo
  lugo: { lat: 43.0097, lng: -7.5567 },

  // Pontevedra
  pontevedra: { lat: 42.4333, lng: -8.6444 },

  // Huesca
  huesca: { lat: 42.136, lng: -0.408 },

  // Alava
  alava: { lat: 42.8467, lng: -2.6716 },

  // Girona
  girona: { lat: 41.9794, lng: 2.8214 },

  // Major logistics parks (default fallbacks)
  'poligono san fernando': { lat: 40.3057, lng: -3.7327 }, // Getafe
  'poligono industrial': { lat: 40.4168, lng: -3.7038 }, // Madrid default
  'zona industrial': { lat: 41.3874, lng: 2.1686 }, // Barcelona default
})

/**
 * Obtiene coordenadas para una ciudad. Busca por coincidencia parcial.
 * @param {string} cityName - Nombre de la ciudad
 * @returns {{ lat: number, lng: number } | null} Coordenadas o null
 */
export function getCityCoords(cityName) {
  if (!cityName) return null

  // Normalize: remove accents for matching
  const normalized = cityName
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  // Direct match
  if (CITY_COORDS[normalized]) return CITY_COORDS[normalized]

  // Partial match — normalize keys too
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    const normalizedKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (normalized.includes(normalizedKey) || normalizedKey.includes(normalized)) return coords
  }

  return null
}

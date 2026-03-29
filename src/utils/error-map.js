/**
 * FleetControl — Supabase Error Mapper
 *
 * Maps Supabase error codes to user-friendly Spanish messages.
 * NEVER expose raw Supabase errors to the UI.
 */

/** @type {Record<string, string>} */
const ERROR_MAP = {
  '23505': 'Este registro ya existe',
  '23503': 'No se puede eliminar: existen registros relacionados',
  '23502': 'Faltan campos obligatorios',
  PGRST116: 'No encontrado',
  '42501': 'Sin permisos para esta acción',
  '42P01': 'Error interno del sistema',
  '22P02': 'Formato de dato inválido',
}

/** @param {Error|string|null} error */
export function mapSupabaseError(error) {
  if (!error) return null

  const code = typeof error === 'string' ? error : error.code
  const message = typeof error === 'string' ? error : error.message

  if (code && ERROR_MAP[code]) {
    return ERROR_MAP[code]
  }

  if (message?.includes('Failed to fetch') || message?.includes('NetworkError')) {
    return 'Error de conexión. Inténtelo de nuevo.'
  }

  if (message?.includes('JWT')) {
    return 'Sesión expirada. Inicie sesión de nuevo.'
  }

  return 'Ha ocurrido un error. Inténtelo de nuevo.'
}

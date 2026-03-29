import { describe, it, expect } from 'vitest'
import { mapSupabaseError } from './error-map.js'

describe('mapSupabaseError', () => {
  it('debería retornar null para error null', () => {
    expect(mapSupabaseError(null)).toBeNull()
  })

  it('debería mapear código 23505 a mensaje de registro duplicado', () => {
    expect(mapSupabaseError({ code: '23505', message: '' })).toBe('Este registro ya existe')
  })

  it('debería mapear código 23503 a mensaje de relación existente', () => {
    expect(mapSupabaseError({ code: '23503', message: '' })).toBe(
      'No se puede eliminar: existen registros relacionados',
    )
  })

  it('debería mapear código PGRST116 a no encontrado', () => {
    expect(mapSupabaseError({ code: 'PGRST116', message: '' })).toBe('No encontrado')
  })

  it('debería mapear código 42501 a sin permisos', () => {
    expect(mapSupabaseError({ code: '42501', message: '' })).toBe(
      'Sin permisos para esta acción',
    )
  })

  it('debería detectar errores de red', () => {
    expect(mapSupabaseError({ code: '', message: 'Failed to fetch' })).toBe(
      'Error de conexión. Inténtelo de nuevo.',
    )
  })

  it('debería detectar errores JWT', () => {
    expect(mapSupabaseError({ code: '', message: 'JWT expired' })).toBe(
      'Sesión expirada. Inicie sesión de nuevo.',
    )
  })

  it('debería retornar mensaje genérico para errores desconocidos', () => {
    expect(mapSupabaseError({ code: '', message: 'Unknown error' })).toBe(
      'Ha ocurrido un error. Inténtelo de nuevo.',
    )
  })

  it('debería aceptar string como entrada', () => {
    expect(mapSupabaseError('23505')).toBe('Este registro ya existe')
  })
})

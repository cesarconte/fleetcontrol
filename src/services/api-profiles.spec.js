import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/supabase-client.js', () => {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
  }
  return { supabase: { from: vi.fn().mockReturnValue(query) } }
})

import { apiProfiles } from './api-profiles.js'
import { supabase } from '@/services/supabase-client.js'

describe('apiProfiles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('debería retornar todos los perfiles', async () => {
      const mockData = [{ id: 'u1', full_name: 'Admin', role: 'administrador' }]
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiProfiles.getAll()
      expect(supabase.from).toHaveBeenCalledWith('profiles')
      expect(result).toEqual(mockData)
    })
  })

  describe('getById', () => {
    it('debería retornar un perfil por id', async () => {
      const mockData = { id: 'u1', full_name: 'Admin' }
      const mockSingle = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiProfiles.getById('u1')
      expect(result).toEqual(mockData)
    })
  })

  describe('updateProfile', () => {
    it('debería actualizar un perfil', async () => {
      const updated = { id: 'u1', full_name: 'Nuevo Nombre' }
      const mockSingle = vi.fn().mockResolvedValue({ data: updated, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ update: mockUpdate })

      const result = await apiProfiles.updateProfile('u1', { full_name: 'Nuevo Nombre' })
      expect(result).toEqual(updated)
    })
  })

  describe('updateRole', () => {
    it('debería actualizar el rol de un usuario', async () => {
      const updated = { id: 'u1', role: 'jefe_trafico' }
      const mockSingle = vi.fn().mockResolvedValue({ data: updated, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ update: mockUpdate })

      const result = await apiProfiles.updateRole('u1', 'jefe_trafico')
      expect(result).toEqual(updated)
    })
  })

  describe('deactivate', () => {
    it('debería desactivar un usuario', async () => {
      const updated = { id: 'u1', is_active: false }
      const mockSingle = vi.fn().mockResolvedValue({ data: updated, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ update: mockUpdate })

      const result = await apiProfiles.deactivate('u1')
      expect(result.is_active).toBe(false)
    })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/supabase-client.js', () => {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    update: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  }
  return { supabase: { from: vi.fn().mockReturnValue(query) } }
})

import { apiCompanySettings } from './api-company-settings.js'
import { supabase } from '@/services/supabase-client.js'

describe('apiCompanySettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSettings', () => {
    it('debería retornar la configuración de empresa', async () => {
      const mockData = { id: '1', company_name: 'Test S.L.', cif: 'B12345678' }
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const mockSelect = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiCompanySettings.getSettings()
      expect(supabase.from).toHaveBeenCalledWith('company_settings')
      expect(result).toEqual(mockData)
    })

    it('debería retornar null si no hay configuración', async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
      const mockSelect = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiCompanySettings.getSettings()
      expect(result).toBeNull()
    })
  })

  describe('updateSettings', () => {
    it('debería actualizar la configuración', async () => {
      const updated = { id: '1', company_name: 'Nueva S.L.' }
      const mockSingle = vi.fn().mockResolvedValue({ data: updated, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ update: mockUpdate })

      const result = await apiCompanySettings.updateSettings('1', { company_name: 'Nueva S.L.' })
      expect(supabase.from).toHaveBeenCalledWith('company_settings')
      expect(result).toEqual(updated)
    })
  })
})

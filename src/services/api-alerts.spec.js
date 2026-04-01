import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/supabase-client.js', () => {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
  }
  return {
    supabase: {
      from: vi.fn().mockReturnValue(query),
    },
  }
})

import { apiAlerts } from './api-alerts.js'
import { supabase } from '@/services/supabase-client.js'

const mockAlert = {
  id: '1',
  alert_type: 'vehicle_doc_expired',
  severity: 'warning',
  title: 'ITV vencida',
  message: 'La ITV del vehículo 1234ABC vence en 5 días',
  vehicle_id: 'v1',
  driver_id: null,
  route_id: null,
  document_id: null,
  is_read: false,
  read_at: null,
  read_by: null,
  is_dismissed: false,
  dismissed_at: null,
  dismissed_by: null,
  dismiss_justification: null,
  created_at: '2026-03-28T10:00:00Z',
}

describe('apiAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('CRUD base', () => {
    it('debería heredar getAll del CRUD base', () => {
      expect(apiAlerts.getAll).toBeDefined()
    })

    it('debería heredar getById del CRUD base', () => {
      expect(apiAlerts.getById).toBeDefined()
    })

    it('debería heredar create del CRUD base', () => {
      expect(apiAlerts.create).toBeDefined()
    })

    it('debería heredar update del CRUD base', () => {
      expect(apiAlerts.update).toBeDefined()
    })

    it('debería heredar delete del CRUD base', () => {
      expect(apiAlerts.delete).toBeDefined()
    })
  })

  describe('getPaginated', () => {
    it('debería retornar datos paginados de alerts', async () => {
      const mockEq2 = vi.fn().mockResolvedValue({
        data: [mockAlert],
        error: null,
        count: 1,
      })
      const mockOrder = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockRange = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ range: mockRange })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiAlerts.getPaginated({ page: 1, pageSize: 25 })

      expect(supabase.from).toHaveBeenCalledWith('alerts')
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('page', 1)
      expect(result).toHaveProperty('pageSize', 25)
    })

    it('debería ordenar por created_at descendente por defecto', async () => {
      const mockEq2 = vi.fn().mockResolvedValue({
        data: [mockAlert],
        error: null,
        count: 1,
      })
      const mockOrder = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockRange = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ range: mockRange })
      supabase.from.mockReturnValue({ select: mockSelect })

      await apiAlerts.getPaginated()

      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })
  })

  describe('getActiveCount', () => {
    it('debería retornar el número de alertas activas (no leídas ni silenciadas)', async () => {
      const mockEq2 = vi.fn().mockResolvedValue({
        count: 5,
        error: null,
      })
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 })
      supabase.from.mockReturnValue({ select: mockSelect })

      const count = await apiAlerts.getActiveCount()

      expect(supabase.from).toHaveBeenCalledWith('alerts')
      expect(count).toBe(5)
    })
  })

  describe('markAsRead', () => {
    it('debería marcar una alerta como leída', async () => {
      const updatedAlert = { ...mockAlert, is_read: true, read_at: '2026-03-28T12:00:00Z' }
      const mockEq2 = vi.fn().mockResolvedValue({ data: updatedAlert, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockEq2 })
      const mockEq1 = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 })
      supabase.from.mockReturnValue({ update: mockUpdate })

      const result = await apiAlerts.markAsRead('1')

      expect(supabase.from).toHaveBeenCalledWith('alerts')
      expect(result.is_read).toBe(true)
    })
  })

  describe('markAllAsRead', () => {
    it('debería marcar todas las alertas no leídas como leídas', async () => {
      const mockEq2 = vi.fn().mockResolvedValue({ data: [], error: null })
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 })
      supabase.from.mockReturnValue({ update: mockUpdate })

      await apiAlerts.markAllAsRead()

      expect(supabase.from).toHaveBeenCalledWith('alerts')
      expect(mockUpdate).toHaveBeenCalled()
    })
  })

  describe('dismiss', () => {
    it('debería silenciar una alerta con justificación', async () => {
      const dismissedAlert = {
        ...mockAlert,
        is_dismissed: true,
        dismiss_justification: 'Duplicada',
      }
      const mockEq2 = vi.fn().mockResolvedValue({ data: dismissedAlert, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockEq2 })
      const mockEq1 = vi.fn().mockReturnValue({ select: mockSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 })
      supabase.from.mockReturnValue({ update: mockUpdate })

      const result = await apiAlerts.dismiss('1', 'Duplicada')

      expect(supabase.from).toHaveBeenCalledWith('alerts')
      expect(result.is_dismissed).toBe(true)
      expect(result.dismiss_justification).toBe('Duplicada')
    })
  })

  describe('getByVehicle', () => {
    it('debería retornar alertas de un vehículo específico', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [mockAlert], error: null })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiAlerts.getByVehicle('v1')

      expect(supabase.from).toHaveBeenCalledWith('alerts')
      expect(result).toEqual([mockAlert])
    })
  })

  describe('getByDriver', () => {
    it('debería retornar alertas de un conductor específico', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      supabase.from.mockReturnValue({ select: mockSelect })

      const result = await apiAlerts.getByDriver('d1')

      expect(supabase.from).toHaveBeenCalledWith('alerts')
      expect(result).toEqual([])
    })
  })
})

/**
 * FleetControl — useRealtime Composable Tests
 *
 * TDD: RED phase — tests written BEFORE implementation.
 * Tests the generic realtime subscription composable.
 *
 * @see docs/plans/realtime-subscriptions.md — Fase 1
 * @see AGENTS.md §17 — Realtime Subscriptions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/services/supabase-client.js', () => {
  const createMockChannel = () => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  })

  const mockSupabase = {
    channel: vi.fn(() => createMockChannel()),
    removeChannel: vi.fn().mockResolvedValue('ok'),
  }

  return { supabase: mockSupabase }
})

import { supabase as mockSupabase } from '@/services/supabase-client.js'
import { useRealtime, _resetState } from './use-realtime.js'

describe('useRealtime', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    // Reset singleton state
    _resetState()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('estado inicial', () => {
    it('debería tener connectionStatus en "disconnected"', () => {
      const { connectionStatus } = useRealtime()
      expect(connectionStatus.value).toBe('disconnected')
    })

    it('debería tener error en null', () => {
      const { error } = useRealtime()
      expect(error.value).toBeNull()
    })

    it('debería exponer función subscribe', () => {
      const { subscribe } = useRealtime()
      expect(typeof subscribe).toBe('function')
    })

    it('debería exponer función unsubscribe', () => {
      const { unsubscribe } = useRealtime()
      expect(typeof unsubscribe).toBe('function')
    })

    it('debería exponer función unsubscribeAll', () => {
      const { unsubscribeAll } = useRealtime()
      expect(typeof unsubscribeAll).toBe('function')
    })
  })

  describe('subscribe', () => {
    it('debería crear un canal y suscribirse a la tabla', () => {
      const { subscribe } = useRealtime()

      subscribe('alerts', vi.fn())

      expect(mockSupabase.channel).toHaveBeenCalledWith('alerts_changes')
      const channel = mockSupabase.channel.mock.results[0].value
      expect(channel.on).toHaveBeenCalledWith(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        expect.any(Function),
      )
      expect(channel.subscribe).toHaveBeenCalled()
    })

    it('debería cambiar connectionStatus a "connected" al suscribirse', () => {
      const { subscribe, connectionStatus } = useRealtime()

      subscribe('alerts', vi.fn())
      const channel = mockSupabase.channel.mock.results[0].value
      const statusCb = channel.subscribe.mock.calls[0][0]
      statusCb('SUBSCRIBED')

      expect(connectionStatus.value).toBe('connected')
    })

    it('debería ejecutar handler al recibir evento INSERT', () => {
      const { subscribe } = useRealtime()
      const handler = vi.fn()

      subscribe('alerts', handler)
      const channel = mockSupabase.channel.mock.results[0].value
      const onCb = channel.on.mock.calls[0][2]

      onCb({
        eventType: 'INSERT',
        new: { id: '1', name: 'Test' },
        old: null,
        table: 'alerts',
        schema: 'public',
        commit_timestamp: '2026-04-03T10:00:00Z',
      })

      expect(handler).toHaveBeenCalledWith({
        eventType: 'INSERT',
        new: { id: '1', name: 'Test' },
        old: null,
        table: 'alerts',
        schema: 'public',
        commitTimestamp: '2026-04-03T10:00:00Z',
      })
    })

    it('debería ejecutar handler al recibir evento UPDATE con old y new', () => {
      const { subscribe } = useRealtime()
      const handler = vi.fn()

      subscribe('vehicles', handler)
      const channel = mockSupabase.channel.mock.results[0].value
      const onCb = channel.on.mock.calls[0][2]

      onCb({
        eventType: 'UPDATE',
        new: { id: '1', name: 'Updated' },
        old: { id: '1', name: 'Old' },
        table: 'vehicles',
        schema: 'public',
        commit_timestamp: '2026-04-03T10:00:00Z',
      })

      expect(handler).toHaveBeenCalledWith({
        eventType: 'UPDATE',
        new: { id: '1', name: 'Updated' },
        old: { id: '1', name: 'Old' },
        table: 'vehicles',
        schema: 'public',
        commitTimestamp: '2026-04-03T10:00:00Z',
      })
    })

    it('debería ejecutar handler al recibir evento DELETE con old record', () => {
      const { subscribe } = useRealtime()
      const handler = vi.fn()

      subscribe('drivers', handler)
      const channel = mockSupabase.channel.mock.results[0].value
      const onCb = channel.on.mock.calls[0][2]

      onCb({
        eventType: 'DELETE',
        new: null,
        old: { id: '1', name: 'Deleted' },
        table: 'drivers',
        schema: 'public',
        commit_timestamp: '2026-04-03T10:00:00Z',
      })

      expect(handler).toHaveBeenCalledWith({
        eventType: 'DELETE',
        new: null,
        old: { id: '1', name: 'Deleted' },
        table: 'drivers',
        schema: 'public',
        commitTimestamp: '2026-04-03T10:00:00Z',
      })
    })

    it('debería reutilizar el mismo canal si ya existe para esa tabla', () => {
      const { subscribe } = useRealtime()

      subscribe('alerts', vi.fn())
      subscribe('alerts', vi.fn())

      expect(mockSupabase.channel).toHaveBeenCalledTimes(1)
    })
  })

  describe('unsubscribe', () => {
    it('debería llamar removeChannel para la tabla', () => {
      const { subscribe, unsubscribe } = useRealtime()

      subscribe('alerts', vi.fn())
      const channel = mockSupabase.channel.mock.results[0].value
      unsubscribe('alerts')

      expect(mockSupabase.removeChannel).toHaveBeenCalledWith(channel)
    })

    it('debería no hacer nada si no hay canal para esa tabla', () => {
      const { unsubscribe } = useRealtime()

      unsubscribe('nonexistent')

      expect(mockSupabase.removeChannel).not.toHaveBeenCalled()
    })
  })

  describe('unsubscribeAll', () => {
    it('debería limpiar todos los canales activos', () => {
      const { subscribe, unsubscribeAll } = useRealtime()

      subscribe('alerts', vi.fn())
      const channel1 = mockSupabase.channel.mock.results[0].value
      subscribe('vehicles', vi.fn())
      const channel2 = mockSupabase.channel.mock.results[1].value
      unsubscribeAll()

      expect(mockSupabase.removeChannel).toHaveBeenCalledWith(channel1)
      expect(mockSupabase.removeChannel).toHaveBeenCalledWith(channel2)
    })
  })

  describe('manejo de errores', () => {
    it('debería set error state al recibir CHANNEL_ERROR', () => {
      const { subscribe, error, connectionStatus } = useRealtime()

      subscribe('alerts', vi.fn())
      const channel = mockSupabase.channel.mock.results[0].value
      const statusCb = channel.subscribe.mock.calls[0][0]
      statusCb('CHANNEL_ERROR')

      expect(connectionStatus.value).toBe('error')
      expect(error.value).toBe('Conexión perdida')
    })

    it('debería programar reconexión al recibir CLOSED', () => {
      const { subscribe, connectionStatus } = useRealtime()

      subscribe('alerts', vi.fn())
      const channel = mockSupabase.channel.mock.results[0].value
      const statusCb = channel.subscribe.mock.calls[0][0]
      statusCb('CLOSED')

      // CLOSED should trigger reconnection flow
      // A new channel should be created after backoff timer fires
      expect(connectionStatus.value).not.toBe('connected')
      expect(mockSupabase.removeChannel).toHaveBeenCalledWith(channel)
    })

    it('debería usar backoff exponencial para reconexión (1s → 2s → 4s)', () => {
      const { subscribe } = useRealtime()

      subscribe('alerts', vi.fn())
      const channel1 = mockSupabase.channel.mock.results[0].value
      const statusCb1 = channel1.subscribe.mock.calls[0][0]
      statusCb1('CLOSED')

      vi.advanceTimersByTime(1000)

      expect(mockSupabase.channel).toHaveBeenCalledTimes(2)
    })

    it('debería dar error permanente tras 10 reintentos', () => {
      const { subscribe, error, connectionStatus } = useRealtime()

      subscribe('alerts', vi.fn())

      // Initial subscribe + 10 reconnects = 11 channels total
      // After 10 failures (retryCount reaches MAX_RETRIES), permanent error
      for (let i = 0; i < 11; i++) {
        const channel = mockSupabase.channel.mock.results[i].value
        const statusCb = channel.subscribe.mock.calls[0][0]
        statusCb('CLOSED')
        const backoff = Math.min(1000 * Math.pow(2, i), 30000)
        vi.advanceTimersByTime(backoff)
      }

      expect(connectionStatus.value).toBe('error')
      expect(error.value).toContain('reconexión')
    })
  })

  describe('múltiples tablas', () => {
    it('debería crear canales independientes para cada tabla', () => {
      const { subscribe } = useRealtime()

      subscribe('alerts', vi.fn())
      subscribe('vehicles', vi.fn())

      expect(mockSupabase.channel).toHaveBeenCalledTimes(2)
      expect(mockSupabase.channel).toHaveBeenCalledWith('alerts_changes')
      expect(mockSupabase.channel).toHaveBeenCalledWith('vehicles_changes')
    })
  })

  describe('graceful degradation', () => {
    it('debería hacer no-op si no hay supabase disponible', () => {
      const { subscribe } = useRealtime()

      expect(() => subscribe('alerts', vi.fn())).not.toThrow()
    })
  })
})

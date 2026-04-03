/**
 * FleetControl — useRealtime Composable
 *
 * Generic Supabase Realtime subscription manager.
 * Handles channel creation, event routing, error handling,
 * and automatic reconnection with exponential backoff.
 *
 * @see AGENTS.md §17 — Realtime Subscriptions
 * @see docs/plans/realtime-subscriptions.md — Fase 2
 *
 * @returns {Object} Realtime API
 * @returns {Ref<string>} connectionStatus - 'connected' | 'connecting' | 'error' | 'disconnected'
 * @returns {Ref<string|null>} error - Error message or null
 * @returns {Function} subscribe - (table, handler) => void
 * @returns {Function} unsubscribe - (table) => void
 * @returns {Function} unsubscribeAll - () => void
 *
 * @example
 * const realtime = useRealtime()
 *
 * onMounted(() => {
 *   realtime.subscribe('alerts', handleAlertChange)
 * })
 *
 * onUnmounted(() => {
 *   realtime.unsubscribe('alerts')
 * })
 */

import { ref } from 'vue'
import { supabase } from '@/services/supabase-client.js'

// ── Module-level singleton state ──────────────────────────────────────
const channels = new Map()
const handlers = new Map()
const reconnectTimers = new Map()
const retryCounts = new Map()

const MAX_RETRIES = 10
const MAX_BACKOFF = 30000 // 30s

/**
 * Calculate exponential backoff delay.
 * @param {number} retryCount - Current retry attempt number
 * @returns {number} Delay in milliseconds
 */
function getBackoff(retryCount) {
  return Math.min(1000 * Math.pow(2, retryCount), MAX_BACKOFF)
}

/**
 * Set up postgres_changes listener on a channel.
 * Does NOT call subscribe — caller must do that.
 * @param {object} channel - Supabase channel instance
 * @param {string} table - Table name for the filter
 * @param {Function} handler - Callback for change events
 */
function setupListener(channel, table, handler) {
  channel.on('postgres_changes', { event: '*', schema: 'public', table }, payload => {
    handler({
      eventType: payload.eventType,
      new: payload.new,
      old: payload.old,
      table: payload.table,
      schema: payload.schema,
      commitTimestamp: payload.commit_timestamp,
    })
  })
}

/**
 * Build status change handler for a given table.
 * @param {string} table - Table name
 * @param {Function} handler - Original event handler
 * @param {object} ctx - { connectionStatus, error } refs
 * @returns {Function} Status callback
 */
function buildStatusHandler(table, handler, ctx) {
  return status => {
    if (status === 'SUBSCRIBED') {
      ctx.connectionStatus.value = 'connected'
      ctx.error.value = null
      retryCounts.set(table, 0)
    }

    if (status === 'CHANNEL_ERROR') {
      ctx.connectionStatus.value = 'error'
      ctx.error.value = 'Conexión perdida'
      const currentRetry = retryCounts.get(table) || 0
      retryCounts.set(table, currentRetry + 1)
      cleanupChannel(table)
      if (currentRetry < MAX_RETRIES) {
        scheduleReconnect(table, handler, ctx, currentRetry)
      } else {
        ctx.error.value = 'Error permanente tras múltiples intentos de reconexión'
      }
    }

    if (status === 'CLOSED') {
      const currentRetry = retryCounts.get(table) || 0
      retryCounts.set(table, currentRetry + 1)
      cleanupChannel(table)
      if (currentRetry < MAX_RETRIES) {
        scheduleReconnect(table, handler, ctx, currentRetry)
      } else {
        ctx.connectionStatus.value = 'error'
        ctx.error.value = 'Error permanente tras múltiples intentos de reconexión'
      }
    }
  }
}

/**
 * Schedule reconnection with exponential backoff.
 * @param {string} table - Table name
 * @param {Function} handler - Original event handler
 * @param {object} ctx - { connectionStatus, error } refs
 * @param {number} retryCount - Current retry attempt (0-based)
 */
function scheduleReconnect(table, handler, ctx, retryCount) {
  const delay = getBackoff(retryCount)

  const timer = setTimeout(() => {
    reconnectTimers.delete(table)
    ctx.connectionStatus.value = 'connecting'
    doSubscribe(table, handler, ctx)
  }, delay)

  reconnectTimers.set(table, timer)
}

/**
 * Clean up a channel and all associated state.
 * @param {string} table - Table name to clean up
 */
function cleanupChannel(table) {
  const channel = channels.get(table)
  if (channel) {
    supabase.removeChannel(channel)
    channels.delete(table)
  }

  const timer = reconnectTimers.get(table)
  if (timer) {
    clearTimeout(timer)
    reconnectTimers.delete(table)
  }

  handlers.delete(table)
}

/**
 * Internal: create channel, set up listener, and subscribe.
 * @param {string} table - Table name
 * @param {Function} handler - Event handler
 * @param {object} ctx - { connectionStatus, error } refs
 */
function doSubscribe(table, handler, ctx) {
  const channel = supabase.channel(`${table}_changes`)

  setupListener(channel, table, handler)
  channel.subscribe(buildStatusHandler(table, handler, ctx))

  channels.set(table, channel)
}

/**
 * Generic Supabase Realtime subscription composable.
 * Manages channels, event routing, error handling, and auto-reconnection.
 *
 * @returns {object} Realtime API with connection status and subscription methods
 */
export function useRealtime() {
  const connectionStatus = ref('disconnected')
  const error = ref(null)

  const ctx = { connectionStatus, error }

  /**
   * Subscribe to realtime changes on a table.
   * Reuses existing channel if already subscribed.
   *
   * @param {string} table - Table name (e.g., 'alerts', 'vehicles')
   * @param {Function} handler - Callback receiving { eventType, new, old, table, schema, commitTimestamp }
   */
  function subscribe(table, handler) {
    if (!supabase) return

    if (channels.has(table)) {
      handlers.set(table, handler)
      return
    }

    handlers.set(table, handler)
    retryCounts.set(table, 0)
    connectionStatus.value = 'connecting'
    error.value = null

    doSubscribe(table, handler, ctx)
  }

  /**
   * Unsubscribe from a specific table's realtime channel.
   * @param {string} table - Table name to unsubscribe from
   */
  function unsubscribe(table) {
    if (!channels.has(table)) return
    cleanupChannel(table)
    if (channels.size === 0) {
      connectionStatus.value = 'disconnected'
    }
  }

  /**
   * Unsubscribe from all active realtime channels.
   */
  function unsubscribeAll() {
    const tables = Array.from(channels.keys())
    tables.forEach(table => cleanupChannel(table))
    connectionStatus.value = 'disconnected'
    error.value = null
  }

  return {
    connectionStatus,
    error,
    subscribe,
    unsubscribe,
    unsubscribeAll,
  }
}

/**
 * Reset module-level singleton state. Used in tests only.
 * @internal
 */
export function _resetState() {
  channels.clear()
  handlers.clear()
  reconnectTimers.forEach(timer => clearTimeout(timer))
  reconnectTimers.clear()
  retryCounts.clear()
}

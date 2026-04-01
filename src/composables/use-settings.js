/**
 * FleetControl — useSettings Composable
 *
 * Wrapper around the settings Pinia store.
 * Provides the same API but ensures shared state across components.
 *
 * @see PRD §4.10 — Configuración
 */

import { useSettingsStore } from '@/stores/settings.js'

export function useSettings() {
  return useSettingsStore()
}

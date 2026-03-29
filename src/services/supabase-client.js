/**
 * FleetControl — Supabase Client
 *
 * Single instance of the Supabase client.
 * All services import from this module.
 *
 * Uses placeholder values if env vars are missing so the app
 * doesn't crash at startup (useful for UI development without
 * a connected Supabase instance).
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '[FleetControl] Supabase env vars missing. Using placeholder values. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env for real functionality.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

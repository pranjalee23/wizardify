import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// The tables, as supabase/migrations defines them
export type ReservationRow = {
  id: string
  number: number
  email: string
  whatsapp: string
  name: string | null
  house: string | null
  known_for: string | null
  role: string | null
  skyball: string | null
  companion: string | null
  setting: string | null
  wish: string | null
  // The IP address they reserved from, and roughly where that is (see app/reserve/actions.ts)
  ip: string | null
  approx_city: string | null
  approx_region: string | null
  approx_country: string | null
  photos: number
  priority: 'first' | 'standard'
  alerts_email: boolean
  alerts_whatsapp: boolean
  consent_at: string
  continue_sent_at: string | null
  photo_reminders: number
  photo_reminded_at: string | null
  created_at: string
  updated_at: string
}

type Generated = 'id' | 'number' | 'priority' | 'created_at' | 'updated_at'

export type AdminRow = {
  id: string
  email: string
  role: 'super_admin' | 'manager' | 'marketing' | 'viewer'
  created_at: string
  last_login_at: string | null
}

type AdminCodeRow = { email: string; code_hash: string; expires_at: string; attempts: number; sent_at: string }

export type Database = {
  public: {
    Tables: {
      reservations: {
        Row: ReservationRow
        Insert: Partial<Omit<ReservationRow, Generated>> & Pick<ReservationRow, 'email' | 'whatsapp'>
        Update: Partial<Omit<ReservationRow, Generated>>
        Relationships: []
      }
      admins: {
        Row: AdminRow
        Insert: Pick<AdminRow, 'email' | 'role'> & Partial<Pick<AdminRow, 'last_login_at'>>
        Update: Partial<Pick<AdminRow, 'email' | 'role' | 'last_login_at'>>
        Relationships: []
      }
      admin_codes: {
        Row: AdminCodeRow
        Insert: Pick<AdminCodeRow, 'email' | 'code_hash' | 'expires_at'> & Partial<Pick<AdminCodeRow, 'attempts' | 'sent_at'>>
        Update: Partial<AdminCodeRow>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      // Space used, for the daily health check
      usage: { Args: Record<string, never>; Returns: { database_bytes: number; storage_bytes: number }[] }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export const PHOTO_BUCKET = 'reservation-photos'

let client: SupabaseClient<Database> | undefined

// The server's own connection, with the service key: it can read and write everything, so it must
// never reach the browser (server-only makes importing this from a client component fail the build).
export function db() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase is not set up: add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example)')
  client ??= createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return client
}

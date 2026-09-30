import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// The tables, as supabase/migrations defines them
export type ReservationRow = {
  id: string
  number: number
  email: string
  whatsapp: string
  name: string | null
  city: string | null
  house: string | null
  known_for: string | null
  setting: string | null
  wish: string | null
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

export type Database = {
  public: {
    Tables: {
      reservations: {
        Row: ReservationRow
        Insert: Partial<Omit<ReservationRow, Generated>> & Pick<ReservationRow, 'email' | 'whatsapp'>
        Update: Partial<Omit<ReservationRow, Generated>>
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

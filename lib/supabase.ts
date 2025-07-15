import { createClient } from '@supabase/supabase-js'

// Kiểm tra environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Environment check:', {
  url: supabaseUrl ? '✅ Found' : '❌ Missing',
  anonKey: supabaseAnonKey ? '✅ Found' : '❌ Missing',
  serviceKey: supabaseServiceRoleKey ? '✅ Found' : '❌ Missing'
})

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
}

// Client cho frontend (browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Admin client cho backend APIs (chỉ tạo nếu có service role key)
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Database types
export interface Profile {
  id: string
  full_name: string | null
  bio: string | null
  phone: string | null
  location: string | null
  website: string | null
  company: string | null
  avatar_url: string | null
  email_notifications: boolean
  sms_notifications: boolean
  security_notifications: boolean
  marketing_notifications: boolean
  two_factor_enabled: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  payment_id: string
  amount: number
  description: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'expired'
  payment_method?: string
  payment_url?: string
  qr_code?: string
  metadata?: any
  created_at: string
  updated_at: string
  completed_at?: string
  expired_at?: string
}

// Helper functions
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey)
}

export const getSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client is not configured. Make sure SUPABASE_SERVICE_ROLE_KEY is set.')
  }
  return supabaseAdmin
}
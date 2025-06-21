import { createClient } from "@supabase/supabase-js"

// Safe environment variable access
const getEnvVar = (name: string): string | undefined => {
  try {
    return process.env[name]
  } catch {
    return undefined
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
  )
}

// Check if environment variables are valid URLs/keys
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false
  try {
    new URL(url)
    return url.includes("supabase.co")
  } catch {
    return false
  }
}

const isValidKey = (key: string | undefined): boolean => {
  return !!(key && key.length > 50) // Supabase keys are typically longer
}

// Demo mode - simulate authentication without real backend
const createDemoClient = () => {
  // Simple in-memory storage for demo
  const demoUsers = new Map()
  const demoSessions = new Map()

  return {
    auth: {
      signUp: async (credentials: any) => {
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay

        const { email, password, options } = credentials

        if (demoUsers.has(email)) {
          return {
            data: { user: null, session: null },
            error: { message: "User already registered" },
          }
        }

        const user = {
          id: `demo-${Date.now()}`,
          email,
          email_confirmed_at: null,
          user_metadata: options?.data || {},
          created_at: new Date().toISOString(),
        }

        demoUsers.set(email, { ...user, password })

        return {
          data: { user, session: null },
          error: null,
        }
      },

      signInWithPassword: async (credentials: any) => {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const { email, password } = credentials
        const user = demoUsers.get(email)

        if (!user || user.password !== password) {
          return {
            data: { user: null, session: null },
            error: { message: "Invalid login credentials" },
          }
        }

        if (!user.email_confirmed_at) {
          return {
            data: { user: null, session: null },
            error: { message: "Email not confirmed" },
          }
        }

        const session = {
          access_token: `demo-token-${Date.now()}`,
          user: { ...user, password: undefined },
        }

        demoSessions.set(email, session)

        return {
          data: { user: session.user, session },
          error: null,
        }
      },

      signOut: async () => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return { error: null }
      },

      resetPasswordForEmail: async (email: string, options?: any) => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return { error: null }
      },

      verifyOtp: async (params: any) => {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const { email, token, type } = params

        if (type === "signup" && token === "123456") {
          const user = demoUsers.get(email)
          if (user) {
            user.email_confirmed_at = new Date().toISOString()
            demoUsers.set(email, user)

            const session = {
              access_token: `demo-token-${Date.now()}`,
              user: { ...user, password: undefined },
            }

            demoSessions.set(email, session)

            return {
              data: { user: session.user, session },
              error: null,
            }
          }
        }

        return {
          data: { user: null, session: null },
          error: { message: "Invalid or expired OTP" },
        }
      },

      resend: async (params: any) => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return { error: null }
      },

      updateUser: async (attributes: any) => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return {
          data: { user: { id: "demo-user", ...attributes } },
          error: null,
        }
      },

      getSession: async () => {
        // Check if there's a demo session
        const currentUser = Array.from(demoSessions.values())[0]
        return {
          data: { session: currentUser || null },
          error: null,
        }
      },

      onAuthStateChange: (callback: any) => {
        // Simple mock - in real app this would listen to auth changes
        return {
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
        }
      },
    },

    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            await new Promise((resolve) => setTimeout(resolve, 500))

            if (table === "profiles") {
              return {
                data: {
                  id: value,
                  full_name: "Demo User",
                  avatar_url: null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
                error: null,
              }
            }

            return { data: null, error: null }
          },
        }),
      }),
    }),
  }
}

// Create the client safely
let supabaseClient: any

try {
  if (isValidUrl(supabaseUrl) && isValidKey(supabaseAnonKey)) {
    supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  } else {
    console.log("Using demo mode - Supabase not configured")
    supabaseClient = createDemoClient()
  }
} catch (error) {
  console.warn("Failed to create Supabase client, using demo mode:", error)
  supabaseClient = createDemoClient()
}

export const supabase = supabaseClient

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return isValidUrl(supabaseUrl) && isValidKey(supabaseAnonKey)
}

// Helper to check if we're in demo mode
export const isDemoMode = (): boolean => {
  return !isSupabaseConfigured()
}

// Types for our database
export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

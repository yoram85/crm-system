import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// הוראות התקנה:
// 1. לך ל-https://supabase.com
// 2. צור פרויקט חדש (חינם!)
// 3. קבל את ה-URL וה-ANON_KEY מ-Settings > API
// 4. צור קובץ .env.local בשורש הפרויקט עם:
//    VITE_SUPABASE_URL=your-project-url
//    VITE_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '')
}

// יצירת Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce',
  }
})

// Debug: Log when session changes
if (isSupabaseConfigured()) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase auth event:', event, 'Session:', session?.user?.id || 'none')
  })
}

// Database Types
export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          user_id: string
          name: string
          first_name: string
          last_name: string
          email: string
          phone: string
          company: string
          profile_image: string | null
          status: 'active' | 'inactive' | 'lead'
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      deals: {
        Row: {
          id: string
          user_id: string
          customer_id: string
          title: string
          amount: number
          stage: 'lead' | 'proposal' | 'negotiation' | 'won' | 'lost'
          probability: number
          expected_close_date: string
          notes: string
          items: any
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['deals']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['deals']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          customer_id: string | null
          deal_id: string | null
          title: string
          description: string
          due_date: string
          priority: 'low' | 'medium' | 'high'
          status: 'pending' | 'in-progress' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          price: number
          category: string
          image: string | null
          stock: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      services: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          price: number
          duration: number
          category: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['services']['Insert']>
      }
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'admin' | 'manager' | 'sales' | 'support' | 'viewer'
          avatar: string | null
          phone: string | null
          department: string | null
          status: 'active' | 'inactive' | 'pending'
          monthly_target: number | null
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      activities: {
        Row: {
          id: string
          user_id: string
          type: 'customer' | 'deal' | 'task' | 'product' | 'service' | 'user'
          action: 'created' | 'updated' | 'deleted' | 'completed' | 'assigned'
          entity_id: string
          entity_name: string
          description: string
          metadata: any
          timestamp: string
        }
        Insert: Omit<Database['public']['Tables']['activities']['Row'], 'id' | 'timestamp'>
        Update: Partial<Database['public']['Tables']['activities']['Insert']>
      }
    }
  }
}

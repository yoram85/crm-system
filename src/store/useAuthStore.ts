import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthState } from '../types'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>
  logout: () => void
  updateLastLogin: () => void
  initializeAuth: () => Promise<void>
}

// Mock users database (fallback when Supabase is not configured)
const mockUsers: Array<User & { password: string }> = [
  {
    id: '1',
    email: 'admin@crm.com',
    password: 'admin123',
    firstName: 'מנהל',
    lastName: 'ראשי',
    role: 'admin',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
  },
  {
    id: '2',
    email: 'sales@crm.com',
    password: 'sales123',
    firstName: 'איש',
    lastName: 'מכירות',
    role: 'sales',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
  },
  {
    id: '3',
    email: 'viewer@crm.com',
    password: 'viewer123',
    firstName: 'צופה',
    lastName: 'בלבד',
    role: 'viewer',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
  },
]

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      // Initialize auth - check for existing Supabase session
      initializeAuth: async () => {
        if (!isSupabaseConfigured()) {
          console.log('Supabase not configured, using mock auth')
          return
        }

        try {
          const { data: { session } } = await supabase.auth.getSession()

          if (session?.user) {
            // Get user profile from database
            const { data: profile, error } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (!error && profile) {
              const user: User = {
                id: profile.id,
                email: session.user.email || '',
                firstName: profile.first_name,
                lastName: profile.last_name,
                role: profile.role,
                status: profile.status,
                avatar: profile.avatar,
                phone: profile.phone,
                department: profile.department,
                monthlyTarget: profile.monthly_target,
                createdAt: new Date(profile.created_at),
                lastLogin: profile.last_login ? new Date(profile.last_login) : undefined,
              }

              set({ user, isAuthenticated: true })
            }
          }
        } catch (error) {
          console.error('Error initializing auth:', error)
        }
      },

      login: async (email: string, password: string) => {
        // Use Supabase Auth if configured
        if (isSupabaseConfigured()) {
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            })

            if (error) {
              console.error('Login error:', error.message)
              return false
            }

            if (data.user) {
              // Get user profile
              const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', data.user.id)
                .single()

              if (profileError) {
                console.error('Profile error:', profileError.message)
                return false
              }

              // Update last login
              await supabase
                .from('user_profiles')
                .update({ last_login: new Date().toISOString() })
                .eq('id', data.user.id)

              const user: User = {
                id: profile.id,
                email: data.user.email || '',
                firstName: profile.first_name,
                lastName: profile.last_name,
                role: profile.role,
                status: profile.status,
                avatar: profile.avatar,
                phone: profile.phone,
                department: profile.department,
                monthlyTarget: profile.monthly_target,
                createdAt: new Date(profile.created_at),
                lastLogin: new Date(),
              }

              set({
                user,
                isAuthenticated: true,
              })

              return true
            }
          } catch (error) {
            console.error('Login error:', error)
            return false
          }
        }

        // Fallback to mock auth
        await new Promise((resolve) => setTimeout(resolve, 500))

        const user = mockUsers.find(
          (u) => u.email === email && u.password === password
        )

        if (user) {
          const { password: _, ...userWithoutPassword } = user
          set({
            user: { ...userWithoutPassword, lastLogin: new Date() },
            isAuthenticated: true,
          })
          return true
        }

        return false
      },

      register: async (
        email: string,
        password: string,
        firstName: string,
        lastName: string
      ) => {
        // Use Supabase Auth if configured
        if (isSupabaseConfigured()) {
          try {
            console.log('Registering user:', email)

            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  first_name: firstName,
                  last_name: lastName,
                  role: 'sales', // Default role
                },
              },
            })

            if (error) {
              console.error('Registration error:', error.message)
              return false
            }

            if (data.user) {
              console.log('User created in Auth:', data.user.id)

              // Create profile manually (don't rely on trigger)
              const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                  id: data.user.id,
                  first_name: firstName,
                  last_name: lastName,
                  role: 'sales',
                  status: 'active',
                })
                .select()
                .single()

              if (profileError) {
                console.error('Profile creation error:', profileError)
                // Profile might already exist from trigger, try to fetch it
                await new Promise((resolve) => setTimeout(resolve, 1000))

                const { data: existingProfile } = await supabase
                  .from('user_profiles')
                  .select('*')
                  .eq('id', data.user.id)
                  .single()

                if (existingProfile) {
                  console.log('Using existing profile:', existingProfile)
                  const user: User = {
                    id: existingProfile.id,
                    email: data.user.email || '',
                    firstName: existingProfile.first_name,
                    lastName: existingProfile.last_name,
                    role: existingProfile.role,
                    status: existingProfile.status,
                    avatar: existingProfile.avatar,
                    phone: existingProfile.phone,
                    department: existingProfile.department,
                    monthlyTarget: existingProfile.monthly_target,
                    createdAt: new Date(existingProfile.created_at),
                    lastLogin: new Date(),
                  }

                  set({
                    user,
                    isAuthenticated: true,
                  })

                  return true
                }

                console.error('Failed to create or fetch profile')
                return false
              }

              if (profile) {
                console.log('Profile created successfully:', profile)

                const user: User = {
                  id: profile.id,
                  email: data.user.email || '',
                  firstName: profile.first_name,
                  lastName: profile.last_name,
                  role: profile.role,
                  status: profile.status,
                  avatar: profile.avatar,
                  phone: profile.phone,
                  department: profile.department,
                  monthlyTarget: profile.monthly_target,
                  createdAt: new Date(profile.created_at),
                  lastLogin: new Date(),
                }

                set({
                  user,
                  isAuthenticated: true,
                })

                return true
              }
            }
          } catch (error) {
            console.error('Registration error:', error)
            return false
          }
        }

        // Fallback to mock auth
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Check if user exists
        if (mockUsers.find((u) => u.email === email)) {
          return false
        }

        const newUser: User = {
          id: crypto.randomUUID(),
          email,
          firstName,
          lastName,
          role: 'sales', // Default role
          status: 'active',
          createdAt: new Date(),
          lastLogin: new Date(),
        }

        // Add to mock database
        mockUsers.push({ ...newUser, password })

        set({
          user: newUser,
          isAuthenticated: true,
        })

        return true
      },

      logout: async () => {
        console.log('Logging out...')

        // Sign out from Supabase
        if (isSupabaseConfigured()) {
          console.log('Signing out from Supabase...')
          await supabase.auth.signOut()
        }

        // Clear auth state
        set({ user: null, isAuthenticated: false })

        // Clear LocalStorage
        localStorage.removeItem('auth-storage')
        localStorage.removeItem('crm-storage')

        console.log('Logout complete - all storage cleared')
      },

      updateLastLogin: async () => {
        const state = get()
        if (state.user && isSupabaseConfigured()) {
          await supabase
            .from('user_profiles')
            .update({ last_login: new Date().toISOString() })
            .eq('id', state.user.id)
        }

        set((state) => ({
          user: state.user ? { ...state.user, lastLogin: new Date() } : null,
        }))
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

// Listen to auth state changes
if (isSupabaseConfigured()) {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT') {
      useAuthStore.getState().logout()
    } else if (event === 'SIGNED_IN' && session?.user) {
      // Refresh user data
      await useAuthStore.getState().initializeAuth()
    }
  })
}

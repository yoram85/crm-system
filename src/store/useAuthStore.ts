import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthState } from '../types'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>
  signInWithGoogle: () => Promise<void>
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

// Flag to prevent multiple simultaneous auth initializations
let isInitializing = false

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      // Initialize auth - check for existing Supabase session
      initializeAuth: async () => {
        console.log('🟣 [AuthStore] initializeAuth called')

        // Prevent race conditions
        if (isInitializing) {
          console.log('⚠️ [AuthStore] Already initializing, skipping...')
          return
        }

        isInitializing = true

        if (!isSupabaseConfigured()) {
          console.log('⚠️ [AuthStore] Supabase not configured, using mock auth')
          isInitializing = false
          return
        }

        console.log('🟣 [AuthStore] Checking for existing session...')

        try {
          console.log('🟣 [AuthStore] About to call supabase.auth.getSession()...')
          const sessionResult = await supabase.auth.getSession()
          console.log('🟣 [AuthStore] getSession() returned:', sessionResult)

          const { data: { session }, error: sessionError } = sessionResult

          console.log('🟣 [AuthStore] Session check result:', {
            hasSession: !!session,
            hasUser: !!session?.user,
            email: session?.user?.email,
            sessionError
          })

          if (session?.user) {
            console.log('✅ [AuthStore] Found session for user:', session.user.email)
            console.log('🟣 [AuthStore] User metadata:', session.user.user_metadata)

            // Get user profile from database
            console.log('🟣 [AuthStore] Fetching user profile from database...')
            let { data: profile, error } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            console.log('🟣 [AuthStore] Profile fetch result:', { profile, error })

            // If profile doesn't exist (e.g., Google OAuth first login), create it
            if (error && error.code === 'PGRST116') {
              console.log('⚠️ [AuthStore] Profile not found, creating from OAuth user...')

              // Extract name from user metadata or email
              const userMeta = session.user.user_metadata
              const firstName = userMeta?.full_name?.split(' ')[0] || userMeta?.name?.split(' ')[0] || session.user.email?.split('@')[0] || 'משתמש'
              const lastName = userMeta?.full_name?.split(' ').slice(1).join(' ') || userMeta?.name?.split(' ').slice(1).join(' ') || 'חדש'

              // Automatically set yoram1985@gmail.com as admin
              const role = session.user.email === 'yoram1985@gmail.com' ? 'admin' : 'sales'

              console.log('🟣 [AuthStore] Creating profile with:', { firstName, lastName, role })

              const { data: newProfile, error: createError } = await supabase
                .from('user_profiles')
                .insert({
                  id: session.user.id,
                  first_name: firstName,
                  last_name: lastName,
                  role: role,
                  status: 'active',
                  avatar: userMeta?.avatar_url || userMeta?.picture,
                })
                .select()
                .single()

              console.log('🟣 [AuthStore] Profile creation result:', { newProfile, createError })

              if (!createError && newProfile) {
                profile = newProfile
                console.log('✅ [AuthStore] Profile created successfully')
              } else {
                console.error('❌ [AuthStore] Failed to create profile:', createError)
              }
            }

            if (profile) {
              console.log('✅ [AuthStore] Profile found/created:', profile)

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

              console.log('✅ [AuthStore] Setting user state:', user)
              set({ user, isAuthenticated: true })
              console.log('✅ [AuthStore] User authenticated successfully!')
            } else {
              console.error('❌ [AuthStore] No profile available after creation attempt')
            }
          } else {
            console.log('ℹ️ [AuthStore] No active session found')
          }
        } catch (error) {
          console.error('❌ [AuthStore] Error initializing auth:', error)
        } finally {
          isInitializing = false
          console.log('🟣 [AuthStore] initializeAuth completed, flag reset')
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

      signInWithGoogle: async () => {
        console.log('🟢 [AuthStore] signInWithGoogle called')
        console.log('🟢 [AuthStore] Checking if Supabase is configured...')

        if (!isSupabaseConfigured()) {
          console.error('❌ [AuthStore] Supabase not configured for Google OAuth')
          throw new Error('Supabase לא מוגדר. בדוק את קובץ .env.local')
        }

        console.log('✅ [AuthStore] Supabase is configured')

        const redirectUrl = `${window.location.origin}/login`
        console.log('🟢 [AuthStore] Redirect URL:', redirectUrl)

        try {
          console.log('🟢 [AuthStore] Calling supabase.auth.signInWithOAuth...')
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectUrl,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              },
            },
          })

          console.log('🟢 [AuthStore] OAuth response data:', data)

          if (error) {
            console.error('❌ [AuthStore] Google sign-in error:', error)
            console.error('❌ [AuthStore] Error code:', error.code)
            console.error('❌ [AuthStore] Error message:', error.message)
            console.error('❌ [AuthStore] Error status:', error.status)
            throw error
          }

          // Manually redirect to Google OAuth URL
          if (data?.url) {
            console.log('✅ [AuthStore] OAuth initiated successfully, redirecting to Google...')
            console.log('🟢 [AuthStore] Redirecting to:', data.url)
            window.location.href = data.url
          } else {
            console.error('❌ [AuthStore] No OAuth URL returned from Supabase')
            throw new Error('לא התקבל URL להתחברות')
          }
        } catch (error: any) {
          console.error('❌ [AuthStore] Caught error in signInWithGoogle:', error)
          throw error
        }
      },

      logout: async () => {
        console.log('Logging out...')

        // Clear auth state first
        set({ user: null, isAuthenticated: false })

        // Clear LocalStorage
        localStorage.removeItem('auth-storage')
        localStorage.removeItem('crm-storage')

        // Sign out from Supabase (this will trigger onAuthStateChange but state is already cleared)
        if (isSupabaseConfigured()) {
          console.log('Signing out from Supabase...')
          await supabase.auth.signOut()
        }

        console.log('Logout complete')
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
    console.log('🔶 [AuthStore] Auth state changed:', event, 'Session:', session ? 'exists' : 'none')

    if (event === 'SIGNED_OUT') {
      console.log('🔶 [AuthStore] User signed out')
      // Just clear the state, don't call logout() to avoid infinite loop
      const state = useAuthStore.getState()
      if (state.isAuthenticated) {
        useAuthStore.setState({ user: null, isAuthenticated: false })
      }
    } else if (event === 'SIGNED_IN' && session?.user) {
      console.log('🔶 [AuthStore] User signed in:', session.user.email)

      // Fetch user profile directly instead of calling initializeAuth
      try {
        console.log('🔶 [AuthStore] Fetching profile for signed in user...')
        let { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        // Automatically upgrade yoram1985@gmail.com to admin if not already
        if (!error && profile && session.user.email === 'yoram1985@gmail.com' && profile.role !== 'admin') {
          console.log('🔶 [AuthStore] Upgrading yoram1985@gmail.com to admin...')
          const { data: updatedProfile } = await supabase
            .from('user_profiles')
            .update({ role: 'admin' })
            .eq('id', session.user.id)
            .select()
            .single()

          if (updatedProfile) {
            profile = updatedProfile
            console.log('✅ [AuthStore] Upgraded to admin')
          }
        }

        if (!error && profile) {
          console.log('🔶 [AuthStore] Profile found:', profile)
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

          console.log('✅ [AuthStore] Setting authenticated user from SIGNED_IN event')
          console.log('✅ [AuthStore] User object:', user)
          console.log('✅ [AuthStore] About to set isAuthenticated = true')
          useAuthStore.setState({ user, isAuthenticated: true })
          console.log('✅ [AuthStore] State updated! isAuthenticated should now be true')
          console.log('✅ [AuthStore] Current state:', useAuthStore.getState().isAuthenticated)
        } else {
          console.error('❌ [AuthStore] Failed to fetch profile:', error)
        }
      } catch (error) {
        console.error('❌ [AuthStore] Error fetching profile:', error)
      }
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('🔶 [AuthStore] Token refreshed')
    } else if (event === 'USER_UPDATED') {
      console.log('🔶 [AuthStore] User updated')
    }
  })
}

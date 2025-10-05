import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthState } from '../types'

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>
  logout: () => void
  updateLastLogin: () => void
}

// Mock users database (in real app, this would be in backend)
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
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Simulate API call
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
        // Simulate API call
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

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      updateLastLogin: () => {
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

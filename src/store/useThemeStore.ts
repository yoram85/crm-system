import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  isDarkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (value: boolean) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDarkMode: false,

      toggleDarkMode: () => {
        set((state) => {
          const newValue = !state.isDarkMode
          // Apply to document
          if (newValue) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          return { isDarkMode: newValue }
        })
      },

      setDarkMode: (value: boolean) => {
        set({ isDarkMode: value })
        if (value) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply theme on page load
        if (state?.isDarkMode) {
          document.documentElement.classList.add('dark')
        }
      },
    }
  )
)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Activity {
  id: string
  type: 'customer' | 'deal' | 'task' | 'product' | 'service' | 'email' | 'login'
  action: 'created' | 'updated' | 'deleted' | 'sent' | 'logged_in'
  userId: string
  userName: string
  entityId?: string
  entityName?: string
  details?: string
  timestamp: Date
}

interface ActivityStore {
  activities: Activity[]
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void
  getActivitiesByType: (type: Activity['type']) => Activity[]
  getActivitiesByEntity: (entityId: string) => Activity[]
  clearActivities: () => void
}

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set, get) => ({
      activities: [],

      addActivity: (activity) => {
        const newActivity: Activity = {
          ...activity,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        }

        set((state) => ({
          activities: [newActivity, ...state.activities].slice(0, 500), // Keep last 500 activities
        }))
      },

      getActivitiesByType: (type) => {
        return get().activities.filter((a) => a.type === type)
      },

      getActivitiesByEntity: (entityId) => {
        return get().activities.filter((a) => a.entityId === entityId)
      },

      clearActivities: () => {
        set({ activities: [] })
      },
    }),
    {
      name: 'activity-log',
    }
  )
)

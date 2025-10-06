import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Customer, Deal, Task, Product, Service, WebhookConfig, IntegrationConfig, User, Activity, Permission } from '../types'
import { notifyWebhooks, syncToIntegrations } from '../utils/integrations'
import { isSupabaseConfigured } from '../lib/supabase'
import * as supabaseSync from '../lib/supabaseSync'

interface CRMState {
  customers: Customer[]
  deals: Deal[]
  tasks: Task[]
  products: Product[]
  services: Service[]
  webhooks: WebhookConfig[]
  integrations: IntegrationConfig[]
  users: User[]
  activities: Activity[]
  currentUser: User | null
  isLoading: boolean
  lastSync: Date | null

  // Data loading
  loadAllData: () => Promise<void>

  // Customer methods
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>

  // Deal methods
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt'>) => Promise<void>
  updateDeal: (id: string, deal: Partial<Deal>) => Promise<void>
  deleteDeal: (id: string) => Promise<void>

  // Task methods
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>
  updateTask: (id: string, task: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>

  // Product methods
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>

  // Service methods
  addService: (service: Omit<Service, 'id' | 'createdAt'>) => Promise<void>
  updateService: (id: string, service: Partial<Service>) => Promise<void>
  deleteService: (id: string) => Promise<void>

  // Webhook methods
  addWebhook: (webhook: Omit<WebhookConfig, 'id' | 'createdAt'>) => void
  updateWebhook: (id: string, webhook: Partial<WebhookConfig>) => void
  deleteWebhook: (id: string) => void

  // Integration methods
  addIntegration: (integration: Omit<IntegrationConfig, 'id' | 'createdAt'>) => void
  updateIntegration: (id: string, integration: Partial<IntegrationConfig>) => void
  deleteIntegration: (id: string) => void

  // User methods
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  setCurrentUser: (user: User | null) => void
  hasPermission: (permission: Permission) => boolean

  // Activity methods
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => Promise<void>
  getActivities: (limit?: number) => Activity[]
  getUserActivities: (userId: string, limit?: number) => Activity[]
}

// Helper to get updateWebhook function
const getUpdateWebhook = () => (id: string, updates: Partial<WebhookConfig>) => {
  useStore.getState().updateWebhook(id, updates)
}

export const useStore = create<CRMState>()(
  persist(
    (set, get) => ({
      customers: [],
      deals: [],
      tasks: [],
      products: [],
      services: [],
      webhooks: [],
      integrations: [],
      users: [],
      activities: [],
      currentUser: null,
      isLoading: false,
      lastSync: null,

      // Load all data from Supabase
      loadAllData: async () => {
        if (!isSupabaseConfigured()) {
          console.log('Supabase not configured, skipping data load')
          return
        }

        console.log('Loading data from Supabase...')
        set({ isLoading: true })

        try {
          const [customers, deals, tasks, products, services, activities] = await Promise.all([
            supabaseSync.fetchCustomers(),
            supabaseSync.fetchDeals(),
            supabaseSync.fetchTasks(),
            supabaseSync.fetchProducts(),
            supabaseSync.fetchServices(),
            supabaseSync.fetchActivities(100),
          ])

          console.log('Data loaded from Supabase:', {
            customers: customers.length,
            deals: deals.length,
            tasks: tasks.length,
            products: products.length,
            services: services.length,
            activities: activities.length,
          })

          set({
            customers,
            deals,
            tasks,
            products,
            services,
            activities,
            lastSync: new Date(),
            isLoading: false,
          })
        } catch (error) {
          console.error('Error loading data:', error)
          set({ isLoading: false })
        }
      },

      // Customer methods
      addCustomer: async (customer) => {
        const newCustomer = {
          ...customer,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          name: `${customer.firstName} ${customer.lastName}`.trim(),
        }

        // Update local state immediately
        set((state) => ({
          customers: [...state.customers, newCustomer],
        }))

        // Sync to Supabase
        if (isSupabaseConfigured()) {
          const created = await supabaseSync.createCustomer(newCustomer)
          if (created) {
            // Update with actual ID from Supabase
            set((state) => ({
              customers: state.customers.map(c =>
                c.id === newCustomer.id ? created : c
              ),
            }))
          }
        }

        // Send to webhooks and integrations
        const state = get()
        notifyWebhooks(state.webhooks, 'customer', 'create', newCustomer, getUpdateWebhook())
        syncToIntegrations(state.integrations, 'customers', 'create', newCustomer)

        // Log activity
        await get().addActivity({
          userId: state.currentUser?.id || 'system',
          type: 'customer',
          action: 'created',
          entityId: newCustomer.id,
          entityName: newCustomer.name,
          description: `נוצר לקוח חדש: ${newCustomer.name}`,
        })
      },

      updateCustomer: async (id, customer) => {
        let updatedCustomer: Customer | null = null

        set((state) => {
          const customers = state.customers.map((c) => {
            if (c.id === id) {
              const updated = { ...c, ...customer }
              if (customer.firstName || customer.lastName) {
                updated.name = `${updated.firstName} ${updated.lastName}`.trim()
              }
              updatedCustomer = updated
              return updated
            }
            return c
          })
          return { customers }
        })

        // Sync to Supabase
        if (isSupabaseConfigured() && updatedCustomer) {
          await supabaseSync.updateCustomer(id, customer)
        }

        // Send to webhooks and integrations
        if (updatedCustomer) {
          const state = get()
          const finalCustomer: Customer = updatedCustomer as Customer
          notifyWebhooks(state.webhooks, 'customer', 'update', finalCustomer, getUpdateWebhook())
          syncToIntegrations(state.integrations, 'customers', 'update', finalCustomer)

          await get().addActivity({
            userId: state.currentUser?.id || 'system',
            type: 'customer',
            action: 'updated',
            entityId: finalCustomer.id,
            entityName: finalCustomer.name,
            description: `עודכן לקוח: ${finalCustomer.name}`,
          })
        }
      },

      deleteCustomer: async (id) => {
        const deletedCustomer = get().customers.find((c) => c.id === id)

        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }))

        // Sync to Supabase
        if (isSupabaseConfigured()) {
          await supabaseSync.deleteCustomer(id)
        }

        // Send to webhooks
        if (deletedCustomer) {
          const state = get()
          notifyWebhooks(state.webhooks, 'customer', 'delete', deletedCustomer, getUpdateWebhook())

          await get().addActivity({
            userId: state.currentUser?.id || 'system',
            type: 'customer',
            action: 'deleted',
            entityId: deletedCustomer.id,
            entityName: deletedCustomer.name,
            description: `נמחק לקוח: ${deletedCustomer.name}`,
          })
        }
      },

      // Deal methods
      addDeal: async (deal) => {
        const newDeal = {
          ...deal,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        }

        set((state) => ({
          deals: [...state.deals, newDeal],
        }))

        if (isSupabaseConfigured()) {
          const created = await supabaseSync.createDeal(newDeal)
          if (created) {
            set((state) => ({
              deals: state.deals.map(d => d.id === newDeal.id ? created : d),
            }))
          }
        }

        const state = get()
        notifyWebhooks(state.webhooks, 'deal', 'create', newDeal, getUpdateWebhook())
        syncToIntegrations(state.integrations, 'deals', 'create', newDeal)

        await get().addActivity({
          userId: state.currentUser?.id || 'system',
          type: 'deal',
          action: 'created',
          entityId: newDeal.id,
          entityName: newDeal.title,
          description: `נוצרה עסקה חדשה: ${newDeal.title}`,
        })
      },

      updateDeal: async (id, deal) => {
        let updatedDeal: Deal | null = null

        set((state) => {
          const deals = state.deals.map((d) => {
            if (d.id === id) {
              const updated = { ...d, ...deal }
              updatedDeal = updated
              return updated
            }
            return d
          })
          return { deals }
        })

        if (isSupabaseConfigured() && updatedDeal) {
          await supabaseSync.updateDeal(id, deal)
        }

        if (updatedDeal) {
          const state = get()
          const finalDeal: Deal = updatedDeal as Deal
          notifyWebhooks(state.webhooks, 'deal', 'update', finalDeal, getUpdateWebhook())
          syncToIntegrations(state.integrations, 'deals', 'update', finalDeal)

          await get().addActivity({
            userId: state.currentUser?.id || 'system',
            type: 'deal',
            action: 'updated',
            entityId: finalDeal.id,
            entityName: finalDeal.title,
            description: `עודכנה עסקה: ${finalDeal.title}`,
          })
        }
      },

      deleteDeal: async (id) => {
        const deletedDeal = get().deals.find((d) => d.id === id)

        set((state) => ({
          deals: state.deals.filter((d) => d.id !== id),
        }))

        if (isSupabaseConfigured()) {
          await supabaseSync.deleteDeal(id)
        }

        if (deletedDeal) {
          const state = get()
          notifyWebhooks(state.webhooks, 'deal', 'delete', deletedDeal, getUpdateWebhook())

          await get().addActivity({
            userId: state.currentUser?.id || 'system',
            type: 'deal',
            action: 'deleted',
            entityId: deletedDeal.id,
            entityName: deletedDeal.title,
            description: `נמחקה עסקה: ${deletedDeal.title}`,
          })
        }
      },

      // Task methods
      addTask: async (task) => {
        const newTask = {
          ...task,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        }

        set((state) => ({
          tasks: [...state.tasks, newTask],
        }))

        if (isSupabaseConfigured()) {
          const created = await supabaseSync.createTask(newTask)
          if (created) {
            set((state) => ({
              tasks: state.tasks.map(t => t.id === newTask.id ? created : t),
            }))
          }
        }

        const state = get()
        notifyWebhooks(state.webhooks, 'task', 'create', newTask, getUpdateWebhook())
        syncToIntegrations(state.integrations, 'tasks', 'create', newTask)

        await get().addActivity({
          userId: state.currentUser?.id || 'system',
          type: 'task',
          action: 'created',
          entityId: newTask.id,
          entityName: newTask.title,
          description: `נוצרה משימה חדשה: ${newTask.title}`,
        })
      },

      updateTask: async (id, task) => {
        let updatedTask: Task | null = null

        set((state) => {
          const tasks = state.tasks.map((t) => {
            if (t.id === id) {
              const updated = { ...t, ...task }
              updatedTask = updated
              return updated
            }
            return t
          })
          return { tasks }
        })

        if (isSupabaseConfigured() && updatedTask) {
          await supabaseSync.updateTask(id, task)
        }

        if (updatedTask) {
          const state = get()
          const finalTask: Task = updatedTask as Task
          notifyWebhooks(state.webhooks, 'task', 'update', finalTask, getUpdateWebhook())
          syncToIntegrations(state.integrations, 'tasks', 'update', finalTask)

          await get().addActivity({
            userId: state.currentUser?.id || 'system',
            type: 'task',
            action: finalTask.status === 'completed' ? 'completed' : 'updated',
            entityId: finalTask.id,
            entityName: finalTask.title,
            description: `עודכנה משימה: ${finalTask.title}`,
          })
        }
      },

      deleteTask: async (id) => {
        const deletedTask = get().tasks.find((t) => t.id === id)

        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }))

        if (isSupabaseConfigured()) {
          await supabaseSync.deleteTask(id)
        }

        if (deletedTask) {
          const state = get()
          notifyWebhooks(state.webhooks, 'task', 'delete', deletedTask, getUpdateWebhook())

          await get().addActivity({
            userId: state.currentUser?.id || 'system',
            type: 'task',
            action: 'deleted',
            entityId: deletedTask.id,
            entityName: deletedTask.title,
            description: `נמחקה משימה: ${deletedTask.title}`,
          })
        }
      },

      // Product methods
      addProduct: async (product) => {
        const newProduct = {
          ...product,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        }

        set((state) => ({
          products: [...state.products, newProduct],
        }))

        if (isSupabaseConfigured()) {
          const created = await supabaseSync.createProduct(newProduct)
          if (created) {
            set((state) => ({
              products: state.products.map(p => p.id === newProduct.id ? created : p),
            }))
          }
        }

        const state = get()
        notifyWebhooks(state.webhooks, 'product', 'create', newProduct, getUpdateWebhook())
        syncToIntegrations(state.integrations, 'products', 'create', newProduct)
      },

      updateProduct: async (id, product) => {
        let updatedProduct: Product | null = null

        set((state) => {
          const products = state.products.map((p) => {
            if (p.id === id) {
              const updated = { ...p, ...product }
              updatedProduct = updated
              return updated
            }
            return p
          })
          return { products }
        })

        if (isSupabaseConfigured() && updatedProduct) {
          await supabaseSync.updateProduct(id, product)
        }

        if (updatedProduct) {
          const state = get()
          notifyWebhooks(state.webhooks, 'product', 'update', updatedProduct, getUpdateWebhook())
          syncToIntegrations(state.integrations, 'products', 'update', updatedProduct)
        }
      },

      deleteProduct: async (id) => {
        const deletedProduct = get().products.find((p) => p.id === id)

        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }))

        if (isSupabaseConfigured()) {
          await supabaseSync.deleteProduct(id)
        }

        if (deletedProduct) {
          const state = get()
          notifyWebhooks(state.webhooks, 'product', 'delete', deletedProduct, getUpdateWebhook())
        }
      },

      // Service methods
      addService: async (service) => {
        const newService = {
          ...service,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        }

        set((state) => ({
          services: [...state.services, newService],
        }))

        if (isSupabaseConfigured()) {
          const created = await supabaseSync.createService(newService)
          if (created) {
            set((state) => ({
              services: state.services.map(s => s.id === newService.id ? created : s),
            }))
          }
        }

        const state = get()
        notifyWebhooks(state.webhooks, 'service', 'create', newService, getUpdateWebhook())
        syncToIntegrations(state.integrations, 'services', 'create', newService)
      },

      updateService: async (id, service) => {
        let updatedService: Service | null = null

        set((state) => {
          const services = state.services.map((s) => {
            if (s.id === id) {
              const updated = { ...s, ...service }
              updatedService = updated
              return updated
            }
            return s
          })
          return { services }
        })

        if (isSupabaseConfigured() && updatedService) {
          await supabaseSync.updateService(id, service)
        }

        if (updatedService) {
          const state = get()
          notifyWebhooks(state.webhooks, 'service', 'update', updatedService, getUpdateWebhook())
          syncToIntegrations(state.integrations, 'services', 'update', updatedService)
        }
      },

      deleteService: async (id) => {
        const deletedService = get().services.find((s) => s.id === id)

        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
        }))

        if (isSupabaseConfigured()) {
          await supabaseSync.deleteService(id)
        }

        if (deletedService) {
          const state = get()
          notifyWebhooks(state.webhooks, 'service', 'delete', deletedService, getUpdateWebhook())
        }
      },

      // Webhook methods (local only)
      addWebhook: (webhook) =>
        set((state) => ({
          webhooks: [
            ...state.webhooks,
            {
              ...webhook,
              id: crypto.randomUUID(),
              createdAt: new Date(),
            },
          ],
        })),

      updateWebhook: (id, webhook) =>
        set((state) => ({
          webhooks: state.webhooks.map((w) =>
            w.id === id ? { ...w, ...webhook } : w
          ),
        })),

      deleteWebhook: (id) =>
        set((state) => ({
          webhooks: state.webhooks.filter((w) => w.id !== id),
        })),

      // Integration methods (local only)
      addIntegration: (integration) =>
        set((state) => ({
          integrations: [
            ...state.integrations,
            {
              ...integration,
              id: crypto.randomUUID(),
              createdAt: new Date(),
            },
          ],
        })),

      updateIntegration: (id, integration) =>
        set((state) => ({
          integrations: state.integrations.map((i) =>
            i.id === id ? { ...i, ...integration } : i
          ),
        })),

      deleteIntegration: (id) =>
        set((state) => ({
          integrations: state.integrations.filter((i) => i.id !== id),
        })),

      // User methods (local only - managed by Supabase Auth)
      addUser: (user) =>
        set((state) => {
          const newUser = {
            ...user,
            id: crypto.randomUUID(),
            createdAt: new Date(),
          }

          return {
            users: [...state.users, newUser],
          }
        }),

      updateUser: (id, user) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...user } : u
          ),
        })),

      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        })),

      setCurrentUser: (user) =>
        set({ currentUser: user }),

      hasPermission: (permission) => {
        const state = get()
        const user = state.currentUser

        if (!user) return false
        if (user.role === 'admin') return true
        if (user.permissions?.includes(permission)) return true

        return false
      },

      // Activity methods
      addActivity: async (activity) => {
        const newActivity = {
          ...activity,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        }

        set((state) => ({
          activities: [newActivity, ...state.activities].slice(0, 1000),
        }))

        if (isSupabaseConfigured()) {
          await supabaseSync.createActivity(newActivity)
        }
      },

      getActivities: (limit = 50) =>
        get().activities.slice(0, limit),

      getUserActivities: (userId, limit = 50) =>
        get()
          .activities.filter((a) => a.userId === userId)
          .slice(0, limit),
    }),
    {
      name: 'crm-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

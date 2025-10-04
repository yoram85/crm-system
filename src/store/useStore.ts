import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Customer, Deal, Task, Product, Service, WebhookConfig, IntegrationConfig } from '../types'
import { notifyWebhooks, syncToIntegrations } from '../utils/integrations'

interface CRMState {
  customers: Customer[]
  deals: Deal[]
  tasks: Task[]
  products: Product[]
  services: Service[]
  webhooks: WebhookConfig[]
  integrations: IntegrationConfig[]

  // Customer methods
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void
  updateCustomer: (id: string, customer: Partial<Customer>) => void
  deleteCustomer: (id: string) => void

  // Deal methods
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt'>) => void
  updateDeal: (id: string, deal: Partial<Deal>) => void
  deleteDeal: (id: string) => void

  // Task methods
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void

  // Product methods
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void

  // Service methods
  addService: (service: Omit<Service, 'id' | 'createdAt'>) => void
  updateService: (id: string, service: Partial<Service>) => void
  deleteService: (id: string) => void

  // Webhook methods
  addWebhook: (webhook: Omit<WebhookConfig, 'id' | 'createdAt'>) => void
  updateWebhook: (id: string, webhook: Partial<WebhookConfig>) => void
  deleteWebhook: (id: string) => void

  // Integration methods
  addIntegration: (integration: Omit<IntegrationConfig, 'id' | 'createdAt'>) => void
  updateIntegration: (id: string, integration: Partial<IntegrationConfig>) => void
  deleteIntegration: (id: string) => void
}

// Helper to get updateWebhook function
const getUpdateWebhook = () => (id: string, updates: Partial<WebhookConfig>) => {
  useStore.getState().updateWebhook(id, updates)
}

export const useStore = create<CRMState>()(
  persist(
    (set) => ({
      customers: [],
      deals: [],
      tasks: [],
      products: [],
      services: [],
      webhooks: [],
      integrations: [],

      // Customer methods
      addCustomer: (customer) =>
        set((state) => {
          const newCustomer = {
            ...customer,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            name: `${customer.firstName} ${customer.lastName}`.trim(),
          }

          // Send to webhooks and integrations
          notifyWebhooks(state.webhooks, 'customer', 'create', newCustomer, getUpdateWebhook())
          syncToIntegrations(state.integrations, 'customers', 'create', newCustomer)

          return {
            customers: [...state.customers, newCustomer],
          }
        }),

      updateCustomer: (id, customer) =>
        set((state) => {
          let updatedCustomer: Customer | null = null

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

          // Send to webhooks and integrations
          if (updatedCustomer) {
            notifyWebhooks(state.webhooks, 'customer', 'update', updatedCustomer, getUpdateWebhook())
            syncToIntegrations(state.integrations, 'customers', 'update', updatedCustomer)
          }

          return { customers }
        }),

      deleteCustomer: (id) =>
        set((state) => {
          const deletedCustomer = state.customers.find((c) => c.id === id)

          // Send to webhooks
          if (deletedCustomer) {
            notifyWebhooks(state.webhooks, 'customer', 'delete', deletedCustomer, getUpdateWebhook())
          }

          return {
            customers: state.customers.filter((c) => c.id !== id),
          }
        }),

      // Deal methods
      addDeal: (deal) =>
        set((state) => {
          const newDeal = {
            ...deal,
            id: crypto.randomUUID(),
            createdAt: new Date(),
          }

          notifyWebhooks(state.webhooks, 'deal', 'create', newDeal, getUpdateWebhook())
          syncToIntegrations(state.integrations, 'deals', 'create', newDeal)

          return {
            deals: [...state.deals, newDeal],
          }
        }),

      updateDeal: (id, deal) =>
        set((state) => {
          let updatedDeal: Deal | null = null

          const deals = state.deals.map((d) => {
            if (d.id === id) {
              const updated = { ...d, ...deal }
              updatedDeal = updated
              return updated
            }
            return d
          })

          if (updatedDeal) {
            notifyWebhooks(state.webhooks, 'deal', 'update', updatedDeal, getUpdateWebhook())
            syncToIntegrations(state.integrations, 'deals', 'update', updatedDeal)
          }

          return { deals }
        }),

      deleteDeal: (id) =>
        set((state) => {
          const deletedDeal = state.deals.find((d) => d.id === id)

          if (deletedDeal) {
            notifyWebhooks(state.webhooks, 'deal', 'delete', deletedDeal, getUpdateWebhook())
          }

          return {
            deals: state.deals.filter((d) => d.id !== id),
          }
        }),

      // Task methods
      addTask: (task) =>
        set((state) => {
          const newTask = {
            ...task,
            id: crypto.randomUUID(),
            createdAt: new Date(),
          }

          notifyWebhooks(state.webhooks, 'task', 'create', newTask, getUpdateWebhook())
          syncToIntegrations(state.integrations, 'tasks', 'create', newTask)

          return {
            tasks: [...state.tasks, newTask],
          }
        }),

      updateTask: (id, task) =>
        set((state) => {
          let updatedTask: Task | null = null

          const tasks = state.tasks.map((t) => {
            if (t.id === id) {
              const updated = { ...t, ...task }
              updatedTask = updated
              return updated
            }
            return t
          })

          if (updatedTask) {
            notifyWebhooks(state.webhooks, 'task', 'update', updatedTask, getUpdateWebhook())
            syncToIntegrations(state.integrations, 'tasks', 'update', updatedTask)
          }

          return { tasks }
        }),

      deleteTask: (id) =>
        set((state) => {
          const deletedTask = state.tasks.find((t) => t.id === id)

          if (deletedTask) {
            notifyWebhooks(state.webhooks, 'task', 'delete', deletedTask, getUpdateWebhook())
          }

          return {
            tasks: state.tasks.filter((t) => t.id !== id),
          }
        }),

      // Product methods
      addProduct: (product) =>
        set((state) => {
          const newProduct = {
            ...product,
            id: crypto.randomUUID(),
            createdAt: new Date(),
          }

          notifyWebhooks(state.webhooks, 'product', 'create', newProduct, getUpdateWebhook())
          syncToIntegrations(state.integrations, 'products', 'create', newProduct)

          return {
            products: [...state.products, newProduct],
          }
        }),

      updateProduct: (id, product) =>
        set((state) => {
          let updatedProduct: Product | null = null

          const products = state.products.map((p) => {
            if (p.id === id) {
              const updated = { ...p, ...product }
              updatedProduct = updated
              return updated
            }
            return p
          })

          if (updatedProduct) {
            notifyWebhooks(state.webhooks, 'product', 'update', updatedProduct, getUpdateWebhook())
            syncToIntegrations(state.integrations, 'products', 'update', updatedProduct)
          }

          return { products }
        }),

      deleteProduct: (id) =>
        set((state) => {
          const deletedProduct = state.products.find((p) => p.id === id)

          if (deletedProduct) {
            notifyWebhooks(state.webhooks, 'product', 'delete', deletedProduct, getUpdateWebhook())
          }

          return {
            products: state.products.filter((p) => p.id !== id),
          }
        }),

      // Service methods
      addService: (service) =>
        set((state) => {
          const newService = {
            ...service,
            id: crypto.randomUUID(),
            createdAt: new Date(),
          }

          notifyWebhooks(state.webhooks, 'service', 'create', newService, getUpdateWebhook())
          syncToIntegrations(state.integrations, 'services', 'create', newService)

          return {
            services: [...state.services, newService],
          }
        }),

      updateService: (id, service) =>
        set((state) => {
          let updatedService: Service | null = null

          const services = state.services.map((s) => {
            if (s.id === id) {
              const updated = { ...s, ...service }
              updatedService = updated
              return updated
            }
            return s
          })

          if (updatedService) {
            notifyWebhooks(state.webhooks, 'service', 'update', updatedService, getUpdateWebhook())
            syncToIntegrations(state.integrations, 'services', 'update', updatedService)
          }

          return { services }
        }),

      deleteService: (id) =>
        set((state) => {
          const deletedService = state.services.find((s) => s.id === id)

          if (deletedService) {
            notifyWebhooks(state.webhooks, 'service', 'delete', deletedService, getUpdateWebhook())
          }

          return {
            services: state.services.filter((s) => s.id !== id),
          }
        }),

      // Webhook methods
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

      // Integration methods
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
    }),
    {
      name: 'crm-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

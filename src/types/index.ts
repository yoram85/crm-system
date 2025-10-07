export interface Customer {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  profileImage?: string
  status: 'active' | 'inactive' | 'lead' | 'customer'
  createdAt: Date
  notes: string
}

export interface DealItem {
  id: string
  type: 'product' | 'service'
  itemId: string
  quantity: number
  price: number
  discount?: number
}

export interface Deal {
  id: string
  title: string
  customerId: string
  amount: number
  stage: 'lead' | 'proposal' | 'negotiation' | 'won' | 'lost'
  probability: number
  expectedCloseDate: Date
  createdAt: Date
  notes: string
  items?: DealItem[] // מוצרים ושירותים בעסקה
}

export interface Task {
  id: string
  title: string
  description: string
  customerId?: string
  dealId?: string
  dueDate: Date
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: Date
  notes?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  stock: number
  createdAt: Date
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number // in minutes
  category: string
  createdAt: Date
}

export interface DashboardStats {
  totalCustomers: number
  activeDeals: number
  pendingTasks: number
  monthlyRevenue: number
}

export interface WebhookConfig {
  id: string
  name: string
  url: string
  enabled: boolean
  events: ('customer' | 'deal' | 'task' | 'product' | 'service')[]
  createdAt: Date
  status?: 'connected' | 'disconnected' | 'error'
  lastSuccess?: Date
  lastError?: {
    message: string
    timestamp: Date
  }
  successCount?: number
  errorCount?: number
}

export interface IntegrationConfig {
  id: string
  type: 'google-sheets' | 'airtable'
  enabled: boolean
  config: GoogleSheetsConfig | AirtableConfig
  createdAt: Date
  status?: 'connected' | 'disconnected' | 'error'
  lastSuccess?: Date
  lastError?: {
    message: string
    timestamp: Date
  }
  successCount?: number
  errorCount?: number
}

export interface GoogleSheetsConfig {
  spreadsheetId: string
  credentials: string // JSON string של Service Account credentials
  sheetNames: {
    customers?: string
    deals?: string
    tasks?: string
    products?: string
    services?: string
  }
}

export interface AirtableConfig {
  apiKey: string
  baseId: string
  tableNames: {
    customers?: string
    deals?: string
    tasks?: string
    products?: string
    services?: string
  }
}

export type UserRole = 'developer' | 'admin' | 'manager' | 'sales' | 'support' | 'user' | 'viewer'

export type Permission =
  | 'customers.view' | 'customers.create' | 'customers.edit' | 'customers.delete'
  | 'deals.view' | 'deals.create' | 'deals.edit' | 'deals.delete'
  | 'tasks.view' | 'tasks.create' | 'tasks.edit' | 'tasks.delete'
  | 'products.view' | 'products.create' | 'products.edit' | 'products.delete'
  | 'reports.view' | 'reports.export'
  | 'team.view' | 'team.manage'
  | 'settings.view' | 'settings.edit'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatar?: string
  phone?: string
  department?: string
  status: 'active' | 'inactive' | 'pending'
  permissions?: Permission[]
  createdAt: Date
  lastLogin?: Date
  assignedCustomers?: string[] // IDs של לקוחות שמוקצים למשתמש
  monthlyTarget?: number // יעד מכירות חודשי
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

export interface Activity {
  id: string
  userId: string
  type: 'customer' | 'deal' | 'task' | 'product' | 'service' | 'user'
  action: 'created' | 'updated' | 'deleted' | 'completed' | 'assigned'
  entityId: string
  entityName: string
  description: string
  metadata?: Record<string, any>
  timestamp: Date
}

export interface TeamPerformance {
  userId: string
  deals: {
    total: number
    won: number
    lost: number
    value: number
  }
  tasks: {
    completed: number
    pending: number
    overdue: number
  }
  customers: {
    total: number
    active: number
  }
  lastActivityDate: Date
}

export interface Customer {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  profileImage?: string
  status: 'active' | 'inactive' | 'lead'
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

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'user' | 'viewer'
  createdAt: Date
  lastLogin?: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

import { supabase, isSupabaseConfigured } from './supabase'
import { Customer, Deal, Task, Product, Service, Activity } from '../types'

// Helper to get current user ID
const getCurrentUserId = async (): Promise<string | null> => {
  if (!isSupabaseConfigured()) {
    console.log('getCurrentUserId: Supabase not configured')
    return null
  }

  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('getCurrentUserId: Error getting session:', error)
    return null
  }

  console.log('getCurrentUserId: session =', session)
  console.log('getCurrentUserId: user ID =', session?.user?.id)

  return session?.user?.id || null
}

// ==================== CUSTOMERS ====================

export const fetchCustomers = async (): Promise<Customer[]> => {
  console.log('🔵 fetchCustomers: Starting...')

  if (!isSupabaseConfigured()) {
    console.log('⚠️ fetchCustomers: Supabase not configured')
    return []
  }

  const userId = await getCurrentUserId()
  console.log('🔵 fetchCustomers: userId =', userId)

  if (!userId) {
    console.log('⚠️ fetchCustomers: No user ID')
    return []
  }

  console.log('🔵 fetchCustomers: Querying customers for user:', userId)

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  console.log('🔵 fetchCustomers: Query result:', { data, error, count: data?.length })

  if (error) {
    console.error('❌ fetchCustomers: Error:', error)
    return []
  }

  console.log(`✅ fetchCustomers: Found ${data.length} customers`)

  return data.map(row => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    profileImage: row.profile_image,
    status: row.status,
    notes: row.notes,
    createdAt: new Date(row.created_at),
  }))
}

export const createCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer | null> => {
  if (!isSupabaseConfigured()) {
    console.log('createCustomer: Supabase not configured')
    return null
  }

  const userId = await getCurrentUserId()
  console.log('createCustomer: userId =', userId)

  if (!userId) {
    console.error('createCustomer: No user ID found!')
    return null
  }

  console.log('createCustomer: Inserting customer to Supabase...', {
    user_id: userId,
    name: customer.name,
    email: customer.email,
  })

  const insertData = {
    user_id: userId,
    first_name: customer.firstName,
    last_name: customer.lastName,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    company: customer.company,
    profile_image: customer.profileImage,
    status: customer.status,
    notes: customer.notes || '',
  }

  console.log('createCustomer: About to insert:', insertData)

  const { data, error } = await supabase
    .from('customers')
    .insert(insertData)
    .select()
    .single()

  console.log('createCustomer: Insert result:', { data, error })

  if (error) {
    console.error('createCustomer: Error creating customer:', error)
    console.error('createCustomer: Error code:', error.code)
    console.error('createCustomer: Error message:', error.message)
    console.error('createCustomer: Error details:', error.details)
    console.error('createCustomer: Error hint:', error.hint)
    return null
  }

  console.log('createCustomer: Customer created successfully!', data)

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    profileImage: data.profile_image,
    status: data.status,
    notes: data.notes,
    createdAt: new Date(data.created_at),
  }
}

export const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false

  const updateData: any = {}
  if (updates.firstName !== undefined) updateData.first_name = updates.firstName
  if (updates.lastName !== undefined) updateData.last_name = updates.lastName
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.email !== undefined) updateData.email = updates.email
  if (updates.phone !== undefined) updateData.phone = updates.phone
  if (updates.company !== undefined) updateData.company = updates.company
  if (updates.profileImage !== undefined) updateData.profile_image = updates.profileImage
  if (updates.status !== undefined) updateData.status = updates.status
  if (updates.notes !== undefined) updateData.notes = updates.notes

  const { error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating customer:', error)
    return false
  }

  return true
}

export const deleteCustomer = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting customer:', error)
    return false
  }

  return true
}

// ==================== DEALS ====================

export const fetchDeals = async (): Promise<Deal[]> => {
  if (!isSupabaseConfigured()) return []

  const userId = await getCurrentUserId()
  if (!userId) return []

  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching deals:', error)
    return []
  }

  return data.map(row => ({
    id: row.id,
    customerId: row.customer_id,
    title: row.title,
    amount: parseFloat(row.amount),
    stage: row.stage,
    probability: row.probability,
    expectedCloseDate: new Date(row.expected_close_date),
    notes: row.notes,
    items: row.items || [],
    createdAt: new Date(row.created_at),
  }))
}

export const createDeal = async (deal: Omit<Deal, 'id' | 'createdAt'>): Promise<Deal | null> => {
  if (!isSupabaseConfigured()) return null

  const userId = await getCurrentUserId()
  if (!userId) return null

  const { data, error } = await supabase
    .from('deals')
    .insert({
      user_id: userId,
      customer_id: deal.customerId,
      title: deal.title,
      amount: deal.amount,
      stage: deal.stage,
      probability: deal.probability,
      expected_close_date: deal.expectedCloseDate.toISOString().split('T')[0],
      notes: deal.notes || '',
      items: deal.items || [],
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating deal:', error)
    return null
  }

  return {
    id: data.id,
    customerId: data.customer_id,
    title: data.title,
    amount: parseFloat(data.amount),
    stage: data.stage,
    probability: data.probability,
    expectedCloseDate: new Date(data.expected_close_date),
    notes: data.notes,
    items: data.items || [],
    createdAt: new Date(data.created_at),
  }
}

export const updateDeal = async (id: string, updates: Partial<Deal>): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false

  const updateData: any = {}
  if (updates.customerId !== undefined) updateData.customer_id = updates.customerId
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.amount !== undefined) updateData.amount = updates.amount
  if (updates.stage !== undefined) updateData.stage = updates.stage
  if (updates.probability !== undefined) updateData.probability = updates.probability
  if (updates.expectedCloseDate !== undefined) updateData.expected_close_date = updates.expectedCloseDate.toISOString().split('T')[0]
  if (updates.notes !== undefined) updateData.notes = updates.notes
  if (updates.items !== undefined) updateData.items = updates.items

  const { error } = await supabase
    .from('deals')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating deal:', error)
    return false
  }

  return true
}

export const deleteDeal = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false

  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting deal:', error)
    return false
  }

  return true
}

// ==================== TASKS ====================

export const fetchTasks = async (): Promise<Task[]> => {
  if (!isSupabaseConfigured()) return []

  const userId = await getCurrentUserId()
  if (!userId) return []

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }

  return data.map(row => ({
    id: row.id,
    customerId: row.customer_id,
    dealId: row.deal_id,
    title: row.title,
    description: row.description,
    dueDate: new Date(row.due_date),
    priority: row.priority,
    status: row.status,
    createdAt: new Date(row.created_at),
  }))
}

export const createTask = async (task: Omit<Task, 'id' | 'createdAt'>): Promise<Task | null> => {
  if (!isSupabaseConfigured()) return null

  const userId = await getCurrentUserId()
  if (!userId) return null

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      customer_id: task.customerId || null,
      deal_id: task.dealId || null,
      title: task.title,
      description: task.description || '',
      due_date: task.dueDate.toISOString().split('T')[0],
      priority: task.priority,
      status: task.status,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating task:', error)
    return null
  }

  return {
    id: data.id,
    customerId: data.customer_id,
    dealId: data.deal_id,
    title: data.title,
    description: data.description,
    dueDate: new Date(data.due_date),
    priority: data.priority,
    status: data.status,
    createdAt: new Date(data.created_at),
  }
}

export const updateTask = async (id: string, updates: Partial<Task>): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false

  const updateData: any = {}
  if (updates.customerId !== undefined) updateData.customer_id = updates.customerId
  if (updates.dealId !== undefined) updateData.deal_id = updates.dealId
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate.toISOString().split('T')[0]
  if (updates.priority !== undefined) updateData.priority = updates.priority
  if (updates.status !== undefined) updateData.status = updates.status

  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating task:', error)
    return false
  }

  return true
}

export const deleteTask = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting task:', error)
    return false
  }

  return true
}

// ==================== PRODUCTS ====================

export const fetchProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) return []

  const userId = await getCurrentUserId()
  if (!userId) return []

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: parseFloat(row.price),
    category: row.category,
    image: row.image,
    stock: row.stock,
    createdAt: new Date(row.created_at),
  }))
}

export const createProduct = async (product: Omit<Product, 'id' | 'createdAt'>): Promise<Product | null> => {
  if (!isSupabaseConfigured()) return null

  const userId = await getCurrentUserId()
  if (!userId) return null

  const { data, error } = await supabase
    .from('products')
    .insert({
      user_id: userId,
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: parseFloat(data.price),
    category: data.category,
    image: data.image,
    stock: data.stock,
    createdAt: new Date(data.created_at),
  }
}

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false

  const updateData: any = {}
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.price !== undefined) updateData.price = updates.price
  if (updates.category !== undefined) updateData.category = updates.category
  if (updates.image !== undefined) updateData.image = updates.image
  if (updates.stock !== undefined) updateData.stock = updates.stock

  const { error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating product:', error)
    return false
  }

  return true
}

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    return false
  }

  return true
}

// ==================== SERVICES ====================

export const fetchServices = async (): Promise<Service[]> => {
  if (!isSupabaseConfigured()) return []

  const userId = await getCurrentUserId()
  if (!userId) return []

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching services:', error)
    return []
  }

  return data.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: parseFloat(row.price),
    duration: row.duration,
    category: row.category,
    createdAt: new Date(row.created_at),
  }))
}

export const createService = async (service: Omit<Service, 'id' | 'createdAt'>): Promise<Service | null> => {
  if (!isSupabaseConfigured()) return null

  const userId = await getCurrentUserId()
  if (!userId) return null

  const { data, error } = await supabase
    .from('services')
    .insert({
      user_id: userId,
      name: service.name,
      description: service.description || '',
      price: service.price,
      duration: service.duration,
      category: service.category,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating service:', error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: parseFloat(data.price),
    duration: data.duration,
    category: data.category,
    createdAt: new Date(data.created_at),
  }
}

export const updateService = async (id: string, updates: Partial<Service>): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false

  const updateData: any = {}
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.price !== undefined) updateData.price = updates.price
  if (updates.duration !== undefined) updateData.duration = updates.duration
  if (updates.category !== undefined) updateData.category = updates.category

  const { error } = await supabase
    .from('services')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating service:', error)
    return false
  }

  return true
}

export const deleteService = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting service:', error)
    return false
  }

  return true
}

// ==================== ACTIVITIES ====================

export const createActivity = async (activity: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity | null> => {
  if (!isSupabaseConfigured()) return null

  const userId = await getCurrentUserId()
  if (!userId) return null

  const { data, error } = await supabase
    .from('activities')
    .insert({
      user_id: userId,
      type: activity.type,
      action: activity.action,
      entity_id: activity.entityId,
      entity_name: activity.entityName,
      description: activity.description || '',
      metadata: activity.metadata || {},
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating activity:', error)
    return null
  }

  return {
    id: data.id,
    userId: data.user_id,
    type: data.type,
    action: data.action,
    entityId: data.entity_id,
    entityName: data.entity_name,
    description: data.description,
    metadata: data.metadata,
    timestamp: new Date(data.timestamp),
  }
}

export const fetchActivities = async (limit: number = 50): Promise<Activity[]> => {
  if (!isSupabaseConfigured()) return []

  const userId = await getCurrentUserId()
  if (!userId) return []

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching activities:', error)
    return []
  }

  return data.map(row => ({
    id: row.id,
    userId: row.user_id,
    type: row.type,
    action: row.action,
    entityId: row.entity_id,
    entityName: row.entity_name,
    description: row.description,
    metadata: row.metadata,
    timestamp: new Date(row.timestamp),
  }))
}

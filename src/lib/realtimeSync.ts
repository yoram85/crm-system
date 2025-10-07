import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from './supabase'
import { useStore } from '../store/useStore'
import { showInfo } from '../utils/toast'

let channels: RealtimeChannel[] = []

/**
 * Subscribe to real-time updates from Supabase
 * This enables live synchronization across multiple users
 */
export const subscribeToRealtimeUpdates = (userId: string) => {
  if (!isSupabaseConfigured()) {
    console.log('⚠️ Supabase not configured, skipping realtime subscriptions')
    return
  }

  console.log('🔴 [Realtime] Starting real-time subscriptions for user:', userId)

  // Unsubscribe from existing channels first
  unsubscribeFromRealtimeUpdates()

  const store = useStore.getState()

  // Subscribe to customers table
  const customersChannel = supabase
    .channel('customers-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'customers',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('🔴 [Realtime] Customers change:', payload)

        if (payload.eventType === 'INSERT') {
          // Reload all data to get the new customer
          store.loadAllData()
          showInfo('לקוח חדש נוסף על ידי חבר צוות')
        } else if (payload.eventType === 'UPDATE') {
          store.loadAllData()
          showInfo('לקוח עודכן על ידי חבר צוות')
        } else if (payload.eventType === 'DELETE') {
          store.loadAllData()
          showInfo('לקוח נמחק על ידי חבר צוות')
        }
      }
    )
    .subscribe((status) => {
      console.log('🔴 [Realtime] Customers subscription status:', status)
    })

  channels.push(customersChannel)

  // Subscribe to deals table
  const dealsChannel = supabase
    .channel('deals-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'deals',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('🔴 [Realtime] Deals change:', payload)

        if (payload.eventType === 'INSERT') {
          store.loadAllData()
          showInfo('עסקה חדשה נוספה על ידי חבר צוות')
        } else if (payload.eventType === 'UPDATE') {
          store.loadAllData()
          showInfo('עסקה עודכנה על ידי חבר צוות')
        } else if (payload.eventType === 'DELETE') {
          store.loadAllData()
          showInfo('עסקה נמחקה על ידי חבר צוות')
        }
      }
    )
    .subscribe((status) => {
      console.log('🔴 [Realtime] Deals subscription status:', status)
    })

  channels.push(dealsChannel)

  // Subscribe to tasks table
  const tasksChannel = supabase
    .channel('tasks-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('🔴 [Realtime] Tasks change:', payload)

        if (payload.eventType === 'INSERT') {
          store.loadAllData()
          showInfo('משימה חדשה נוספה על ידי חבר צוות')
        } else if (payload.eventType === 'UPDATE') {
          store.loadAllData()
          showInfo('משימה עודכנה על ידי חבר צוות')
        } else if (payload.eventType === 'DELETE') {
          store.loadAllData()
          showInfo('משימה נמחקה על ידי חבר צוות')
        }
      }
    )
    .subscribe((status) => {
      console.log('🔴 [Realtime] Tasks subscription status:', status)
    })

  channels.push(tasksChannel)

  // Subscribe to products table
  const productsChannel = supabase
    .channel('products-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'products',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('🔴 [Realtime] Products change:', payload)

        if (payload.eventType === 'INSERT') {
          store.loadAllData()
          showInfo('מוצר חדש נוסף על ידי חבר צוות')
        } else if (payload.eventType === 'UPDATE') {
          store.loadAllData()
        } else if (payload.eventType === 'DELETE') {
          store.loadAllData()
        }
      }
    )
    .subscribe((status) => {
      console.log('🔴 [Realtime] Products subscription status:', status)
    })

  channels.push(productsChannel)

  // Subscribe to services table
  const servicesChannel = supabase
    .channel('services-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'services',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('🔴 [Realtime] Services change:', payload)

        if (payload.eventType === 'INSERT') {
          store.loadAllData()
          showInfo('שירות חדש נוסף על ידי חבר צוות')
        } else if (payload.eventType === 'UPDATE') {
          store.loadAllData()
        } else if (payload.eventType === 'DELETE') {
          store.loadAllData()
        }
      }
    )
    .subscribe((status) => {
      console.log('🔴 [Realtime] Services subscription status:', status)
    })

  channels.push(servicesChannel)

  console.log(`🔴 [Realtime] Subscribed to ${channels.length} channels`)
}

/**
 * Unsubscribe from all real-time updates
 */
export const unsubscribeFromRealtimeUpdates = () => {
  console.log(`🔴 [Realtime] Unsubscribing from ${channels.length} channels`)

  channels.forEach((channel) => {
    supabase.removeChannel(channel)
  })

  channels = []
}

/**
 * Enable Realtime for specific tables in Supabase
 * Run this SQL in Supabase SQL Editor:
 *
 * ALTER PUBLICATION supabase_realtime ADD TABLE customers;
 * ALTER PUBLICATION supabase_realtime ADD TABLE deals;
 * ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
 * ALTER PUBLICATION supabase_realtime ADD TABLE products;
 * ALTER PUBLICATION supabase_realtime ADD TABLE services;
 */

import { Customer, Deal, Task, Product, Service, WebhookConfig, IntegrationConfig, GoogleSheetsConfig, AirtableConfig } from '../types'

// Webhook sender with status tracking
export const sendToWebhook = async (
  webhook: WebhookConfig,
  eventType: 'customer' | 'deal' | 'task' | 'product' | 'service',
  action: 'create' | 'update' | 'delete',
  data: any,
  updateWebhookStatus?: (id: string, status: Partial<WebhookConfig>) => void
): Promise<{ success: boolean; error?: string }> => {
  if (!webhook.enabled || !webhook.events.includes(eventType)) {
    return { success: false, error: 'Webhook disabled or event not subscribed' }
  }

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventType,
        action: action,
        data: data,
        timestamp: new Date().toISOString(),
        webhookName: webhook.name,
      }),
    })

    if (!response.ok) {
      const errorMsg = `HTTP ${response.status}: ${response.statusText}`
      console.error(`Webhook ${webhook.name} failed:`, errorMsg)

      // Update webhook status to error
      if (updateWebhookStatus) {
        updateWebhookStatus(webhook.id, {
          status: 'error',
          lastError: {
            message: errorMsg,
            timestamp: new Date(),
          },
          errorCount: (webhook.errorCount || 0) + 1,
        })
      }

      return { success: false, error: errorMsg }
    }

    // Update webhook status to connected
    if (updateWebhookStatus) {
      updateWebhookStatus(webhook.id, {
        status: 'connected',
        lastSuccess: new Date(),
        successCount: (webhook.successCount || 0) + 1,
      })
    }

    return { success: true }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Network error'
    console.error(`Error sending to webhook ${webhook.name}:`, errorMsg)

    // Update webhook status to error
    if (updateWebhookStatus) {
      updateWebhookStatus(webhook.id, {
        status: 'error',
        lastError: {
          message: errorMsg,
          timestamp: new Date(),
        },
        errorCount: (webhook.errorCount || 0) + 1,
      })
    }

    return { success: false, error: errorMsg }
  }
}

// Send to all enabled webhooks
export const notifyWebhooks = async (
  webhooks: WebhookConfig[],
  eventType: 'customer' | 'deal' | 'task' | 'product' | 'service',
  action: 'create' | 'update' | 'delete',
  data: any,
  updateWebhookStatus?: (id: string, status: Partial<WebhookConfig>) => void
) => {
  const enabledWebhooks = webhooks.filter(w => w.enabled && w.events.includes(eventType))

  const results = await Promise.allSettled(
    enabledWebhooks.map(webhook =>
      sendToWebhook(webhook, eventType, action, data, updateWebhookStatus)
    )
  )

  return results
}

// Google Sheets integration via backend
export const sendToGoogleSheets = async (
  config: GoogleSheetsConfig,
  eventType: 'customer' | 'deal' | 'task' | 'product' | 'service',
  action: 'create' | 'update' | 'delete',
  data: any
) => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

    const response = await fetch(`${backendUrl}/api/google-sheets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        credentials: config.credentials,
        spreadsheetId: config.spreadsheetId,
        event: eventType,
        action: action,
        data: data,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Google Sheets API error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending to Google Sheets:', error)
    return false
  }
}

// Airtable integration
export const sendToAirtable = async (
  config: AirtableConfig,
  tableName: string,
  data: any
) => {
  try {
    const baseId = config.baseId
    const apiKey = config.apiKey

    const url = `https://api.airtable.com/v0/${baseId}/${tableName}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: data,
      }),
    })

    if (!response.ok) {
      console.error('Airtable API error:', response.statusText)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending to Airtable:', error)
    return false
  }
}

// Send to all enabled integrations
export const syncToIntegrations = async (
  integrations: IntegrationConfig[],
  entityType: 'customers' | 'deals' | 'tasks' | 'products' | 'services',
  action: 'create' | 'update' | 'delete',
  data: any
) => {
  const enabledIntegrations = integrations.filter(i => i.enabled)

  // Map entity type to event type
  const eventTypeMap: Record<typeof entityType, 'customer' | 'deal' | 'task' | 'product' | 'service'> = {
    customers: 'customer',
    deals: 'deal',
    tasks: 'task',
    products: 'product',
    services: 'service',
  }

  const eventType = eventTypeMap[entityType]

  for (const integration of enabledIntegrations) {
    if (integration.type === 'google-sheets') {
      const config = integration.config as GoogleSheetsConfig
      const sheetName = config.sheetNames[entityType]

      if (sheetName) {
        await sendToGoogleSheets(config, eventType, action, data)
      }
    } else if (integration.type === 'airtable') {
      const config = integration.config as AirtableConfig
      const tableName = config.tableNames[entityType]

      if (tableName) {
        await sendToAirtable(config, tableName, data)
      }
    }
  }
}

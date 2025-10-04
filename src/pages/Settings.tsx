import { useState } from 'react'
import { Settings as SettingsIcon, Database, Download, Upload, Trash2, Link as LinkIcon, Plus, Edit2, Trash, Power, PowerOff, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { useStore } from '../store/useStore'
import { WebhookConfig, IntegrationConfig, GoogleSheetsConfig, AirtableConfig } from '../types'
import GoogleSheetsPicker from '../components/GoogleSheetsPicker'

const Settings = () => {
  const store = useStore()
  const [showWebhookModal, setShowWebhookModal] = useState(false)
  const [showIntegrationModal, setShowIntegrationModal] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null)
  const [editingIntegration, setEditingIntegration] = useState<IntegrationConfig | null>(null)

  const [webhookForm, setWebhookForm] = useState({
    name: '',
    url: '',
    enabled: true,
    events: [] as ('customer' | 'deal' | 'task' | 'product' | 'service')[],
  })

  const [integrationType, setIntegrationType] = useState<'google-sheets' | 'airtable'>('google-sheets')
  const [googleSheetsForm, setGoogleSheetsForm] = useState<GoogleSheetsConfig>({
    spreadsheetId: '',
    credentials: '',
    sheetNames: {},
  })
  const [airtableForm, setAirtableForm] = useState<AirtableConfig>({
    apiKey: '',
    baseId: '',
    tableNames: {},
  })

  const handleExportData = () => {
    const data = {
      customers: store.customers,
      deals: store.deals,
      tasks: store.tasks,
      products: store.products,
      services: store.services,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `crm-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string)
          if (confirm('האם אתה בטוח? פעולה זו תדרוס את כל הנתונים הקיימים!')) {
            // Import data
            if (data.customers) data.customers.forEach((c: any) => store.addCustomer(c))
            if (data.deals) data.deals.forEach((d: any) => store.addDeal(d))
            if (data.tasks) data.tasks.forEach((t: any) => store.addTask(t))
            if (data.products) data.products.forEach((p: any) => store.addProduct(p))
            if (data.services) data.services.forEach((s: any) => store.addService(s))
            alert('הנתונים יובאו בהצלחה!')
            window.location.reload()
          }
        } catch (error) {
          alert('שגיאה בקריאת הקובץ. אנא וודא שהקובץ תקין.')
        }
      }
      reader.readAsText(file)
    }
  }

  const handleClearAllData = () => {
    if (
      confirm(
        'האם אתה בטוח שברצונך למחוק את כל הנתונים? פעולה זו אינה הפיכה!'
      ) &&
      confirm('האם אתה בטוח לחלוטין? כל הנתונים יימחקו!')
    ) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const stats = {
    customers: store.customers.length,
    deals: store.deals.length,
    tasks: store.tasks.length,
    products: store.products.length,
    services: store.services.length,
  }

  // Webhook handlers
  const handleWebhookSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingWebhook) {
      store.updateWebhook(editingWebhook.id, webhookForm)
    } else {
      store.addWebhook(webhookForm)
    }
    resetWebhookForm()
  }

  const resetWebhookForm = () => {
    setWebhookForm({ name: '', url: '', enabled: true, events: [] })
    setEditingWebhook(null)
    setShowWebhookModal(false)
  }

  const handleEditWebhook = (webhook: WebhookConfig) => {
    setEditingWebhook(webhook)
    setWebhookForm({
      name: webhook.name,
      url: webhook.url,
      enabled: webhook.enabled,
      events: webhook.events,
    })
    setShowWebhookModal(true)
  }

  const handleDeleteWebhook = (id: string) => {
    if (confirm('האם למחוק webhook זה?')) {
      store.deleteWebhook(id)
    }
  }

  const toggleWebhookEvent = (event: 'customer' | 'deal' | 'task' | 'product' | 'service') => {
    setWebhookForm(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }))
  }

  // Integration handlers
  const handleIntegrationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const config = integrationType === 'google-sheets' ? googleSheetsForm : airtableForm

    if (editingIntegration) {
      store.updateIntegration(editingIntegration.id, {
        type: integrationType,
        config: config,
      })
    } else {
      store.addIntegration({
        type: integrationType,
        enabled: true,
        config: config,
      })
    }
    resetIntegrationForm()
  }

  const resetIntegrationForm = () => {
    setGoogleSheetsForm({ spreadsheetId: '', credentials: '', sheetNames: {} })
    setAirtableForm({ apiKey: '', baseId: '', tableNames: {} })
    setEditingIntegration(null)
    setShowIntegrationModal(false)
  }

  const handleEditIntegration = (integration: IntegrationConfig) => {
    setEditingIntegration(integration)
    setIntegrationType(integration.type)
    if (integration.type === 'google-sheets') {
      setGoogleSheetsForm(integration.config as GoogleSheetsConfig)
    } else {
      setAirtableForm(integration.config as AirtableConfig)
    }
    setShowIntegrationModal(true)
  }

  const handleDeleteIntegration = (id: string) => {
    if (confirm('האם למחוק אינטגרציה זו?')) {
      store.deleteIntegration(id)
    }
  }

  const toggleIntegration = (id: string, enabled: boolean) => {
    store.updateIntegration(id, { enabled })
  }

  const testIntegration = async (integration: IntegrationConfig) => {
    try {
      if (integration.type === 'google-sheets') {
        const config = integration.config as GoogleSheetsConfig
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

        // Parse credentials to validate format
        let credentials
        try {
          credentials = JSON.parse(config.credentials)
        } catch (e) {
          alert('❌ שגיאה: קובץ ה-JSON לא תקין')
          store.updateIntegration(integration.id, {
            status: 'error',
            lastError: {
              message: 'Invalid credentials JSON format',
              timestamp: new Date(),
            },
            errorCount: (integration.errorCount || 0) + 1,
          })
          return
        }

        // Validate credentials format
        if (!credentials.client_email || !credentials.private_key) {
          alert('❌ שגיאה: חסרים פרטים בקובץ JSON (client_email או private_key)')
          store.updateIntegration(integration.id, {
            status: 'error',
            lastError: {
              message: 'Invalid credentials format',
              timestamp: new Date(),
            },
            errorCount: (integration.errorCount || 0) + 1,
          })
          return
        }

        // Test connection via backend
        const response = await fetch(`${backendUrl}/api/google-sheets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credentials: config.credentials,
            spreadsheetId: config.spreadsheetId,
            event: 'test',
            action: 'test_connection',
            data: {
              message: 'בדיקת חיבור מ-CRM',
              timestamp: new Date().toISOString(),
            },
          }),
        })

        if (response.ok) {
          const result = await response.json()
          store.updateIntegration(integration.id, {
            status: 'connected',
            lastSuccess: new Date(),
            successCount: (integration.successCount || 0) + 1,
            lastError: undefined,
          })
          alert(`✅ החיבור ל-Google Sheets הצליח!\n\nSpreadsheet: ${result.spreadsheetTitle || config.spreadsheetId}\nService Account: ${credentials.client_email}`)
        } else {
          const error = await response.json()
          const errorMsg = error.error || `HTTP ${response.status}`
          store.updateIntegration(integration.id, {
            status: 'error',
            lastError: {
              message: errorMsg,
              timestamp: new Date(),
            },
            errorCount: (integration.errorCount || 0) + 1,
          })
          alert(`❌ שגיאה: ${errorMsg}`)
        }
      } else if (integration.type === 'airtable') {
        const config = integration.config as AirtableConfig
        const baseId = config.baseId
        const apiKey = config.apiKey

        // Test Airtable API connection
        const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        })

        if (response.ok) {
          store.updateIntegration(integration.id, {
            status: 'connected',
            lastSuccess: new Date(),
            successCount: (integration.successCount || 0) + 1,
            lastError: undefined,
          })
          alert('✅ החיבור ל-Airtable הצליח!')
        } else {
          const errorMsg = `HTTP ${response.status}: ${response.statusText}`
          store.updateIntegration(integration.id, {
            status: 'error',
            lastError: {
              message: errorMsg,
              timestamp: new Date(),
            },
            errorCount: (integration.errorCount || 0) + 1,
          })
          alert(`❌ שגיאה: ${errorMsg}`)
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Connection failed'
      store.updateIntegration(integration.id, {
        status: 'error',
        lastError: {
          message: errorMsg,
          timestamp: new Date(),
        },
        errorCount: (integration.errorCount || 0) + 1,
      })
      alert(`❌ שגיאת חיבור: ${errorMsg}`)
    }
  }

  const getWebhookStatusInfo = (webhook: WebhookConfig) => {
    if (!webhook.status) {
      return { icon: Clock, color: 'text-gray-400', label: 'ממתין', bg: 'bg-gray-100' }
    }

    switch (webhook.status) {
      case 'connected':
        return { icon: CheckCircle, color: 'text-green-600', label: 'מחובר', bg: 'bg-green-100' }
      case 'error':
        return { icon: XCircle, color: 'text-red-600', label: 'שגיאה', bg: 'bg-red-100' }
      case 'disconnected':
        return { icon: AlertCircle, color: 'text-orange-600', label: 'מנותק', bg: 'bg-orange-100' }
      default:
        return { icon: Clock, color: 'text-gray-400', label: 'לא ידוע', bg: 'bg-gray-100' }
    }
  }

  const testWebhook = async (webhook: WebhookConfig) => {
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'test',
          action: 'test_connection',
          data: {
            message: 'בדיקת חיבור מ-CRM',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
          webhookName: webhook.name,
        }),
      })

      if (response.ok) {
        store.updateWebhook(webhook.id, {
          status: 'connected',
          lastSuccess: new Date(),
          successCount: (webhook.successCount || 0) + 1,
          lastError: undefined, // ניקוי שגיאות קודמות
        })
        alert('✅ החיבור הצליח! הנתונים נשלחו ל-webhook')
      } else {
        const errorMsg = `HTTP ${response.status}: ${response.statusText}`
        store.updateWebhook(webhook.id, {
          status: 'error',
          lastError: {
            message: errorMsg,
            timestamp: new Date(),
          },
          errorCount: (webhook.errorCount || 0) + 1,
        })
        alert(`❌ שגיאה: ${errorMsg}`)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch'
      store.updateWebhook(webhook.id, {
        status: 'error',
        lastError: {
          message: errorMsg,
          timestamp: new Date(),
        },
        errorCount: (webhook.errorCount || 0) + 1,
      })
      alert(`❌ שגיאת חיבור: ${errorMsg}\n\nייתכן שהבעיה היא CORS. נסה להפעיל CORS ב-n8n או השתמש ב-ngrok.`)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon size={32} className="text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-800">הגדרות</h1>
      </div>

      {/* Statistics Card */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database size={20} />
          סטטיסטיקת מערכת
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.customers}</div>
            <div className="text-sm text-gray-600 mt-1">לקוחות</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.deals}</div>
            <div className="text-sm text-gray-600 mt-1">עסקאות</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.tasks}</div>
            <div className="text-sm text-gray-600 mt-1">משימות</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.products}</div>
            <div className="text-sm text-gray-600 mt-1">מוצרים</div>
          </div>
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-pink-600">{stats.services}</div>
            <div className="text-sm text-gray-600 mt-1">שירותים</div>
          </div>
        </div>
      </div>

      {/* Webhooks */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <LinkIcon size={20} />
            Webhooks
          </h2>
          <button
            onClick={() => setShowWebhookModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Webhook חדש
          </button>
        </div>

        {store.webhooks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">אין webhooks מוגדרים</p>
        ) : (
          <div className="space-y-3">
            {store.webhooks.map(webhook => {
              const statusInfo = getWebhookStatusInfo(webhook)
              const StatusIcon = statusInfo.icon

              return (
                <div key={webhook.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{webhook.name}</h3>
                        {webhook.enabled ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">פעיל</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">כבוי</span>
                        )}
                        <div className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusInfo.bg}`}>
                          <StatusIcon size={14} className={statusInfo.color} />
                          <span className={statusInfo.color}>{statusInfo.label}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{webhook.url}</p>

                      <div className="flex gap-2 mb-2">
                        {webhook.events.map(event => (
                          <span key={event} className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                            {event === 'customer' ? 'לקוחות' : event === 'deal' ? 'עסקאות' : event === 'task' ? 'משימות' : event === 'product' ? 'מוצרים' : 'שירותים'}
                          </span>
                        ))}
                      </div>

                      {/* Statistics */}
                      <div className="flex gap-4 text-xs text-gray-600 mt-2">
                        {webhook.successCount !== undefined && (
                          <span>✓ {webhook.successCount} הצלחות</span>
                        )}
                        {webhook.errorCount !== undefined && webhook.errorCount > 0 && (
                          <span className="text-red-600">✗ {webhook.errorCount} שגיאות</span>
                        )}
                        {webhook.lastSuccess && (
                          <span>שליחה אחרונה: {format(new Date(webhook.lastSuccess), 'dd/MM HH:mm')}</span>
                        )}
                      </div>

                      {/* Error message */}
                      {webhook.lastError && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                          <strong>שגיאה אחרונה:</strong> {webhook.lastError.message}
                          <br />
                          <span className="text-red-600">{format(new Date(webhook.lastError.timestamp), 'dd/MM/yyyy HH:mm:ss')}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mr-4">
                      <button
                        onClick={() => testWebhook(webhook)}
                        className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="בדוק חיבור"
                      >
                        בדוק חיבור
                      </button>
                      <button
                        onClick={() => handleEditWebhook(webhook)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="ערוך"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteWebhook(webhook.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="מחק"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Integrations */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Database size={20} />
            אינטגרציות
          </h2>
          <button
            onClick={() => setShowIntegrationModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            אינטגרציה חדשה
          </button>
        </div>

        {store.integrations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">אין אינטגרציות מוגדרות</p>
        ) : (
          <div className="space-y-3">
            {store.integrations.map(integration => {
              const statusInfo = getWebhookStatusInfo(integration as any)
              const StatusIcon = statusInfo.icon

              return (
                <div key={integration.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">
                          {integration.type === 'google-sheets' ? 'Google Sheets' : 'Airtable'}
                        </h3>
                        <button
                          onClick={() => toggleIntegration(integration.id, !integration.enabled)}
                          className={`p-1 rounded ${integration.enabled ? 'text-green-600' : 'text-gray-400'}`}
                        >
                          {integration.enabled ? <Power size={20} /> : <PowerOff size={20} />}
                        </button>
                        {integration.status && (
                          <div className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusInfo.bg}`}>
                            <StatusIcon size={14} className={statusInfo.color} />
                            <span className={statusInfo.color}>{statusInfo.label}</span>
                          </div>
                        )}
                      </div>

                      {integration.type === 'google-sheets' && (
                        <p className="text-sm text-gray-600 mb-1">
                          Spreadsheet: {(integration.config as GoogleSheetsConfig).spreadsheetId}
                        </p>
                      )}
                      {integration.type === 'airtable' && (
                        <p className="text-sm text-gray-600 mb-1">
                          Base: {(integration.config as AirtableConfig).baseId}
                        </p>
                      )}

                      {/* Statistics */}
                      {(integration.successCount !== undefined || integration.errorCount !== undefined) && (
                        <div className="flex gap-4 text-xs text-gray-600 mt-2">
                          {integration.successCount !== undefined && (
                            <span>✓ {integration.successCount} הצלחות</span>
                          )}
                          {integration.errorCount !== undefined && integration.errorCount > 0 && (
                            <span className="text-red-600">✗ {integration.errorCount} שגיאות</span>
                          )}
                          {integration.lastSuccess && (
                            <span>חיבור אחרון: {format(new Date(integration.lastSuccess), 'dd/MM HH:mm')}</span>
                          )}
                        </div>
                      )}

                      {/* Error message */}
                      {integration.lastError && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                          <strong>שגיאה אחרונה:</strong> {integration.lastError.message}
                          <br />
                          <span className="text-red-600">{format(new Date(integration.lastError.timestamp), 'dd/MM/yyyy HH:mm:ss')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mr-4">
                      <button
                        onClick={() => testIntegration(integration)}
                        className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="בדוק חיבור"
                      >
                        בדוק חיבור
                      </button>
                      <button
                        onClick={() => handleEditIntegration(integration)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="ערוך"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteIntegration(integration.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="מחק"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Data Management */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">ניהול נתונים</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium">ייצוא נתונים</h3>
              <p className="text-sm text-gray-600">שמור גיבוי של כל הנתונים למחשב</p>
            </div>
            <button
              onClick={handleExportData}
              className="btn-primary flex items-center gap-2"
            >
              <Download size={18} />
              ייצא
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium">ייבוא נתונים</h3>
              <p className="text-sm text-gray-600">טען גיבוי קיים מהמחשב</p>
            </div>
            <label className="btn-secondary cursor-pointer flex items-center gap-2">
              <Upload size={18} />
              ייבא
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <h3 className="font-medium text-red-700">מחק את כל הנתונים</h3>
              <p className="text-sm text-red-600">פעולה זו תמחק את כל המידע ממערכת ה-CRM</p>
            </div>
            <button
              onClick={handleClearAllData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 size={18} />
              מחק הכל
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">אודות</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>מערכת CRM בעברית</strong></p>
          <p>גרסה: 1.0.0</p>
          <p>מערכת ניהול לקוחות, עסקאות, משימות, מוצרים ושירותים</p>
          <p className="pt-4 border-t mt-4">
            הנתונים נשמרים באחסון המקומי של הדפדפן (LocalStorage)
          </p>
        </div>
      </div>

      {/* Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingWebhook ? 'עריכת Webhook' : 'Webhook חדש'}
              </h2>
            </div>

            <form onSubmit={handleWebhookSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם *
                </label>
                <input
                  type="text"
                  required
                  value={webhookForm.name}
                  onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                  placeholder="n8n Workflow / Make Scenario"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  required
                  value={webhookForm.url}
                  onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  אירועים לשליחה *
                </label>
                <div className="space-y-2">
                  {(['customer', 'deal', 'task', 'product', 'service'] as const).map(event => (
                    <label key={event} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webhookForm.events.includes(event)}
                        onChange={() => toggleWebhookEvent(event)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>
                        {event === 'customer' ? 'לקוחות' : event === 'deal' ? 'עסקאות' : event === 'task' ? 'משימות' : event === 'product' ? 'מוצרים' : 'שירותים'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={webhookForm.enabled}
                  onChange={(e) => setWebhookForm({ ...webhookForm, enabled: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  פעיל
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={resetWebhookForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingWebhook ? 'עדכן' : 'צור'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Integration Modal */}
      {showIntegrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingIntegration ? 'עריכת אינטגרציה' : 'אינטגרציה חדשה'}
              </h2>
            </div>

            <form onSubmit={handleIntegrationSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סוג אינטגרציה
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="google-sheets"
                      checked={integrationType === 'google-sheets'}
                      onChange={(e) => setIntegrationType(e.target.value as 'google-sheets')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Google Sheets</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="airtable"
                      checked={integrationType === 'airtable'}
                      onChange={(e) => setIntegrationType(e.target.value as 'airtable')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Airtable</span>
                  </label>
                </div>
              </div>

              {integrationType === 'google-sheets' ? (
                <>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <strong>איך ליצור Service Account:</strong>
                    <ol className="mr-4 mt-2 space-y-1">
                      <li>1. עבור ל-<a href="https://console.cloud.google.com" target="_blank" className="text-blue-600 underline">Google Cloud Console</a></li>
                      <li>2. IAM & Admin → Service Accounts → CREATE SERVICE ACCOUNT</li>
                      <li>3. תן שם ולחץ CREATE</li>
                      <li>4. דלג על השלבים הבאים (CONTINUE → DONE)</li>
                      <li>5. לחץ על ה-Service Account → KEYS → ADD KEY → Create new key</li>
                      <li>6. בחר JSON ולחץ CREATE (קובץ יורד)</li>
                      <li>7. פתח את קובץ ה-JSON והעתק את כל התוכן</li>
                      <li>8. <strong>חשוב:</strong> שתף את הגיליון עם ה-email מקובץ ה-JSON (client_email)</li>
                    </ol>
                    <p className="mt-2"><strong>Spreadsheet ID:</strong> נמצא ב-URL של הגיליון בין <code>/d/</code> ו-<code>/edit</code></p>
                  </div>

                  {/* Google Sheets Picker */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">🎯 דרך מהירה: בחר גיליון ישירות</h4>
                    <GoogleSheetsPicker
                      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                      apiKey={import.meta.env.VITE_GOOGLE_API_KEY}
                      onSelect={(spreadsheetId, spreadsheetName, sheets) => {
                        setGoogleSheetsForm({
                          ...googleSheetsForm,
                          spreadsheetId,
                          sheetNames: {
                            customers: sheets.find(s => s.toLowerCase().includes('customer') || s.includes('לקוח')) || '',
                            deals: sheets.find(s => s.toLowerCase().includes('deal') || s.includes('עסקא')) || '',
                            tasks: sheets.find(s => s.toLowerCase().includes('task') || s.includes('משימ')) || '',
                            products: sheets.find(s => s.toLowerCase().includes('product') || s.includes('מוצר')) || '',
                            services: sheets.find(s => s.toLowerCase().includes('service') || s.includes('שירות')) || '',
                          },
                        })
                        alert(`✅ נבחר: ${spreadsheetName}\n\nנמצאו ${sheets.length} גיליונות: ${sheets.join(', ')}`)
                      }}
                    />
                    <p className="text-xs text-blue-700 mt-2">
                      💡 לחץ על הכפתור למעלה כדי לבחור גיליון מ-Google Drive שלך
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">או הזן ידנית</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spreadsheet ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={googleSheetsForm.spreadsheetId}
                      onChange={(e) => setGoogleSheetsForm({ ...googleSheetsForm, spreadsheetId: e.target.value })}
                      placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Account Credentials (JSON) *
                    </label>
                    <textarea
                      required
                      value={googleSheetsForm.credentials}
                      onChange={(e) => setGoogleSheetsForm({ ...googleSheetsForm, credentials: e.target.value })}
                      placeholder='{"type": "service_account", "project_id": "...", "private_key_id": "...", ...}'
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                    />
                    <p className="text-xs text-gray-600 mt-1">הדבק את כל תוכן קובץ ה-JSON כאן</p>
                  </div>

                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      שמות גיליונות (Sheet Names)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="לקוחות (Customers)"
                        value={googleSheetsForm.sheetNames.customers || ''}
                        onChange={(e) => setGoogleSheetsForm({
                          ...googleSheetsForm,
                          sheetNames: { ...googleSheetsForm.sheetNames, customers: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="עסקאות (Deals)"
                        value={googleSheetsForm.sheetNames.deals || ''}
                        onChange={(e) => setGoogleSheetsForm({
                          ...googleSheetsForm,
                          sheetNames: { ...googleSheetsForm.sheetNames, deals: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="משימות (Tasks)"
                        value={googleSheetsForm.sheetNames.tasks || ''}
                        onChange={(e) => setGoogleSheetsForm({
                          ...googleSheetsForm,
                          sheetNames: { ...googleSheetsForm.sheetNames, tasks: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="מוצרים (Products)"
                        value={googleSheetsForm.sheetNames.products || ''}
                        onChange={(e) => setGoogleSheetsForm({
                          ...googleSheetsForm,
                          sheetNames: { ...googleSheetsForm.sheetNames, products: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="שירותים (Services)"
                        value={googleSheetsForm.sheetNames.services || ''}
                        onChange={(e) => setGoogleSheetsForm({
                          ...googleSheetsForm,
                          sheetNames: { ...googleSheetsForm.sheetNames, services: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <strong>איך להשיג API Key:</strong>
                    <ol className="mr-4 mt-2 space-y-1">
                      <li>1. עבור ל-<a href="https://airtable.com/account" target="_blank" className="text-blue-600 underline">Airtable Account</a></li>
                      <li>2. לחץ על "Generate API key" או צפה במפתח קיים</li>
                      <li>3. העתק את ה-API Key</li>
                    </ol>
                    <p className="mt-2"><strong>Base ID:</strong> נמצא ב-URL של הבסיס: <code>https://airtable.com/app<strong>XXXXXXX</strong>/...</code></p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={airtableForm.baseId}
                      onChange={(e) => setAirtableForm({ ...airtableForm, baseId: e.target.value })}
                      placeholder="appXXXXXXXXXXXXXX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key *
                    </label>
                    <input
                      type="password"
                      required
                      value={airtableForm.apiKey}
                      onChange={(e) => setAirtableForm({ ...airtableForm, apiKey: e.target.value })}
                      placeholder="key..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      שמות טבלאות (Table Names)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="לקוחות (Customers)"
                        value={airtableForm.tableNames.customers || ''}
                        onChange={(e) => setAirtableForm({
                          ...airtableForm,
                          tableNames: { ...airtableForm.tableNames, customers: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="עסקאות (Deals)"
                        value={airtableForm.tableNames.deals || ''}
                        onChange={(e) => setAirtableForm({
                          ...airtableForm,
                          tableNames: { ...airtableForm.tableNames, deals: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="משימות (Tasks)"
                        value={airtableForm.tableNames.tasks || ''}
                        onChange={(e) => setAirtableForm({
                          ...airtableForm,
                          tableNames: { ...airtableForm.tableNames, tasks: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="מוצרים (Products)"
                        value={airtableForm.tableNames.products || ''}
                        onChange={(e) => setAirtableForm({
                          ...airtableForm,
                          tableNames: { ...airtableForm.tableNames, products: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="שירותים (Services)"
                        value={airtableForm.tableNames.services || ''}
                        onChange={(e) => setAirtableForm({
                          ...airtableForm,
                          tableNames: { ...airtableForm.tableNames, services: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={resetIntegrationForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingIntegration ? 'עדכן' : 'צור'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings

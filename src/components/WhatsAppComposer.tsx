import { useState } from 'react'
import { X, Send, MessageCircle } from 'lucide-react'
import { Customer } from '../types'
import { sendWhatsAppMessage, whatsappTemplates, isValidWhatsAppPhone } from '../utils/whatsapp'
import { crmToast } from '../utils/toast'

interface WhatsAppComposerProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
}

type TemplateId = keyof typeof whatsappTemplates

export default function WhatsAppComposer({ isOpen, onClose, customer }: WhatsAppComposerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('greeting')
  const [message, setMessage] = useState('')
  const [customMessage, setCustomMessage] = useState('')

  if (!isOpen || !customer) return null

  const handleTemplateChange = (templateId: TemplateId) => {
    setSelectedTemplate(templateId)

    // Generate preview message
    const name = `${customer.firstName} ${customer.lastName}`
    const companyName = 'החברה שלנו'

    let preview = ''

    switch (templateId) {
      case 'greeting':
        preview = whatsappTemplates.greeting(name).replace('{{companyName}}', companyName)
        break
      case 'followUp':
        preview = whatsappTemplates.followUp(name, 'העסקה')
        break
      case 'quote':
        preview = whatsappTemplates.quote(name, 10000)
        break
      case 'meeting':
        preview = whatsappTemplates.meeting(name, 'מחר', '14:00')
        break
      case 'thankYou':
        preview = whatsappTemplates.thankYou(name)
        break
      case 'custom':
        preview = whatsappTemplates.custom(name, customMessage || 'ההודעה שלך כאן...')
        break
    }

    setMessage(preview)
  }

  const handleSend = () => {
    if (!customer.phone) {
      crmToast.error('אין מספר טלפון ללקוח')
      return
    }

    if (!isValidWhatsAppPhone(customer.phone)) {
      crmToast.error('מספר טלפון לא תקין')
      return
    }

    if (!message.trim()) {
      crmToast.error('נא להזין הודעה')
      return
    }

    try {
      sendWhatsAppMessage(customer.phone, message)
      crmToast.emailSent() // Reuse for WhatsApp
      onClose()
    } catch (error) {
      crmToast.error('שגיאה בפתיחת WhatsApp')
    }
  }

  // Update message when custom message changes
  const handleCustomMessageChange = (text: string) => {
    setCustomMessage(text)
    if (selectedTemplate === 'custom') {
      const name = `${customer.firstName} ${customer.lastName}`
      setMessage(whatsappTemplates.custom(name, text))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle size={28} />
            <div>
              <h2 className="text-xl font-bold">שליחת הודעת WhatsApp</h2>
              <p className="text-green-100 text-sm">
                {customer.firstName} {customer.lastName} • {customer.phone}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-green-700 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              בחר תבנית
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value as TemplateId)}
              className="input-field"
            >
              <option value="greeting">ברכת שלום 👋</option>
              <option value="followUp">מעקב 📞</option>
              <option value="quote">הצעת מחיר 💼</option>
              <option value="meeting">תזכורת פגישה 📅</option>
              <option value="thankYou">תודה 🙏</option>
              <option value="custom">הודעה מותאמת אישית ✍️</option>
            </select>
          </div>

          {/* Custom Message Input (only for custom template) */}
          {selectedTemplate === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תוכן ההודעה
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => handleCustomMessageChange(e.target.value)}
                className="input-field h-24 resize-none"
                placeholder="כתוב את ההודעה המותאמת אישית שלך..."
              />
            </div>
          )}

          {/* Message Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תצוגה מקדימה
            </label>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 min-h-[150px]">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <pre className="whitespace-pre-wrap font-sans text-gray-800 text-sm leading-relaxed">
                  {message || 'בחר תבנית כדי לראות תצוגה מקדימה...'}
                </pre>
              </div>
            </div>
          </div>

          {/* Edit Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ערוך הודעה
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input-field h-32 resize-none font-mono text-sm"
              placeholder="ערוך את ההודעה לפי הצורך..."
            />
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>טיפ:</strong> לחיצה על "שלח" תפתח את WhatsApp Web עם ההודעה מוכנה.
              תצטרך ללחוץ על כפתור השליחה ב-WhatsApp.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-lg flex gap-3 justify-end border-t">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            ביטול
          </button>
          <button
            onClick={handleSend}
            className="btn-primary flex items-center gap-2"
          >
            <Send size={18} />
            שלח ב-WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}

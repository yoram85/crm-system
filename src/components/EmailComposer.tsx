import { useState } from 'react'
import { X, Mail, Send } from 'lucide-react'
import { emailTemplates, generateEmailFromTemplate, sendEmail } from '../utils/emailTemplates'
import { Customer, Deal, Task } from '../types'

interface EmailComposerProps {
  isOpen: boolean
  onClose: () => void
  recipient?: Customer
  deal?: Deal
  task?: Task
}

const EmailComposer = ({ isOpen, onClose, recipient, deal, task }: EmailComposerProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isSending, setIsSending] = useState(false)

  if (!isOpen) return null

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find((t) => t.id === templateId)
    if (template && recipient) {
      const generated = generateEmailFromTemplate(template, {
        customer: recipient,
        deal,
        task,
      })
      setSubject(generated.subject)
      setBody(generated.body)
      setSelectedTemplate(templateId)
    }
  }

  const handleSend = () => {
    if (!recipient || !subject || !body) return

    setIsSending(true)
    const success = sendEmail(recipient.email, subject, body)

    if (success) {
      setTimeout(() => {
        setIsSending(false)
        onClose()
        setSubject('')
        setBody('')
        setSelectedTemplate('')
      }, 500)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">שליחת אימייל</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              אל
            </label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {recipient?.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{recipient?.name}</p>
                <p className="text-sm text-gray-600">{recipient?.email}</p>
              </div>
            </div>
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              בחר תבנית (אופציונלי)
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">ללא תבנית</option>
              {emailTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              נושא
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="הזן נושא האימייל..."
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תוכן האימייל
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              placeholder="כתוב את תוכן האימייל כאן..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={handleSend}
            disabled={!recipient || !subject || !body || isSending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={18} />
            {isSending ? 'שולח...' : 'שלח'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailComposer

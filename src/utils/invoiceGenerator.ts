import { Task, Customer, Deal, Product, Service } from '../types'
import { jsPDF } from 'jspdf'

export interface InvoiceData {
  invoiceNumber: string
  date: Date
  customer: Customer
  task?: Task
  deal?: Deal
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  notes?: string
  paymentTerms?: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

// Generate invoice number (format: INV-YYYYMMDD-XXX)
export const generateInvoiceNumber = (): string => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')

  return `INV-${year}${month}${day}-${random}`
}

// Create invoice from task completion
export const createInvoiceFromTask = (
  task: Task,
  customer: Customer,
  deal?: Deal,
  products?: Product[],
  services?: Service[]
): InvoiceData => {
  const items: InvoiceItem[] = []

  // Add deal items if available
  if (deal && deal.items) {
    deal.items.forEach(item => {
      if (item.type === 'product') {
        const product = products?.find(p => p.id === item.itemId)
        if (product) {
          const total = item.quantity * item.price - (item.discount || 0)
          items.push({
            description: `${product.name} - ${product.description || ''}`,
            quantity: item.quantity,
            unitPrice: item.price,
            total: total
          })
        }
      } else if (item.type === 'service') {
        const service = services?.find(s => s.id === item.itemId)
        if (service) {
          const total = item.quantity * item.price - (item.discount || 0)
          items.push({
            description: `${service.name} - ${service.description || ''}`,
            quantity: item.quantity,
            unitPrice: item.price,
            total: total
          })
        }
      }
    })
  }

  // If no deal items, create a single item from the deal amount or task
  if (items.length === 0 && deal) {
    items.push({
      description: `${deal.title} - ${task.title}`,
      quantity: 1,
      unitPrice: deal.amount,
      total: deal.amount
    })
  } else if (items.length === 0) {
    items.push({
      description: task.title,
      quantity: 1,
      unitPrice: 0,
      total: 0
    })
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * 0.17 // VAT 17% (Israel)
  const total = subtotal + tax

  return {
    invoiceNumber: generateInvoiceNumber(),
    date: new Date(),
    customer,
    task,
    deal,
    items,
    subtotal,
    tax,
    total,
    notes: task.notes || '',
    paymentTerms: 'תשלום תוך 30 יום'
  }
}

// Generate PDF invoice
export const generateInvoicePDF = (invoice: InvoiceData): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Use default font (Hebrew will render as Unicode)
  doc.setFont('helvetica')

  // RTL support
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15

  // Header
  doc.setFontSize(24)
  doc.text('חשבונית מס / קבלה', pageWidth - margin, 20, { align: 'right' })

  // Invoice details
  doc.setFontSize(10)
  let yPos = 35
  doc.text(`מספר חשבונית: ${invoice.invoiceNumber}`, pageWidth - margin, yPos, { align: 'right' })
  yPos += 7
  doc.text(`תאריך: ${new Date(invoice.date).toLocaleDateString('he-IL')}`, pageWidth - margin, yPos, { align: 'right' })

  // Customer details
  yPos += 15
  doc.setFontSize(12)
  doc.text('פרטי לקוח:', pageWidth - margin, yPos, { align: 'right' })
  doc.setFontSize(10)
  yPos += 7
  doc.text(`${invoice.customer.firstName} ${invoice.customer.lastName}`, pageWidth - margin, yPos, { align: 'right' })
  if (invoice.customer.company) {
    yPos += 7
    doc.text(invoice.customer.company, pageWidth - margin, yPos, { align: 'right' })
  }
  if (invoice.customer.email) {
    yPos += 7
    doc.text(invoice.customer.email, pageWidth - margin, yPos, { align: 'right' })
  }
  if (invoice.customer.phone) {
    yPos += 7
    doc.text(invoice.customer.phone, pageWidth - margin, yPos, { align: 'right' })
  }

  // Table header
  yPos += 15
  doc.setFillColor(99, 102, 241) // Indigo color
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)

  // Column headers (RTL)
  doc.text('סה"כ', margin + 10, yPos + 5)
  doc.text('מחיר יחידה', margin + 40, yPos + 5)
  doc.text('כמות', margin + 75, yPos + 5)
  doc.text('תיאור', pageWidth - margin - 10, yPos + 5, { align: 'right' })

  // Table rows
  doc.setTextColor(0, 0, 0)
  yPos += 10

  invoice.items.forEach(item => {
    yPos += 7
    doc.text(`₪${item.total.toLocaleString()}`, margin + 10, yPos)
    doc.text(`₪${item.unitPrice.toLocaleString()}`, margin + 40, yPos)
    doc.text(item.quantity.toString(), margin + 75, yPos)
    doc.text(item.description, pageWidth - margin - 10, yPos, { align: 'right' })
  })

  // Totals
  yPos += 15
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPos, pageWidth - margin, yPos)

  yPos += 10
  doc.text(`₪${invoice.subtotal.toLocaleString()}`, margin + 10, yPos)
  doc.text('סכום ביניים:', pageWidth - margin - 10, yPos, { align: 'right' })

  yPos += 7
  doc.text(`₪${invoice.tax.toLocaleString()}`, margin + 10, yPos)
  doc.text('מע"מ (17%):', pageWidth - margin - 10, yPos, { align: 'right' })

  yPos += 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`₪${invoice.total.toLocaleString()}`, margin + 10, yPos)
  doc.text('סה"כ לתשלום:', pageWidth - margin - 10, yPos, { align: 'right' })

  // Payment terms
  if (invoice.paymentTerms) {
    yPos += 15
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`תנאי תשלום: ${invoice.paymentTerms}`, pageWidth - margin, yPos, { align: 'right' })
  }

  // Notes
  if (invoice.notes) {
    yPos += 10
    doc.text('הערות:', pageWidth - margin, yPos, { align: 'right' })
    yPos += 7
    const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - 2 * margin)
    splitNotes.forEach((line: string) => {
      doc.text(line, pageWidth - margin, yPos, { align: 'right' })
      yPos += 5
    })
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text('חשבונית זו הופקה אוטומטית על ידי מערכת CRM', pageWidth / 2, pageHeight - 10, { align: 'center' })

  return doc
}

// Export invoice as PDF file
export const exportInvoicePDF = (invoice: InvoiceData, filename?: string) => {
  const doc = generateInvoicePDF(invoice)
  const name = filename || `חשבונית-${invoice.invoiceNumber}.pdf`
  doc.save(name)
}

// Send invoice data to N8N webhook
export const sendInvoiceToWebhook = async (
  webhookUrl: string,
  invoice: InvoiceData
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'invoice',
        action: 'created',
        data: invoice,
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'CRM',
          type: 'invoice_generation'
        }
      }),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

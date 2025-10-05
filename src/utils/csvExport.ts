import { Customer, Deal, Task, Product, Service } from '../types'

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    alert('אין נתונים לייצוא')
    return
  }

  // Get all unique keys from all objects
  const allKeys = Array.from(
    new Set(data.flatMap(item => Object.keys(item)))
  )

  // Create CSV header
  const header = allKeys.join(',')

  // Create CSV rows
  const rows = data.map(item => {
    return allKeys.map(key => {
      const value = item[key]

      // Handle different value types
      if (value === null || value === undefined) {
        return ''
      }

      // Handle dates
      if (value instanceof Date) {
        return value.toISOString().split('T')[0]
      }

      // Handle arrays and objects
      if (typeof value === 'object') {
        return JSON.stringify(value).replace(/"/g, '""')
      }

      // Handle strings with commas or quotes
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }

      return stringValue
    }).join(',')
  })

  // Combine header and rows
  const csv = [header, ...rows].join('\n')

  // Add BOM for proper Hebrew encoding in Excel
  const BOM = '\uFEFF'
  const csvContent = BOM + csv

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Specific export functions for each entity type
export const exportCustomersToCSV = (customers: Customer[]) => {
  const data = customers.map(customer => ({
    'שם': customer.name,
    'אימייל': customer.email,
    'טלפון': customer.phone,
    'חברה': customer.company,
    'סטטוס': customer.status === 'active' ? 'פעיל' : customer.status === 'lead' ? 'ליד' : 'לא פעיל',
    'הערות': customer.notes || '',
    'תאריך יצירה': customer.createdAt,
  }))

  exportToCSV(data, 'לקוחות')
}

export const exportDealsToCSV = (deals: Deal[], customers: Customer[]) => {
  const data = deals.map(deal => {
    const customer = customers.find(c => c.id === deal.customerId)
    return {
      'כותרת': deal.title,
      'לקוח': customer?.name || 'לא ידוע',
      'סכום': deal.amount,
      'שלב': deal.stage === 'lead' ? 'ליד' :
             deal.stage === 'proposal' ? 'הצעת מחיר' :
             deal.stage === 'negotiation' ? 'משא ומתן' :
             deal.stage === 'won' ? 'נסגר בהצלחה' : 'אבוד',
      'סבירות': `${deal.probability}%`,
      'תאריך סגירה צפוי': deal.expectedCloseDate,
      'הערות': deal.notes,
    }
  })

  exportToCSV(data, 'עסקאות')
}

export const exportTasksToCSV = (tasks: Task[], customers: Customer[]) => {
  const data = tasks.map(task => {
    const customer = customers.find(c => c.id === task.customerId)
    return {
      'כותרת': task.title,
      'תיאור': task.description,
      'לקוח': customer?.name || '',
      'סטטוס': task.status === 'pending' ? 'ממתין' :
               task.status === 'in-progress' ? 'בתהליך' : 'הושלם',
      'עדיפות': task.priority === 'high' ? 'גבוהה' :
                 task.priority === 'medium' ? 'בינונית' : 'נמוכה',
      'תאריך יעד': task.dueDate,
    }
  })

  exportToCSV(data, 'משימות')
}

export const exportProductsToCSV = (products: Product[]) => {
  const data = products.map(product => ({
    'שם': product.name,
    'תיאור': product.description,
    'מחיר': product.price,
    'קטגוריה': product.category,
    'מלאי': product.stock,
  }))

  exportToCSV(data, 'מוצרים')
}

export const exportServicesToCSV = (services: Service[]) => {
  const data = services.map(service => ({
    'שם': service.name,
    'תיאור': service.description,
    'מחיר': service.price,
    'קטגוריה': service.category,
    'משך (דקות)': service.duration,
  }))

  exportToCSV(data, 'שירותים')
}

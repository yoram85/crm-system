import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Customer, Deal, Task, Product, Service } from '../types'
import { format } from 'date-fns'
import { hebrewFontBase64 } from './hebrewFont'

// Reverse Hebrew text for proper RTL display in PDF
const reverseHebrewText = (text: string): string => {
  if (!text) return text

  // Simple character reversal for Hebrew text
  return text.split('').reverse().join('')
}

// Configure jsPDF for RTL and Hebrew support
const createPDF = () => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Add Hebrew font support (Rubik font)
  doc.addFileToVFS('Rubik-Regular.ttf', hebrewFontBase64)
  doc.addFont('Rubik-Regular.ttf', 'Rubik', 'normal')
  doc.setFont('Rubik')

  return doc
}

const addHeader = (doc: jsPDF, title: string) => {
  doc.setFontSize(18)
  doc.text(reverseHebrewText(title), 105, 20, { align: 'center' })

  doc.setFontSize(10)
  const dateText = `תאריך: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`
  doc.text(reverseHebrewText(dateText), 105, 28, {
    align: 'center',
  })

  doc.setLineWidth(0.5)
  doc.line(15, 32, 195, 32)
}

export const exportCustomersToPDF = (customers: Customer[]) => {
  const doc = createPDF()
  addHeader(doc, 'דוח לקוחות')

  const tableData = customers.map((customer) => [
    reverseHebrewText(customer.name),
    customer.email,
    customer.phone,
    reverseHebrewText(customer.company),
    reverseHebrewText(customer.status === 'active' ? 'פעיל' : customer.status === 'lead' ? 'ליד' : 'לא פעיל'),
    format(new Date(customer.createdAt), 'dd/MM/yyyy'),
  ])

  autoTable(doc, {
    startY: 38,
    head: [[
      reverseHebrewText('שם'),
      reverseHebrewText('אימייל'),
      reverseHebrewText('טלפון'),
      reverseHebrewText('חברה'),
      reverseHebrewText('סטטוס'),
      reverseHebrewText('תאריך יצירה')
    ]],
    body: tableData,
    styles: {
      font: 'Rubik',
      fontSize: 9,
      halign: 'right',
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      font: 'Rubik',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  })

  // Add summary
  const finalY = (doc as any).lastAutoTable.finalY || 38
  doc.setFontSize(10)
  doc.text(reverseHebrewText(`סך הכל לקוחות: ${customers.length}`), 195, finalY + 10, { align: 'right' })
  doc.text(
    reverseHebrewText(`לקוחות פעילים: ${customers.filter((c) => c.status === 'active').length}`),
    195,
    finalY + 16,
    { align: 'right' }
  )
  doc.text(
    reverseHebrewText(`לידים: ${customers.filter((c) => c.status === 'lead').length}`),
    195,
    finalY + 22,
    { align: 'right' }
  )

  doc.save(`לקוחות_${format(new Date(), 'dd-MM-yyyy')}.pdf`)
}

export const exportDealsToPDF = (deals: Deal[], customers: Customer[]) => {
  const doc = createPDF()
  addHeader(doc, 'דוח עסקאות')

  const tableData = deals.map((deal) => {
    const customer = customers.find((c) => c.id === deal.customerId)
    return [
      reverseHebrewText(deal.title),
      reverseHebrewText(customer?.name || 'לא ידוע'),
      `₪${deal.amount.toLocaleString()}`,
      reverseHebrewText(deal.stage === 'lead'
        ? 'ליד'
        : deal.stage === 'proposal'
        ? 'הצעת מחיר'
        : deal.stage === 'negotiation'
        ? 'משא ומתן'
        : deal.stage === 'won'
        ? 'נסגר בהצלחה'
        : 'אבוד'),
      `${deal.probability}%`,
      format(new Date(deal.expectedCloseDate), 'dd/MM/yyyy'),
    ]
  })

  autoTable(doc, {
    startY: 38,
    head: [[
      reverseHebrewText('כותרת'),
      reverseHebrewText('לקוח'),
      reverseHebrewText('סכום'),
      reverseHebrewText('שלב'),
      reverseHebrewText('סבירות'),
      reverseHebrewText('תאריך סגירה')
    ]],
    body: tableData,
    styles: {
      font: 'Rubik',
      fontSize: 9,
      halign: 'right',
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      font: 'Rubik',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  })

  // Add summary
  const finalY = (doc as any).lastAutoTable.finalY || 38
  const totalAmount = deals.reduce((sum, deal) => sum + deal.amount, 0)
  const wonAmount = deals
    .filter((d) => d.stage === 'won')
    .reduce((sum, deal) => sum + deal.amount, 0)

  doc.setFontSize(10)
  doc.text(reverseHebrewText(`סך הכל עסקאות: ${deals.length}`), 195, finalY + 10, { align: 'right' })
  doc.text(reverseHebrewText(`סכום כולל: ₪${totalAmount.toLocaleString()}`), 195, finalY + 16, { align: 'right' })
  doc.text(
    reverseHebrewText(`עסקאות שנסגרו: ${deals.filter((d) => d.stage === 'won').length}`),
    195,
    finalY + 22,
    { align: 'right' }
  )
  doc.text(reverseHebrewText(`הכנסות: ₪${wonAmount.toLocaleString()}`), 195, finalY + 28, { align: 'right' })

  doc.save(`עסקאות_${format(new Date(), 'dd-MM-yyyy')}.pdf`)
}

export const exportTasksToPDF = (tasks: Task[], customers: Customer[]) => {
  const doc = createPDF()
  addHeader(doc, 'דוח משימות')

  const tableData = tasks.map((task) => {
    const customer = customers.find((c) => c.id === task.customerId)
    return [
      reverseHebrewText(task.title),
      reverseHebrewText(task.description),
      reverseHebrewText(customer?.name || ''),
      reverseHebrewText(task.status === 'pending'
        ? 'ממתין'
        : task.status === 'in-progress'
        ? 'בתהליך'
        : 'הושלם'),
      reverseHebrewText(task.priority === 'high'
        ? 'גבוהה'
        : task.priority === 'medium'
        ? 'בינונית'
        : 'נמוכה'),
      format(new Date(task.dueDate), 'dd/MM/yyyy'),
    ]
  })

  autoTable(doc, {
    startY: 38,
    head: [[
      reverseHebrewText('כותרת'),
      reverseHebrewText('תיאור'),
      reverseHebrewText('לקוח'),
      reverseHebrewText('סטטוס'),
      reverseHebrewText('עדיפות'),
      reverseHebrewText('תאריך יעד')
    ]],
    body: tableData,
    styles: {
      font: 'Rubik',
      fontSize: 8,
      halign: 'right',
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      font: 'Rubik',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      1: { cellWidth: 60 },
    },
  })

  // Add summary
  const finalY = (doc as any).lastAutoTable.finalY || 38
  doc.setFontSize(10)
  doc.text(reverseHebrewText(`סך הכל משימות: ${tasks.length}`), 195, finalY + 10, { align: 'right' })
  doc.text(
    reverseHebrewText(`הושלמו: ${tasks.filter((t) => t.status === 'completed').length}`),
    195,
    finalY + 16,
    { align: 'right' }
  )
  doc.text(
    reverseHebrewText(`בתהליך: ${tasks.filter((t) => t.status === 'in-progress').length}`),
    195,
    finalY + 22,
    { align: 'right' }
  )
  doc.text(
    reverseHebrewText(`ממתינות: ${tasks.filter((t) => t.status === 'pending').length}`),
    195,
    finalY + 28,
    { align: 'right' }
  )

  doc.save(`משימות_${format(new Date(), 'dd-MM-yyyy')}.pdf`)
}

export const exportProductsToPDF = (products: Product[]) => {
  const doc = createPDF()
  addHeader(doc, 'דוח מוצרים')

  const tableData = products.map((product) => [
    reverseHebrewText(product.name),
    reverseHebrewText(product.description),
    `₪${product.price.toLocaleString()}`,
    reverseHebrewText(product.category),
    product.stock.toString(),
  ])

  autoTable(doc, {
    startY: 38,
    head: [[
      reverseHebrewText('שם'),
      reverseHebrewText('תיאור'),
      reverseHebrewText('מחיר'),
      reverseHebrewText('קטגוריה'),
      reverseHebrewText('מלאי')
    ]],
    body: tableData,
    styles: {
      font: 'Rubik',
      fontSize: 9,
      halign: 'right',
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      font: 'Rubik',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  })

  // Add summary
  const finalY = (doc as any).lastAutoTable.finalY || 38
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)

  doc.setFontSize(10)
  doc.text(reverseHebrewText(`סך הכל מוצרים: ${products.length}`), 195, finalY + 10, { align: 'right' })
  doc.text(reverseHebrewText(`ערך מלאי: ₪${totalValue.toLocaleString()}`), 195, finalY + 16, { align: 'right' })

  doc.save(`מוצרים_${format(new Date(), 'dd-MM-yyyy')}.pdf`)
}

export const exportServicesToPDF = (services: Service[]) => {
  const doc = createPDF()
  addHeader(doc, 'דוח שירותים')

  const tableData = services.map((service) => [
    reverseHebrewText(service.name),
    reverseHebrewText(service.description),
    `₪${service.price.toLocaleString()}`,
    reverseHebrewText(service.category),
    reverseHebrewText(`${service.duration} דקות`),
  ])

  autoTable(doc, {
    startY: 38,
    head: [[
      reverseHebrewText('שם'),
      reverseHebrewText('תיאור'),
      reverseHebrewText('מחיר'),
      reverseHebrewText('קטגוריה'),
      reverseHebrewText('משך')
    ]],
    body: tableData,
    styles: {
      font: 'Rubik',
      fontSize: 9,
      halign: 'right',
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      font: 'Rubik',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  })

  // Add summary
  const finalY = (doc as any).lastAutoTable.finalY || 38
  doc.setFontSize(10)
  doc.text(reverseHebrewText(`סך הכל שירותים: ${services.length}`), 195, finalY + 10, { align: 'right' })

  doc.save(`שירותים_${format(new Date(), 'dd-MM-yyyy')}.pdf`)
}

// Comprehensive business report
export const exportComprehensiveReport = (
  customers: Customer[],
  deals: Deal[],
  tasks: Task[],
  products: Product[],
  services: Service[]
) => {
  const doc = createPDF()
  addHeader(doc, 'דוח עסקי מקיף')

  let currentY = 45

  // Customers Summary
  doc.setFontSize(14)
  doc.setFont('Rubik', 'normal')
  doc.text(reverseHebrewText('סיכום לקוחות'), 105, currentY, { align: 'center' })
  currentY += 8

  doc.setFontSize(10)
  doc.setFont('Rubik', 'normal')
  doc.text(reverseHebrewText(`סך הכל לקוחות: ${customers.length}`), 195, currentY, { align: 'right' })
  currentY += 6
  doc.text(
    reverseHebrewText(`לקוחות פעילים: ${customers.filter((c) => c.status === 'active').length}`),
    195,
    currentY,
    { align: 'right' }
  )
  currentY += 6
  doc.text(
    reverseHebrewText(`לידים: ${customers.filter((c) => c.status === 'lead').length}`),
    195,
    currentY,
    { align: 'right' }
  )
  currentY += 12

  // Deals Summary
  doc.setFontSize(14)
  doc.setFont('Rubik', 'normal')
  doc.text(reverseHebrewText('סיכום עסקאות'), 105, currentY, { align: 'center' })
  currentY += 8

  const totalDealsAmount = deals.reduce((sum, deal) => sum + deal.amount, 0)
  const wonDealsAmount = deals
    .filter((d) => d.stage === 'won')
    .reduce((sum, deal) => sum + deal.amount, 0)

  doc.setFontSize(10)
  doc.setFont('Rubik', 'normal')
  doc.text(reverseHebrewText(`סך הכל עסקאות: ${deals.length}`), 195, currentY, { align: 'right' })
  currentY += 6
  doc.text(reverseHebrewText(`סכום כולל: ₪${totalDealsAmount.toLocaleString()}`), 195, currentY, { align: 'right' })
  currentY += 6
  doc.text(
    reverseHebrewText(`עסקאות שנסגרו: ${deals.filter((d) => d.stage === 'won').length}`),
    195,
    currentY,
    { align: 'right' }
  )
  currentY += 6
  doc.text(reverseHebrewText(`הכנסות: ₪${wonDealsAmount.toLocaleString()}`), 195, currentY, { align: 'right' })
  currentY += 12

  // Tasks Summary
  doc.setFontSize(14)
  doc.setFont('Rubik', 'normal')
  doc.text(reverseHebrewText('סיכום משימות'), 105, currentY, { align: 'center' })
  currentY += 8

  doc.setFontSize(10)
  doc.setFont('Rubik', 'normal')
  doc.text(reverseHebrewText(`סך הכל משימות: ${tasks.length}`), 195, currentY, { align: 'right' })
  currentY += 6
  doc.text(
    reverseHebrewText(`הושלמו: ${tasks.filter((t) => t.status === 'completed').length}`),
    195,
    currentY,
    { align: 'right' }
  )
  currentY += 6
  doc.text(
    reverseHebrewText(`בתהליך: ${tasks.filter((t) => t.status === 'in-progress').length}`),
    195,
    currentY,
    { align: 'right' }
  )
  currentY += 6
  doc.text(
    reverseHebrewText(`ממתינות: ${tasks.filter((t) => t.status === 'pending').length}`),
    195,
    currentY,
    { align: 'right' }
  )
  currentY += 12

  // Products & Services Summary
  doc.setFontSize(14)
  doc.setFont('Rubik', 'normal')
  doc.text(reverseHebrewText('סיכום מוצרים ושירותים'), 105, currentY, { align: 'center' })
  currentY += 8

  const productsValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)

  doc.setFontSize(10)
  doc.setFont('Rubik', 'normal')
  doc.text(reverseHebrewText(`מוצרים: ${products.length}`), 195, currentY, { align: 'right' })
  currentY += 6
  doc.text(reverseHebrewText(`ערך מלאי: ₪${productsValue.toLocaleString()}`), 195, currentY, { align: 'right' })
  currentY += 6
  doc.text(reverseHebrewText(`שירותים: ${services.length}`), 195, currentY, { align: 'right' })

  doc.save(`דוח_עסקי_מקיף_${format(new Date(), 'dd-MM-yyyy')}.pdf`)
}

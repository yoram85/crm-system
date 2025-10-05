import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Customer, Deal, Task, Product, Service } from '../types'
import { format } from 'date-fns'

// Configure jsPDF for RTL and Hebrew support
const createPDF = () => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  // Add Hebrew font support (using Arial Unicode MS or similar)
  // Note: For full Hebrew support, you'd need to add a Hebrew font
  // For now, we'll use the default font

  return doc
}

const addHeader = (doc: jsPDF, title: string) => {
  doc.setFontSize(18)
  doc.text(title, 105, 20, { align: 'center' })

  doc.setFontSize(10)
  doc.text(`תאריך: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 28, {
    align: 'center',
  })

  doc.setLineWidth(0.5)
  doc.line(15, 32, 195, 32)
}

export const exportCustomersToPDF = (customers: Customer[]) => {
  const doc = createPDF()
  addHeader(doc, 'דוח לקוחות')

  const tableData = customers.map((customer) => [
    customer.name,
    customer.email,
    customer.phone,
    customer.company,
    customer.status === 'active' ? 'פעיל' : customer.status === 'lead' ? 'ליד' : 'לא פעיל',
    format(new Date(customer.createdAt), 'dd/MM/yyyy'),
  ])

  autoTable(doc, {
    startY: 38,
    head: [['שם', 'אימייל', 'טלפון', 'חברה', 'סטטוס', 'תאריך יצירה']],
    body: tableData,
    styles: {
      font: 'helvetica',
      fontSize: 9,
      halign: 'right',
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  })

  // Add summary
  const finalY = (doc as any).lastAutoTable.finalY || 38
  doc.setFontSize(10)
  doc.text(`סך הכל לקוחות: ${customers.length}`, 15, finalY + 10)
  doc.text(
    `לקוחות פעילים: ${customers.filter((c) => c.status === 'active').length}`,
    15,
    finalY + 16
  )
  doc.text(
    `לידים: ${customers.filter((c) => c.status === 'lead').length}`,
    15,
    finalY + 22
  )

  doc.save(`לקוחות_${format(new Date(), 'dd-MM-yyyy')}.pdf`)
}

export const exportDealsToPDF = (deals: Deal[], customers: Customer[]) => {
  const doc = createPDF()
  addHeader(doc, 'דוח עסקאות')

  const tableData = deals.map((deal) => {
    const customer = customers.find((c) => c.id === deal.customerId)
    return [
      deal.title,
      customer?.name || 'לא ידוע',
      `₪${deal.amount.toLocaleString()}`,
      deal.stage === 'lead'
        ? 'ליד'
        : deal.stage === 'proposal'
        ? 'הצעת מחיר'
        : deal.stage === 'negotiation'
        ? 'משא ומתן'
        : deal.stage === 'won'
        ? 'נסגר בהצלחה'
        : 'אבוד',
      `${deal.probability}%`,
      format(new Date(deal.expectedCloseDate), 'dd/MM/yyyy'),
    ]
  })

  autoTable(doc, {
    startY: 38,
    head: [['כותרת', 'לקוח', 'סכום', 'שלב', 'סבירות', 'תאריך סגירה']],
    body: tableData,
    styles: {
      font: 'helvetica',
      fontSize: 9,
      halign: 'right',
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
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
  doc.text(`סך הכל עסקאות: ${deals.length}`, 15, finalY + 10)
  doc.text(`סכום כולל: ₪${totalAmount.toLocaleString()}`, 15, finalY + 16)
  doc.text(
    `עסקאות שנסגרו: ${deals.filter((d) => d.stage === 'won').length}`,
    15,
    finalY + 22
  )
  doc.text(`הכנסות: ₪${wonAmount.toLocaleString()}`, 15, finalY + 28)

  doc.save(`עסקאות_${format(new Date(), 'dd-MM-yyyy')}.pdf`)
}

export const exportTasksToPDF = (tasks: Task[], customers: Customer[]) => {
  const doc = createPDF()
  addHeader(doc, 'דוח משימות')

  const tableData = tasks.map((task) => {
    const customer = customers.find((c) => c.id === task.customerId)
    return [
      task.title,
      task.description,
      customer?.name || '',
      task.status === 'pending'
        ? 'ממתין'
        : task.status === 'in-progress'
        ? 'בתהליך'
        : 'הושלם',
      task.priority === 'high'
        ? 'גבוהה'
        : task.priority === 'medium'
        ? 'בינונית'
        : 'נמוכה',
      format(new Date(task.dueDate), 'dd/MM/yyyy'),
    ]
  })

  autoTable(doc, {
    startY: 38,
    head: [['כותרת', 'תיאור', 'לקוח', 'סטטוס', 'עדיפות', 'תאריך יעד']],
    body: tableData,
    styles: {
      font: 'helvetica',
      fontSize: 8,
      halign: 'right',
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
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
  doc.text(`סך הכל משימות: ${tasks.length}`, 15, finalY + 10)
  doc.text(
    `הושלמו: ${tasks.filter((t) => t.status === 'completed').length}`,
    15,
    finalY + 16
  )
  doc.text(
    `בתהליך: ${tasks.filter((t) => t.status === 'in-progress').length}`,
    15,
    finalY + 22
  )
  doc.text(
    `ממתינות: ${tasks.filter((t) => t.status === 'pending').length}`,
    15,
    finalY + 28
  )

  doc.save(`משימות_${format(new Date(), 'dd-MM-yyyy')}.pdf`)
}

export const exportProductsToPDF = (products: Product[]) => {
  const doc = createPDF()
  addHeader(doc, 'דוח מוצרים')

  const tableData = products.map((product) => [
    product.name,
    product.description,
    `₪${product.price.toLocaleString()}`,
    product.category,
    product.stock.toString(),
  ])

  autoTable(doc, {
    startY: 38,
    head: [['שם', 'תיאור', 'מחיר', 'קטגוריה', 'מלאי']],
    body: tableData,
    styles: {
      font: 'helvetica',
      fontSize: 9,
      halign: 'right',
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  })

  // Add summary
  const finalY = (doc as any).lastAutoTable.finalY || 38
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)

  doc.setFontSize(10)
  doc.text(`סך הכל מוצרים: ${products.length}`, 15, finalY + 10)
  doc.text(`ערך מלאי: ₪${totalValue.toLocaleString()}`, 15, finalY + 16)

  doc.save(`מוצרים_${format(new Date(), 'dd-MM-yyyy')}.pdf`)
}

export const exportServicesToPDF = (services: Service[]) => {
  const doc = createPDF()
  addHeader(doc, 'דוח שירותים')

  const tableData = services.map((service) => [
    service.name,
    service.description,
    `₪${service.price.toLocaleString()}`,
    service.category,
    `${service.duration} דקות`,
  ])

  autoTable(doc, {
    startY: 38,
    head: [['שם', 'תיאור', 'מחיר', 'קטגוריה', 'משך']],
    body: tableData,
    styles: {
      font: 'helvetica',
      fontSize: 9,
      halign: 'right',
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  })

  // Add summary
  const finalY = (doc as any).lastAutoTable.finalY || 38
  doc.setFontSize(10)
  doc.text(`סך הכל שירותים: ${services.length}`, 15, finalY + 10)

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
  doc.setFont('helvetica', 'bold')
  doc.text('סיכום לקוחות', 105, currentY, { align: 'center' })
  currentY += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`סך הכל לקוחות: ${customers.length}`, 15, currentY)
  currentY += 6
  doc.text(
    `לקוחות פעילים: ${customers.filter((c) => c.status === 'active').length}`,
    15,
    currentY
  )
  currentY += 6
  doc.text(
    `לידים: ${customers.filter((c) => c.status === 'lead').length}`,
    15,
    currentY
  )
  currentY += 12

  // Deals Summary
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('סיכום עסקאות', 105, currentY, { align: 'center' })
  currentY += 8

  const totalDealsAmount = deals.reduce((sum, deal) => sum + deal.amount, 0)
  const wonDealsAmount = deals
    .filter((d) => d.stage === 'won')
    .reduce((sum, deal) => sum + deal.amount, 0)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`סך הכל עסקאות: ${deals.length}`, 15, currentY)
  currentY += 6
  doc.text(`סכום כולל: ₪${totalDealsAmount.toLocaleString()}`, 15, currentY)
  currentY += 6
  doc.text(
    `עסקאות שנסגרו: ${deals.filter((d) => d.stage === 'won').length}`,
    15,
    currentY
  )
  currentY += 6
  doc.text(`הכנסות: ₪${wonDealsAmount.toLocaleString()}`, 15, currentY)
  currentY += 12

  // Tasks Summary
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('סיכום משימות', 105, currentY, { align: 'center' })
  currentY += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`סך הכל משימות: ${tasks.length}`, 15, currentY)
  currentY += 6
  doc.text(
    `הושלמו: ${tasks.filter((t) => t.status === 'completed').length}`,
    15,
    currentY
  )
  currentY += 6
  doc.text(
    `בתהליך: ${tasks.filter((t) => t.status === 'in-progress').length}`,
    15,
    currentY
  )
  currentY += 6
  doc.text(
    `ממתינות: ${tasks.filter((t) => t.status === 'pending').length}`,
    15,
    currentY
  )
  currentY += 12

  // Products & Services Summary
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('סיכום מוצרים ושירותים', 105, currentY, { align: 'center' })
  currentY += 8

  const productsValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`מוצרים: ${products.length}`, 15, currentY)
  currentY += 6
  doc.text(`ערך מלאי: ₪${productsValue.toLocaleString()}`, 15, currentY)
  currentY += 6
  doc.text(`שירותים: ${services.length}`, 15, currentY)

  doc.save(`דוח_עסקי_מקיף_${format(new Date(), 'dd-MM-yyyy')}.pdf`)
}

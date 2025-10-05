import { Customer, Deal, Task } from '../types'
import { format } from 'date-fns'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  category: 'customer' | 'deal' | 'task' | 'general'
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'ברוכים הבאים ללקוח חדש',
    subject: 'ברוכים הבאים ל{company_name}!',
    body: `שלום {customer_name},

ברוכים הבאים למערכת ה-CRM שלנו!

אנו שמחים שהצטרפת אלינו. הנה כמה פרטים חשובים:

- שם החברה: {company_name}
- אימייל: {customer_email}
- טלפון: {customer_phone}

נציג שלנו ייצור איתך קשר בקרוב.

בברכה,
צוות {company_name}`,
    category: 'customer',
  },
  {
    id: '2',
    name: 'הצעת מחיר',
    subject: 'הצעת מחיר - {deal_title}',
    body: `שלום {customer_name},

מצורפת הצעת מחיר עבור: {deal_title}

פרטי ההצעה:
- סכום: ₪{deal_amount}
- סבירות: {deal_probability}%
- תאריך סגירה צפוי: {deal_close_date}

נשמח לענות על כל שאלה.

בברכה,
צוות המכירות`,
    category: 'deal',
  },
  {
    id: '3',
    name: 'תזכורת למשימה',
    subject: 'תזכורת: {task_title}',
    body: `שלום {customer_name},

זוהי תזכורת למשימה: {task_title}

תיאור: {task_description}
תאריך יעד: {task_due_date}
עדיפות: {task_priority}

נא לטפל במשימה זו בהקדם.

בברכה,
הצוות`,
    category: 'task',
  },
  {
    id: '4',
    name: 'עסקה נסגרה בהצלחה',
    subject: 'מזל טוב! העסקה נסגרה בהצלחה',
    body: `שלום {customer_name},

מזל טוב! העסקה "{deal_title}" נסגרה בהצלחה!

פרטי העסקה:
- סכום: ₪{deal_amount}
- תאריך סגירה: {deal_close_date}

תודה על האמון שלך בנו.

בברכה,
צוות המכירות`,
    category: 'deal',
  },
  {
    id: '5',
    name: 'עדכון סטטוס לקוח',
    subject: 'עדכון סטטוס - {customer_name}',
    body: `שלום {customer_name},

רצינו לעדכן אותך בנוגע לסטטוס שלך במערכת שלנו.

הסטטוס שלך עודכן ל: {customer_status}

אם יש לך שאלות, אנחנו כאן לעזור.

בברכה,
צוות התמיכה`,
    category: 'customer',
  },
]

export const generateEmailFromTemplate = (
  template: EmailTemplate,
  data: {
    customer?: Customer
    deal?: Deal
    task?: Task
    companyName?: string
  }
): { subject: string; body: string } => {
  let subject = template.subject
  let body = template.body

  // Replace customer placeholders
  if (data.customer) {
    subject = subject.replace(/{customer_name}/g, data.customer.name)
    subject = subject.replace(/{customer_email}/g, data.customer.email)
    subject = subject.replace(/{customer_phone}/g, data.customer.phone)
    subject = subject.replace(/{customer_status}/g, data.customer.status)

    body = body.replace(/{customer_name}/g, data.customer.name)
    body = body.replace(/{customer_email}/g, data.customer.email)
    body = body.replace(/{customer_phone}/g, data.customer.phone)
    body = body.replace(/{customer_status}/g,
      data.customer.status === 'active' ? 'פעיל' :
      data.customer.status === 'lead' ? 'ליד' : 'לא פעיל'
    )
  }

  // Replace deal placeholders
  if (data.deal) {
    subject = subject.replace(/{deal_title}/g, data.deal.title)
    subject = subject.replace(/{deal_amount}/g, data.deal.amount.toLocaleString())
    subject = subject.replace(/{deal_probability}/g, data.deal.probability.toString())
    subject = subject.replace(/{deal_close_date}/g, format(new Date(data.deal.expectedCloseDate), 'dd/MM/yyyy'))

    body = body.replace(/{deal_title}/g, data.deal.title)
    body = body.replace(/{deal_amount}/g, data.deal.amount.toLocaleString())
    body = body.replace(/{deal_probability}/g, data.deal.probability.toString())
    body = body.replace(/{deal_close_date}/g, format(new Date(data.deal.expectedCloseDate), 'dd/MM/yyyy'))
  }

  // Replace task placeholders
  if (data.task) {
    subject = subject.replace(/{task_title}/g, data.task.title)
    subject = subject.replace(/{task_description}/g, data.task.description)
    subject = subject.replace(/{task_due_date}/g, format(new Date(data.task.dueDate), 'dd/MM/yyyy'))
    subject = subject.replace(/{task_priority}/g,
      data.task.priority === 'high' ? 'גבוהה' :
      data.task.priority === 'medium' ? 'בינונית' : 'נמוכה'
    )

    body = body.replace(/{task_title}/g, data.task.title)
    body = body.replace(/{task_description}/g, data.task.description)
    body = body.replace(/{task_due_date}/g, format(new Date(data.task.dueDate), 'dd/MM/yyyy'))
    body = body.replace(/{task_priority}/g,
      data.task.priority === 'high' ? 'גבוהה' :
      data.task.priority === 'medium' ? 'בינונית' : 'נמוכה'
    )
  }

  // Replace company placeholders
  const companyName = data.companyName || 'מערכת CRM'
  subject = subject.replace(/{company_name}/g, companyName)
  body = body.replace(/{company_name}/g, companyName)

  return { subject, body }
}

export const sendEmail = (to: string, subject: string, body: string): boolean => {
  // Simulate sending email (in real app, this would call an API)
  console.log('Sending email:', { to, subject, body })

  // Create mailto link
  const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.open(mailtoLink, '_blank')

  return true
}

// WhatsApp Integration for CRM
// אינטגרציה עם WhatsApp

export interface WhatsAppMessage {
  phone: string
  message: string
}

/**
 * Send a message via WhatsApp Web
 * Opens WhatsApp Web with pre-filled message
 */
export const sendWhatsAppMessage = (phone: string, message: string) => {
  // Clean phone number - remove all non-digits
  const cleanPhone = phone.replace(/\D/g, '')

  // Add country code if missing (Israel +972)
  let formattedPhone = cleanPhone
  if (cleanPhone.startsWith('0')) {
    formattedPhone = '972' + cleanPhone.substring(1)
  } else if (!cleanPhone.startsWith('972')) {
    formattedPhone = '972' + cleanPhone
  }

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message)

  // WhatsApp Web URL
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`

  // Open in new window
  window.open(whatsappUrl, '_blank')
}

/**
 * Check if phone number is valid for WhatsApp
 */
export const isValidWhatsAppPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '')
  return cleanPhone.length >= 9 && cleanPhone.length <= 15
}

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '')

  // Israeli format: 050-123-4567
  if (cleanPhone.startsWith('972')) {
    const localNumber = cleanPhone.substring(3)
    if (localNumber.length === 9) {
      return `0${localNumber.substring(0, 2)}-${localNumber.substring(2, 5)}-${localNumber.substring(5)}`
    }
  } else if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
    return `${cleanPhone.substring(0, 3)}-${cleanPhone.substring(3, 6)}-${cleanPhone.substring(6)}`
  }

  return phone
}

// WhatsApp message templates
export const whatsappTemplates = {
  greeting: (name: string) => `שלום ${name}! 👋\n\nאני פונה אליך מ{{companyName}}.\n\nנשמח לעמוד לרשותך!`,

  followUp: (name: string, dealName: string) => `היי ${name}! 😊\n\nרציתי לעדכן אותך לגבי ${dealName}.\n\nיש לך זמן לשיחה קצרה?`,

  quote: (name: string, amount: number) => `שלום ${name}! 💼\n\nמצורפת הצעת המחיר עבורך:\n\n*סכום כולל:* ₪${amount.toLocaleString()}\n\nנשמח לענות על שאלות!`,

  meeting: (name: string, date: string, time: string) => `היי ${name}! 📅\n\n*תזכורת לפגישה:*\n📆 תאריך: ${date}\n🕐 שעה: ${time}\n\nמצפה לראותך!`,

  thankYou: (name: string) => `תודה רבה ${name}! 🙏\n\nהיה כיף לעבוד איתך.\n\nנשמח לעזור בכל שאלה נוספת!`,

  custom: (name: string, message: string) => `היי ${name}! 👋\n\n${message}`,
}

/**
 * Send WhatsApp message with template
 */
export const sendWhatsAppTemplate = (
  phone: string,
  templateId: keyof typeof whatsappTemplates,
  data: Record<string, any>
) => {
  const template = whatsappTemplates[templateId]

  if (!template) {
    throw new Error(`Template not found: ${templateId}`)
  }

  let message: string

  switch (templateId) {
    case 'greeting':
      message = whatsappTemplates.greeting(data.name)
      break
    case 'followUp':
      message = whatsappTemplates.followUp(data.name, data.dealName)
      break
    case 'quote':
      message = whatsappTemplates.quote(data.name, data.amount)
      break
    case 'meeting':
      message = whatsappTemplates.meeting(data.name, data.date, data.time)
      break
    case 'thankYou':
      message = whatsappTemplates.thankYou(data.name)
      break
    case 'custom':
      message = whatsappTemplates.custom(data.name, data.message)
      break
    default:
      message = ''
  }

  // Replace company name placeholder
  message = message.replace('{{companyName}}', data.companyName || 'החברה שלנו')

  sendWhatsAppMessage(phone, message)
}

/**
 * Quick action: Send greeting via WhatsApp
 */
export const quickWhatsAppGreeting = (name: string, phone: string, companyName: string = 'החברה שלנו') => {
  sendWhatsAppTemplate(phone, 'greeting', { name, companyName })
}

import { Handler } from '@netlify/functions'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailRequest {
  to: string
  subject: string
  html: string
  from?: string
}

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const { to, subject, html, from }: EmailRequest = JSON.parse(event.body || '{}')

    // Validation
    if (!to || !subject || !html) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
      }
    }

    // Send email using Resend
    const data = await resend.emails.send({
      from: from || 'CRM System <onboarding@resend.dev>', // Change this to your verified domain
      to,
      subject,
      html,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        messageId: data.id,
      }),
    }
  } catch (error: any) {
    console.error('Error sending email:', error)

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send email',
        message: error?.message || 'Unknown error',
      }),
    }
  }
}

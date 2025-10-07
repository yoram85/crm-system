# 🔗 N8N Integration Guide - מדריך שילוב N8N

## סקירה כללית

המערכת תומכת באינטגרציה מלאה עם N8N באמצעות Webhooks. כל פעולה במערכת ה-CRM יכולה לשלוח אירוע ל-N8N ולהפעיל workflow אוטומטי.

---

## 🚀 הגדרה מהירה

### שלב 1: יצירת Webhook ב-N8N

1. פתח את N8N שלך
2. צור Workflow חדש
3. הוסף Node מסוג **Webhook**
4. העתק את ה-URL של ה-Webhook
5. שמור את ה-Workflow

### שלב 2: הוספת Webhook ב-CRM

1. כנס ל-CRM שלך
2. עבור ל-**הגדרות** → **Webhooks**
3. לחץ על **הוסף Webhook**
4. הזן:
   - **שם**: N8N Integration
   - **URL**: הדבק את ה-URL מ-N8N
   - **אירועים**: בחר את האירועים שתרצה לקבל (customers, deals, tasks, products, services)
5. סמן **מופעל** ולחץ **שמור**

---

## 📊 מבנה ה-Webhook Payload

כל webhook שנשלח מה-CRM מכיל את המבנה הבא:

```json
{
  "event": "customer" | "deal" | "task" | "product" | "service" | "invoice",
  "action": "create" | "update" | "delete",
  "data": { /* האובייקט המלא */ },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "webhookName": "N8N Integration",
  "metadata": {
    "source": "CRM",
    "environment": "production",
    "version": "1.0.0"
  }
}
```

### אירועים מיוחדים (Special Events)

המערכת שולחת אירועים מיוחדים עבור פעולות חשובות:

#### 1. **Lead Converted** - ליד הומר ללקוח
```json
{
  "event": "customer",
  "action": "update",
  "data": {
    ...customerData,
    "_specialEvent": "lead_converted",
    "_previousStatus": "lead"
  }
}
```

#### 2. **Deal Stage Changed** - עסקה התקדמה
```json
{
  "event": "deal",
  "action": "update",
  "data": {
    ...dealData,
    "_specialEvent": "stage_changed",
    "_previousStage": "qualified",
    "_newStage": "proposal"
  }
}
```

#### 3. **Task Completed** - משימה הושלמה
```json
{
  "event": "task",
  "action": "update",
  "data": {
    ...taskData,
    "_specialEvent": "task_completed",
    "_invoice": { /* חשבונית שנוצרה אוטומטית */ }
  }
}
```

#### 4. **Invoice Created** - חשבונית נוצרה
```json
{
  "event": "invoice",
  "action": "created",
  "data": {
    "invoiceNumber": "INV-20240115-123",
    "date": "2024-01-15T10:30:00.000Z",
    "customer": { /* פרטי לקוח */ },
    "items": [ /* פריטים */ ],
    "subtotal": 10000,
    "tax": 1700,
    "total": 11700,
    "notes": "...",
    "paymentTerms": "תשלום תוך 30 יום"
  }
}
```

---

## 🎯 N8N Workflow Templates

### 1️⃣ לקוח חדש נוסף → שלח SMS/Email

**מטרה**: כשנוסף לקוח חדש, שלח אליו הודעת ברוכים הבאים.

**N8N Workflow:**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Webhook    │────▶│     IF      │────▶│   Send SMS  │
│             │     │ event=      │     │   (Twilio)  │
└─────────────┘     │ customer &  │     └─────────────┘
                    │ action=     │
                    │ create      │     ┌─────────────┐
                    └─────────────┘────▶│ Send Email  │
                                        │  (Resend)   │
                                        └─────────────┘
```

**הגדרת Nodes:**

1. **Webhook Node**
   - Method: POST
   - Path: /crm-webhook

2. **IF Node**
   - Condition 1: `{{ $json.event }} === 'customer'`
   - Condition 2: `{{ $json.action }} === 'create'`

3. **Send SMS Node (Twilio)**
   - To: `{{ $json.data.phone }}`
   - Message: `שלום {{ $json.data.firstName }}! ברוכים הבאים למערכת שלנו 👋`

4. **Send Email Node (Resend/SMTP)**
   - To: `{{ $json.data.email }}`
   - Subject: `ברוך הבא ${$json.data.firstName}!`
   - Body: Template HTML עם פרטי הלקוח

---

### 2️⃣ עסקה התקדמה → עדכן Google Sheets

**מטרה**: כשעסקה משנה שלב, עדכן Google Sheets עם הסטטוס החדש.

**N8N Workflow:**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Webhook    │────▶│     IF      │────▶│   Google    │
│             │     │ special     │     │   Sheets    │
└─────────────┘     │ Event =     │     │   Update    │
                    │ stage_      │     └─────────────┘
                    │ changed     │
                    └─────────────┘
```

**הגדרת Nodes:**

1. **Webhook Node**
   - Method: POST
   - Path: /crm-webhook

2. **IF Node**
   - Condition: `{{ $json.data._specialEvent }} === 'stage_changed'`

3. **Google Sheets Node**
   - Operation: **Update**
   - Spreadsheet ID: `YOUR_SHEET_ID`
   - Sheet Name: `Deals`
   - Search Column: `Deal ID`
   - Search Value: `{{ $json.data.id }}`
   - Columns to Update:
     - `Stage`: `{{ $json.data._newStage }}`
     - `Previous Stage`: `{{ $json.data._previousStage }}`
     - `Updated At`: `{{ $json.timestamp }}`

---

### 3️⃣ משימה הושלמה → יצירת חשבונית ושליחה ללקוח

**מטרה**: כשמשימה מסומנת כהושלמה, המערכת יוצרת חשבונית ושולחת ללקוח באימייל.

**N8N Workflow:**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Webhook    │────▶│     IF      │────▶│   Format    │────▶│ Send Email  │
│             │     │ special     │     │   Invoice   │     │ with PDF    │
└─────────────┘     │ Event =     │     │   HTML      │     │ Attachment  │
                    │ task_       │     └─────────────┘     └─────────────┘
                    │ completed   │
                    └─────────────┘────▶│   Google    │
                                        │   Sheets    │
                                        │   Log       │
                                        └─────────────┘
```

**הגדרת Nodes:**

1. **Webhook Node**
   - Method: POST
   - Path: /crm-webhook

2. **IF Node**
   - Condition: `{{ $json.data._specialEvent }} === 'task_completed'`
   - AND: `{{ $json.data._invoice }} exists`

3. **Function Node - Format Invoice HTML**
   ```javascript
   const invoice = $input.item.json.data._invoice
   const html = `
     <div dir="rtl" style="font-family: Arial;">
       <h1>חשבונית מס ${invoice.invoiceNumber}</h1>
       <p><strong>לכבוד:</strong> ${invoice.customer.firstName} ${invoice.customer.lastName}</p>
       <p><strong>תאריך:</strong> ${new Date(invoice.date).toLocaleDateString('he-IL')}</p>
       <hr>
       <table>
         <thead>
           <tr>
             <th>תיאור</th>
             <th>כמות</th>
             <th>מחיר יחידה</th>
             <th>סה"כ</th>
           </tr>
         </thead>
         <tbody>
           ${invoice.items.map(item => `
             <tr>
               <td>${item.description}</td>
               <td>${item.quantity}</td>
               <td>₪${item.unitPrice.toLocaleString()}</td>
               <td>₪${item.total.toLocaleString()}</td>
             </tr>
           `).join('')}
         </tbody>
       </table>
       <hr>
       <p><strong>סכום ביניים:</strong> ₪${invoice.subtotal.toLocaleString()}</p>
       <p><strong>מע"מ (17%):</strong> ₪${invoice.tax.toLocaleString()}</p>
       <h2><strong>סה"כ לתשלום:</strong> ₪${invoice.total.toLocaleString()}</h2>
       <p><em>תנאי תשלום: ${invoice.paymentTerms}</em></p>
     </div>
   `
   return { json: { ...invoice, htmlContent: html } }
   ```

4. **Send Email Node (Resend)**
   - To: `{{ $json.customer.email }}`
   - Subject: `חשבונית ${$json.invoiceNumber} - ${$json.customer.firstName}`
   - HTML: `{{ $json.htmlContent }}`

5. **Google Sheets Node - Log Invoice**
   - Operation: **Append**
   - Spreadsheet ID: `YOUR_SHEET_ID`
   - Sheet Name: `Invoices`
   - Columns:
     - Invoice Number: `{{ $json.invoiceNumber }}`
     - Customer: `{{ $json.customer.firstName }} {{ $json.customer.lastName }}`
     - Total: `{{ $json.total }}`
     - Date: `{{ $json.date }}`

---

### 4️⃣ לקוח הפך ל-"לקוח" → הוספה לרשימת תפוצה

**מטרה**: כשליד הופך ללקוח משלם, הוסף אותו לרשימת תפוצה (Mailchimp/Brevo).

**N8N Workflow:**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Webhook    │────▶│     IF      │────▶│  Mailchimp  │────▶│   Slack     │
│             │     │ special     │     │  Add to     │     │   Notify    │
└─────────────┘     │ Event =     │     │  List       │     │   Team      │
                    │ lead_       │     └─────────────┘     └─────────────┘
                    │ converted   │
                    └─────────────┘
```

**הגדרת Nodes:**

1. **Webhook Node**
   - Method: POST
   - Path: /crm-webhook

2. **IF Node**
   - Condition: `{{ $json.data._specialEvent }} === 'lead_converted'`

3. **Mailchimp Node**
   - Operation: **Add/Update Member**
   - List ID: `YOUR_LIST_ID`
   - Email: `{{ $json.data.email }}`
   - Status: `subscribed`
   - Merge Fields:
     - FNAME: `{{ $json.data.firstName }}`
     - LNAME: `{{ $json.data.lastName }}`
     - PHONE: `{{ $json.data.phone }}`
     - COMPANY: `{{ $json.data.company }}`

4. **Slack Node**
   - Channel: `#sales`
   - Message:
     ```
     🎉 *לקוח חדש הומר!*
     שם: {{ $json.data.firstName }} {{ $json.data.lastName }}
     חברה: {{ $json.data.company }}
     אימייל: {{ $json.data.email }}
     ```

---

### 5️⃣ Workflow מתקדם: אוטומציה מלאה

**מטרה**: workflow מורכב שמטפל במספר תרחישים.

**N8N Workflow:**

```
                                    ┌─────────────┐
                                    │ New Customer│
                                    │ Send Welcome│
                             ┌─────▶│    Email    │
                             │      └─────────────┘
┌─────────────┐     ┌────────┴──────┐
│  Webhook    │────▶│    Switch     │     ┌─────────────┐
│             │     │   (by event)  │────▶│Deal Progress│
└─────────────┘     └────────┬──────┘     │Update Sheets│
                             │            └─────────────┘
                             │      ┌─────────────┐
                             ├─────▶│Task Complete│
                             │      │Send Invoice │
                             │      └─────────────┘
                             │      ┌─────────────┐
                             └─────▶│Lead Convert │
                                    │Add to List  │
                                    └─────────────┘
```

**הגדרת Switch Node:**

```javascript
// Mode: Rules
Rules:
1. {{ $json.event === 'customer' && $json.action === 'create' }} → Output 1
2. {{ $json.data._specialEvent === 'stage_changed' }} → Output 2
3. {{ $json.data._specialEvent === 'task_completed' }} → Output 3
4. {{ $json.data._specialEvent === 'lead_converted' }} → Output 4
```

---

## 🔧 דוגמאות נוספות

### שליחת WhatsApp אוטומטית
```
Webhook → IF (new customer) → HTTP Request to WhatsApp API
```

### יצירת משימת follow-up
```
Webhook → IF (deal created) → Schedule (7 days) → Create Task via CRM API
```

### שליחת דוח יומי
```
Cron (daily 8am) → HTTP Request to CRM → Format Report → Send Email
```

---

## 📝 Tips & Best Practices

### 1. **אבטחה**
- השתמש ב-Authentication Header ב-Webhooks
- הגדר IP Whitelist ב-N8N
- הצפן sensitive data

### 2. **Error Handling**
- הוסף Error Trigger ל-Workflows
- שלח התרעות ל-Slack/Email במקרה של שגיאה
- שמור logs ב-Google Sheets

### 3. **Performance**
- השתמש ב-Queue Node למשימות כבדות
- הגדר Timeout מתאים
- השתמש ב-Batch operations כשאפשר

### 4. **Testing**
- בדוק כל Workflow עם Test Webhook
- השתמש ב-Switch Node לסביבות שונות (dev/prod)
- שמור backups של Workflows

---

## 🆘 Troubleshooting

### Webhook לא מגיע ל-N8N
1. ✅ בדוק שה-Webhook מופעל ב-CRM
2. ✅ בדוק שה-URL נכון (כולל https://)
3. ✅ בדוק שה-N8N Workflow פעיל
4. ✅ בדוק את ה-Event Types שנבחרו

### Workflow נכשל
1. ✅ בדוק את ה-Execution Log ב-N8N
2. ✅ וודא שיש הרשאות ל-APIs חיצוניים
3. ✅ בדוק את ה-Payload שמגיע מה-CRM
4. ✅ הוסף Error Trigger לתפוס שגיאות

---

## 📚 משאבים נוספים

- [N8N Documentation](https://docs.n8n.io/)
- [N8N Webhook Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [N8N Community](https://community.n8n.io/)

---

## 🎓 סיכום

עם השילוב של CRM + N8N אתה יכול:

✅ לשלוח הודעות אוטומטיות ללקוחות
✅ לסנכרן נתונים עם מערכות חיצוניות
✅ ליצור חשבוניות ולשלוח אוטומטית
✅ להוסיף לקוחות לרשימות תפוצה
✅ ליצור דוחות ולוגים
✅ לבנות אוטומציות מורכבות ללא קוד!

**בהצלחה! 🚀**

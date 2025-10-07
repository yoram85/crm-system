# 🚀 N8N Integration - סיכום שילוב

## ✅ מה בוצע

הושלם שילוב מלא עם N8N עבור אוטומציות מתקדמות. המערכת כעת תומכת ב-4 תרחישים עיקריים:

### 1️⃣ לקוח חדש נוסף → שלח SMS/Email ✅
- **Webhook Event**: `customer` + `create`
- **כשמתבצע**: נוסף לקוח חדש למערכת
- **מה נשלח**: פרטי לקוח מלאים (שם, אימייל, טלפון, חברה, סטטוס)

### 2️⃣ עסקה התקדמה → עדכן Google Sheets ✅
- **Webhook Event**: `deal` + `update` + `_specialEvent: 'stage_changed'`
- **כשמתבצע**: עסקה משנה שלב (lead → qualified → proposal → negotiation → won/lost)
- **מה נשלח**:
  - פרטי עסקה מלאים
  - `_previousStage` - השלב הקודם
  - `_newStage` - השלב החדש

### 3️⃣ משימה הושלמה → יצירת חשבונית ✅
- **Webhook Event**: `task` + `update` + `_specialEvent: 'task_completed'`
- **כשמתבצע**: משימה מסומנת כהושלמה
- **מה נשלח**:
  - פרטי משימה
  - **חשבונית מלאה** (`_invoice` object) כולל:
    - מספר חשבונית
    - פרטי לקוח
    - פריטים (מוצרים/שירותים)
    - סכום ביניים, מע"מ, סה"כ
    - תנאי תשלום

### 4️⃣ לקוח הפך ל-"לקוח" → הוספה לרשימת תפוצה ✅
- **Webhook Event**: `customer` + `update` + `_specialEvent: 'lead_converted'`
- **כשמתבצע**: סטטוס לקוח משתנה מ-"ליד" ל-"לקוח"
- **מה נשלח**:
  - פרטי לקוח מלאים
  - `_previousStatus` - הסטטוס הקודם (lead)

---

## 📁 קבצים חדשים שנוצרו

### 1. `src/utils/invoiceGenerator.ts`
מודול מלא ליצירת חשבוניות:
- `createInvoiceFromTask()` - יוצר חשבונית ממשימה שהושלמה
- `generateInvoicePDF()` - יוצר PDF של החשבונית (עם תמיכה בעברית)
- `exportInvoicePDF()` - מייצא חשבונית כקובץ PDF
- `sendInvoiceToWebhook()` - שולח חשבונית ל-N8N webhook

### 2. `N8N-WORKFLOWS.md`
מדריך מלא עם:
- 5 workflow templates מוכנים לשימוש
- הסברים מפורטים על כל node
- דוגמאות קוד ל-Function nodes
- Tips & Best Practices
- Troubleshooting guide

### 3. `src/store/useStore.ts` (עודכן)
שיפורים ב-CRUD operations:
- **לקוחות**: זיהוי אוטומטי של המרת ליד ללקוח
- **עסקאות**: מעקב אחר שינוי שלבים
- **משימות**: יצירה אוטומטית של חשבוניות
- שליחת אירועים מיוחדים (`_specialEvent`)

### 4. `src/utils/integrations.ts` (עודכן)
הוספת metadata לכל webhook:
```json
{
  "metadata": {
    "source": "CRM",
    "environment": "production",
    "version": "1.0.0"
  }
}
```

### 5. `src/types/index.ts` (עודכן)
- הוספת סטטוס `'customer'` ל-Customer interface
- הוספת שדה `notes` ל-Task interface

---

## 🔧 איך להתחיל

### שלב 1: הגדר Webhook ב-N8N

1. פתח את N8N שלך
2. צור Workflow חדש
3. הוסף **Webhook Node**:
   - Method: `POST`
   - Path: `/crm-webhook`
4. העתק את ה-Webhook URL
5. שמור את ה-Workflow

### שלב 2: הוסף Webhook ב-CRM

1. כנס ל-CRM → **הגדרות** → **Webhooks**
2. לחץ **הוסף Webhook**
3. מלא:
   - **שם**: N8N Integration
   - **URL**: [הדבק את ה-URL מ-N8N]
   - **אירועים**: סמן את כל האירועים שאתה רוצה
     - ✅ Customers
     - ✅ Deals
     - ✅ Tasks
     - ✅ Products
     - ✅ Services
4. **אפשר** את ה-Webhook
5. לחץ **שמור**

### שלב 3: בנה Workflow ב-N8N

בחר אחד מה-Templates ב-`N8N-WORKFLOWS.md` ובנה את ה-Workflow שלך:

**דוגמה: לקוח חדש → שלח Email**

```
Webhook → IF Node → Send Email Node
```

**IF Node Settings:**
```javascript
{{ $json.event === 'customer' && $json.action === 'create' }}
```

**Send Email Node:**
- To: `{{ $json.data.email }}`
- Subject: `ברוך הבא {{ $json.data.firstName }}!`
- Body: Template HTML

### שלב 4: בדוק את השילוב

1. הוסף לקוח חדש ב-CRM
2. בדוק שה-Workflow רץ ב-N8N
3. ודא שהאימייל נשלח

---

## 📊 דוגמאות Payload

### לקוח חדש נוסף
```json
{
  "event": "customer",
  "action": "create",
  "data": {
    "id": "abc123",
    "firstName": "ישראל",
    "lastName": "ישראלי",
    "email": "israel@example.com",
    "phone": "050-1234567",
    "company": "חברה בע\"מ",
    "status": "lead",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "webhookName": "N8N Integration",
  "metadata": {
    "source": "CRM",
    "environment": "production",
    "version": "1.0.0"
  }
}
```

### ליד הומר ללקוח (🎉 Special Event!)
```json
{
  "event": "customer",
  "action": "update",
  "data": {
    "id": "abc123",
    "firstName": "ישראל",
    "lastName": "ישראלי",
    "email": "israel@example.com",
    "phone": "050-1234567",
    "company": "חברה בע\"מ",
    "status": "customer",
    "_specialEvent": "lead_converted",
    "_previousStatus": "lead"
  },
  "timestamp": "2024-01-15T11:00:00.000Z",
  "webhookName": "N8N Integration"
}
```

### עסקה התקדמה (📊 Special Event!)
```json
{
  "event": "deal",
  "action": "update",
  "data": {
    "id": "deal456",
    "title": "עסקת ענק",
    "customerId": "abc123",
    "amount": 100000,
    "stage": "proposal",
    "probability": 70,
    "_specialEvent": "stage_changed",
    "_previousStage": "qualified",
    "_newStage": "proposal"
  },
  "timestamp": "2024-01-15T12:00:00.000Z",
  "webhookName": "N8N Integration"
}
```

### משימה הושלמה + חשבונית (✅ Special Event!)
```json
{
  "event": "task",
  "action": "update",
  "data": {
    "id": "task789",
    "title": "השלמת פרויקט",
    "customerId": "abc123",
    "dealId": "deal456",
    "status": "completed",
    "_specialEvent": "task_completed",
    "_invoice": {
      "invoiceNumber": "INV-20240115-001",
      "date": "2024-01-15T13:00:00.000Z",
      "customer": {
        "firstName": "ישראל",
        "lastName": "ישראלי",
        "email": "israel@example.com",
        "phone": "050-1234567",
        "company": "חברה בע\"מ"
      },
      "items": [
        {
          "description": "פיתוח אתר - פרויקט מלא",
          "quantity": 1,
          "unitPrice": 85470,
          "total": 85470
        }
      ],
      "subtotal": 85470,
      "tax": 14529.9,
      "total": 99999.9,
      "paymentTerms": "תשלום תוך 30 יום"
    }
  },
  "timestamp": "2024-01-15T13:00:00.000Z",
  "webhookName": "N8N Integration"
}
```

---

## 🎯 תרחישים נפוצים

### 1. שליחת SMS אוטומטית ללקוח חדש (Twilio)
```
Webhook → IF (customer + create) → Twilio SMS
```

### 2. עדכון Google Sheets כשעסקה מתקדמת
```
Webhook → IF (stage_changed) → Google Sheets Update
```

### 3. שליחת חשבונית באימייל כש-task מושלם
```
Webhook → IF (task_completed) → Format Invoice HTML → Send Email
```

### 4. הוספה ל-Mailchimp כשליד הופך ללקוח
```
Webhook → IF (lead_converted) → Mailchimp Add Member → Slack Notify
```

### 5. יצירת משימת Follow-up אוטומטית
```
Webhook → IF (deal created) → Delay (7 days) → HTTP Request (Create Task)
```

---

## 🔥 פיצ'רים מתקדמים

### 1. חשבונית אוטומטית עם PDF
המערכת יוצרת חשבונית מלאה כולל:
- מספר חשבונית ייחודי (INV-YYYYMMDD-XXX)
- פרטי לקוח
- פריטים מהעסקה (מוצרים/שירותים)
- חישוב מע"מ (17%)
- תנאי תשלום

### 2. Activity Log
כל פעולה נרשמת ב-Activity Log:
- `🎉 ליד הומר ללקוח: ישראל ישראלי`
- `📊 עסקה התקדמה: עסקת ענק ← הצעת מחיר`
- `✅ משימה הושלמה וחשבונית נוצרה: השלמת פרויקט (INV-20240115-001)`

### 3. Smart Event Detection
המערכת זוהה אוטומטית אירועים חשובים:
- המרת ליד ללקוח
- התקדמות עסקה
- השלמת משימה

---

## 📚 קבצים לקריאה נוספת

1. **N8N-WORKFLOWS.md** - 5 workflow templates מוכנים
2. **CLAUDE.md** - תיעוד המערכת המלא
3. **IMPROVEMENTS.md** - 20 רעיונות נוספים לשיפור

---

## 🆘 Troubleshooting

### ❌ Webhook לא מגיע ל-N8N
1. ✅ בדוק שה-Webhook **מופעל** ב-CRM
2. ✅ בדוק שה-URL כולל `https://`
3. ✅ בדוק שה-N8N Workflow **פעיל**
4. ✅ בדוק את האירועים שנבחרו

### ❌ Workflow נכשל
1. ✅ בדוק את **Execution Log** ב-N8N
2. ✅ וודא הרשאות ל-APIs חיצוניים
3. ✅ בדוק את ה-Payload שמגיע
4. ✅ הוסף **Error Trigger**

### ❌ חשבונית לא נוצרת
1. ✅ וודא שהמשימה קשורה ללקוח (`customerId`)
2. ✅ בדוק שיש עסקה קשורה עם פריטים
3. ✅ בדוק ב-Console Log

---

## 🎓 סיכום

אתה יכול עכשיו:

✅ לשלוח הודעות אוטומטיות (Email/SMS/WhatsApp)
✅ לסנכרן נתונים עם Google Sheets/Airtable
✅ ליצור חשבוניות אוטומטית כשמשימה מושלמת
✅ להוסיף לקוחות לרשימות תפוצה (Mailchimp/Brevo)
✅ לשלוח התראות ל-Slack/Discord/Telegram
✅ לבנות workflows מורכבים ללא קוד!

**בהצלחה עם האוטומציות! 🚀**

---

## 📞 תמיכה

- **N8N Documentation**: https://docs.n8n.io/
- **N8N Community**: https://community.n8n.io/
- **CRM CLAUDE.md**: קובץ התיעוד המלא של המערכת

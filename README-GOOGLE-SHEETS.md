# Google Sheets Integration - הוראות שימוש

## ⚠️ הגבלה חשובה

**הדפדפן לא יכול לאמת ישירות עם Service Account** בגלל הגבלות אבטחה (לא ניתן לחתום JWT עם RS256 בדפדפן).

## ✅ פתרונות מומלצים:

### אפשרות 1: שימוש ב-n8n (המלצה!)

1. צור workflow ב-n8n
2. הוסף Google Sheets node
3. n8n ידאג לאימות באופן אוטומטי
4. ה-CRM ישלח נתונים ל-webhook של n8n
5. n8n יכתוב ל-Google Sheets

**יתרונות:**
- ✅ פשוט להגדרה
- ✅ מאובטח
- ✅ n8n מטפל באימות
- ✅ יכול לעשות טרנספורמציות על הנתונים

---

### אפשרות 2: Backend Server (Node.js/Python)

צור שרת backend שיקבל את הנתונים מה-CRM וישלח ל-Google Sheets.

**דוגמה ב-Node.js:**

\`\`\`javascript
const { google } = require('googleapis');
const express = require('express');

const app = express();
app.use(express.json());

// טען את ה-Service Account credentials
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

app.post('/api/sheets/append', async (req, res) => {
  const { spreadsheetId, range, values } = req.body;

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: { values },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
\`\`\`

---

### אפשרות 3: Google Apps Script (חלופה פשוטה)

1. פתח את ה-Google Sheet
2. Extensions → Apps Script
3. הוסף את הקוד הזה:

\`\`\`javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.name,
    data.email,
    data.phone,
    // ... שאר השדות
  ]);

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
\`\`\`

4. Deploy → New deployment → Web app
5. השתמש ב-URL שתקבל כ-webhook

---

## 📋 המערכת הנוכחית

המערכת שומרת את ה-Service Account credentials ב-LocalStorage, אבל **לא יכולה לשלוח נתונים ישירות** מהדפדפן.

כדי לממש את האינטגרציה באמת, תצטרך להשתמש באחת מהאפשרויות למעלה.

---

## 🔐 אבטחה

**אזהרה:** אל תשתף את קובץ ה-Service Account JSON עם אף אחד!
קובץ זה מכיל private key שמאפשר גישה מלאה ל-Google Sheets.

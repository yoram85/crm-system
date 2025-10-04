# מדריך הגדרת Google OAuth למערכת CRM

מדריך זה מסביר איך להגדיר Google OAuth 2.0 כדי לאפשר בחירת גיליונות ישירות מ-Google Drive.

---

## 🎯 מה זה נותן לך?

במקום להעתיק ידנית Spreadsheet IDs, תוכל/י:
- 🔍 **לחפש ולבחור** גיליונות ישירות מ-Google Drive
- 📋 **לראות רשימה** של כל הגיליונות (tabs) בקובץ
- ✅ **מילוי אוטומטי** של הגדרות האינטגרציה

---

## 📝 שלבים

### 1️⃣ צור פרויקט ב-Google Cloud Console

1. לך ל: **https://console.cloud.google.com**
2. לחץ על **"Select a project"** → **"New Project"**
3. שם הפרויקט: `CRM Integration` (או כל שם שתרצה)
4. לחץ **"Create"**

---

### 2️⃣ הפעל את Google APIs הנדרשים

1. בתפריט הצדדי, לך ל: **"APIs & Services"** → **"Library"**
2. חפש והפעל את **Google Sheets API**:
   - חפש: `Google Sheets API`
   - לחץ על התוצאה
   - לחץ **"Enable"**
3. חפש והפעל את **Google Picker API**:
   - חזור ל-Library
   - חפש: `Google Picker API`
   - לחץ **"Enable"**
4. חפש והפעל את **Google Drive API**:
   - חפש: `Google Drive API`
   - לחץ **"Enable"**

---

### 3️⃣ צור OAuth 2.0 Client ID

1. לך ל: **"APIs & Services"** → **"Credentials"**
2. לחץ **"Create Credentials"** → **"OAuth client ID"**
3. אם מתבקש, הגדר **OAuth consent screen**:
   - User Type: **External**
   - App name: `CRM System`
   - User support email: המייל שלך
   - Developer contact: המייל שלך
   - לחץ **"Save and Continue"**
   - Scopes: דלג (לחץ "Save and Continue")
   - Test users: הוסף את המייל שלך
   - לחץ **"Save and Continue"**

4. חזור ל-**"Credentials"** → **"Create Credentials"** → **"OAuth client ID"**
5. Application type: **Web application**
6. Name: `CRM Web Client`
7. **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   https://rachel.woretaw.net
   ```
   (הוסף את כל הדומיינים שבהם האתר רץ)

8. **Authorized redirect URIs:** השאר ריק (לא נדרש ל-Picker API)
9. לחץ **"Create"**
10. **העתק את ה-Client ID** (משהו כמו: `123456789-abc.apps.googleusercontent.com`)

---

### 4️⃣ צור API Key

1. באותו מסך **"Credentials"**, לחץ **"Create Credentials"** → **"API key"**
2. **העתק את ה-API Key**
3. (אופציונלי) לחץ על ה-API Key שיצרת → **"Restrict Key"**:
   - API restrictions: בחר **"Restrict key"**
   - סמן:
     - ✅ Google Sheets API
     - ✅ Google Picker API
     - ✅ Google Drive API
   - שמור

---

### 5️⃣ הגדר את המשתנים בפרויקט

1. **צור קובץ `.env`** בשורש הפרויקט:
   ```bash
   cp .env.example .env
   ```

2. **ערוך את הקובץ `.env`** והדבק את הערכים שהעתקת:
   ```env
   VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
   VITE_GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. **שמור את הקובץ**

---

### 6️⃣ הגדר את המשתנים ב-Netlify (לפרודקשן)

1. לך ל: **https://app.netlify.com**
2. בחר את האתר שלך
3. לך ל: **"Site settings"** → **"Environment variables"**
4. הוסף 2 משתנים:
   - **Key:** `VITE_GOOGLE_CLIENT_ID`
     **Value:** ה-Client ID שלך

   - **Key:** `VITE_GOOGLE_API_KEY`
     **Value:** ה-API Key שלך

5. לחץ **"Save"**
6. **Redeploy** את האתר:
   - לך ל-**"Deploys"**
   - לחץ **"Trigger deploy"** → **"Deploy site"**

---

### 7️⃣ בדוק שזה עובד

1. **הרץ את האתר מקומית:**
   ```bash
   npm run dev
   ```

2. לך ל: **http://localhost:5173/settings**

3. לחץ **"+ אינטגרציה חדשה"** → **Google Sheets**

4. תראה כפתור כחול: **"בחר גיליון מ-Google Drive"** 🎉

5. לחץ עליו - אמור להיפתח חלון Google Picker!

---

## 🔒 אבטחה

- ✅ **API Key** ו-**Client ID** הם ציבוריים - בטוח לשתף אותם
- ✅ OAuth מאומת דרך Google - המשתמש מתחבר עם החשבון שלו
- ✅ אין צורך ב-Service Account credentials (אם משתמשים ב-Picker בלבד)
- ⚠️ אל תשתף את ה-**Service Account JSON** (אם יש לך)

---

## ❓ פתרון בעיות

### "Google APIs עדיין לא נטענו"
- המתן כמה שניות ונסה שוב
- בדוק שהסקריפטים נטענו ב-Network tab (F12)

### "חסרים Google Client ID או API Key"
- ודא שיצרת קובץ `.env` עם הערכים הנכונים
- הפעל מחדש את `npm run dev`

### "Access blocked: This app's request is invalid"
- ודא שהוספת את הדומיין הנכון ב-**Authorized JavaScript origins**
- לדוגמה: `http://localhost:5173` (בדיוק כמו שרץ)

### "The API key doesn't authorize requests to this API"
- לך ל-Google Cloud Console → Credentials
- ערוך את ה-API Key
- בדוק ש-**Google Sheets API**, **Picker API**, ו-**Drive API** מסומנים

---

## 🎊 סיימת!

עכשיו תוכל/י לבחור גיליונות מ-Google Drive ישירות במערכת CRM! 🚀

אם יש בעיות, בדוק את ה-Console (F12) לשגיאות.

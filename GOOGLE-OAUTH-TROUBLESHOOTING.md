# פתרון בעיות - Google OAuth לא עובד

## 🔍 הבעיה

אתה מנסה להתחבר ב-https://rachel.woretaw.net/login דרך Google, אבל זה לא עובד.

---

## ✅ רשימת בדיקות (Checklist)

### 1️⃣ בדיקה ראשונה: האם Supabase מוגדר?

1. **בדוק שיש לך קובץ `.env.local`** בשורש הפרויקט
2. **פתח אותו ובדוק:**
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. **ודא שהערכים מלאים ונכונים** (לא "your-project" או דומה)

**אם חסר `.env.local`:**
- צור אותו מ-`.env.local.example`
- מלא את הערכים מ-Supabase Dashboard

---

### 2️⃣ Google OAuth ב-Supabase - הגדרה נכונה

#### שלב 1: אפשר Google Provider

1. לך ל-**Supabase Dashboard**: https://supabase.com/dashboard
2. בחר את הפרויקט שלך
3. לך ל-**Authentication** → **Providers**
4. מצא **Google** ברשימה
5. לחץ על **Google** להרחבה
6. ודא שה-**toggle מופעל** (צבע ירוק/כחול)

#### שלב 2: הגדר Google OAuth Credentials

אם Google Provider **לא מוגדר**, תצטרך:

1. **ליצור Google OAuth Client** ב-Google Cloud Console:
   - לך ל: https://console.cloud.google.com
   - צור פרויקט חדש (או בחר קיים)
   - לך ל-**APIs & Services** → **Credentials**
   - לחץ **Create Credentials** → **OAuth 2.0 Client ID**
   - בחר **Web application**
   - **Authorized JavaScript origins**:
     ```
     https://your-project.supabase.co
     ```
   - **Authorized redirect URIs**:
     ```
     https://your-project.supabase.co/auth/v1/callback
     ```
   - העתק את **Client ID** ו-**Client Secret**

2. **חזור ל-Supabase Dashboard**:
   - ב-**Authentication** → **Providers** → **Google**
   - הדבק:
     - **Client ID** (מ-Google Console)
     - **Client Secret** (מ-Google Console)
   - לחץ **Save**

---

### 3️⃣ Redirect URLs ב-Supabase

**חשוב מאוד!** Supabase חייב לדעת לאן להחזיר את המשתמש אחרי התחברות Google.

1. ב-**Supabase Dashboard**:
   - לך ל-**Authentication** → **URL Configuration**
   - ב-**Redirect URLs**, הוסף:
     ```
     https://rachel.woretaw.net
     https://rachel.woretaw.net/
     https://rachel.woretaw.net/**
     http://localhost:5173
     http://localhost:5173/
     ```

2. לחץ **Save**

---

### 4️⃣ בדיקת משתני סביבה ב-Netlify

אם האתר רץ ב-Netlify, ודא:

1. לך ל-**Netlify Dashboard**: https://app.netlify.com
2. בחר את האתר **rachel.woretaw.net**
3. לך ל-**Site settings** → **Environment variables**
4. **ודא שיש:**
   - `VITE_SUPABASE_URL` = ה-URL של Supabase
   - `VITE_SUPABASE_ANON_KEY` = ה-anon key של Supabase

**אם חסרים:**
- הוסף אותם
- לחץ **Save**
- **Trigger deploy מחדש**:
  - לך ל-**Deploys**
  - **Trigger deploy** → **Clear cache and deploy site**

---

### 5️⃣ בדיקת הקוד - Redirect URL

הקוד נכון כרגע ([useAuthStore.ts:365](src/store/useAuthStore.ts#L365)):

```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/`,
  },
})
```

**זה אמור לעבוד!** אם לא, נסה לשנות ל:

```typescript
redirectTo: 'https://rachel.woretaw.net/',
```

---

### 6️⃣ בדיקת Console Errors

פתח את **Developer Tools** (F12) ובדוק:

1. **Console Tab** - מה השגיאות?
   - "Google sign-in error: Invalid provider"
     → Google Provider לא מופעל ב-Supabase

   - "Google sign-in error: Invalid redirect URL"
     → Redirect URLs לא מוגדרים ב-Supabase

   - "Invalid API key"
     → `.env.local` לא קיים או ריק

2. **Network Tab** - מה קורה כשלוחצים "התחבר עם Google"?
   - האם יש קריאה ל-`/auth/v1/authorize`?
   - מה הסטטוס קוד? (200 = טוב, 400/500 = שגיאה)

---

### 7️⃣ בדיקת התנהגות Google OAuth

כשהכל עובד נכון:

1. **לוחצים "התחבר עם Google"**
2. **מועברים לדף Google** (accounts.google.com)
3. **בוחרים חשבון Google**
4. **מאשרים הרשאות** (אם זו הפעם הראשונה)
5. **מועברים חזרה ל-https://rachel.woretaw.net/**
6. **מתחברים אוטומטית!** ✅

**אם זה לא קורה**, בדוק שוב את השלבים למעלה.

---

## 🆘 שגיאות נפוצות ופתרונות

### ❌ "Supabase not configured for Google OAuth"

**פתרון:**
- `.env.local` חסר או ריק
- צור אותו והוסף את Supabase URL ו-Key

---

### ❌ "Invalid OAuth provider"

**פתרון:**
- Google Provider לא מופעל ב-Supabase Dashboard
- לך ל-Authentication → Providers → Google → הפעל

---

### ❌ "Redirect URL mismatch"

**פתרון:**
1. בדוק ב-Supabase: Authentication → URL Configuration
2. הוסף את כל ה-URLs:
   ```
   https://rachel.woretaw.net
   https://rachel.woretaw.net/
   http://localhost:5173
   ```

---

### ❌ "unauthorized_client"

**פתרון:**
- ב-Google Cloud Console, הוסף את Supabase Redirect URI:
  ```
  https://your-project.supabase.co/auth/v1/callback
  ```

---

### ❌ נשאר תקוע אחרי בחירת חשבון Google

**בעיה:** נכנס ל-Google, בוחר חשבון, אבל לא חוזר לאתר.

**פתרון:**
1. בדוק ב-Supabase: Authentication → URL Configuration
2. ודא שיש: `https://rachel.woretaw.net/`
3. **Redeploy** ב-Netlify
4. נקה Cache של הדפדפן (Ctrl+Shift+Delete)

---

### ❌ "Failed to create profile"

**בעיה:** התחברות עובדת, אבל לא נכנסים למערכת.

**פתרון:**
1. בדוק ב-Supabase: Table Editor → user_profiles
2. האם יש טבלה? אם לא, הרץ את `supabase-schema.sql`
3. בדוק שיש RLS Policies:
   - לך ל-Authentication → Policies
   - ודא שיש policy ל-INSERT על user_profiles

---

## 🔧 Debug Mode - איך לבדוק מה קורה?

הוסף את זה ל-[Login.tsx](src/pages/Login.tsx) לבדיקה:

```typescript
const handleGoogleSignIn = async () => {
  setError('')
  setIsLoading(true)

  try {
    console.log('🔵 Starting Google Sign-In...')
    console.log('🔵 Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
    console.log('🔵 Current URL:', window.location.origin)

    await signInWithGoogle()

    console.log('✅ Google Sign-In initiated successfully')
  } catch (err: any) {
    console.error('❌ Google Sign-In failed:', err)
    setError(`שגיאה: ${err.message}`)
    setIsLoading(false)
  }
}
```

פתח Console (F12) ובדוק מה מודפס.

---

## 📋 רשימת בדיקות סופית

לפני שפונים לעזרה, ודא:

- [ ] קובץ `.env.local` קיים ומכיל Supabase URL ו-Key
- [ ] Google Provider מופעל ב-Supabase Dashboard
- [ ] Google OAuth Client ID ו-Secret מוגדרים ב-Supabase
- [ ] Redirect URLs מוגדרים ב-Supabase (עם `https://rachel.woretaw.net/`)
- [ ] משתני סביבה מוגדרים ב-Netlify
- [ ] האתר עבר Redeploy ב-Netlify
- [ ] Cache של הדפדפן נוקה
- [ ] בדקתי ב-Console (F12) אם יש שגיאות

---

## ✅ מה לעשות עכשיו?

1. **עבור על הרשימה למעלה צעד אחר צעד**
2. **תקן כל בעיה שמצאת**
3. **נסה שוב להתחבר**
4. **אם עדיין לא עובד:**
   - העתק את השגיאות מ-Console (F12)
   - פתח issue עם פרטי השגיאה

---

**בהצלחה! 🚀**

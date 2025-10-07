# 🔧 תיקון בעיית ההרשמה - Row Level Security

## הבעיה
כשמשתמש חדש מנסה להירשם דרך Email/Password, הוא מקבל שגיאה:
```
new row violates row-level security policy for table "user_profiles"
```

המשתמש נוצר ב-Auth, אבל לא יכול ליצור פרופיל ב-`user_profiles`.

## הפתרון - הרץ SQL ב-Supabase

### שלב 1: כנס ל-Supabase Dashboard
1. לך ל-https://supabase.com/dashboard
2. בחר בפרויקט שלך
3. לחץ על **SQL Editor** בתפריט הצד

### שלב 2: הרץ את התיקון
1. פתח את הקובץ `fix-user-profiles-rls.sql` במחשב שלך
2. העתק את **כל התוכן**
3. הדבק ב-SQL Editor של Supabase
4. לחץ על **Run** (או `Ctrl + Enter`)

### שלב 3: אמת שהתיקון עבד
אתה אמור לראות הודעה:
```
Success. No rows returned
```

זה אומר שהכל עבד מצוין! ✅

### שלב 4: נסה להירשם שוב
1. לך ל-https://rachel.woretaw.net/register
2. לחץ על "הירשם עם אימייל"
3. מלא את הפרטים
4. לחץ "הירשם"

עכשיו ההרשמה תעבוד! 🎉

## מה התיקון עושה?

1. **מתקן את ה-RLS Policies** - נותן למשתמשים חדשים הרשאה ליצור פרופיל
2. **יוצר Trigger אוטומטי** - כל משתמש חדש מקבל פרופיל באופן אוטומטי
3. **מוסיף עמודת email** - ל-`user_profiles` (לאיפוס סיסמאות)
4. **נותן הרשאות** - ל-`anon` ו-`authenticated` users

## בדיקה שהכל עובד

לאחר הרצת ה-SQL, נסה:

1. **הרשמה חדשה:**
   - לך ל-/register
   - הירשם עם email חדש
   - אמור להכנס אוטומטית ✅

2. **התחברות:**
   - התנתק
   - התחבר שוב עם אותו email/password
   - אמור להכנס ✅

## אם עדיין יש בעיה

הרץ את השאילתה הזו ב-SQL Editor כדי לבדוק את ה-Policies:

```sql
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
```

אמור להראות 3 policies:
- `Users can view their own profile` (SELECT)
- `Users can insert their own profile` (INSERT)
- `Users can update their own profile` (UPDATE)

## הערות חשובות

⚠️ **אל תמחק את auth.users!** התיקון לא משפיע על משתמשים קיימים.

✅ **בטוח לחלוטין** - התיקון רק מוסיף הרשאות בסיסיות.

🔒 **אבטחה** - כל משתמש עדיין רואה רק את הפרופיל שלו.

---

**צריך עזרה?** בדוק את הלוגים ב-Console (F12) בזמן ההרשמה.

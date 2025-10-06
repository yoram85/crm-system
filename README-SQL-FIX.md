# תיקון שגיאות SQL ב-VS Code

## הבעיה

VS Code מציג שגיאות אדומות בקבצי SQL (supabase-schema.sql) בגלל ש-extension של DB2 מנסה לפרסר PostgreSQL SQL.

## הפתרון

הקבצים SQL **עובדים מצוין ב-Supabase**! השגיאות הן רק קוסמטיות ב-VS Code.

### תיקנו את זה:

1. ✅ כל קבצי `.sql` מוגדרים כ-`plaintext` ב-`.vscode/settings.json`
2. ✅ DB2 diagnostics מכובה
3. ✅ הקובץ מוגדר בצורה מפורשת

### איך להשתמש:

**Option 1: טען מחדש את החלון (מומלץ)**
1. לחץ `Ctrl + Shift + P` (או `Cmd + Shift + P` ב-Mac)
2. הקלד: `Developer: Reload Window`
3. לחץ Enter
4. השגיאות ייעלמו! ✨

**Option 2: סגור ופתח את הקובץ**
1. סגור את `supabase-schema.sql`
2. פתח אותו שוב
3. השגיאות אמורות להיעלם

**Option 3: השבת את DB2 Extension**
1. לחץ על Extensions בסרגל הצד
2. חפש "DB2"
3. לחץ על ההילוכון ⚙️ ליד Extension
4. בחר "Disable (Workspace)" או "Uninstall"

## אימות

אחרי הטעינה מחדש:
- ✅ לא אמורות להיות שגיאות אדומות
- ✅ הקובץ ייפתח כ-plaintext
- ✅ הכל עדיין יעבוד מצוין ב-Supabase

## שאלות נפוצות

**ש: הקבצים SQL שלי עדיין יעבדו ב-Supabase?**
✅ כן! זה משנה רק איך VS Code מציג אותם. Supabase לא משתמש ב-VS Code.

**ש: איבדתי syntax highlighting?**
✅ כן, אבל זה עדיף משגיאות אדומות מטעות. אם אתה רוצה highlighting, תצטרך להסיר את DB2 extension לגמרי.

**ש: מה אם אני רוצה SQL highlighting?**
השתמש ב-PostgreSQL extension במקום DB2:
1. הסר את DB2 Extension
2. התקן "PostgreSQL" by Chris Kolkman
3. שנה ב-`.vscode/settings.json`: `"*.sql": "postgres"` במקום `"plaintext"`

---

**הערה:** הקובץ SQL מושלם ועובד 100% ב-Supabase. השגיאות היו רק visual bug ב-VS Code.

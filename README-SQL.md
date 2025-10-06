# הגדרות פרויקט CRM

## בעיות ידועות

### שגיאות DB2 SQL Parser

קבצי ה-SQL בפרויקט (`supabase-schema.sql` ו-`create-admin.sql`) מיועדים ל-**PostgreSQL/Supabase** ולא ל-DB2.

השגיאות שמוצגות ב-VS Code הן **לא קריטיות** ונגרמות כי VS Code מנסה לפרס PostgreSQL SQL עם parser של DB2.

#### פתרון:

1. קבצי ה-SQL מוגדרים כ-`plaintext` ב-`.vscode/settings.json`
2. השירות `Db2SqlService` מבוטל
3. הקבצים עובדים מצוין ב-Supabase

#### אם השגיאות עדיין מופיעות:

```
1. פתח Command Palette (Ctrl+Shift+P)
2. חפש "Developer: Reload Window"
3. לחץ Enter
```

## מבנה הפרויקט

- `supabase-schema.sql` - סכמת מסד הנתונים
- `create-admin.sql` - יצירת משתמש מנהל
- `src/` - קוד המקור של האפליקציה
- `.vscode/` - הגדרות VS Code

-- Set Admin Role for Google OAuth User
-- Email: yoram1985@gmail.com
-- Role: Admin (full permissions)

-- הוראות:
-- 1. התחבר לאתר עם Google (yoram1985@gmail.com) - פעם אחת
-- 2. לך ל-Supabase Dashboard > SQL Editor
-- 3. העתק והרץ את הסקריפט הזה (שורות 14-26)
-- 4. זה יעדכן את המשתמש שלך להיות Admin

-- Note: המשתמש כבר קיים ב-auth.users (לאחר התחברות Google)
-- הסקריפט יעדכן רק את ה-user_profile

-- Update or insert the user profile to ensure admin role:
INSERT INTO user_profiles (id, first_name, last_name, role, status)
SELECT
  id,
  'Woretaw',
  'Zaudo',
  'admin',
  'active'
FROM auth.users
WHERE email = 'yoram1985@gmail.com'
ON CONFLICT (id)
DO UPDATE SET
  role = 'admin',
  status = 'active',
  first_name = 'Woretaw',
  last_name = 'Zaudo';

-- Verify the user was updated correctly:
SELECT
  u.id,
  u.email,
  u.created_at,
  p.first_name,
  p.last_name,
  p.role,
  p.status
FROM auth.users u
LEFT JOIN user_profiles p ON p.id = u.id
WHERE u.email = 'yoram1985@gmail.com';

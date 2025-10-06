-- Set Admin Role for Google OAuth User (PostgreSQL/Supabase)
-- Email: yoram1985@gmail.com
-- Role: Admin (full permissions)
--
-- IMPORTANT: This is PostgreSQL/Supabase SQL, not DB2!
-- VS Code DB2 parser errors can be ignored.

-- הוראות:
-- 1. התחבר לאתר עם Google (yoram1985@gmail.com) - פעם אחת
-- 2. לך ל-Supabase Dashboard > SQL Editor
-- 3. העתק והרץ את הסקריפט הזה (שורות 14-26)
-- 4. זה יעדכן את המשתמש שלך להיות Admin

-- Note: המשתמש כבר קיים ב-auth.users (לאחר התחברות Google)
-- הסקריפט יעדכן רק את ה-user_profile

-- Update or insert the user profile to ensure admin role:
-- First, try to update existing profile
UPDATE user_profiles 
SET 
  role = 'admin',
  status = 'active',
  first_name = 'Woretaw',
  last_name = 'Zaudo'
WHERE id = (SELECT id FROM auth.users WHERE email = 'yoram1985@gmail.com');

-- If no rows were updated (profile doesn't exist), insert new profile
INSERT INTO user_profiles (id, first_name, last_name, role, status)
SELECT
  id,
  'Woretaw',
  'Zaudo',
  'admin',
  'active'
FROM auth.users
WHERE email = 'yoram1985@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = (SELECT id FROM auth.users WHERE email = 'yoram1985@gmail.com')
  );

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

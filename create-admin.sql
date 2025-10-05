-- Create Admin User for Yoram
-- Email: yoram1985@gmail.com
-- Password: 309592574
-- Role: Admin (full permissions)

-- הוראות:
-- 1. לך ל-Supabase Dashboard > SQL Editor
-- 2. העתק והרץ את הסקריפט הזה
-- 3. לאחר מכן תוכל להתחבר עם המייל והסיסמה

-- Note: This creates the user in Supabase Auth
-- The user_profile will be created automatically by the trigger

-- You'll need to create this user through the Supabase Dashboard UI:
-- 1. Go to Authentication > Users
-- 2. Click "Add user" > "Create new user"
-- 3. Enter:
--    - Email: yoram1985@gmail.com
--    - Password: 309592574
--    - Auto Confirm User: YES (important!)
--    - User Metadata (JSON):
--      {
--        "first_name": "יורם",
--        "last_name": "מנהל ראשי",
--        "role": "admin"
--      }
-- 4. Click "Create user"

-- After the user is created, run this to ensure admin role:

-- First, get the user ID (will be shown after creation)
-- Then run this (replace USER_ID with actual ID):

-- UPDATE auth.users
-- SET raw_user_meta_data = jsonb_build_object(
--   'first_name', 'יורם',
--   'last_name', 'מנהל ראשי',
--   'role', 'admin'
-- )
-- WHERE email = 'yoram1985@gmail.com';

-- Update or insert the user profile to ensure admin role:
INSERT INTO user_profiles (id, first_name, last_name, role, status)
SELECT
  id,
  'יורם',
  'מנהל ראשי',
  'admin',
  'active'
FROM auth.users
WHERE email = 'yoram1985@gmail.com'
ON CONFLICT (id)
DO UPDATE SET
  role = 'admin',
  status = 'active',
  first_name = 'יורם',
  last_name = 'מנהל ראשי';

-- Verify the user was created correctly:
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

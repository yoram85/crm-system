-- Fix existing user that was created before the trigger
-- תיקון משתמש קיים שנוצר לפני ה-Trigger

-- Option 1: Create profile for existing user
-- אפשרות 1: צור פרופיל למשתמש הקיים
INSERT INTO public.user_profiles (id, first_name, last_name, email, role, status)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'first_name', 'Yoram') as first_name,
  COALESCE(raw_user_meta_data->>'last_name', 'Zaudo') as last_name,
  email,
  'sales' as role,
  'active' as status
FROM auth.users
WHERE email = 'woretaw@outlook.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = auth.users.id
  );

-- Check the result
-- בדוק את התוצאה
SELECT
  u.id,
  u.email,
  u.created_at as user_created,
  p.first_name,
  p.last_name,
  p.role,
  p.status,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.id
WHERE u.email = 'woretaw@outlook.com';

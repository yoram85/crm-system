-- Enable Realtime for CRM tables
-- הפעלת Realtime עבור טבלאות ה-CRM

-- This allows Supabase to broadcast changes in real-time
-- זה מאפשר ל-Supabase לשדר שינויים בזמן אמת

-- Enable realtime for customers table
ALTER PUBLICATION supabase_realtime ADD TABLE customers;

-- Enable realtime for deals table
ALTER PUBLICATION supabase_realtime ADD TABLE deals;

-- Enable realtime for tasks table
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

-- Enable realtime for products table
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- Enable realtime for services table
ALTER PUBLICATION supabase_realtime ADD TABLE services;

-- Check if realtime is enabled (verification)
SELECT tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';

-- Expected output should show all 5 tables:
-- - customers
-- - deals
-- - tasks
-- - products
-- - services

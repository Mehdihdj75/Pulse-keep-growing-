-- Add phone column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- Drop foreign key constraint to auth.users if it exists
-- This allows creating "Ghost" profiles (Account Managers) without a corresponding Auth user yet
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

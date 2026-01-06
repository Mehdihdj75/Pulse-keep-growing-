-- Drop valid restrictive policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a permissive policy for development allowing all authenticated users to manage profiles
-- In production, you would want to restrict this to users with role='ADMIN'
CREATE POLICY "Enable all access for authenticated users" ON public.profiles
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

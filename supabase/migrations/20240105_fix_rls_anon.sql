-- Allow anonymous users (Demo Mode) to manage profiles
-- This is necessary because Demo Mode does not establish a real Supabase Auth session
CREATE POLICY "Enable all access for anon users (Dev)" ON public.profiles
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- Trigger to automatically create a profile when a user signs up via Supabase Auth
-- and assign roles based on specific email addresses.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role text;
BEGIN
  -- Determine role based on email
  IF NEW.email = 'mehdi@keepgrowing.fr' OR NEW.email = 'david@keepgrowing.fr' THEN
    assigned_role := 'ADMIN';
  ELSIF NEW.email = 'mehdihdj@hotmail.fr' THEN
    assigned_role := 'MANAGER';
  ELSIF NEW.email = 'mehdihdj2014@gmail.com' THEN
    assigned_role := 'DIRECTEUR';
  ELSE
    assigned_role := 'INDIVIDUEL'; -- Default role
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (id, email, prenom, nom, role, avatar)
  VALUES (
    NEW.id,
    NEW.email,
    'Utilisateur', -- Default first name
    '', -- Default last name
    assigned_role,
    'https://ui-avatars.com/api/?name=' || assigned_role || '&background=random'
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role; -- Update role if entry already exists
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

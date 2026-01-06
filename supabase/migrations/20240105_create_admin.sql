-- Remplacez 'VOTRE_UUID_ICI' par l'ID de l'utilisateur que vous venez de créer dans Supabase Auth
-- Remplacez 'votre@email.com', 'VotrePrénom', 'VotreNom' par vos infos

INSERT INTO public.profiles (id, email, prenom, nom, role, bio, avatar)
VALUES (
    'VOTRE_UUID_ICI', 
    'votre@email.com', 
    'VotrePrénom', 
    'VotreNom', 
    'ADMIN', 
    'Super Admin', 
    'https://ui-avatars.com/api/?name=Super+Admin&background=0D9488&color=fff'
)
ON CONFLICT (id) DO UPDATE 
SET role = 'ADMIN';

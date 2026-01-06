-- SEED DATA - VERSION 4 (Aligned with Reference Diagram)

-- 1. COMPANIES
INSERT INTO public.companies (id, name, address, phone, email, sector)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'TechFlow Solutions', '12 Avenue des Champs, Paris', '0102030405', 'contact@techflow.com', 'Technology'),
    ('22222222-2222-2222-2222-222222222222', 'GreenWave Energy', '45 Rue de la République, Lyon', '0478963214', 'info@greenwave.com', 'Energy'),
    ('33333333-3333-3333-3333-333333333333', 'OmniRetail Group', '8 Boulevard Haussmann, Paris', '0144556677', 'support@omniretail.com', 'Retail'),
    ('44444444-4444-4444-4444-444444444444', 'HealthPlus Care', '22 Rue du Faubourg, Marseille', '0491919191', 'contact@healthplus.com', 'Healthcare'),
    ('55555555-5555-5555-5555-555555555555', 'FinStar Bank', '10 La Défense, Puteaux', '0188990011', 'service@finstar.com', 'Finance')
ON CONFLICT (id) DO NOTHING;

-- 2. QUESTIONNAIRES
-- Adjusted to match Diagram: id, titre, status. (ignoring schema, description, etc. which seem missing)
INSERT INTO public.questionnaires (id, titre, status)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Diagnostic Pulse+ Global', 'Actif'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Enquête QVT 2024', 'En pause')
ON CONFLICT (id) DO NOTHING;

-- 3. PROFILES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@demo.com') THEN
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
        VALUES (
            'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
            '00000000-0000-0000-0000-000000000000', 
            'authenticated', 
            'authenticated', 
            'admin@demo.com', 
            '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0123456789', 
            now(), null, now(), 
            '{"provider":"email","providers":["email"]}', 
            '{}', 
            now(), now(), '', '', '', ''
        );
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not insert into auth.users. Skipping.';
END $$;

INSERT INTO public.profiles (id, email, prenom, nom, role, bio, avatar, entreprise_id)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@demo.com', 'David', 'Zaoui', 'ADMIN', 'Super Admin du système', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop', NULL)
ON CONFLICT (id) DO NOTHING;


-- 4. DIAGNOSTICS
INSERT INTO public.diagnostics (id, user_id, company_id, questionnaire_title, team_name, score, status, trend, created_at)
VALUES
    -- TechFlow (111...)
    (uuid_generate_v4(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '11111111-1111-1111-1111-111111111111', 'Diagnostic Pulse+ Global', 'Engineering', 9, 'Terminé', 'up', NOW() - INTERVAL '2 days'),
    (uuid_generate_v4(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '11111111-1111-1111-1111-111111111111', 'Diagnostic Pulse+ Global', 'Product', 8, 'Terminé', 'stable', NOW() - INTERVAL '5 days'),
    (uuid_generate_v4(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '11111111-1111-1111-1111-111111111111', 'Diagnostic Pulse+ Global', 'Sales', 7, 'En cours', 'down', NOW() - INTERVAL '1 day'),
    
    -- GreenWave (222...)
    (uuid_generate_v4(), NULL, '22222222-2222-2222-2222-222222222222', 'Enquête QVT 2024', 'RH', 6, 'Terminé', 'stable', NOW() - INTERVAL '10 days'),
    (uuid_generate_v4(), NULL, '22222222-2222-2222-2222-222222222222', 'Enquête QVT 2024', 'Marketing', 8, 'Terminé', 'up', NOW() - INTERVAL '12 days'),

    -- OmniRetail (333...)
    (uuid_generate_v4(), NULL, '33333333-3333-3333-3333-333333333333', 'Diagnostic Pulse+ Global', 'Store Ops', 5, 'En cours', 'down', NOW() - INTERVAL '3 days'),

    -- HealthPlus (444...)
    (uuid_generate_v4(), NULL, '44444444-4444-4444-4444-444444444444', 'Diagnostic Pulse+ Global', 'Care Unit', 9, 'Terminé', 'up', NOW() - INTERVAL '20 days'),
    (uuid_generate_v4(), NULL, '44444444-4444-4444-4444-444444444444', 'Diagnostic Pulse+ Global', 'Admin', 7, 'Terminé', 'stable', NOW() - INTERVAL '21 days'),
    
    -- Finance (555...)
    (uuid_generate_v4(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '55555555-5555-5555-5555-555555555555', 'Enquête QVT 2024', 'Finance', 8, 'Generation', 'stable', NOW())
ON CONFLICT DO NOTHING

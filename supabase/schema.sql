-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  prenom text,
  nom text,
  role text check (role in ('ADMIN', 'DIRECTEUR', 'MANAGER', 'INDIVIDUEL')),
  bio text,
  avatar text,
  entreprise_id uuid, -- will link to companies later if needed
  equipe_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- COMPANIES
create table if not exists public.companies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address text,
  phone text,
  email text,
  sector text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- QUESTIONNAIRES
create table if not exists public.questionnaires (
  id uuid default uuid_generate_v4() primary key,
  title text not null, -- 'titre' in types mapped to 'title' or 'name' usually
  description text,
  status text check (status in ('Actif', 'En pause', 'Archivé')) default 'Actif',
  employees_count int default 0,
  sections_count int default 0,
  questions_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- DIAGNOSTICS
create table if not exists public.diagnostics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  questionnaire_title text,
  team_name text,
  score int,
  status text,
  trend text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Development Mode - Permissions Open/Loose)
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.questionnaires enable row level security;
alter table public.diagnostics enable row level security;

-- Allow read access to all for now (authenticated and anon if needed for public generic parts, but mostly anon for dev if using anon key)
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Companies: Allow all access for dev/admin
create policy "Companies are viewable by everyone" on public.companies for select using (true);
create policy "Companies are editable by everyone" on public.companies for all using (true);

-- Questionnaires: Allow all access for dev/admin
create policy "Questionnaires are viewable by everyone" on public.questionnaires for select using (true);
create policy "Questionnaires are editable by everyone" on public.questionnaires for all using (true);

-- Diagnostics: Allow all access for dev/admin
create policy "Diagnostics are viewable by everyone" on public.diagnostics for select using (true);
create policy "Diagnostics are editable by everyone" on public.diagnostics for all using (true);

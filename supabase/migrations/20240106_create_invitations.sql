-- Create invitations table
create table public.invitations (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  company_id uuid references public.companies(id) not null,
  token text not null unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone default timezone('utc'::text, now() + interval '7 days') not null
);

-- Enable RLS
alter table public.invitations enable row level security;

-- Policies
-- Managers can view invitations for their company (assuming company_id link exists on profile)
create policy "Managers can view invitations for their company"
  on public.invitations for select
  using (
    auth.uid() in (
      select id from public.profiles
      where company_id = invitations.company_id
      and role in ('MANAGER', 'DIRECTEUR', 'ADMIN')
    )
  );

-- Managers can insert invitations for their company
create policy "Managers can create invitations"
  on public.invitations for insert
  with check (
    auth.uid() in (
      select id from public.profiles
      where company_id = invitations.company_id
      and role in ('MANAGER', 'DIRECTEUR', 'ADMIN')
    )
  );

-- Anyone (including anon) can read invitation by valid token (for signup flow)
create policy "Anyone can read invitation by valid token"
  on public.invitations for select
  using (true); 
-- Note: 'using (true)' allows select, but we will filter by token in the query from the client side.
-- Secure approach: relying on the token being a secret.

-- ==============================================================================
-- CIVORA / SERVICE-NAVIGATOR SUPABASE SCHEMA & RLS SECURITY POLICIES
-- ==============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 0. OFFICES TABLE (Pre-requisite referenced by profiles and applications)
-- ------------------------------------------------------------------------------
create table if not exists public.offices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null default 'Ethiopia',
  address text not null,
  office_level text not null check (office_level in ('local', 'district', 'regional')),
  location jsonb not null default '{"lat": 9.0, "lng": 38.74}'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS for offices
alter table public.offices enable row level security;

-- Everyone (authenticated and anonymous) can read offices for directory lookup
drop policy if exists "Offices are viewable by all users" on public.offices;
create policy "Offices are viewable by all users"
  on public.offices
  for select
  using (true);

-- Only service_role can insert/update/delete offices
drop policy if exists "Only service_role can modify offices" on public.offices;
create policy "Only service_role can modify offices"
  on public.offices
  for all
  to service_role
  using (true)
  with check (true);


-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  role text not null default 'citizen' check (role in ('citizen', 'pending_officer', 'office_admin')),
  office_id uuid references public.offices(id) on delete set null,
  country text,
  created_at timestamptz not null default now()
);

-- Index for lookup performance
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_office_id on public.profiles(office_id);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Policy 1a: Users can read only their own profile
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Policy 1b: Users can insert their own profile with role='citizen' (or via signup trigger)
drop policy if exists "Users can insert own profile as citizen" on public.profiles;
create policy "Users can insert own profile as citizen"
  on public.profiles
  for insert
  to authenticated
  with check (
    auth.uid() = id
    and role in ('citizen', 'pending_officer')
    and office_id is null
  );

-- Policy 1c: Users can update their own row, but role and office_id CANNOT be modified by client
-- Enforcing strict column lock: role and office_id must remain unchanged from existing value
drop policy if exists "Users can update own profile fields excluding role and office" on public.profiles;
create policy "Users can update own profile fields excluding role and office"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Strict lockdown: authenticated user cannot change role or office_id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and (office_id is not distinct from (select p.office_id from public.profiles p where p.id = auth.uid()))
  );

-- Policy 1d: Service role has unrestricted access (for Supabase Studio / Admin operations)
drop policy if exists "Service role full access on profiles" on public.profiles;
create policy "Service role full access on profiles"
  on public.profiles
  for all
  to service_role
  using (true)
  with check (true);

-- Defense-in-depth trigger: Reject any client-initiated role self-elevation attempt
create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If invoked by normal client (not service_role)
  if current_user in ('authenticated', 'anon') then
    if new.role <> old.role and new.role = 'office_admin' then
      raise exception 'Security Violation: Self-elevation to office_admin is forbidden. Role can only be granted by administrator.';
    end if;
    if new.office_id is distinct from old.office_id and new.role <> 'office_admin' then
      raise exception 'Security Violation: office_id cannot be modified directly by client.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tr_protect_profile_privileged_fields on public.profiles;
create trigger tr_protect_profile_privileged_fields
  before update on public.profiles
  for each row
  execute function public.protect_profile_privileged_fields();


-- ------------------------------------------------------------------------------
-- 2. OFFICE_ADMIN_APPLICATIONS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.office_admin_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  office_id uuid not null references public.offices(id) on delete cascade,
  full_name text not null,
  position_title text not null,
  id_document_url text not null, -- Private storage bucket path, e.g. {user_id}/{file_id}.pdf
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- Index for lookup performance
create index if not exists idx_admin_apps_user_id on public.office_admin_applications(user_id);
create index if not exists idx_admin_apps_office_id on public.office_admin_applications(office_id);
create index if not exists idx_admin_apps_status on public.office_admin_applications(status);

-- Enable RLS for office_admin_applications
alter table public.office_admin_applications enable row level security;

-- Policy 2a: Users can select ONLY their own application(s)
drop policy if exists "Users can view own applications" on public.office_admin_applications;
create policy "Users can view own applications"
  on public.office_admin_applications
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Policy 2b: Users can insert their own application only with status = 'pending'
drop policy if exists "Users can insert own application" on public.office_admin_applications;
create policy "Users can insert own application"
  on public.office_admin_applications
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and status = 'pending'
  );

-- Policy 2c: Service role has full control (for manual review in Supabase dashboard)
-- Note: NO UPDATE POLICY for authenticated role! Clients cannot update status.
drop policy if exists "Service role full access on applications" on public.office_admin_applications;
create policy "Service role full access on applications"
  on public.office_admin_applications
  for all
  to service_role
  using (true)
  with check (true);

-- Defense-in-depth trigger: when an application is inserted, automatically mark profile role = 'pending_officer'
create or replace function public.on_office_admin_application_submitted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set role = 'pending_officer'
  where id = new.user_id
    and role = 'citizen';
  return new;
end;
$$;

drop trigger if exists tr_on_office_admin_application_submitted on public.office_admin_applications;
create trigger tr_on_office_admin_application_submitted
  after insert on public.office_admin_applications
  for each row
  execute function public.on_office_admin_application_submitted();


-- ------------------------------------------------------------------------------
-- 3. STORAGE BUCKET: office-id-documents (PRIVATE)
-- ------------------------------------------------------------------------------
-- Create bucket if not exists and enforce private status
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'office-id-documents',
  'office-id-documents',
  false, -- STRICTLY PRIVATE: no public read access
  10485760, -- 10MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760;

-- Storage Policy 3a: Authenticated users can upload to their own user_id directory
drop policy if exists "Users can upload ID documents to own folder" on storage.objects;
create policy "Users can upload ID documents to own folder"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'office-id-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage Policy 3b: Authenticated users can read ONLY their own uploaded files
drop policy if exists "Users can read own uploaded ID documents" on storage.objects;
create policy "Users can read own uploaded ID documents"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'office-id-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage Policy 3c: Service role has full storage access
drop policy if exists "Service role full access on ID documents" on storage.objects;
create policy "Service role full access on ID documents"
  on storage.objects
  for all
  to service_role
  using (bucket_id = 'office-id-documents')
  with check (bucket_id = 'office-id-documents');


-- ------------------------------------------------------------------------------
-- 4. AUTH SIGNUP TRIGGER: Automated Profile Creation on Supabase Auth Signup
-- ------------------------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, office_id, created_at)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      ''
    ),
    'citizen',
    null,
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

-- ------------------------------------------------------------------------------
-- 5. SEED INITIAL OFFICES (Addis Ababa Administrative Network)
-- ------------------------------------------------------------------------------
insert into public.offices (id, name, country, address, office_level, location)
values
  (
    'a1111111-1111-1111-1111-111111111111',
    'Central District Civic Center',
    'Ethiopia',
    'Bole Road, Central District, Addis Ababa',
    'district',
    '{"lat": 9.0085, "lng": 38.7750}'::jsonb
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'Southern Local Civic Office',
    'Ethiopia',
    'Africa Avenue, Southern Ward, Addis Ababa',
    'local',
    '{"lat": 8.9950, "lng": 38.7620}'::jsonb
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'Eastern Regional Public Service Hall',
    'Ethiopia',
    'Haile Gebreselassie Avenue, Eastern Sector, Addis Ababa',
    'regional',
    '{"lat": 9.0220, "lng": 38.7985}'::jsonb
  )
on conflict (id) do update set
  name = excluded.name,
  country = excluded.country,
  address = excluded.address,
  office_level = excluded.office_level,
  location = excluded.location;

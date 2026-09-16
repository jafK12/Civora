-- ==============================================================================
-- CIVORA / SERVICE-NAVIGATOR SUPABASE SETTINGS & ACCOUNT LIFECYCLE MIGRATION
-- ==============================================================================

-- 1. ADD preferred_language AND country TO PROFILES, AND country TO OFFICES
alter table public.profiles
add column if not exists preferred_language text not null default 'en'
check (preferred_language in ('en', 'am', 'om'));

alter table public.profiles
add column if not exists country text;

alter table public.offices
add column if not exists country text not null default 'Ethiopia';

-- Update RLS to ensure authenticated user can update preferred_language along with full_name
-- (role and office_id remain strictly locked down)
drop policy if exists "Users can update own profile fields excluding role and office" on public.profiles;
create policy "Users can update own profile fields excluding role and office"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and (office_id is not distinct from (select p.office_id from public.profiles p where p.id = auth.uid()))
  );


-- 2. LIGHTWEIGHT SUPPORT REQUESTS TABLE
create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  contact_email text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.support_requests enable row level security;

-- Anyone (authenticated or anonymous) can submit a support ticket
drop policy if exists "Anyone can insert support requests" on public.support_requests;
create policy "Anyone can insert support requests"
  on public.support_requests
  for insert
  with check (true);

-- Only service_role can view or manage support requests
drop policy if exists "Only service_role can read support requests" on public.support_requests;
create policy "Only service_role can read support requests"
  on public.support_requests
  for all
  to service_role
  using (true)
  with check (true);


-- 3. SERVER-SIDE HARDENED DELETE ACCOUNT FUNCTION
-- Runs with SECURITY DEFINER privileges to operate across auth.users, storage, and app tables.
create or replace function public.delete_user_account(target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, storage
as $$
declare
  doc_record record;
begin
  -- Security verification: user must be deleting their own account unless executed by service_role
  if current_user in ('authenticated') and auth.uid() <> target_user_id then
    raise exception 'Unauthorized: You can only delete your own account.';
  end if;

  -- Step A: Preserve public accountability data — anonymize reports by nulling submitter_id
  update public.reports
  set submitter_id = null
  where submitter_id = target_user_id;

  -- Step B: Delete any private ID verification documents stored in 'office-id-documents'
  for doc_record in
    select name from storage.objects
    where bucket_id = 'office-id-documents'
      and (storage.foldername(name))[1] = target_user_id::text
  loop
    delete from storage.objects
    where bucket_id = 'office-id-documents'
      and name = doc_record.name;
  end loop;

  -- Step C: Delete any office admin applications
  delete from public.office_admin_applications
  where user_id = target_user_id;

  -- Step D: Delete user profile
  delete from public.profiles
  where id = target_user_id;

  -- Step E: Delete from auth.users (cascades sessions, tokens, identities)
  delete from auth.users
  where id = target_user_id;

  return jsonb_build_object(
    'success', true,
    'message', 'User account permanently purged and civic reports anonymized.'
  );
exception
  when others then
    return jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
end;
$$;

-- Grant execution to authenticated users (they can only pass their own auth.uid())
revoke all on function public.delete_user_account(uuid) from public;
grant execute on function public.delete_user_account(uuid) to authenticated, service_role;

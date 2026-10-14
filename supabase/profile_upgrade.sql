-- =========================================================
-- AI POLICE: Profile, Avatar & Privacy Settings Upgrade
-- Run this script in Supabase SQL Editor
-- =========================================================

-- 1. Add Avatar & Privacy columns to public.profiles
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists show_rank boolean default true;
alter table public.profiles add column if not exists show_unit boolean default true;
alter table public.profiles add column if not exists is_liked_public boolean default true;
alter table public.profiles add column if not exists hide_phone boolean default true;
alter table public.profiles add column if not exists hide_email boolean default true;

-- 2. Create Storage Bucket for Profile Avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- 3. Storage Policies for 'avatars' bucket
drop policy if exists "Public Access for Avatars" on storage.objects;
create policy "Public Access for Avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Authenticated users can upload avatars" on storage.objects;
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
  );

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
  );

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
  );

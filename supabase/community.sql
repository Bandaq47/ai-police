-- =========================================================
-- AI POLICE: Community Feed & Storage Setup (Run in Supabase)
-- =========================================================

-- 1. Create Storage Bucket for Post Images
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do update set public = true;

-- Storage Policies for 'post-images'
drop policy if exists "Public Access for Post Images" on storage.objects;
create policy "Public Access for Post Images"
  on storage.objects for select
  using (bucket_id = 'post-images');

drop policy if exists "Authenticated users can upload post images" on storage.objects;
create policy "Authenticated users can upload post images"
  on storage.objects for insert
  with check (
    bucket_id = 'post-images' 
    and auth.role() = 'authenticated'
  );

drop policy if exists "Users can delete own post images" on storage.objects;
create policy "Users can delete own post images"
  on storage.objects for delete
  using (
    bucket_id = 'post-images'
    and auth.role() = 'authenticated'
  );

-- Ensure 'submissions' bucket also has proper policies
insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', true)
on conflict (id) do update set public = true;

drop policy if exists "Public Access for Submissions" on storage.objects;
create policy "Public Access for Submissions"
  on storage.objects for select
  using (bucket_id = 'submissions');

drop policy if exists "Authenticated users can upload submissions" on storage.objects;
create policy "Authenticated users can upload submissions"
  on storage.objects for insert
  with check (
    bucket_id = 'submissions' 
    and auth.role() = 'authenticated'
  );

-- 2. Create Community Tables
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- 3. Enable Row Level Security (RLS)
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;

-- 4. Policies for 'posts'
drop policy if exists "Everyone can view posts" on public.posts;
create policy "Everyone can view posts"
  on public.posts for select
  using (true);

drop policy if exists "Authenticated users can insert posts" on public.posts;
create policy "Authenticated users can insert posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users and admins can delete posts" on public.posts;
create policy "Users and admins can delete posts"
  on public.posts for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 5. Policies for 'post_likes'
drop policy if exists "Everyone can view post likes" on public.post_likes;
create policy "Everyone can view post likes"
  on public.post_likes for select
  using (true);

drop policy if exists "Authenticated users can insert post likes" on public.post_likes;
create policy "Authenticated users can insert post likes"
  on public.post_likes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own post likes" on public.post_likes;
create policy "Users can delete own post likes"
  on public.post_likes for delete
  using (auth.uid() = user_id);

-- 6. Policies for 'post_comments'
drop policy if exists "Everyone can view post comments" on public.post_comments;
create policy "Everyone can view post comments"
  on public.post_comments for select
  using (true);

drop policy if exists "Authenticated users can insert post comments" on public.post_comments;
create policy "Authenticated users can insert post comments"
  on public.post_comments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users and admins can delete post comments" on public.post_comments;
create policy "Users and admins can delete post comments"
  on public.post_comments for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

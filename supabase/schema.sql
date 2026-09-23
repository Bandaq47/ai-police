-- ==========================================
-- AI POLICE Database Schema & RLS Policies
-- ==========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  rank text,                        -- ยศ เช่น พ.ต.อ., พ.ต.ท., ร.ต.อ.
  unit text not null,               -- สภ. ที่สังกัด (19 แห่งในจังหวัดสุราษฎร์ธานี)
  role text not null default 'officer' check (role in ('officer', 'admin')),
  created_at timestamptz default now()
);

-- 2. LESSONS TABLE (Managed by Admin)
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- 3. NEWS / ANNOUNCEMENTS TABLE
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  urgent boolean default false,
  url text,                          -- ลิงก์ URL แนบประกาศ
  youtube_url text,                  -- ลิงก์ YouTube แนบประกาศ
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- 4. SUBMISSIONS TABLE (Task submissions)
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  officer_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  prompt_text text not null,
  notes text,
  image_url text,                   -- URL จาก Supabase Storage
  created_at timestamptz default now()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.lessons enable row level security;
alter table public.news enable row level security;
alter table public.submissions enable row level security;

-- PROFILES POLICIES
create policy "Users can view all profiles"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- LESSONS POLICIES
create policy "Everyone can view lessons"
  on public.lessons for select
  using (true);

create policy "Admins can insert lessons"
  on public.lessons for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update lessons"
  on public.lessons for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete lessons"
  on public.lessons for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- NEWS POLICIES
create policy "Everyone can view news"
  on public.news for select
  using (true);

create policy "Admins can insert news"
  on public.news for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete news"
  on public.news for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- SUBMISSIONS POLICIES
create policy "Officers see own submissions or Admins see all"
  on public.submissions for select
  using (
    officer_id = auth.uid()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Officers insert own submissions"
  on public.submissions for insert
  with check (officer_id = auth.uid());

create policy "Officers update own submissions"
  on public.submissions for update
  using (officer_id = auth.uid());

create policy "Admins delete submissions"
  on public.submissions for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- TRIGGER FOR AUTOMATIC PROFILE CREATION ON AUTH SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, rank, unit, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'ตำรวจผู้เข้าอบรม'),
    new.raw_user_meta_data->>'rank',
    coalesce(new.raw_user_meta_data->>'unit', 'สภ.เมืองสุราษฎร์ธานี'),
    coalesce(new.raw_user_meta_data->>'role', 'officer')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- SEED DATA (DEFAULT LESSONS & NEWS)
-- ==========================================

insert into public.lessons (id, title, description) values
  ('11111111-1111-1111-1111-111111111111', 'การใช้พรอมต์สร้างภาพ (AI Image Generation)', 'ฝึกเขียนพรอมต์เพื่อสร้างภาพอินโฟกราฟิก ภาพจำลองเหตุการณ์ หรือสื่อประชาสัมพันธ์งานตำรวจ'),
  ('22222222-2222-2222-2222-222222222222', 'การใช้พรอมต์ทำสไลด์นำเสนอ (AI Presentation)', 'ฝึกเขียนพรอมต์เพื่อสร้างโครงร่างเนื้อหา หัวข้อสไลด์ และสคริปต์การนำเสนอผลงานตำรวจ'),
  ('33333333-3333-3333-3333-333333333333', 'การใช้พรอมต์ทำรายงานสรุปผล (AI Report Summary)', 'ฝึกเขียนพรอมต์วิเคราะห์ข้อมูล สรุปผลการปฏิบัติงาน และวิเคราะห์สถิติคดีประจำเดือน')
on conflict (id) do nothing;

insert into public.news (title, body, urgent) values
  ('กำหนดการส่งงานฝึกปฏิบัติพรอมต์ประจำวัน', 'ขอให้ผู้เข้าอบรมทุกท่านฝึกเขียนพรอมต์ตามหัวข้อที่กำหนด และแนบภาพผลลัพธ์ลงในระบบก่อนเวลา 16.30 น.', true),
  ('เอกสารประกอบการสอนและคู่มือพรอมต์ตัวอย่าง', 'ดาวน์โหลดสไลด์วิทยากรและตัวอย่าง Structure Prompt สำหรับงานตำรวจได้ในเมนูบทเรียน', false);

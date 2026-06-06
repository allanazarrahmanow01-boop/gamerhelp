-- ============================================================
-- GamerHelp Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  bio text,
  provider text, -- 'google' | 'discord' | 'steam'
  steam_id text,
  reputation int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select using (true);

create policy "Users can insert their own profile."
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile."
  on profiles for update using (auth.uid() = id);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table public.categories (
  id serial primary key,
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  color text default '#ff3c3c',
  post_count int default 0
);

insert into public.categories (name, slug, description, icon, color) values
  ('General Help', 'general', 'Get help with anything gaming related', '🎮', '#ff3c3c'),
  ('Build Advice', 'builds', 'Share and request character/loadout builds', '⚔️', '#ffb800'),
  ('Boss Fights', 'bosses', 'Stuck on a boss? Get strategies here', '💀', '#cc2222'),
  ('Glitches & Bugs', 'bugs', 'Report and fix game bugs', '🐛', '#22ff88'),
  ('Achievements', 'achievements', 'Trophy hunters unite', '🏆', '#ffb800'),
  ('Story & Lore', 'lore', 'Discuss game stories and theories', '📖', '#3c8eff'),
  ('Technical Issues', 'tech', 'PC/console performance and setup help', '🔧', '#7a7aff'),
  ('Game Recommendations', 'recs', 'Find your next favorite game', '⭐', '#ff88aa');

-- ============================================================
-- POSTS (Forum)
-- ============================================================
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  category_id int references public.categories(id),
  title text not null,
  content text not null,
  game_tag text,
  tags text[] default '{}',
  upvotes int default 0,
  views int default 0,
  reply_count int default 0,
  is_solved boolean default false,
  is_pinned boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.posts enable row level security;

create policy "Posts are viewable by everyone." on posts for select using (true);
create policy "Authenticated users can create posts." on posts for insert with check (auth.uid() = author_id);
create policy "Authors can update their posts." on posts for update using (auth.uid() = author_id);
create policy "Authors can delete their posts." on posts for delete using (auth.uid() = author_id);

-- ============================================================
-- REPLIES
-- ============================================================
create table public.replies (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  upvotes int default 0,
  is_accepted boolean default false,
  parent_id uuid references public.replies(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.replies enable row level security;

create policy "Replies are viewable by everyone." on replies for select using (true);
create policy "Authenticated users can create replies." on replies for insert with check (auth.uid() = author_id);
create policy "Authors can update their replies." on replies for update using (auth.uid() = author_id);
create policy "Authors can delete their replies." on replies for delete using (auth.uid() = author_id);

-- ============================================================
-- VOTES
-- ============================================================
create table public.votes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  target_id uuid not null,
  target_type text not null check (target_type in ('post', 'reply')),
  value int not null check (value in (1, -1)),
  created_at timestamp with time zone default now(),
  unique(user_id, target_id)
);

alter table public.votes enable row level security;

create policy "Votes are viewable by everyone." on votes for select using (true);
create policy "Authenticated users can vote." on votes for insert with check (auth.uid() = user_id);
create policy "Users can update their votes." on votes for update using (auth.uid() = user_id);
create policy "Users can delete their votes." on votes for delete using (auth.uid() = user_id);

-- ============================================================
-- LFG POSTS (Looking For Group)
-- ============================================================
create table public.lfg_posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  game text not null,
  game_mode text,
  title text not null,
  description text not null,
  platform text not null check (platform in ('PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile', 'Cross-platform')),
  region text not null,
  players_needed int default 1,
  players_current int default 1,
  rank text,
  mic_required boolean default false,
  discord_server text,
  is_active boolean default true,
  expires_at timestamp with time zone default (now() + interval '7 days'),
  created_at timestamp with time zone default now()
);

alter table public.lfg_posts enable row level security;

create policy "LFG posts are viewable by everyone." on lfg_posts for select using (true);
create policy "Authenticated users can create LFG posts." on lfg_posts for insert with check (auth.uid() = author_id);
create policy "Authors can update their LFG posts." on lfg_posts for update using (auth.uid() = author_id);
create policy "Authors can delete their LFG posts." on lfg_posts for delete using (auth.uid() = author_id);

-- ============================================================
-- LFG APPLICATIONS
-- ============================================================
create table public.lfg_applications (
  id uuid default uuid_generate_v4() primary key,
  lfg_post_id uuid references public.lfg_posts(id) on delete cascade not null,
  applicant_id uuid references public.profiles(id) on delete cascade not null,
  message text,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone default now(),
  unique(lfg_post_id, applicant_id)
);

alter table public.lfg_applications enable row level security;

create policy "LFG applications viewable by post author and applicant."
  on lfg_applications for select
  using (
    auth.uid() = applicant_id or
    auth.uid() = (select author_id from lfg_posts where id = lfg_post_id)
  );
create policy "Authenticated users can apply." on lfg_applications for insert with check (auth.uid() = applicant_id);
create policy "Post authors can update applications." on lfg_applications for update
  using (auth.uid() = (select author_id from lfg_posts where id = lfg_post_id));

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url, provider)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'preferred_username', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_app_meta_data->>'provider'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update reply count on post
create or replace function update_post_reply_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update posts set reply_count = reply_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update posts set reply_count = reply_count - 1 where id = OLD.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger on_reply_created
  after insert or delete on replies
  for each row execute procedure update_post_reply_count();

-- Update category post count
create or replace function update_category_post_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update categories set post_count = post_count + 1 where id = NEW.category_id;
  elsif TG_OP = 'DELETE' then
    update categories set post_count = post_count - 1 where id = OLD.category_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger on_post_created
  after insert or delete on posts
  for each row execute procedure update_category_post_count();

-- ============================================================
-- ADD TO PROFILES (run after initial schema)
-- ============================================================
alter table public.profiles
  add column if not exists password_hash text,
  add column if not exists is_banned boolean default false;

-- ============================================================
-- DEVICE REGISTRATIONS (cookie-based account limit)
-- ============================================================
create table if not exists public.device_registrations (
  id uuid default uuid_generate_v4() primary key,
  device_token text not null,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

create index if not exists idx_device_token on device_registrations(device_token);

alter table public.device_registrations enable row level security;
-- Only service role can access this table (used server-side only)

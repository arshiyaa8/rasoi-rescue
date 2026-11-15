-- Rasoi Rescue database. Paste into Supabase -> SQL Editor -> Run.
-- Row Level Security (RLS) means each user can only read and write their own rows.

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  name text not null,
  qty numeric,                 -- grams
  expiry date,
  created_at timestamptz default now()
);

create table if not exists rescue_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  created_at timestamptz default now(),
  recipe_title text,
  kg_used numeric,
  kg_rescued numeric,
  money_saved numeric,
  items jsonb
);

alter table profiles enable row level security;
alter table inventory_items enable row level security;
alter table rescue_log enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own inventory" on inventory_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rescue log" on rescue_log for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

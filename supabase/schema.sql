create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null default '',
  active boolean not null default true,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(code)) > 0)
);

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  target_month text not null check (target_month ~ '^[0-9]{4}-[0-9]{2}$'),
  meeting_date date,
  staff_name text not null default '',
  participants text not null default '',
  meeting_aim text not null default '',
  decisions text not null default '',
  client_homework text not null default '',
  office_homework text not null default '',
  stock_summary text not null default '',
  stock_summary_generated_at timestamptz,
  post_checklist jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, target_month)
);

create table if not exists public.agenda_items (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  title text not null,
  detail text not null default '',
  category text not null default 'current' check (category in ('previous', 'current', 'next')),
  owner text not null default '' check (owner in ('', 'client', 'office', 'staff')),
  due_date date,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'on_hold', 'withdrawn')),
  carry_forward boolean not null default true,
  visibility text not null default 'client' check (visibility in ('client', 'internal')),
  source text not null default 'manual' check (source in ('manual', 'template', 'carry_forward')),
  source_item_id uuid,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(title)) > 0)
);

create table if not exists public.internal_notes (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  title text not null,
  detail text not null default '',
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(title)) > 0)
);

create table if not exists public.exports (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  export_type text not null check (export_type in ('client_agenda', 'internal_memo', 'stock_summary', 'json')),
  file_name text not null default '',
  body text not null default '',
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists set_meetings_updated_at on public.meetings;
create trigger set_meetings_updated_at
before update on public.meetings
for each row execute function public.set_updated_at();

drop trigger if exists set_agenda_items_updated_at on public.agenda_items;
create trigger set_agenda_items_updated_at
before update on public.agenda_items
for each row execute function public.set_updated_at();

drop trigger if exists set_internal_notes_updated_at on public.internal_notes;
create trigger set_internal_notes_updated_at
before update on public.internal_notes
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.meetings enable row level security;
alter table public.agenda_items enable row level security;
alter table public.internal_notes enable row level security;
alter table public.exports enable row level security;

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.clients to authenticated;
grant select, insert, update, delete on public.meetings to authenticated;
grant select, insert, update, delete on public.agenda_items to authenticated;
grant select, insert, update, delete on public.internal_notes to authenticated;
grant select, insert, update, delete on public.exports to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "clients_authenticated_select" on public.clients;
create policy "clients_authenticated_select"
on public.clients for select
to authenticated
using (true);

drop policy if exists "clients_authenticated_insert" on public.clients;
create policy "clients_authenticated_insert"
on public.clients for insert
to authenticated
with check (auth.uid() is not null);

drop policy if exists "clients_authenticated_update" on public.clients;
create policy "clients_authenticated_update"
on public.clients for update
to authenticated
using (true)
with check (auth.uid() is not null);

drop policy if exists "clients_authenticated_delete" on public.clients;
create policy "clients_authenticated_delete"
on public.clients for delete
to authenticated
using (true);

drop policy if exists "meetings_authenticated_all" on public.meetings;
create policy "meetings_authenticated_all"
on public.meetings for all
to authenticated
using (true)
with check (auth.uid() is not null);

drop policy if exists "agenda_items_authenticated_all" on public.agenda_items;
create policy "agenda_items_authenticated_all"
on public.agenda_items for all
to authenticated
using (true)
with check (auth.uid() is not null);

drop policy if exists "internal_notes_authenticated_all" on public.internal_notes;
create policy "internal_notes_authenticated_all"
on public.internal_notes for all
to authenticated
using (true)
with check (auth.uid() is not null);

drop policy if exists "exports_authenticated_all" on public.exports;
create policy "exports_authenticated_all"
on public.exports for all
to authenticated
using (true)
with check (auth.uid() is not null);

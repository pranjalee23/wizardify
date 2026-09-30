-- Reservations made on /drop and filled in through /reserve/2-4.
-- Only the site's server reads and writes them (with the service key): row level security is on
-- with no policies, so the public keys can't reach them.

create sequence public.reservation_number_seq;

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  -- Shown as WZ-0001
  number integer not null unique default nextval('public.reservation_number_seq'),
  email text not null unique check (email = lower(email) and length(email) <= 254),
  -- An Indian mobile number, e.g. +919876543210
  whatsapp text not null check (whatsapp ~ '^\+91[6-9][0-9]{9}$'),
  name text check (length(name) <= 100),
  city text check (length(city) <= 100),
  house text check (house in ('emberwyn', 'tidesong', 'nightbloom', 'stonecrest')),
  known_for text check (length(known_for) <= 40),
  setting text check (length(setting) <= 40),
  wish text check (length(wish) <= 500),
  -- How many photos are in storage, under reservation-photos/WZ-0001/
  photos integer not null default 0 check (photos between 0 and 8),
  -- Members with portrait preferences on record are first in line
  priority text generated always as (
    case when house is not null or known_for is not null or setting is not null then 'first' else 'standard' end
  ) stored,
  alerts_email boolean not null default true,
  alerts_whatsapp boolean not null default true,
  -- When they agreed to drop alerts, by reserving
  consent_at timestamptz not null default now(),
  -- The last "continue your reservation" email, so it can't be sent over and over
  continue_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter sequence public.reservation_number_seq owned by public.reservations.number;
alter table public.reservations enable row level security;

create function public.touch_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger reservations_touch_updated_at
before update on public.reservations
for each row execute function public.touch_updated_at();

-- Members' photos: private, so they can only be uploaded or viewed through links the server signs
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reservation-photos',
  'reservation-photos',
  false,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

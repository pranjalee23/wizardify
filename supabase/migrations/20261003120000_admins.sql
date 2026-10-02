-- The team members who can use the admin pages (/admin), and their role there. What each role may do
-- is set in lib/server/admin.ts.
create table public.admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and length(email) <= 254),
  role text not null check (role in ('super_admin', 'manager', 'marketing', 'viewer')),
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

-- Sign-in codes emailed to admins. Only a keyed hash of the code is kept; each works for 10 minutes
-- and a handful of tries.
create table public.admin_codes (
  email text primary key check (email = lower(email)),
  code_hash text not null,
  expires_at timestamptz not null,
  attempts smallint not null default 0,
  sent_at timestamptz not null default now()
);

alter table public.admins enable row level security;
alter table public.admin_codes enable row level security;

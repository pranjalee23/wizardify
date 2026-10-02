-- The preferences step now also asks for role, Skyball and companion (they used to live in the
-- create flow, which is gone). Any preference on record puts a member first in line.
alter table public.reservations
  add column role text check (length(role) <= 40),
  add column skyball text check (length(skyball) <= 40),
  add column companion text check (length(companion) <= 40);

alter table public.reservations
  drop column priority,
  add column priority text generated always as (
    case when coalesce(house, known_for, setting, role, skyball, companion) is not null then 'first' else 'standard' end
  ) stored;

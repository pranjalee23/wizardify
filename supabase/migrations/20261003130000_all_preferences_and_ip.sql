-- A member is first in line only once all six portrait preferences are filled in. And each
-- reservation keeps the IP address it was made from, which helps spot spam (many reservations from
-- one address) and is shown to admins.
alter table public.reservations
  drop column priority,
  add column priority text generated always as (
    case
      when house is not null and known_for is not null and role is not null and skyball is not null and companion is not null and setting is not null
      then 'first'
      else 'standard'
    end
  ) stored,
  add column ip text check (length(ip) <= 64);

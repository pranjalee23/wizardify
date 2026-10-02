-- Members give their name when they reserve, and the city question becomes an optional shipping pin
-- code on the preferences step. Their approximate location (city, state and country) comes from their
-- internet connection when they reserve: good for knowing where members are, too rough to ship to.
alter table public.reservations
  add column pincode text check (pincode ~ '^[1-9][0-9]{5}$'),
  add column approx_city text check (length(approx_city) <= 100),
  add column approx_region text check (length(approx_region) <= 100),
  -- A two-letter country code, e.g. IN
  add column approx_country text check (approx_country ~ '^[A-Z]{2}$');

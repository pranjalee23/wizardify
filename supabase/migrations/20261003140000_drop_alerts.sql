-- The latest drop alert each member was sent (e.g. 'drop-1') and when, so nobody is sent the same
-- drop's alert twice. Which drop is current is set in lib/drops.ts.
alter table public.reservations
  add column drop_alert text check (length(drop_alert) <= 40),
  add column drop_alert_at timestamptz;

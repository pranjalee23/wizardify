-- Photo reminders: members who haven't added photos get up to two reminder emails (see
-- lib/server/daily.ts). These record how many went out, and when.
alter table public.reservations
  add column photo_reminders smallint not null default 0 check (photo_reminders between 0 and 2),
  add column photo_reminded_at timestamptz;

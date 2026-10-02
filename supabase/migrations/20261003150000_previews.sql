-- Portrait previews. The team uploads a preview video for a member (/admin/members/N); the member
-- watches it (/reserve/preview) and approves it or asks for changes. While previews are made by hand,
-- members get up to two rounds of changes, so up to three previews each.
create table public.previews (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  round smallint not null check (round between 1 and 3),
  video_path text not null check (length(video_path) <= 200),
  status text not null default 'sent' check (status in ('sent', 'approved', 'changes')),
  feedback text check (length(feedback) <= 1000),
  sent_by text,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (reservation_id, round)
);
alter table public.previews enable row level security;

-- The latest preview's status on the member's row, for the admin's filters, plus when they approved
-- and when their photos were deleted (7 days after approval)
alter table public.reservations
  add column preview_status text check (preview_status in ('sent', 'approved', 'changes')),
  add column approved_at timestamptz,
  add column photos_deleted_at timestamptz;

-- Preview videos: private, opened only through links the server signs. 50 MB is the most a single
-- upload can be on Supabase's free plan.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('previews', 'previews', false, 52428800, array['video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do nothing;

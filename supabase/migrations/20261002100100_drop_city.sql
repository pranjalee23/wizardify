-- The city question is gone (see the previous migration); applied with the deploy that stops asking it
alter table public.reservations drop column city;

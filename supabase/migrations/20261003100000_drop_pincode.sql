-- The reservation form no longer asks for a shipping pin code (the address comes at checkout); applied
-- with the deploy that removes the field
alter table public.reservations drop column pincode;

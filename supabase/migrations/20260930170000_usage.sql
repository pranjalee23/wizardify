-- How much space the project uses, for the daily health check (app/api/cron/health), which warns
-- as usage nears the free plan's limits. Only the server's service key can call it.
create function public.usage()
returns table (database_bytes bigint, storage_bytes bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select
    pg_database_size(current_database()),
    coalesce((select sum((metadata ->> 'size')::bigint) from storage.objects), 0)::bigint;
$$;

revoke execute on function public.usage() from public, anon, authenticated;
grant execute on function public.usage() to service_role;

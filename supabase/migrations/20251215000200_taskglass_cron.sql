-- TaskGlass Cron job (daily routine)
-- Enable Supabase Cron (pg_cron) in Dashboard: Integrations -> Cron

begin;

do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise exception 'pg_cron is not enabled. Enable it in Supabase Dashboard -> Integrations -> Cron.';
  end if;
end $$;

-- Runs 13:00 UTC ~= 07:00 America/Mexico_City (Mexico City is UTC-6).
select cron.schedule(
  'taskglass-daily-ops',
  '0 13 * * *',
  $$ select tg_run_daily('OPS'); $$
);

commit;

-- Enable Supabase Realtime on Tier 1 tables (AGENTS.md §17)
-- Required for postgres_changes subscriptions to work

ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.drivers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.routes;

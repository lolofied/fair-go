-- Grant Data API roles access to sync tables.
-- Required when "Automatically expose new tables" is disabled at project creation.
-- RLS policies still restrict rows to auth.uid().

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_blobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.files TO authenticated;

-- Prelogin RPC is service_role only; no anon/authenticated grant needed.

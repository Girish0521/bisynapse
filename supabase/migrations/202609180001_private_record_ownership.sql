BEGIN;
ALTER TABLE public.query_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_records ENABLE ROW LEVEL SECURITY;
-- Private records require authenticated ownership. Existing anonymous/demo
-- identifiers are intentionally inaccessible through these policies.
REVOKE ALL ON public.query_history, public.scan_records FROM anon, authenticated;
GRANT SELECT, INSERT ON public.query_history, public.scan_records TO authenticated;
DROP POLICY IF EXISTS "Users can read own query history" ON public.query_history;
DROP POLICY IF EXISTS "Users can insert query history" ON public.query_history;
DROP POLICY IF EXISTS "Users can read scan records" ON public.scan_records;
DROP POLICY IF EXISTS "Users can insert scan records" ON public.scan_records;
CREATE POLICY "Users can read own query history" ON public.query_history
  FOR SELECT TO authenticated USING ((SELECT auth.uid())::text = user_id);
CREATE POLICY "Users can insert query history" ON public.query_history
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid())::text = user_id);
CREATE POLICY "Users can read scan records" ON public.scan_records
  FOR SELECT TO authenticated USING ((SELECT auth.uid())::text = user_id);
CREATE POLICY "Users can insert scan records" ON public.scan_records
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid())::text = user_id);
DROP POLICY IF EXISTS private_owner_guard ON public.query_history;
CREATE POLICY private_owner_guard ON public.query_history AS RESTRICTIVE
  FOR ALL TO authenticated USING ((SELECT auth.uid())::text = user_id)
  WITH CHECK ((SELECT auth.uid())::text = user_id);
DROP POLICY IF EXISTS private_owner_guard ON public.scan_records;
CREATE POLICY private_owner_guard ON public.scan_records AS RESTRICTIVE
  FOR ALL TO authenticated USING ((SELECT auth.uid())::text = user_id)
  WITH CHECK ((SELECT auth.uid())::text = user_id);
COMMIT;

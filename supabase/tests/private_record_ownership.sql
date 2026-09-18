-- Run only against a disposable database after the ownership migration.
-- All test rows are rolled back. Requires a role that can SET ROLE.
BEGIN;
INSERT INTO public.query_history(user_id, query, response) VALUES
 ('10000000-0000-0000-0000-000000000001','__ownership_test__','one'),
 ('10000000-0000-0000-0000-000000000002','__ownership_test__','two');
INSERT INTO public.scan_records(user_id,scan_type,scanned_value) VALUES
 ('10000000-0000-0000-0000-000000000001','test','__ownership_test__'),
 ('10000000-0000-0000-0000-000000000002','test','__ownership_test__');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.query_history WHERE query='__ownership_test__') <> 1 THEN RAISE EXCEPTION 'History isolation failed'; END IF;
 IF (SELECT count(*) FROM public.scan_records WHERE scanned_value='__ownership_test__') <> 1 THEN RAISE EXCEPTION 'Scan isolation failed'; END IF;
 BEGIN
  INSERT INTO public.query_history(user_id,query,response) VALUES ('10000000-0000-0000-0000-000000000002','__spoof_test__','spoof');
  RAISE EXCEPTION 'History ownership spoof accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  INSERT INTO public.scan_records(user_id,scan_type) VALUES ('10000000-0000-0000-0000-000000000002','spoof');
  RAISE EXCEPTION 'Scan ownership spoof accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 INSERT INTO public.query_history(user_id,query,response) VALUES ('10000000-0000-0000-0000-000000000001','__self_test__','allowed');
END $$;
SELECT set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
DO $$ BEGIN
 IF (SELECT count(*) FROM public.query_history WHERE query='__ownership_test__') <> 1 THEN RAISE EXCEPTION 'Second account history isolation failed'; END IF;
 IF EXISTS(SELECT 1 FROM public.query_history WHERE query='__self_test__') THEN RAISE EXCEPTION 'Second account accessed first account write'; END IF;
END $$;
SET LOCAL ROLE anon;
DO $$ BEGIN
 BEGIN PERFORM 1 FROM public.query_history; RAISE EXCEPTION 'Anonymous history access accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM 1 FROM public.scan_records; RAISE EXCEPTION 'Anonymous scans access accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
ROLLBACK;

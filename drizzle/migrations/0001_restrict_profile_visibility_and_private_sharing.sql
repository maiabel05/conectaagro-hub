DROP POLICY "View own or sharing profiles" ON public.profiles;
CREATE POLICY "View own profile only" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
DROP POLICY "Owner or viewer sees share" ON public.plot_shares;
CREATE POLICY "Owner sees their grants" ON public.plot_shares FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE TABLE public.share_attempts (owner_id uuid NOT NULL, attempted_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.share_attempts TO service_role;
ALTER TABLE public.share_attempts ENABLE ROW LEVEL SECURITY;
CREATE INDEX share_attempts_owner_time ON public.share_attempts(owner_id, attempted_at);
CREATE OR REPLACE FUNCTION public.share_plots_with(_email text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _viewer uuid; _clean text := lower(trim(_email)); _owner uuid := auth.uid();
BEGIN
  IF _owner IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(_owner::text, 0));
  IF (SELECT count(*) FROM public.share_attempts WHERE owner_id = _owner AND attempted_at > now() - interval '1 hour') >= 20 THEN RAISE EXCEPTION 'try later'; END IF;
  INSERT INTO public.share_attempts(owner_id) VALUES (_owner);
  IF _clean IS NULL OR char_length(_clean) > 255 THEN RETURN true; END IF;
  SELECT id INTO _viewer FROM auth.users WHERE lower(email) = _clean AND email_confirmed_at IS NOT NULL;
  IF _viewer IS NULL OR _viewer = _owner THEN RETURN true; END IF;
  INSERT INTO public.plot_shares (owner_id, viewer_id, viewer_email)
  VALUES (_owner, _viewer, _clean) ON CONFLICT (owner_id, viewer_id) DO NOTHING;
  RETURN true;
END $$;
REVOKE EXECUTE ON FUNCTION public.share_plots_with(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.share_plots_with(text) TO authenticated;
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '' CHECK (char_length(full_name) <= 120),
  farm_name text NOT NULL DEFAULT '' CHECK (char_length(farm_name) <= 120),
  city text NOT NULL DEFAULT '' CHECK (char_length(city) <= 120),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.plot_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  viewer_id uuid NOT NULL,
  viewer_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, viewer_id),
  CHECK (owner_id <> viewer_id)
);
GRANT SELECT, DELETE ON public.plot_shares TO authenticated;
GRANT ALL ON public.plot_shares TO service_role;
ALTER TABLE public.plot_shares ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.plots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  code text NOT NULL CHECK (char_length(code) <= 20),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  crop text NOT NULL CHECK (char_length(crop) <= 60),
  stage text NOT NULL DEFAULT '' CHECK (char_length(stage) <= 80),
  area numeric NOT NULL CHECK (area > 0 AND area < 1000000),
  kc numeric NOT NULL DEFAULT 1,
  ndvi numeric NOT NULL DEFAULT 0.7,
  health text NOT NULL DEFAULT 'ótimo' CHECK (health IN ('ótimo','atenção','crítico')),
  moisture numeric NOT NULL DEFAULT 28,
  lat double precision,
  lng double precision,
  boundary jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plots TO authenticated;
GRANT ALL ON public.plots TO service_role;
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_view_owner(_owner uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _owner = auth.uid() OR EXISTS (
    SELECT 1 FROM public.plot_shares WHERE owner_id = _owner AND viewer_id = auth.uid()
  )
$$;
REVOKE EXECUTE ON FUNCTION public.can_view_owner(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_view_owner(uuid) TO authenticated;

-- profiles: own or those who shared with me
CREATE POLICY "View own or sharing profiles" ON public.profiles FOR SELECT TO authenticated USING (public.can_view_owner(id));
CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- plots: owner full control, shared viewers read-only
CREATE POLICY "View own or shared plots" ON public.plots FOR SELECT TO authenticated USING (public.can_view_owner(owner_id));
CREATE POLICY "Insert own plots" ON public.plots FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Update own plots" ON public.plots FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Delete own plots" ON public.plots FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- shares: owner sees own grants (with email they typed); viewer sees row without needing email
CREATE POLICY "Owner or viewer sees share" ON public.plot_shares FOR SELECT TO authenticated USING (owner_id = auth.uid() OR viewer_id = auth.uid());
CREATE POLICY "Owner or viewer removes share" ON public.plot_shares FOR DELETE TO authenticated USING (owner_id = auth.uid() OR viewer_id = auth.uid());

-- Grant access by email; returns only true/false, never user data
CREATE OR REPLACE FUNCTION public.share_plots_with(_email text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _viewer uuid; _clean text := lower(trim(_email));
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF char_length(_clean) > 255 THEN RETURN false; END IF;
  SELECT id INTO _viewer FROM auth.users WHERE lower(email) = _clean AND email_confirmed_at IS NOT NULL;
  IF _viewer IS NULL OR _viewer = auth.uid() THEN RETURN false; END IF;
  INSERT INTO public.plot_shares (owner_id, viewer_id, viewer_email)
  VALUES (auth.uid(), _viewer, _clean) ON CONFLICT (owner_id, viewer_id) DO NOTHING;
  RETURN true;
END $$;
REVOKE EXECUTE ON FUNCTION public.share_plots_with(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.share_plots_with(text) TO authenticated;

-- Viewers must not read the owner's typed email for others: expose a safe view via function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, farm_name, city)
  VALUES (NEW.id,
    left(coalesce(NEW.raw_user_meta_data->>'full_name',''),120),
    left(coalesce(NEW.raw_user_meta_data->>'farm_name',''),120),
    left(coalesce(NEW.raw_user_meta_data->>'city',''),120));
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
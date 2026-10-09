ALTER TABLE public.profiles
 ADD COLUMN phone text NOT NULL DEFAULT '',
 ADD COLUMN address text NOT NULL DEFAULT '',
 ADD COLUMN state text NOT NULL DEFAULT '',
 ADD COLUMN postal_code text NOT NULL DEFAULT '',
 ADD COLUMN main_crops text NOT NULL DEFAULT '',
 ADD COLUMN producer_type text NOT NULL DEFAULT 'individual';

CREATE OR REPLACE FUNCTION public.validate_producer_profile()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 NEW.full_name := trim(NEW.full_name); NEW.farm_name := trim(NEW.farm_name); NEW.city := trim(NEW.city);
 NEW.phone := trim(NEW.phone); NEW.address := trim(NEW.address); NEW.state := upper(trim(NEW.state));
 NEW.postal_code := trim(NEW.postal_code); NEW.main_crops := trim(NEW.main_crops);
 IF char_length(NEW.full_name) > 120 OR char_length(NEW.farm_name) > 120 OR char_length(NEW.city) > 120
 OR char_length(NEW.phone) > 25 OR char_length(NEW.address) > 240 OR char_length(NEW.main_crops) > 240
 OR NEW.phone !~ '^[0-9+() .-]*$' OR NEW.state !~ '^([A-Z]{2})?$'
 OR NEW.postal_code !~ '^([0-9]{5}-?[0-9]{3})?$'
 OR NEW.producer_type NOT IN ('individual','family','business','cooperative') THEN
 RAISE EXCEPTION 'Invalid producer profile' USING ERRCODE = '22023';
 END IF;
 NEW.updated_at := now();
 RETURN NEW;
END $$;
CREATE TRIGGER validate_producer_profile BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.validate_producer_profile();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.profiles (id, full_name, farm_name, city, phone, address, state, postal_code, main_crops, producer_type)
 VALUES (NEW.id,
 coalesce(NEW.raw_user_meta_data->>'full_name',''), coalesce(NEW.raw_user_meta_data->>'farm_name',''),
 coalesce(NEW.raw_user_meta_data->>'city',''), coalesce(NEW.raw_user_meta_data->>'phone',''),
 coalesce(NEW.raw_user_meta_data->>'address',''), coalesce(NEW.raw_user_meta_data->>'state',''),
 coalesce(NEW.raw_user_meta_data->>'postal_code',''), coalesce(NEW.raw_user_meta_data->>'main_crops',''),
 coalesce(NEW.raw_user_meta_data->>'producer_type','individual'));
 RETURN NEW;
END $$;
REVOKE ALL ON public.profiles FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
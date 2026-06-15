-- Prelogin RPC: returns KDF salt + params for an email before auth.
-- Callable only by service_role (edge function). Does not expose wrapped DEKs.

CREATE OR REPLACE FUNCTION public.get_prelogin_kdf(target_email TEXT)
RETURNS TABLE (kdf_salt_b64 TEXT, kdf_params JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    IF target_email IS NULL OR length(trim(target_email)) = 0 THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        encode(p.kdf_salt, 'base64') AS kdf_salt_b64,
        p.kdf_params
    FROM public.profiles AS p
    INNER JOIN auth.users AS u ON u.id = p.user_id
    WHERE lower(u.email) = lower(trim(target_email))
    LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.get_prelogin_kdf(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_prelogin_kdf(TEXT) TO service_role;

COMMENT ON FUNCTION public.get_prelogin_kdf IS 'Edge-function-only lookup for login KDF material. Intentionally reveals account existence for a given email.';

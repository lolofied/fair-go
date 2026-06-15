-- Recovery prelogin RPC: returns recovery-wrapped DEK for passphrase reset flow.
-- Callable only by service_role (edge function). Does not expose passphrase-wrapped DEK.

CREATE OR REPLACE FUNCTION public.get_recovery_wrapped_dek(target_email TEXT)
RETURNS TABLE (wrapped_dek_recovery_b64 TEXT, wrapped_dek_recovery_nonce_b64 TEXT)
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
        encode(p.wrapped_dek_recovery, 'base64') AS wrapped_dek_recovery_b64,
        encode(p.wrapped_dek_recovery_nonce, 'base64') AS wrapped_dek_recovery_nonce_b64
    FROM public.profiles AS p
    INNER JOIN auth.users AS u ON u.id = p.user_id
    WHERE lower(u.email) = lower(trim(target_email))
    LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.get_recovery_wrapped_dek(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_recovery_wrapped_dek(TEXT) TO service_role;

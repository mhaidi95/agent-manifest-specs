REVOKE EXECUTE ON FUNCTION public.lookup_active_token(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.lookup_active_token(TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.lookup_active_token(TEXT) FROM authenticated;
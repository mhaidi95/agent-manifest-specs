-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own roles (so the UI knows whether to show admin pages)
CREATE POLICY "users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Security-definer role check (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Admin metrics function (only admins get data)
CREATE OR REPLACE FUNCTION public.get_admin_metrics()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'new_users_7d', (SELECT COUNT(*) FROM auth.users WHERE created_at > now() - interval '7 days'),
    'new_users_30d', (SELECT COUNT(*) FROM auth.users WHERE created_at > now() - interval '30 days'),
    'active_users_7d', (SELECT COUNT(DISTINCT user_id) FROM public.audit_logs WHERE created_at > now() - interval '7 days'),
    'total_apps', (SELECT COUNT(*) FROM public.connected_apps),
    'total_actions', (SELECT COUNT(*) FROM public.agent_actions),
    'active_tokens', (SELECT COUNT(*) FROM public.agent_tokens WHERE revoked_at IS NULL),
    'total_invokes', (SELECT COUNT(*) FROM public.audit_logs),
    'invokes_7d', (SELECT COUNT(*) FROM public.audit_logs WHERE created_at > now() - interval '7 days'),
    'invokes_24h', (SELECT COUNT(*) FROM public.audit_logs WHERE created_at > now() - interval '24 hours'),
    'invokes_success', (SELECT COUNT(*) FROM public.audit_logs WHERE status = 'success'),
    'invokes_denied', (SELECT COUNT(*) FROM public.audit_logs WHERE status IN ('denied','scope_denied','forbidden')),
    'approvals_pending', (SELECT COUNT(*) FROM public.pending_approvals WHERE status = 'pending'),
    'approvals_approved', (SELECT COUNT(*) FROM public.pending_approvals WHERE status = 'approved'),
    'approvals_denied', (SELECT COUNT(*) FROM public.pending_approvals WHERE status = 'denied'),
    'top_actions', (
      SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
      FROM (
        SELECT action_name, COUNT(*) AS count
        FROM public.audit_logs
        WHERE created_at > now() - interval '30 days'
        GROUP BY action_name
        ORDER BY count DESC
        LIMIT 5
      ) t
    ),
    'invokes_by_day', (
      SELECT COALESCE(jsonb_agg(row_to_json(d) ORDER BY d.day), '[]'::jsonb)
      FROM (
        SELECT date_trunc('day', created_at)::date AS day, COUNT(*) AS count
        FROM public.audit_logs
        WHERE created_at > now() - interval '14 days'
        GROUP BY 1
        ORDER BY 1
      ) d
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- 5. Grant the only existing user (you) the admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;
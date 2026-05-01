
-- Connected apps
CREATE TABLE public.connected_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  description TEXT,
  manifest JSONB,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.connected_apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own apps select" ON public.connected_apps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own apps insert" ON public.connected_apps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own apps update" ON public.connected_apps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own apps delete" ON public.connected_apps FOR DELETE USING (auth.uid() = user_id);

-- Agent actions
CREATE TABLE public.agent_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  app_id UUID NOT NULL REFERENCES public.connected_apps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  method TEXT NOT NULL DEFAULT 'GET',
  endpoint TEXT,
  parameters JSONB DEFAULT '[]'::jsonb,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  risk_level TEXT NOT NULL DEFAULT 'low',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own actions select" ON public.agent_actions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own actions insert" ON public.agent_actions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own actions update" ON public.agent_actions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own actions delete" ON public.agent_actions FOR DELETE USING (auth.uid() = user_id);

-- Permissions
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  app_id UUID NOT NULL REFERENCES public.connected_apps(id) ON DELETE CASCADE,
  action_id UUID REFERENCES public.agent_actions(id) ON DELETE CASCADE,
  scope TEXT NOT NULL,
  allowed_agents TEXT[] DEFAULT '{}',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own perms select" ON public.permissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own perms insert" ON public.permissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own perms update" ON public.permissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own perms delete" ON public.permissions FOR DELETE USING (auth.uid() = user_id);

-- Approval rules
CREATE TABLE public.approval_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  app_id UUID NOT NULL REFERENCES public.connected_apps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  condition TEXT NOT NULL,
  threshold NUMERIC,
  notify_email TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.approval_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rules select" ON public.approval_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own rules insert" ON public.approval_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own rules update" ON public.approval_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own rules delete" ON public.approval_rules FOR DELETE USING (auth.uid() = user_id);

-- Audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  app_id UUID REFERENCES public.connected_apps(id) ON DELETE CASCADE,
  action_name TEXT NOT NULL,
  agent_identity TEXT,
  status TEXT NOT NULL DEFAULT 'success',
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own logs select" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own logs insert" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own logs delete" ON public.audit_logs FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_apps_user ON public.connected_apps(user_id);
CREATE INDEX idx_actions_app ON public.agent_actions(app_id);
CREATE INDEX idx_logs_app ON public.audit_logs(app_id);

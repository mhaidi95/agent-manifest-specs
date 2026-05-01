-- Agent API tokens (per-agent identity)
CREATE TABLE public.agent_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  app_id UUID NOT NULL,
  label TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  token_prefix TEXT NOT NULL,
  agent_identity TEXT NOT NULL,
  allowed_scopes TEXT[] NOT NULL DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_tokens_hash ON public.agent_tokens(token_hash) WHERE revoked_at IS NULL;
CREATE INDEX idx_agent_tokens_user ON public.agent_tokens(user_id);

ALTER TABLE public.agent_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own tokens select" ON public.agent_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own tokens insert" ON public.agent_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own tokens update" ON public.agent_tokens FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own tokens delete" ON public.agent_tokens FOR DELETE USING (auth.uid() = user_id);

-- Pending approvals queue
CREATE TABLE public.pending_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  app_id UUID NOT NULL,
  token_id UUID,
  action_name TEXT NOT NULL,
  agent_identity TEXT,
  payload JSONB,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  decided_by UUID,
  decided_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pending_approvals_user_status ON public.pending_approvals(user_id, status);

ALTER TABLE public.pending_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own approvals select" ON public.pending_approvals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own approvals insert" ON public.pending_approvals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own approvals update" ON public.pending_approvals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own approvals delete" ON public.pending_approvals FOR DELETE USING (auth.uid() = user_id);

-- Helper: lookup an active token by its hash (used by edge function with service role)
CREATE OR REPLACE FUNCTION public.lookup_active_token(_hash TEXT)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  app_id UUID,
  agent_identity TEXT,
  allowed_scopes TEXT[],
  label TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, user_id, app_id, agent_identity, allowed_scopes, label
  FROM public.agent_tokens
  WHERE token_hash = _hash
    AND revoked_at IS NULL
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1
$$;
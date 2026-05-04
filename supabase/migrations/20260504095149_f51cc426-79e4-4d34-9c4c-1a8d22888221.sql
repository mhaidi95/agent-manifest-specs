
ALTER TABLE public.connected_apps
  ADD COLUMN IF NOT EXISTS slack_channel_id text,
  ADD COLUMN IF NOT EXISTS slack_channel_name text,
  ADD COLUMN IF NOT EXISTS slack_team_id text;

ALTER TABLE public.pending_approvals
  ADD COLUMN IF NOT EXISTS slack_message_ts text,
  ADD COLUMN IF NOT EXISTS slack_channel_id text,
  ADD COLUMN IF NOT EXISTS decided_by_slack text;

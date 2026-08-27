ALTER TABLE public.fund_performance_history
  ADD COLUMN IF NOT EXISTS identity_status text;

CREATE INDEX IF NOT EXISTS fund_performance_history_identity_status_idx
  ON public.fund_performance_history (identity_status, report_date DESC);

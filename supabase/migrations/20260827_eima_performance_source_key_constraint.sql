DROP INDEX IF EXISTS public.fund_performance_history_source_row_key_uq;

ALTER TABLE public.fund_performance_history
  ADD CONSTRAINT fund_performance_history_source_row_key_uq
  UNIQUE (source_row_key);

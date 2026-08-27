-- EIMA historical reporting layer. This migration is additive only.
-- It does not modify fund_prices, validated NAVs, or collector sources.

CREATE TABLE IF NOT EXISTS public.eima_reports (
  report_date date PRIMARY KEY,
  report_label text NOT NULL,
  report_url text NOT NULL UNIQUE,
  source_id text NOT NULL REFERENCES public.sources(source_id),
  report_status text,
  reference_period date,
  report_note_count integer,
  has_report_notes boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fund_performance_history
  ADD COLUMN IF NOT EXISTS source_row_key text,
  ADD COLUMN IF NOT EXISTS report_status text,
  ADD COLUMN IF NOT EXISTS source_page text,
  ADD COLUMN IF NOT EXISTS source_file text,
  ADD COLUMN IF NOT EXISTS reference_period date,
  ADD COLUMN IF NOT EXISTS initial_value numeric,
  ADD COLUMN IF NOT EXISTS currency text,
  ADD COLUMN IF NOT EXISTS currency_resolution text;

CREATE UNIQUE INDEX IF NOT EXISTS fund_performance_history_source_row_key_uq
  ON public.fund_performance_history (source_row_key)
  WHERE source_row_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS fund_performance_history_fund_report_date_idx
  ON public.fund_performance_history (fund_id, report_date DESC);

CREATE INDEX IF NOT EXISTS fund_performance_history_report_date_idx
  ON public.fund_performance_history (report_date);

CREATE TABLE IF NOT EXISTS public.eima_report_indicators (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  report_date date NOT NULL REFERENCES public.eima_reports(report_date),
  indicator_key text NOT NULL,
  value numeric NOT NULL,
  unit text NOT NULL,
  reference_period date,
  source_file text,
  source_row_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT eima_report_indicators_report_metric_uq UNIQUE (report_date, indicator_key)
);

CREATE INDEX IF NOT EXISTS eima_report_indicators_key_date_idx
  ON public.eima_report_indicators (indicator_key, report_date DESC);

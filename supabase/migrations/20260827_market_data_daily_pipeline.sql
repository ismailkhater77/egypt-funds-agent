-- Daily market data pipeline. Additive only: it does not modify funds, fund_prices,
-- benchmark_price_history, or the separate EIMA historical-reporting layer.

CREATE TABLE IF NOT EXISTS public.market_indicators (
  indicator_key text PRIMARY KEY,
  display_name text NOT NULL UNIQUE,
  asset_class text NOT NULL CHECK (asset_class IN ('forex', 'crypto', 'commodity', 'equity_index')),
  base_asset text NOT NULL,
  quote_currency text,
  unit text NOT NULL,
  canonical_definition text NOT NULL,
  primary_source_id text REFERENCES public.sources(source_id),
  provider_symbol text,
  source_documentation_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT market_indicators_required_keys CHECK (
    indicator_key IN ('USD_EGP', 'BTC_USD', 'XAU_USD', 'XAG_USD', 'SPX', 'MSCI_EM', 'EGX30')
  )
);

CREATE TABLE IF NOT EXISTS public.market_observations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  indicator_key text NOT NULL REFERENCES public.market_indicators(indicator_key),
  source_id text NOT NULL REFERENCES public.sources(source_id),
  source_symbol text NOT NULL,
  market_date date NOT NULL,
  value numeric(28,10) NOT NULL CHECK (value > 0),
  unit text NOT NULL,
  source_observed_at timestamptz,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  source_url text NOT NULL,
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  observation_status text NOT NULL DEFAULT 'validated' CHECK (observation_status IN ('validated', 'review', 'error')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT market_observations_source_day_uq UNIQUE (indicator_key, source_id, source_symbol, market_date)
);

CREATE INDEX IF NOT EXISTS market_observations_indicator_date_idx
  ON public.market_observations (indicator_key, market_date DESC);

CREATE INDEX IF NOT EXISTS market_observations_source_date_idx
  ON public.market_observations (source_id, market_date DESC);

CREATE TABLE IF NOT EXISTS public.market_data_jobs (
  job_key text PRIMARY KEY,
  job_name text NOT NULL,
  schedule_cron_task_uid varchar(65) UNIQUE,
  cron_expression text,
  active boolean NOT NULL DEFAULT false,
  last_started_at timestamptz,
  last_finished_at timestamptz,
  last_status text CHECK (last_status IN ('success', 'partial', 'error')),
  last_run_summary jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT market_data_jobs_key_check CHECK (job_key = 'daily_market_data')
);

ALTER TABLE public.market_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data_jobs ENABLE ROW LEVEL SECURITY;

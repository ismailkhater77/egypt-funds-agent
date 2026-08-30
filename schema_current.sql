-- Current schema snapshot generated from Supabase catalog metadata.
-- Project ref: znuxaxhmvqijgpsbdteq
-- Generated: 2026-08-30
-- This is a current-state schema snapshot, not a replayable historical migration chain.

create extension if not exists pgcrypto;

create table if not exists public.benchmark_fetch_requests (
  id bigint not null,
  request_id bigint not null,
  benchmark_key text not null,
  requested_at timestamptz default now() not null,
  processed boolean default false not null
);

create table if not exists public.benchmark_price_history (
  id bigint not null,
  benchmark_key text not null,
  price_date date not null,
  value numeric not null,
  unit text not null,
  source text not null,
  fetched_at timestamptz default now() not null
);

create table if not exists public.eima_report_indicators (
  id bigint not null,
  report_date date not null,
  indicator_key text not null,
  value numeric not null,
  unit text not null,
  reference_period date,
  source_file text,
  source_row_key text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.eima_reports (
  report_date date not null,
  report_label text not null,
  report_url text not null,
  source_id text not null,
  report_status text,
  reference_period date,
  report_note_count integer,
  has_report_notes boolean,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.fund_performance_history (
  id bigint not null,
  fund_id text,
  eima_fund_name_raw text not null,
  report_date date not null,
  horizon text not null,
  category text,
  management_company_raw text,
  nav_value numeric,
  return_pct numeric,
  fund_rank integer,
  source text default 'EIMA_official_report'::text not null,
  inserted_at timestamptz default now() not null,
  source_row_key text,
  report_status text,
  source_page text,
  source_file text,
  reference_period date,
  initial_value numeric,
  currency text,
  currency_resolution text,
  identity_status text
);

create table if not exists public.fund_prices (
  id uuid default gen_random_uuid() not null,
  fund_id text not null,
  nav numeric not null,
  currency text default 'EGP'::text not null,
  valuation_date date,
  collected_at timestamptz default now() not null,
  source_id text,
  parser_name text,
  status text default 'validated'::text not null,
  raw_name text,
  raw_payload jsonb,
  error_message text
);

create table if not exists public.funds (
  fund_id text not null,
  canonical_name text not null,
  eima_name_raw text,
  management_company_raw text,
  category text,
  confidence text,
  price_update_url text,
  fund_info_url text,
  source_id text,
  notes text,
  active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.latest_fund_prices (
  id uuid,
  fund_id text,
  nav numeric,
  currency text,
  valuation_date date,
  collected_at timestamptz,
  source_id text,
  parser_name text,
  status text,
  raw_name text,
  raw_payload jsonb,
  error_message text
);

create table if not exists public.market_data_jobs (
  job_key text not null,
  job_name text not null,
  schedule_cron_task_uid character varying,
  cron_expression text,
  active boolean default false not null,
  last_started_at timestamptz,
  last_finished_at timestamptz,
  last_status text,
  last_run_summary jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.market_indicators (
  indicator_key text not null,
  display_name text not null,
  asset_class text not null,
  base_asset text not null,
  quote_currency text,
  unit text not null,
  canonical_definition text not null,
  primary_source_id text,
  provider_symbol text,
  source_documentation_url text,
  active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.market_observations (
  id bigint not null,
  indicator_key text not null,
  source_id text not null,
  source_symbol text not null,
  market_date date not null,
  value numeric not null,
  unit text not null,
  source_observed_at timestamptz,
  fetched_at timestamptz default now() not null,
  source_url text not null,
  raw_payload jsonb default '{}'::jsonb not null,
  observation_status text default 'validated'::text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.platform_alert_rules (
  id uuid default gen_random_uuid() not null,
  owner_open_id text not null,
  fund_id text not null,
  metric_key text not null,
  operator text not null,
  threshold numeric not null,
  cadence text default 'weekly'::text not null,
  active boolean default false not null,
  last_evaluated_at timestamptz,
  last_triggered_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.platform_decision_journal (
  id uuid default gen_random_uuid() not null,
  owner_open_id text not null,
  fund_id text,
  title text not null,
  thesis text,
  risks text,
  decision_status text default 'researching'::text not null,
  evidence_snapshot jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.platform_user_funds (
  id uuid default gen_random_uuid() not null,
  owner_open_id text not null,
  fund_id text not null,
  list_type text not null,
  note text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.smartscore_benchmark_results (
  id bigint not null,
  evaluation_id uuid not null,
  benchmark_key text not null,
  benchmark_role text not null,
  input_status text not null,
  aligned_start_date date,
  aligned_end_date date,
  return_pct numeric,
  outperformance_pct numeric,
  downside_protection_pct numeric,
  consistency_pct numeric,
  contribution_score numeric,
  status text not null,
  calculation_inputs jsonb default '{}'::jsonb not null,
  created_at timestamptz default now() not null
);

create table if not exists public.smartscore_evaluations (
  evaluation_id uuid default gen_random_uuid() not null,
  fund_id text not null,
  report_date date not null,
  category text,
  methodology_version text not null,
  smartscore numeric,
  performance_score numeric,
  risk_score numeric,
  benchmark_score numeric,
  consistency_score numeric,
  inflation_score numeric,
  effective_weights jsonb not null,
  component_availability jsonb not null,
  evidence_coverage jsonb not null,
  evidence_score numeric not null,
  data_confidence text not null,
  data_tier text not null,
  track_record text not null,
  peer_cohort_size integer,
  fallback_used boolean default false not null,
  natural_benchmark text,
  raw_rank integer,
  qualified_rank integer,
  qualification_status text not null,
  input_status jsonb not null,
  warnings jsonb default '[]'::jsonb not null,
  calculation_inputs jsonb not null,
  calculated_at timestamptz default now() not null
);

create table if not exists public.smartscore_methodology_versions (
  methodology_version text not null,
  display_name text not null,
  weights jsonb not null,
  rules jsonb not null,
  documentation_path text not null,
  active boolean default true not null,
  created_at timestamptz default now() not null
);

create table if not exists public.smartscore_metric_evidence (
  id bigint not null,
  evaluation_id uuid not null,
  metric_key text not null,
  metric_value numeric,
  unit text,
  input_status text not null,
  aligned_start_date date,
  aligned_end_date date,
  source_count integer default 0 not null,
  source_summary jsonb default '[]'::jsonb not null,
  created_at timestamptz default now() not null
);

create table if not exists public.sources (
  source_id text not null,
  source_name text not null,
  source_url text not null,
  source_kind text default 'management_company_page'::text not null,
  active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table if not exists public.v_fund_egx30_alpha_latest (
  eima_fund_name_raw text,
  category text,
  horizon text,
  nominal_pct numeric,
  egx30_pct numeric,
  alpha_pct numeric
);

create table if not exists public.v_fund_real_returns_latest (
  eima_fund_name_raw text,
  category text,
  management_company_raw text,
  horizon text,
  report_date date,
  nominal_pct numeric,
  inflation_pct numeric,
  real_pct numeric,
  beat_inflation boolean
);

create table if not exists public.v_macro_wide (
  report_date date,
  cpi_headline_pct numeric,
  cpi_core_pct numeric,
  egx30_close numeric,
  fx_sell numeric,
  tbill_yield_avg numeric,
  deposit_rate_6m_1y numeric
);

-- Constraints, indexes, and view definitions observed in public.

alter table if exists public.benchmark_fetch_requests add constraint benchmark_fetch_requests_pkey PRIMARY KEY (id);

alter table if exists public.benchmark_price_history add constraint benchmark_price_history_benchmark_key_check CHECK ((benchmark_key = ANY (ARRAY['EGX30'::text, 'GOLD_EGP'::text, 'SILVER_EGP'::text, 'BTC_EGP'::text, 'SP500_EGP'::text, 'MSCI_EM_EGP'::text, 'USD_EGP'::text, 'TBILL_YIELD_12M'::text, 'INFLATION_INDEX'::text])));

alter table if exists public.benchmark_price_history add constraint benchmark_price_history_benchmark_key_price_date_key UNIQUE (benchmark_key, price_date);

alter table if exists public.benchmark_price_history add constraint benchmark_price_history_pkey PRIMARY KEY (id);

alter table if exists public.eima_report_indicators add constraint eima_report_indicators_pkey PRIMARY KEY (id);

alter table if exists public.eima_report_indicators add constraint eima_report_indicators_report_date_fkey FOREIGN KEY (report_date) REFERENCES eima_reports(report_date);

alter table if exists public.eima_report_indicators add constraint eima_report_indicators_report_metric_uq UNIQUE (report_date, indicator_key);

alter table if exists public.eima_report_indicators add constraint eima_report_indicators_source_row_key_key UNIQUE (source_row_key);

alter table if exists public.eima_reports add constraint eima_reports_pkey PRIMARY KEY (report_date);

alter table if exists public.eima_reports add constraint eima_reports_report_url_key UNIQUE (report_url);

alter table if exists public.eima_reports add constraint eima_reports_source_id_fkey FOREIGN KEY (source_id) REFERENCES sources(source_id);

alter table if exists public.fund_performance_history add constraint fund_performance_history_eima_fund_name_raw_report_date_hor_key UNIQUE (eima_fund_name_raw, report_date, horizon);

alter table if exists public.fund_performance_history add constraint fund_performance_history_eima_report_date_fkey FOREIGN KEY (report_date) REFERENCES eima_reports(report_date);

alter table if exists public.fund_performance_history add constraint fund_performance_history_fund_id_fkey FOREIGN KEY (fund_id) REFERENCES funds(fund_id);

alter table if exists public.fund_performance_history add constraint fund_performance_history_pkey PRIMARY KEY (id);

alter table if exists public.fund_performance_history add constraint fund_performance_history_source_row_key_uq UNIQUE (source_row_key);

alter table if exists public.fund_prices add constraint fund_prices_fund_id_fkey FOREIGN KEY (fund_id) REFERENCES funds(fund_id) ON DELETE CASCADE;

alter table if exists public.fund_prices add constraint fund_prices_nav_check CHECK ((nav >= (0)::numeric));

alter table if exists public.fund_prices add constraint fund_prices_pkey PRIMARY KEY (id);

alter table if exists public.fund_prices add constraint fund_prices_source_id_fkey FOREIGN KEY (source_id) REFERENCES sources(source_id);

alter table if exists public.fund_prices add constraint fund_prices_status_check CHECK ((status = ANY (ARRAY['validated'::text, 'stale'::text, 'not_found'::text, 'error'::text, 'review'::text])));

alter table if exists public.funds add constraint funds_pkey PRIMARY KEY (fund_id);

alter table if exists public.funds add constraint funds_source_id_fkey FOREIGN KEY (source_id) REFERENCES sources(source_id);

alter table if exists public.market_data_jobs add constraint market_data_jobs_key_check CHECK ((job_key = 'daily_market_data'::text));

alter table if exists public.market_data_jobs add constraint market_data_jobs_last_status_check CHECK ((last_status = ANY (ARRAY['success'::text, 'partial'::text, 'error'::text])));

alter table if exists public.market_data_jobs add constraint market_data_jobs_pkey PRIMARY KEY (job_key);

alter table if exists public.market_data_jobs add constraint market_data_jobs_schedule_cron_task_uid_key UNIQUE (schedule_cron_task_uid);

alter table if exists public.market_indicators add constraint market_indicators_asset_class_check CHECK ((asset_class = ANY (ARRAY['forex'::text, 'crypto'::text, 'commodity'::text, 'equity_index'::text])));

alter table if exists public.market_indicators add constraint market_indicators_display_name_key UNIQUE (display_name);

alter table if exists public.market_indicators add constraint market_indicators_pkey PRIMARY KEY (indicator_key);

alter table if exists public.market_indicators add constraint market_indicators_primary_source_id_fkey FOREIGN KEY (primary_source_id) REFERENCES sources(source_id);

alter table if exists public.market_indicators add constraint market_indicators_required_keys CHECK ((indicator_key = ANY (ARRAY['USD_EGP'::text, 'BTC_USD'::text, 'XAU_USD'::text, 'XAG_USD'::text, 'SPX'::text, 'MSCI_EM'::text, 'EGX30'::text])));

alter table if exists public.market_observations add constraint market_observations_indicator_key_fkey FOREIGN KEY (indicator_key) REFERENCES market_indicators(indicator_key);

alter table if exists public.market_observations add constraint market_observations_observation_status_check CHECK ((observation_status = ANY (ARRAY['validated'::text, 'review'::text, 'error'::text])));

alter table if exists public.market_observations add constraint market_observations_pkey PRIMARY KEY (id);

alter table if exists public.market_observations add constraint market_observations_source_day_uq UNIQUE (indicator_key, source_id, source_symbol, market_date);

alter table if exists public.market_observations add constraint market_observations_source_id_fkey FOREIGN KEY (source_id) REFERENCES sources(source_id);

alter table if exists public.market_observations add constraint market_observations_value_check CHECK ((value > (0)::numeric));

alter table if exists public.platform_alert_rules add constraint platform_alert_rules_cadence_check CHECK ((cadence = ANY (ARRAY['daily'::text, 'weekly'::text])));

alter table if exists public.platform_alert_rules add constraint platform_alert_rules_fund_id_fkey FOREIGN KEY (fund_id) REFERENCES funds(fund_id) ON DELETE CASCADE;

alter table if exists public.platform_alert_rules add constraint platform_alert_rules_metric_key_check CHECK ((metric_key = ANY (ARRAY['smartscore'::text, 'evidence'::text, 'performance'::text, 'risk'::text, 'benchmark'::text, 'consistency'::text])));

alter table if exists public.platform_alert_rules add constraint platform_alert_rules_operator_check CHECK ((operator = ANY (ARRAY['gte'::text, 'lte'::text, 'change_gte'::text, 'change_lte'::text])));

alter table if exists public.platform_alert_rules add constraint platform_alert_rules_owner_open_id_fund_id_metric_key_opera_key UNIQUE (owner_open_id, fund_id, metric_key, operator, threshold);

alter table if exists public.platform_alert_rules add constraint platform_alert_rules_pkey PRIMARY KEY (id);

alter table if exists public.platform_decision_journal add constraint platform_decision_journal_decision_status_check CHECK ((decision_status = ANY (ARRAY['researching'::text, 'shortlisted'::text, 'watching'::text, 'rejected'::text, 'archived'::text])));

alter table if exists public.platform_decision_journal add constraint platform_decision_journal_fund_id_fkey FOREIGN KEY (fund_id) REFERENCES funds(fund_id) ON DELETE SET NULL;

alter table if exists public.platform_decision_journal add constraint platform_decision_journal_pkey PRIMARY KEY (id);

alter table if exists public.platform_decision_journal add constraint platform_decision_journal_risks_check CHECK (((risks IS NULL) OR (char_length(risks) <= 4000)));

alter table if exists public.platform_decision_journal add constraint platform_decision_journal_thesis_check CHECK (((thesis IS NULL) OR (char_length(thesis) <= 4000)));

alter table if exists public.platform_decision_journal add constraint platform_decision_journal_title_check CHECK (((char_length(title) >= 1) AND (char_length(title) <= 180)));

alter table if exists public.platform_user_funds add constraint platform_user_funds_fund_id_fkey FOREIGN KEY (fund_id) REFERENCES funds(fund_id) ON DELETE CASCADE;

alter table if exists public.platform_user_funds add constraint platform_user_funds_list_type_check CHECK ((list_type = ANY (ARRAY['shortlist'::text, 'watchlist'::text, 'portfolio_candidate'::text])));

alter table if exists public.platform_user_funds add constraint platform_user_funds_note_check CHECK (((note IS NULL) OR (char_length(note) <= 1000)));

alter table if exists public.platform_user_funds add constraint platform_user_funds_owner_open_id_fund_id_list_type_key UNIQUE (owner_open_id, fund_id, list_type);

alter table if exists public.platform_user_funds add constraint platform_user_funds_pkey PRIMARY KEY (id);

alter table if exists public.smartscore_benchmark_results add constraint smartscore_benchmark_results_evaluation_id_fkey FOREIGN KEY (evaluation_id) REFERENCES smartscore_evaluations(evaluation_id);

alter table if exists public.smartscore_benchmark_results add constraint smartscore_benchmark_results_input_status CHECK ((input_status = ANY (ARRAY['verified'::text, 'assumed'::text, 'unverified'::text, 'null'::text])));

alter table if exists public.smartscore_benchmark_results add constraint smartscore_benchmark_results_pkey PRIMARY KEY (id);

alter table if exists public.smartscore_benchmark_results add constraint smartscore_benchmark_results_role CHECK ((benchmark_role = ANY (ARRAY['natural'::text, 'opportunity'::text])));

alter table if exists public.smartscore_benchmark_results add constraint smartscore_benchmark_results_status CHECK ((status = ANY (ARRAY['calculated'::text, 'unavailable'::text, 'unaligned'::text])));

alter table if exists public.smartscore_benchmark_results add constraint smartscore_benchmark_results_unique UNIQUE (evaluation_id, benchmark_key);

alter table if exists public.smartscore_evaluations add constraint smartscore_evaluations_components_range CHECK ((((performance_score IS NULL) OR ((performance_score >= (0)::numeric) AND (performance_score <= (100)::numeric))) AND ((risk_score IS NULL) OR ((risk_score >= (0)::numeric) AND (risk_score <= (100)::numeric))) AND ((benchmark_score IS NULL) OR ((benchmark_score >= (0)::numeric) AND (benchmark_score <= (100)::numeric))) AND ((consistency_score IS NULL) OR ((consistency_score >= (0)::numeric) AND (consistency_score <= (100)::numeric))) AND ((inflation_score IS NULL) OR ((inflation_score >= (0)::numeric) AND (inflation_score <= (100)::numeric)))));

alter table if exists public.smartscore_evaluations add constraint smartscore_evaluations_confidence CHECK ((data_confidence = ANY (ARRAY['High'::text, 'Moderate'::text, 'Limited'::text, 'Insufficient'::text])));

alter table if exists public.smartscore_evaluations add constraint smartscore_evaluations_evidence_range CHECK (((evidence_score >= (0)::numeric) AND (evidence_score <= (100)::numeric)));

alter table if exists public.smartscore_evaluations add constraint smartscore_evaluations_fund_id_fkey FOREIGN KEY (fund_id) REFERENCES funds(fund_id);

alter table if exists public.smartscore_evaluations add constraint smartscore_evaluations_methodology_version_fkey FOREIGN KEY (methodology_version) REFERENCES smartscore_methodology_versions(methodology_version);

alter table if exists public.smartscore_evaluations add constraint smartscore_evaluations_pkey PRIMARY KEY (evaluation_id);

alter table if exists public.smartscore_evaluations add constraint smartscore_evaluations_qualification CHECK ((qualification_status = ANY (ARRAY['qualified'::text, 'not_yet_qualified'::text, 'not_ranked'::text])));

alter table if exists public.smartscore_evaluations add constraint smartscore_evaluations_report_date_fkey FOREIGN KEY (report_date) REFERENCES eima_reports(report_date);

alter table if exists public.smartscore_evaluations add constraint smartscore_evaluations_score_range CHECK (((smartscore IS NULL) OR ((smartscore >= (0)::numeric) AND (smartscore <= (100)::numeric))));

alter table if exists public.smartscore_evaluations add constraint smartscore_evaluations_tier CHECK ((data_tier = ANY (ARRAY['Verified'::text, 'Mixed'::text, 'Limited'::text, 'Unverified'::text])));

alter table if exists public.smartscore_evaluations add constraint smartscore_evaluations_track_record CHECK ((track_record = ANY (ARRAY['Emerging'::text, 'Developing'::text, 'Established'::text])));

alter table if exists public.smartscore_evaluations add constraint smartscore_evaluations_unique_run UNIQUE (fund_id, report_date, methodology_version);

alter table if exists public.smartscore_methodology_versions add constraint smartscore_methodology_versions_pkey PRIMARY KEY (methodology_version);

alter table if exists public.smartscore_methodology_versions add constraint smartscore_methodology_weights_object CHECK ((jsonb_typeof(weights) = 'object'::text));

alter table if exists public.smartscore_metric_evidence add constraint smartscore_metric_evidence_evaluation_id_fkey FOREIGN KEY (evaluation_id) REFERENCES smartscore_evaluations(evaluation_id);

alter table if exists public.smartscore_metric_evidence add constraint smartscore_metric_evidence_input_status CHECK ((input_status = ANY (ARRAY['verified'::text, 'assumed'::text, 'unverified'::text, 'null'::text])));

alter table if exists public.smartscore_metric_evidence add constraint smartscore_metric_evidence_pkey PRIMARY KEY (id);

alter table if exists public.smartscore_metric_evidence add constraint smartscore_metric_evidence_unique UNIQUE (evaluation_id, metric_key);

alter table if exists public.sources add constraint sources_pkey PRIMARY KEY (source_id);

alter table if exists public.sources add constraint sources_source_url_key UNIQUE (source_url);

CREATE UNIQUE INDEX benchmark_fetch_requests_pkey ON public.benchmark_fetch_requests USING btree (id);

CREATE UNIQUE INDEX benchmark_price_history_benchmark_key_price_date_key ON public.benchmark_price_history USING btree (benchmark_key, price_date);

CREATE UNIQUE INDEX benchmark_price_history_pkey ON public.benchmark_price_history USING btree (id);

CREATE INDEX idx_benchmark_history_key_date ON public.benchmark_price_history USING btree (benchmark_key, price_date DESC);

CREATE INDEX eima_report_indicators_key_date_idx ON public.eima_report_indicators USING btree (indicator_key, report_date DESC);

CREATE UNIQUE INDEX eima_report_indicators_pkey ON public.eima_report_indicators USING btree (id);

CREATE UNIQUE INDEX eima_report_indicators_report_metric_uq ON public.eima_report_indicators USING btree (report_date, indicator_key);

CREATE UNIQUE INDEX eima_report_indicators_source_row_key_key ON public.eima_report_indicators USING btree (source_row_key);

CREATE UNIQUE INDEX eima_reports_pkey ON public.eima_reports USING btree (report_date);

CREATE UNIQUE INDEX eima_reports_report_url_key ON public.eima_reports USING btree (report_url);

CREATE UNIQUE INDEX fund_performance_history_eima_fund_name_raw_report_date_hor_key ON public.fund_performance_history USING btree (eima_fund_name_raw, report_date, horizon);

CREATE INDEX fund_performance_history_fund_report_date_idx ON public.fund_performance_history USING btree (fund_id, report_date DESC);

CREATE INDEX fund_performance_history_identity_status_idx ON public.fund_performance_history USING btree (identity_status, report_date DESC);

CREATE UNIQUE INDEX fund_performance_history_pkey ON public.fund_performance_history USING btree (id);

CREATE INDEX fund_performance_history_report_date_idx ON public.fund_performance_history USING btree (report_date);

CREATE UNIQUE INDEX fund_performance_history_source_row_key_uq ON public.fund_performance_history USING btree (source_row_key);

CREATE INDEX idx_perf_history_date ON public.fund_performance_history USING btree (report_date);

CREATE INDEX idx_perf_history_fund ON public.fund_performance_history USING btree (fund_id);

CREATE INDEX idx_perf_history_name ON public.fund_performance_history USING btree (eima_fund_name_raw);

CREATE INDEX fund_prices_collected_idx ON public.fund_prices USING btree (collected_at DESC);

CREATE INDEX fund_prices_fund_date_idx ON public.fund_prices USING btree (fund_id, valuation_date DESC);

CREATE UNIQUE INDEX fund_prices_pkey ON public.fund_prices USING btree (id);

CREATE UNIQUE INDEX fund_prices_unique_snapshot ON public.fund_prices USING btree (fund_id, valuation_date, source_id);

CREATE UNIQUE INDEX funds_pkey ON public.funds USING btree (fund_id);

CREATE UNIQUE INDEX market_data_jobs_pkey ON public.market_data_jobs USING btree (job_key);

CREATE UNIQUE INDEX market_data_jobs_schedule_cron_task_uid_key ON public.market_data_jobs USING btree (schedule_cron_task_uid);

CREATE UNIQUE INDEX market_indicators_display_name_key ON public.market_indicators USING btree (display_name);

CREATE UNIQUE INDEX market_indicators_pkey ON public.market_indicators USING btree (indicator_key);

CREATE INDEX market_observations_indicator_date_idx ON public.market_observations USING btree (indicator_key, market_date DESC);

CREATE UNIQUE INDEX market_observations_pkey ON public.market_observations USING btree (id);

CREATE INDEX market_observations_source_date_idx ON public.market_observations USING btree (source_id, market_date DESC);

CREATE UNIQUE INDEX market_observations_source_day_uq ON public.market_observations USING btree (indicator_key, source_id, source_symbol, market_date);

CREATE INDEX platform_alert_rules_owner_idx ON public.platform_alert_rules USING btree (owner_open_id, active, updated_at DESC);

CREATE UNIQUE INDEX platform_alert_rules_owner_open_id_fund_id_metric_key_opera_key ON public.platform_alert_rules USING btree (owner_open_id, fund_id, metric_key, operator, threshold);

CREATE UNIQUE INDEX platform_alert_rules_pkey ON public.platform_alert_rules USING btree (id);

CREATE INDEX platform_decision_journal_owner_idx ON public.platform_decision_journal USING btree (owner_open_id, updated_at DESC);

CREATE UNIQUE INDEX platform_decision_journal_pkey ON public.platform_decision_journal USING btree (id);

CREATE INDEX platform_user_funds_owner_idx ON public.platform_user_funds USING btree (owner_open_id, list_type, updated_at DESC);

CREATE UNIQUE INDEX platform_user_funds_owner_open_id_fund_id_list_type_key ON public.platform_user_funds USING btree (owner_open_id, fund_id, list_type);

CREATE UNIQUE INDEX platform_user_funds_pkey ON public.platform_user_funds USING btree (id);

CREATE INDEX smartscore_benchmark_results_evaluation_idx ON public.smartscore_benchmark_results USING btree (evaluation_id, benchmark_role);

CREATE UNIQUE INDEX smartscore_benchmark_results_pkey ON public.smartscore_benchmark_results USING btree (id);

CREATE UNIQUE INDEX smartscore_benchmark_results_unique ON public.smartscore_benchmark_results USING btree (evaluation_id, benchmark_key);

CREATE INDEX smartscore_evaluations_fund_report_idx ON public.smartscore_evaluations USING btree (fund_id, report_date DESC);

CREATE UNIQUE INDEX smartscore_evaluations_pkey ON public.smartscore_evaluations USING btree (evaluation_id);

CREATE INDEX smartscore_evaluations_report_category_score_idx ON public.smartscore_evaluations USING btree (report_date DESC, category, smartscore DESC NULLS LAST);

CREATE UNIQUE INDEX smartscore_evaluations_unique_run ON public.smartscore_evaluations USING btree (fund_id, report_date, methodology_version);

CREATE UNIQUE INDEX smartscore_methodology_versions_pkey ON public.smartscore_methodology_versions USING btree (methodology_version);

CREATE INDEX smartscore_metric_evidence_evaluation_idx ON public.smartscore_metric_evidence USING btree (evaluation_id);

CREATE UNIQUE INDEX smartscore_metric_evidence_pkey ON public.smartscore_metric_evidence USING btree (id);

CREATE UNIQUE INDEX smartscore_metric_evidence_unique ON public.smartscore_metric_evidence USING btree (evaluation_id, metric_key);

CREATE UNIQUE INDEX sources_pkey ON public.sources USING btree (source_id);

CREATE UNIQUE INDEX sources_source_url_key ON public.sources USING btree (source_url);

create or replace view public.latest_fund_prices as
 SELECT DISTINCT ON (fund_id) id,
    fund_id,
    nav,
    currency,
    valuation_date,
    collected_at,
    source_id,
    parser_name,
    status,
    raw_name,
    raw_payload,
    error_message
   FROM fund_prices
  ORDER BY fund_id, valuation_date DESC NULLS LAST, collected_at DESC;

create or replace view public.v_fund_egx30_alpha_latest as
 SELECT eima_fund_name_raw,
    category,
    horizon,
    return_pct AS nominal_pct,
    egx30_return_between((date_trunc('year'::text, (report_date)::timestamp with time zone))::date, report_date) AS egx30_pct,
    (return_pct - egx30_return_between((date_trunc('year'::text, (report_date)::timestamp with time zone))::date, report_date)) AS alpha_pct
   FROM fund_performance_history fph
  WHERE ((report_date = ( SELECT max(fund_performance_history.report_date) AS max
           FROM fund_performance_history)) AND (horizon = 'ytd'::text) AND (category ~~* '%Equity%'::text));

create or replace view public.v_fund_real_returns_latest as
 SELECT fph.eima_fund_name_raw,
    fph.category,
    fph.management_company_raw,
    fph.horizon,
    fph.report_date,
    fph.return_pct AS nominal_pct,
    rr.inflation_pct,
    rr.real_pct,
        CASE
            WHEN (rr.real_pct IS NOT NULL) THEN (rr.real_pct > (0)::numeric)
            ELSE NULL::boolean
        END AS beat_inflation
   FROM (fund_performance_history fph
     CROSS JOIN LATERAL fund_real_return(fph.eima_fund_name_raw, fph.horizon, fph.report_date) rr(nominal_pct, inflation_pct, real_pct, period_start))
  WHERE ((fph.report_date = ( SELECT max(fund_performance_history.report_date) AS max
           FROM fund_performance_history)) AND (fph.horizon = 'ytd'::text));

create or replace view public.v_macro_wide as
 SELECT report_date,
    max(value) FILTER (WHERE (indicator_key = 'CPI_HEADLINE_MONTHLY_CHANGE'::text)) AS cpi_headline_pct,
    max(value) FILTER (WHERE (indicator_key = 'CPI_CORE_MONTHLY_CHANGE'::text)) AS cpi_core_pct,
    max(value) FILTER (WHERE (indicator_key = 'EGX30_CLOSE'::text)) AS egx30_close,
    max(value) FILTER (WHERE (indicator_key = 'FX_SELL_EGP_PER_UNIT'::text)) AS fx_sell,
    max(value) FILTER (WHERE (indicator_key = 'TBILL_YIELD_AVG'::text)) AS tbill_yield_avg,
    max(value) FILTER (WHERE (indicator_key = 'DEPOSIT_RATE_6M_1Y'::text)) AS deposit_rate_6m_1y
   FROM eima_report_indicators
  GROUP BY report_date
  ORDER BY report_date;


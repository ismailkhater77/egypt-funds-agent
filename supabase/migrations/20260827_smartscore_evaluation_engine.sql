-- SmartScore evaluation layer: additive and versioned.
-- This migration does not modify NAV snapshots, EIMA reports, or market observations.

CREATE TABLE IF NOT EXISTS public.smartscore_methodology_versions (
  methodology_version text PRIMARY KEY,
  display_name text NOT NULL,
  weights jsonb NOT NULL,
  rules jsonb NOT NULL,
  documentation_path text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT smartscore_methodology_weights_object CHECK (jsonb_typeof(weights) = 'object')
);

CREATE TABLE IF NOT EXISTS public.smartscore_evaluations (
  evaluation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id text NOT NULL REFERENCES public.funds(fund_id),
  report_date date NOT NULL REFERENCES public.eima_reports(report_date),
  category text,
  methodology_version text NOT NULL REFERENCES public.smartscore_methodology_versions(methodology_version),
  smartscore numeric,
  performance_score numeric,
  risk_score numeric,
  benchmark_score numeric,
  consistency_score numeric,
  inflation_score numeric,
  effective_weights jsonb NOT NULL,
  component_availability jsonb NOT NULL,
  evidence_coverage jsonb NOT NULL,
  evidence_score numeric NOT NULL,
  data_confidence text NOT NULL,
  data_tier text NOT NULL,
  track_record text NOT NULL,
  peer_cohort_size integer,
  fallback_used boolean NOT NULL DEFAULT false,
  natural_benchmark text,
  raw_rank integer,
  qualified_rank integer,
  qualification_status text NOT NULL,
  input_status jsonb NOT NULL,
  warnings jsonb NOT NULL DEFAULT '[]'::jsonb,
  calculation_inputs jsonb NOT NULL,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT smartscore_evaluations_components_range CHECK (
    (performance_score IS NULL OR performance_score BETWEEN 0 AND 100) AND
    (risk_score IS NULL OR risk_score BETWEEN 0 AND 100) AND
    (benchmark_score IS NULL OR benchmark_score BETWEEN 0 AND 100) AND
    (consistency_score IS NULL OR consistency_score BETWEEN 0 AND 100) AND
    (inflation_score IS NULL OR inflation_score BETWEEN 0 AND 100)
  ),
  CONSTRAINT smartscore_evaluations_score_range CHECK (smartscore IS NULL OR smartscore BETWEEN 0 AND 100),
  CONSTRAINT smartscore_evaluations_evidence_range CHECK (evidence_score BETWEEN 0 AND 100),
  CONSTRAINT smartscore_evaluations_confidence CHECK (data_confidence IN ('High', 'Moderate', 'Limited', 'Insufficient')),
  CONSTRAINT smartscore_evaluations_tier CHECK (data_tier IN ('Verified', 'Mixed', 'Limited', 'Unverified')),
  CONSTRAINT smartscore_evaluations_track_record CHECK (track_record IN ('Emerging', 'Developing', 'Established')),
  CONSTRAINT smartscore_evaluations_qualification CHECK (qualification_status IN ('qualified', 'not_yet_qualified', 'not_ranked')),
  CONSTRAINT smartscore_evaluations_unique_run UNIQUE (fund_id, report_date, methodology_version)
);

CREATE INDEX IF NOT EXISTS smartscore_evaluations_report_category_score_idx
  ON public.smartscore_evaluations (report_date DESC, category, smartscore DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS smartscore_evaluations_fund_report_idx
  ON public.smartscore_evaluations (fund_id, report_date DESC);

CREATE TABLE IF NOT EXISTS public.smartscore_benchmark_results (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  evaluation_id uuid NOT NULL REFERENCES public.smartscore_evaluations(evaluation_id),
  benchmark_key text NOT NULL,
  benchmark_role text NOT NULL,
  input_status text NOT NULL,
  aligned_start_date date,
  aligned_end_date date,
  return_pct numeric,
  outperformance_pct numeric,
  downside_protection_pct numeric,
  consistency_pct numeric,
  contribution_score numeric,
  status text NOT NULL,
  calculation_inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT smartscore_benchmark_results_role CHECK (benchmark_role IN ('natural', 'opportunity')),
  CONSTRAINT smartscore_benchmark_results_input_status CHECK (input_status IN ('verified', 'assumed', 'unverified', 'null')),
  CONSTRAINT smartscore_benchmark_results_status CHECK (status IN ('calculated', 'unavailable', 'unaligned')),
  CONSTRAINT smartscore_benchmark_results_unique UNIQUE (evaluation_id, benchmark_key)
);

CREATE INDEX IF NOT EXISTS smartscore_benchmark_results_evaluation_idx
  ON public.smartscore_benchmark_results (evaluation_id, benchmark_role);

CREATE TABLE IF NOT EXISTS public.smartscore_metric_evidence (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  evaluation_id uuid NOT NULL REFERENCES public.smartscore_evaluations(evaluation_id),
  metric_key text NOT NULL,
  metric_value numeric,
  unit text,
  input_status text NOT NULL,
  aligned_start_date date,
  aligned_end_date date,
  source_count integer NOT NULL DEFAULT 0,
  source_summary jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT smartscore_metric_evidence_input_status CHECK (input_status IN ('verified', 'assumed', 'unverified', 'null')),
  CONSTRAINT smartscore_metric_evidence_unique UNIQUE (evaluation_id, metric_key)
);

CREATE INDEX IF NOT EXISTS smartscore_metric_evidence_evaluation_idx
  ON public.smartscore_metric_evidence (evaluation_id);

ALTER TABLE public.smartscore_methodology_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smartscore_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smartscore_benchmark_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smartscore_metric_evidence ENABLE ROW LEVEL SECURITY;

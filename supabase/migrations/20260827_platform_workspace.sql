create table if not exists public.platform_user_funds (
  id uuid primary key default gen_random_uuid(),
  owner_open_id text not null,
  fund_id text not null references public.funds(fund_id) on delete cascade,
  list_type text not null check (list_type in ('shortlist','watchlist','portfolio_candidate')),
  note text null check (note is null or char_length(note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_open_id, fund_id, list_type)
);

create index if not exists platform_user_funds_owner_idx on public.platform_user_funds(owner_open_id, list_type, updated_at desc);
alter table public.platform_user_funds enable row level security;

create table if not exists public.platform_decision_journal (
  id uuid primary key default gen_random_uuid(),
  owner_open_id text not null,
  fund_id text null references public.funds(fund_id) on delete set null,
  title text not null check (char_length(title) between 1 and 180),
  thesis text null check (thesis is null or char_length(thesis) <= 4000),
  risks text null check (risks is null or char_length(risks) <= 4000),
  decision_status text not null default 'researching' check (decision_status in ('researching','shortlisted','watching','rejected','archived')),
  evidence_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_decision_journal_owner_idx on public.platform_decision_journal(owner_open_id, updated_at desc);
alter table public.platform_decision_journal enable row level security;

create table if not exists public.platform_alert_rules (
  id uuid primary key default gen_random_uuid(),
  owner_open_id text not null,
  fund_id text not null references public.funds(fund_id) on delete cascade,
  metric_key text not null check (metric_key in ('smartscore','evidence','performance','risk','benchmark','consistency')),
  operator text not null check (operator in ('gte','lte','change_gte','change_lte')),
  threshold numeric not null,
  cadence text not null default 'weekly' check (cadence in ('daily','weekly')),
  active boolean not null default false,
  last_evaluated_at timestamptz null,
  last_triggered_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_open_id, fund_id, metric_key, operator, threshold)
);

create index if not exists platform_alert_rules_owner_idx on public.platform_alert_rules(owner_open_id, active, updated_at desc);
alter table public.platform_alert_rules enable row level security;

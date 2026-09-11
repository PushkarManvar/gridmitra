create schema if not exists gridmitra;

create table if not exists gridmitra.scenarios (
    id uuid primary key,
    name text not null,
    description text not null default '',
    input_payload jsonb not null,
    created_at timestamptz not null default now()
);

create table if not exists gridmitra.optimization_runs (
    id uuid primary key,
    scenario_id uuid references gridmitra.scenarios(id) on delete set null,
    status text not null check (status in ('optimal', 'feasible', 'failed')),
    solver_name text not null,
    input_payload jsonb not null,
    result_payload jsonb,
    created_at timestamptz not null default now()
);

comment on schema gridmitra is
    'Private application schema. Do not expose through the Supabase Data API without explicit grants and RLS.';

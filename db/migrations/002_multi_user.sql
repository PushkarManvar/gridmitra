-- Phase B: multi-user auth and ownership (Decisions 011-014).
-- Never edit 001_initial_schema.sql; this migration layers on top.

create table if not exists gridmitra.users (
    id uuid primary key,
    email text not null unique,
    password_hash text not null,
    display_name text not null,
    role text not null default 'operator'
        check (role in ('admin', 'operator', 'viewer')),
    created_at timestamptz not null default now()
);

create table if not exists gridmitra.sessions (
    id uuid primary key,
    user_id uuid not null references gridmitra.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    expires_at timestamptz not null
);

create index if not exists idx_sessions_user on gridmitra.sessions (user_id);
create index if not exists idx_sessions_expires on gridmitra.sessions (expires_at);

-- Seeded demo account (role operator) so the offline jury demo works with one
-- click. The password hash is replaced by a real Argon2 hash at app startup
-- (auth seed); the placeholder is never used for login.
insert into gridmitra.users (id, email, password_hash, display_name, role)
select gen_random_uuid(), 'demo@gridmitra.com', '$argon2id$placeholder-never-used', 'Demo Operator', 'operator'
where not exists (select 1 from gridmitra.users where email = 'demo@gridmitra.com');

-- Ownership columns, backfilled to the demo account so existing sites and
-- scenarios stay owned after the migration.
alter table gridmitra.sites add column if not exists owner_id uuid
    references gridmitra.users(id) on delete cascade;
alter table gridmitra.scenarios add column if not exists owner_id uuid
    references gridmitra.users(id) on delete cascade;

update gridmitra.sites
set owner_id = (select id from gridmitra.users where email = 'demo@gridmitra.com')
where owner_id is null;
update gridmitra.scenarios
set owner_id = (select id from gridmitra.users where email = 'demo@gridmitra.com')
where owner_id is null;

alter table gridmitra.sites alter column owner_id set not null;
alter table gridmitra.scenarios alter column owner_id set not null;

create index if not exists idx_sites_owner on gridmitra.sites (owner_id);
create index if not exists idx_scenarios_owner on gridmitra.scenarios (owner_id);

-- Saved scenario drafts per owner. Optimizer results are never stored here;
-- runs carry their own immutable snapshots (Decision 013).
create table if not exists gridmitra.scenario_versions (
    id uuid primary key,
    owner_id uuid not null references gridmitra.users(id) on delete cascade,
    name text not null,
    scenario_type text not null
        check (scenario_type in ('normal', 'cloudy', 'demand_spike', 'high_diesel_price', 'battery_degradation', 'combined_stress', 'custom')),
    version integer not null,
    payload jsonb not null,
    created_at timestamptz not null default now(),
    unique (owner_id, name, version)
);

create index if not exists idx_scenario_versions_owner
    on gridmitra.scenario_versions (owner_id, created_at desc);
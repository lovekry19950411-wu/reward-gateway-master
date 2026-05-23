create table if not exists gateway_members (
  id bigserial primary key,
  member_id text not null unique,
  email text,
  invite_code text,
  referral_code text,
  source_app text default 'default',
  points integer default 0,
  tickets integer default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists gateway_events (
  id bigserial primary key,
  member_id text,
  source_app text default 'default',
  event_type text not null,
  card text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists gateway_ledger (
  id bigserial primary key,
  member_id text,
  source_app text default 'default',
  points_delta integer default 0,
  tickets_delta integer default 0,
  reason text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists gateway_events_member_id_idx on gateway_events(member_id);
create index if not exists gateway_events_source_app_idx on gateway_events(source_app);
create index if not exists gateway_ledger_member_id_idx on gateway_ledger(member_id);

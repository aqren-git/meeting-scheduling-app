-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================
create type slot_status as enum (
  'available',
  'booked',
  'blocked',
  'cancelled'
);

create type job_type as enum (
  'general',
  'tile',
  'painting',
  'flooring',
  'plumbing',
  'electrical',
  'inspection'
);

-- ============================================================
-- CREWS
-- ============================================================
create table crews (
  id             uuid        primary key default gen_random_uuid(),
  name           text        not null,
  color          text        not null,
  display_order  int         not null default 0,
  is_active      boolean     not null default true,
  max_jobs_per_day int       not null default 1,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table crews is 'Deployable crew units. Soft-deleted via is_active.';

-- ============================================================
-- PROPERTIES
-- ============================================================
create table properties (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  address         text,
  city            text        not null default 'Irvine',
  state           text        not null default 'CA',
  contact_name    text,
  contact_email   text,
  is_active       boolean     not null default true,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- SLOTS
-- ============================================================
create table slots (
  id               uuid        primary key default gen_random_uuid(),
  crew_id          uuid        not null references crews(id) on delete restrict,
  date             date        not null,
  start_time       time        not null,
  end_time         time        not null,
  status           slot_status not null default 'available',
  job_type         job_type    not null default 'general',
  property_id      uuid        references properties(id) on delete set null,
  property_name    text,
  booked_by_name   text,
  booked_by_email  text,
  notes            text,
  cancelled_at     timestamptz,
  cancelled_reason text,
  created_by       uuid,
  booked_at        timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint chk_end_after_start check (
    end_time > start_time
  ),
  constraint chk_booked_has_contact check (
    status != 'booked' or (booked_by_name is not null and booked_by_email is not null)
  ),
  constraint chk_cancelled_has_timestamp check (
    status != 'cancelled' or cancelled_at is not null
  )
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_slots_date on slots(date);
create index idx_slots_status on slots(status);
create index idx_slots_crew_id on slots(crew_id);
create index idx_slots_date_status on slots(date, status);
create index idx_slots_crew_date on slots(crew_id, date);
create index idx_slots_crew_date_time on slots(crew_id, date, start_time);
create unique index idx_unique_crew_time_booked on slots(crew_id, date, start_time) where status = 'booked';
create index idx_slots_booked_by_email on slots(booked_by_email) where status = 'booked';

-- ============================================================
-- SETTINGS
-- ============================================================
create table settings (
  key        text primary key,
  value      text not null,
  description text,
  updated_at timestamptz not null default now()
);

insert into settings (key, value, description) values
  ('notification_email', 'monirhasnan@gmail.com', 'Email address that receives booking notifications'),
  ('company_name',       'Reliance Building Services', 'Displayed in email subjects and body'),
  ('calendar_title',     'Irvine Scheduling',           'Displayed as subtitle on the public calendar');

alter table settings enable row level security;
create policy "demo_allow_all_settings" on settings for all using (true) with check (true);

-- ============================================================
-- AUDIT LOG
-- ============================================================
create table slot_audit_log (
  id          bigserial   primary key,
  slot_id     uuid        not null,
  action      text        not null,
  old_status  slot_status,
  new_status  slot_status,
  changed_by  uuid,
  changed_at  timestamptz not null default now(),
  metadata    jsonb
);

create index idx_audit_slot_id on slot_audit_log(slot_id);
create index idx_audit_changed_at on slot_audit_log(changed_at desc);

-- ============================================================
-- RLS — DEMO MODE
-- ============================================================
alter table crews         enable row level security;
alter table properties    enable row level security;
alter table slots         enable row level security;
alter table slot_audit_log enable row level security;

create policy "demo_allow_all_crews"          on crews          for all using (true) with check (true);
create policy "demo_allow_all_properties"     on properties     for all using (true) with check (true);
create policy "demo_allow_all_slots"          on slots          for all using (true) with check (true);
create policy "demo_allow_read_audit"         on slot_audit_log for select using (true);

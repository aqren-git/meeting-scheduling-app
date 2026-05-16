# Reliance Scheduling Demo — Agent Specification

> **Project:** Real-time crew scheduling calendar for Reliance Building Services  
> **Demo Deadline:** Tuesday morning  
> **Stack:** React (Vite) + Supabase (Postgres + Realtime) + TailwindCSS  
> **Scope:** No auth. No login. Demo-ready, publicly shareable link.  
> **Goal:** Wow the Irvine Property Managers with a live, real-time scheduling calendar where they can pick dates on the fly — no emails, no back-and-forth.

---

## 1. What We Are Building

A web application with two views:

### Public Calendar View (`/`)
- Shows a monthly calendar grid
- Each day shows crew availability: **green = available**, **red = booked**, **gray = blocked/unavailable**
- Multiple crews can be available on the same day (multi-lane view per day)
- Clicking an available slot opens a booking modal
- After booking, the slot updates in real time across all open browsers simultaneously
- No login required — anyone with the link can view and book

### Admin Panel (`/admin`)
- Lets Reliance staff manage the calendar: add available slots, block dates, assign crews
- No auth for demo — just a separate route
- Can mark dates as blocked (holidays, crew off, etc.)
- Can see all bookings with property and contact info

---

## 2. Tech Stack & Rationale

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite | Fast dev, hot reload, modern |
| Styling | TailwindCSS v3 | Utility-first, rapid UI |
| Database | Supabase Postgres | Hosted, instant setup |
| Realtime | Supabase Realtime | Built-in websocket channel on table changes |
| State | Zustand | Lightweight, no boilerplate |
| Date handling | date-fns | Small, tree-shakeable |
| Icons | lucide-react | Clean, consistent |
| Notifications | react-hot-toast | Booking confirmations, errors |
| Routing | react-router-dom v6 | Simple two-route setup |

---

## 3. Folder Structure

```
reliance-scheduler/
├── public/
│   └── reliance-logo.svg
├── src/
│   ├── components/
│   │   ├── calendar/
│   │   │   ├── CalendarGrid.jsx         ← Monthly grid, renders day cells
│   │   │   ├── DayCell.jsx              ← Single day with crew slots inside
│   │   │   ├── SlotBadge.jsx            ← Green/red/gray pill per crew slot
│   │   │   ├── MonthNavigator.jsx       ← Prev/Next month controls
│   │   │   └── CrewLegend.jsx           ← Color key for crews
│   │   ├── booking/
│   │   │   ├── BookingModal.jsx         ← Confirm booking form
│   │   │   └── BookingSuccess.jsx       ← Post-booking confirmation screen
│   │   ├── admin/
│   │   │   ├── SlotManager.jsx          ← Add/edit/delete slots
│   │   │   ├── BookingsList.jsx         ← Table of all bookings
│   │   │   └── BlockDateForm.jsx        ← Block a date or range
│   │   └── ui/
│   │       ├── modal/
│   │       │   ├── Modal.jsx            ← Reusable modal wrapper (backdrop, close on esc)
│   │       │   └── index.js             ← re-export
│   │       ├── button/
│   │       │   ├── Button.jsx           ← Variants: primary, ghost, danger
│   │       │   └── index.js
│   │       ├── badge/
│   │       │   ├── Badge.jsx            ← Status badge: available / booked / blocked
│   │       │   └── index.js
│   │       ├── spinner/
│   │       │   ├── Spinner.jsx          ← Loading indicator (used inside buttons)
│   │       │   └── index.js
│   │       ├── input/
│   │       │   ├── Input.jsx            ← Text input with label + error state
│   │       │   ├── Textarea.jsx         ← Textarea with label + error state
│   │       │   └── index.js
│   │       ├── toast/
│   │       │   └── toastConfig.js       ← react-hot-toast style presets (success/error)
│   │       └── empty-state/
│   │           ├── EmptyState.jsx       ← No slots / no bookings empty UI
│   │           └── index.js
│   ├── hooks/
│   │   ├── useSlots.js                  ← Fetch slots + realtime subscription
│   │   ├── useBooking.js                ← Booking mutation with race protection
│   │   ├── useCrews.js                  ← Fetch crew list
│   │   └── useCalendarMonth.js          ← Month navigation state
│   ├── store/
│   │   └── calendarStore.js             ← Zustand store for selected date, modal state
│   ├── lib/
│   │   ├── supabase.js                  ← Supabase client init
│   │   └── dateUtils.js                 ← Helper fns: getDaysInMonth, formatDate, etc.
│   ├── pages/
│   │   ├── PublicCalendar.jsx           ← Main public-facing page
│   │   └── AdminPanel.jsx               ← Internal management page
│   ├── styles/
│   │   └── globals.css                  ← Tailwind directives + custom CSS vars
│   ├── constants/
│   │   └── slotStatus.js                ← Enum: AVAILABLE, BOOKED, BLOCKED, CANCELLED
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql       ← Core tables: crews, properties, slots, audit_log
│   │   └── 002_triggers.sql             ← updated_at trigger, audit log trigger
│   └── seed.sql                         ← Demo data: 3 crews, 35 weekday slots
├── .env.example
├── .env.local                           ← VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 4. Database Schema

> **Philosophy:** Schema is designed for the demo today but structured to support auth, multi-tenancy, time-based slots, cancellations, and audit logging without breaking changes. Additive migrations only — never destructive.

---

### Migration 001 — `001_initial_schema.sql`

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";   -- gen_random_uuid() fallback
create extension if not exists "pg_trgm";    -- future: fuzzy search on property/contact names


-- ============================================================
-- ENUMS
-- ============================================================

-- Slot lifecycle: available → booked | blocked | cancelled
-- 'cancelled' is separate from 'available' so history is preserved
create type slot_status as enum (
  'available',
  'booked',
  'blocked',
  'cancelled'
);

-- Job categories — used for crew specialization routing (future)
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
-- Represents a deployable team unit. Scalable to named members later.
-- ============================================================
create table crews (
  id             uuid        primary key default gen_random_uuid(),
  name           text        not null,
  color          text        not null,              -- hex: '#16a34a' — used in UI legend
  display_order  int         not null default 0,    -- controls calendar sort order
  is_active      boolean     not null default true, -- soft delete — don't hard-delete crews
  max_jobs_per_day int       not null default 1,    -- future: allow crew to take multiple jobs/day
  notes          text,                              -- internal notes (crew specialties, etc.)
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table crews is 'Deployable crew units. Soft-deleted via is_active.';
comment on column crews.max_jobs_per_day is 'Reserved for future multi-slot-per-day support.';


-- ============================================================
-- PROPERTIES
-- Irvine properties. Currently populated manually; future: synced from CRM.
-- ============================================================
create table properties (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  address         text,
  city            text        not null default 'Irvine',
  state           text        not null default 'CA',
  contact_name    text,                              -- default PM contact
  contact_email   text,
  is_active       boolean     not null default true,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table properties is 'Client properties. Linked to slots when booking is confirmed.';

-- For demo: slots.property_name is a free-text field so no FK is required yet.
-- When properties table is in active use, add: property_id uuid references properties(id)


-- ============================================================
-- SLOTS
-- Core scheduling unit. One slot = one crew on one date.
-- ============================================================
create table slots (
  id               uuid        primary key default gen_random_uuid(),
  crew_id          uuid        not null references crews(id) on delete restrict,
                               -- RESTRICT not CASCADE: don't silently delete slot history
  date             date        not null,
  start_time       time,                            -- null = full day (demo default)
  end_time         time,                            -- null = full day (demo default)
  status           slot_status not null default 'available',
  job_type         job_type    not null default 'general',

  -- Booking details (null until status = 'booked')
  property_id      uuid        references properties(id) on delete set null,
  property_name    text,                            -- free-text fallback for demo
  booked_by_name   text,
  booked_by_email  text,
  notes            text,

  -- Cancellation tracking
  cancelled_at     timestamptz,
  cancelled_reason text,

  -- Who created/modified (null for demo; populated when auth is added)
  created_by       uuid,                            -- future: references auth.users(id)
  booked_at        timestamptz,

  -- Timestamps
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- Constraints
  constraint chk_end_after_start check (
    end_time is null or start_time is null or end_time > start_time
  ),
  constraint chk_booked_has_contact check (
    status != 'booked' or (booked_by_name is not null and booked_by_email is not null)
  ),
  constraint chk_cancelled_has_timestamp check (
    status != 'cancelled' or cancelled_at is not null
  )
);

comment on table slots is 'Core scheduling unit. One slot = one crew on one date (optionally time-bounded).';
comment on column slots.start_time is 'Null means full-day. Populated when half-day scheduling is enabled.';
comment on column slots.property_id is 'FK to properties table. Null until properties are managed in-app.';
comment on column slots.created_by is 'Will reference auth.users(id) once auth is added.';


-- ============================================================
-- INDEXES
-- ============================================================

-- Primary query: fetch all slots in a date range (calendar month view)
create index idx_slots_date
  on slots(date);

-- Admin filters by status
create index idx_slots_status
  on slots(status);

-- Join from slots → crews (very common)
create index idx_slots_crew_id
  on slots(crew_id);

-- Composite: date range + status (most calendar queries use both)
create index idx_slots_date_status
  on slots(date, status);

-- Composite: crew + date (used for availability checks)
create index idx_slots_crew_date
  on slots(crew_id, date);

-- UNIQUE: prevent double-booking — one crew can only be 'booked' once per day
-- Partial index: only applies to booked slots, not available/blocked/cancelled
create unique index idx_unique_crew_booked_per_day
  on slots(crew_id, date)
  where status = 'booked';

-- If time-based slots are enabled, prevent time overlaps per crew
-- (Partial — only when both times are set)
create unique index idx_unique_crew_time_slot
  on slots(crew_id, date, start_time)
  where status = 'booked' and start_time is not null;

-- Future: lookup bookings by email (PM searching their own bookings)
create index idx_slots_booked_by_email
  on slots(booked_by_email)
  where status = 'booked';


-- ============================================================
-- SETTINGS
-- Key-value store for app-level config. Change values in Supabase
-- dashboard without touching code. Used by Edge Functions.
-- ============================================================
create table settings (
  key        text primary key,
  value      text not null,
  description text,
  updated_at timestamptz not null default now()
);

comment on table settings is 'App-level config. Edit values in Supabase dashboard to change behaviour without redeploying.';

-- Seed default settings
insert into settings (key, value, description) values
  ('notification_email', 'monirhasnan@gmail.com', 'Email address that receives booking notifications'),
  ('company_name',       'Reliance Building Services', 'Displayed in email subjects and body'),
  ('calendar_title',     'Irvine Scheduling',           'Displayed as subtitle on the public calendar');

alter table settings enable row level security;
create policy "demo_allow_all_settings" on settings for all using (true) with check (true);
create table slot_audit_log (
  id          bigserial   primary key,              -- bigserial: high-volume append, no UUID overhead
  slot_id     uuid        not null,                 -- no FK — log survives slot deletion
  action      text        not null,                 -- 'INSERT' | 'UPDATE' | 'DELETE'
  old_status  slot_status,
  new_status  slot_status,
  changed_by  uuid,                                 -- future: auth.users(id)
  changed_at  timestamptz not null default now(),
  metadata    jsonb                                 -- catch-all for extra context
);

comment on table slot_audit_log is 'Append-only audit trail for slot changes. Survives slot deletion.';
create index idx_audit_slot_id on slot_audit_log(slot_id);
create index idx_audit_changed_at on slot_audit_log(changed_at desc);


-- ============================================================
-- RLS — DEMO MODE (open access, no auth)
-- ============================================================
alter table crews         enable row level security;
alter table properties    enable row level security;
alter table slots         enable row level security;
alter table slot_audit_log enable row level security;

-- Demo: allow all operations via anon key
-- FUTURE: replace each policy with role-specific policies per table
create policy "demo_allow_all_crews"          on crews          for all using (true) with check (true);
create policy "demo_allow_all_properties"     on properties     for all using (true) with check (true);
create policy "demo_allow_all_slots"          on slots          for all using (true) with check (true);
create policy "demo_allow_read_audit"         on slot_audit_log for select using (true);
```

---

### Migration 002 — `002_triggers.sql`

```sql
-- ============================================================
-- updated_at TRIGGER
-- Automatically stamps updated_at on any row change.
-- Apply to every table that has an updated_at column.
-- ============================================================
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_crews_updated_at
  before update on crews
  for each row execute function set_updated_at();

create trigger trg_properties_updated_at
  before update on properties
  for each row execute function set_updated_at();

create trigger trg_slots_updated_at
  before update on slots
  for each row execute function set_updated_at();


-- ============================================================
-- AUDIT LOG TRIGGER
-- Fires after any INSERT, UPDATE, or DELETE on slots.
-- ============================================================
create or replace function log_slot_change()
returns trigger
language plpgsql
security definer                                    -- runs with elevated perms to always write audit
as $$
begin
  if (tg_op = 'INSERT') then
    insert into slot_audit_log(slot_id, action, old_status, new_status, metadata)
    values (new.id, 'INSERT', null, new.status, jsonb_build_object('crew_id', new.crew_id, 'date', new.date));

  elsif (tg_op = 'UPDATE') then
    insert into slot_audit_log(slot_id, action, old_status, new_status, metadata)
    values (new.id, 'UPDATE', old.status, new.status, jsonb_build_object(
      'crew_id', new.crew_id,
      'date', new.date,
      'booked_by_email', new.booked_by_email
    ));

  elsif (tg_op = 'DELETE') then
    insert into slot_audit_log(slot_id, action, old_status, new_status, metadata)
    values (old.id, 'DELETE', old.status, null, jsonb_build_object('crew_id', old.crew_id, 'date', old.date));
  end if;

  return coalesce(new, old);
end;
$$;

create trigger trg_slots_audit
  after insert or update or delete on slots
  for each row execute function log_slot_change();


-- ============================================================
-- AUTO-SET booked_at ON STATUS CHANGE TO 'booked'
-- ============================================================
create or replace function set_booked_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'booked' and old.status != 'booked' then
    new.booked_at = now();
  end if;
  if new.status = 'cancelled' and old.status != 'cancelled' then
    new.cancelled_at = now();
  end if;
  return new;
end;
$$;

create trigger trg_slots_booked_at
  before update on slots
  for each row execute function set_booked_at();
```

---

### Seed Data — `seed.sql`

```sql
-- ============================================================
-- DEMO SEED — run after migrations
-- ============================================================

-- 3 crews
insert into crews (name, color, display_order) values
  ('Team Alpha', '#16a34a', 1),   -- green-600
  ('Team Beta',  '#2563eb', 2),   -- blue-600
  ('Team Gamma', '#d97706', 3);   -- amber-600

-- Generate available slots for every weekday in the next 5 weeks
-- One slot per crew per weekday = 3 slots per day on the calendar
do $$
declare
  crew_record record;
  check_date  date := current_date;
  end_date    date := current_date + interval '35 days';
begin
  while check_date <= end_date loop
    -- Skip weekends (dow: 0=Sun, 6=Sat)
    if extract(dow from check_date) not in (0, 6) then
      for crew_record in select id from crews loop
        insert into slots (crew_id, date, status)
        values (crew_record.id, check_date, 'available')
        on conflict do nothing;
      end loop;
    end if;
    check_date := check_date + interval '1 day';
  end loop;
end;
$$;
```

---

## 5. Supabase Realtime Setup

In the Supabase dashboard:
1. Go to **Database → Replication**
2. Enable Realtime for the `slots` table
3. Check: INSERT, UPDATE, DELETE

In code, subscribe in `useSlots.js`:
```js
supabase
  .channel('slots-live')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'slots' }, handler)
  .subscribe()
```

---

## 6. Environment Variables

```env
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Never commit `.env.local`. Only commit `.env.example` with empty values.

---

## 7. Slot Status Logic

```js
// src/constants/slotStatus.js
export const SLOT_STATUS = {
  AVAILABLE:  'available',
  BOOKED:     'booked',
  BLOCKED:    'blocked',
  CANCELLED:  'cancelled',   // matches DB enum — treat as blocked in UI for demo
}

export const STATUS_STYLES = {
  available: {
    bg: 'bg-green-100 hover:bg-green-200 cursor-pointer',
    text: 'text-green-800',
    label: 'Available',
  },
  booked: {
    bg: 'bg-red-100 cursor-not-allowed',
    text: 'text-red-700',
    label: 'Booked',
  },
  blocked: {
    bg: 'bg-gray-100 cursor-not-allowed',
    text: 'text-gray-500',
    label: 'Unavailable',
  },
}
```

---

## 8. Race Condition Handling (Critical)

Two property managers could click the same slot at the same moment. Handle this at the DB level:

```js
// useBooking.js — atomic update with status guard
const { data, error, count } = await supabase
  .from('slots')
  .update({
    status: 'booked',
    booked_by_name: name,
    booked_by_email: email,
    property_name: property,
    booked_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  .eq('id', slotId)
  .eq('status', 'available')   // ← only updates if still available
  .select()

if (!data || data.length === 0) {
  // Slot was taken between click and submit
  toast.error('This slot was just taken. Please choose another date.')
  return { success: false }
}
```

The `count === 0` check is the safety net. The unique index is the database-level guarantee.

---

## 9. Component Behavior Specs

### `CalendarGrid.jsx`
- Renders a 7-column grid for the current month
- Padding cells for days before the 1st
- Each cell is a `DayCell` component
- Past dates are visually dimmed, non-interactive
- Receives `slots` array, groups by date internally

### `DayCell.jsx`
- Shows the day number
- Renders a `SlotBadge` for each crew that has a slot on this day
- If no slots exist for this day, show subtle "No availability" text
- Click on an available `SlotBadge` → opens `BookingModal` with slot pre-filled

### `SlotBadge.jsx`
- Small pill with crew color + status
- Available: green, hover darkens, pointer cursor
- Booked: red/muted, shows "Booked", no-drop cursor
- Blocked: gray, shows "Unavailable"
- Animate in on mount (fade + slide up, 150ms)

### `BookingModal.jsx`
- Fields: Property Name (text), Contact Name (text), Email (text), Notes (textarea, optional)
- Validates: all required fields filled, email format valid
- Submit button shows spinner during API call
- On success: close modal, show toast "Booking confirmed!", slot turns red in real time
- On race condition error: show error, keep modal open, refresh that slot's status

### `MonthNavigator.jsx`
- Left/right arrows for month navigation
- Cannot navigate to past months (disable left arrow when on current month)
- Shows "May 2026" format centered

### `BookingsList.jsx` (Admin)
- Table: Date | Crew | Property | Contact | Email | Booked At
- Sortable by date
- Shows total booking count
- Export to CSV button (future)

---

## 10. Error States to Handle

| Scenario | How to Handle |
|---|---|
| Supabase unreachable | Show "Connection error. Please refresh." banner |
| Slot taken mid-booking | Toast error, refresh slot status, keep modal open |
| No slots for a month | Show "No availability this month" empty state |
| Invalid email in form | Inline validation error below field |
| Realtime disconnects | Show subtle "Live updates paused" badge, auto-reconnect |
| Admin creates overlapping slot | DB unique index rejects it, show error toast |

---

## 11. UI/UX Requirements

- **Mobile-first:** The demo will likely be opened on a phone by the client
- **Color system:**
  - Available: `green-500` / `green-100`
  - Booked: `red-500` / `red-100`
  - Blocked: `gray-400` / `gray-100`
  - Brand accent: `#1a365d` (dark navy — professional services feel)
- **Typography:** Clean, readable. Use `font-sans` from Tailwind. Headings bold and large.
- **Transitions:** Slot status change should animate (color fade 300ms)
- **Realtime indicator:** Small pulsing green dot in the header "● Live" so client can see it's real-time
- **Responsive breakpoints:**
  - Mobile: single column, stacked crew badges
  - Tablet+: full 7-column calendar grid

---

## 12. Sprint Plan

---

### Sprint 1 — Foundation & Database
**Prompt this sprint:** "Set up the project foundation"

**Tasks:**
1. Scaffold Vite + React project
2. Install all dependencies: `tailwindcss`, `@supabase/supabase-js`, `zustand`, `date-fns`, `lucide-react`, `react-hot-toast`, `react-router-dom`
3. Configure Tailwind (`tailwind.config.js`, `globals.css`)
4. Create `.env.example` and `.env.local` (agent fills with placeholder, human fills real keys)
5. Set up `src/lib/supabase.js`
6. Write and run `supabase/migrations/001_initial_schema.sql`
7. Write and run `supabase/seed.sql` — seed 3 crews + 30 days of available slots (weekdays only)
8. Verify data exists in Supabase dashboard

**Deliverable:** Project runs on localhost, Supabase tables populated, no UI yet.

**Agent prompt to use:**
```
Set up a Vite + React project called reliance-scheduler. 
Install: tailwindcss@3, @supabase/supabase-js, zustand, date-fns, lucide-react, react-hot-toast, react-router-dom.
Configure Tailwind. Create the folder structure as specified in the spec doc.
Create src/lib/supabase.js using env vars VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
Create src/constants/slotStatus.js with SLOT_STATUS and STATUS_STYLES as specified.
Write the SQL migration for the crews and slots tables exactly as in the spec. Include RLS policies.
Write seed.sql with 3 crews and available slots for every weekday in the next 5 weeks.
```

---

### Sprint 2 — Calendar UI (No Data Yet)
**Prompt this sprint:** "Build the calendar shell"

**Tasks:**
1. Build `MonthNavigator.jsx` — prev/next month, disable past months
2. Build `useCalendarMonth.js` hook — manages current month state, generates day grid array
3. Build `CalendarGrid.jsx` — 7-column grid, padding cells, day numbers
4. Build `DayCell.jsx` — renders day number, accepts slot array as prop (empty for now)
5. Build `SlotBadge.jsx` — renders colored pill based on status (use mock data)
6. Build `CrewLegend.jsx` — color key for crews
7. Wire up `PublicCalendar.jsx` page with static mock data to verify layout
8. Make it responsive (mobile stacked, desktop grid)

**Deliverable:** Calendar grid renders correctly with mock slot data. Looks good on mobile.

**Agent prompt to use:**
```
Build the calendar UI components for reliance-scheduler. Use the folder structure and component specs from the spec doc.
Use TailwindCSS only. No external component libraries.
CalendarGrid renders a 7-column monthly grid. DayCell shows day number + crew slot badges.
SlotBadge shows green/red/gray pill based on SLOT_STATUS constants.
MonthNavigator has prev/next arrows, disables left arrow on current month.
CrewLegend shows crew name + color dot for each crew.
Wire up PublicCalendar.jsx to render CalendarGrid with this hardcoded mock data: [paste 3-4 mock slot objects here]
Make it mobile responsive. Add a pulsing green "● Live" indicator in the header.
```

---

### Sprint 3 — Data Layer & Realtime
**Prompt this sprint:** "Connect real data and live updates"

**Tasks:**
1. Build `useCrews.js` — fetch crews from Supabase on mount
2. Build `useSlots.js` — fetch slots for current month + subscribe to realtime changes
3. Replace mock data in `PublicCalendar.jsx` with real hooks
4. Group slots by date in the component (or in the hook)
5. Pass correct slot arrays to each `DayCell`
6. Verify realtime: open two browser tabs, manually update a slot in Supabase dashboard, confirm both tabs update without refresh
7. Handle loading state (skeleton or spinner)
8. Handle empty state (no slots this month)

**Deliverable:** Calendar shows real data. Two tabs open side-by-side update in real time.

**Agent prompt to use:**
```
Connect reliance-scheduler to Supabase. 
Build useCrews.js: fetches all crews from the crews table on mount.
Build useSlots.js: 
  - Accepts a month object {start: 'YYYY-MM-DD', end: 'YYYY-MM-DD'}
  - Fetches all slots in that range with crew data joined
  - Subscribes to Supabase Realtime on the slots table
  - On any change event, updates the local slots array by replacing the changed slot by id
  - Unsubscribes on cleanup
  - Returns { slots, loading, error }
Update PublicCalendar.jsx to use these hooks instead of mock data.
Group slots by date (YYYY-MM-DD key) and pass the correct array to each DayCell.
Show a centered spinner while loading. Show "No availability this month" if slots array is empty.
```

---

### Sprint 4 — Booking Flow
**Prompt this sprint:** "Build the booking modal and confirm flow"

**Tasks:**
1. Build `Modal.jsx` reusable wrapper (backdrop, close on escape/outside click)
2. Build `BookingModal.jsx`:
   - Pre-filled: date, crew name
   - Fields: Property Name, Contact Name, Email, Notes
   - Validation: required fields, email format
   - Loading state on submit button
3. Build `useBooking.js` hook with race condition protection
4. Wire up: clicking available `SlotBadge` → open modal with slot data
5. On success: close modal, show success toast
6. On race condition: show error toast, keep modal open
7. Build `calendarStore.js` (Zustand): manage `selectedSlot` and `isModalOpen` state

**Deliverable:** Full booking flow works end-to-end. Two users cannot book same slot.

**Agent prompt to use:**
```
Build the booking flow for reliance-scheduler.

Build src/store/calendarStore.js with Zustand:
  - selectedSlot: null | slot object
  - isModalOpen: boolean
  - Actions: openModal(slot), closeModal()

Build src/components/ui/Modal.jsx:
  - Backdrop (semi-transparent black)
  - Centered card
  - Close on Escape key or clicking backdrop
  - Accepts: isOpen, onClose, children

Build src/components/booking/BookingModal.jsx:
  - Shows: date formatted nicely, crew name with color dot
  - Form fields: Property Name (required), Contact Name (required), Email (required, validated), Notes (optional)
  - Submit calls useBooking hook
  - Button shows spinner during loading
  - On success: call onClose, show toast.success("Booking confirmed!")
  - On race condition (slot taken): show toast.error("Slot just taken — pick another date"), do NOT close modal

Build src/hooks/useBooking.js:
  - Takes { slotId, bookedByName, bookedByEmail, propertyName, notes }
  - Updates slot using: .eq('id', slotId).eq('status', 'available') guard
  - Returns success: false if count is 0 (race condition)
  - Returns success: true on happy path

In SlotBadge.jsx: clicking an available badge calls calendarStore.openModal(slot)
In PublicCalendar.jsx: render BookingModal, pass selectedSlot and closeModal from store
```

---

### Sprint 5 — Admin Panel
**Prompt this sprint:** "Build the admin panel"

**Tasks:**
1. Set up `/admin` route in `App.jsx`
2. Build `AdminPanel.jsx` — tabbed layout: "Manage Slots" | "View Bookings"
3. Build `SlotManager.jsx`:
   - Form to add a slot: pick date, pick crew, set status (available/blocked)
   - List of existing slots for selected week with delete button
4. Build `BlockDateForm.jsx`:
   - Block a specific date for all crews or one crew
5. Build `BookingsList.jsx`:
   - Table of all booked slots
   - Columns: Date, Crew, Property, Contact, Email, Booked At
   - Sort by date descending by default

**Deliverable:** Admin can add slots, block dates, view all bookings.

**Agent prompt to use:**
```
Build the admin panel for reliance-scheduler at the /admin route.

AdminPanel.jsx: 
  - Simple tab navigation: "Manage Slots" and "View Bookings"
  - Clean table/form layout with Tailwind

SlotManager.jsx:
  - Add Slot form: date picker (input type=date), crew selector (dropdown from useCrews), status toggle (available/blocked)
  - On submit: insert into slots table via supabase
  - Below form: list of slots for the next 14 days with crew name, status badge, and a Delete button
  - Delete button removes the slot (only if status is 'available' or 'blocked' — warn before deleting a booked slot)

BookingsList.jsx:
  - Fetch all slots where status = 'booked', join with crews
  - Render in a table: Date | Crew | Property Name | Contact Name | Email | Booked At
  - Sort by date descending
  - Show total count: "X bookings total"
  - Empty state: "No bookings yet"
```

---

### Sprint 6 — Polish & Demo Readiness
**Prompt this sprint:** "Polish the UI and prep for demo"

**Tasks:**
1. Add Reliance logo/wordmark in the header
2. Add page title: "Reliance Building Services — Irvine Scheduling"
3. Make the live indicator pulse animation smooth
4. Ensure slot status change animates (color transition 300ms)
5. Test full flow on mobile (real device or DevTools)
6. Add `react-hot-toast` Toaster to `App.jsx` with good positioning
7. Verify realtime works on two devices on same WiFi
8. Add a "How it works" tooltip or header subtitle: "Select a green date to book your crew"
9. Handle Supabase connection error gracefully (banner, not crash)
10. Final: build for production (`vite build`) and verify no console errors

**Deliverable:** Demo-ready. Opens on phone, books a slot, other screen updates instantly.

**Agent prompt to use:**
```
Polish reliance-scheduler for the Tuesday demo.

1. Add a header bar with company name "Reliance Building Services" on the left and a pulsing green "● Live" badge on the right. Use a dark navy (#1a365d) background for the header with white text.
2. Add a subtitle below the calendar title: "Select a green slot to schedule your crew — availability updates in real time"
3. Add CSS transition to SlotBadge: when status changes, transition background-color over 300ms
4. Add <Toaster position="top-center" /> from react-hot-toast in App.jsx
5. Wrap the Supabase fetch in useSlots.js with error handling — if fetch fails, set error state and show a banner: "Unable to load schedule. Please check your connection."
6. In useSlots.js, detect realtime subscription status. If it disconnects (subscription.state === 'CHANNEL_ERROR'), show a subtle yellow badge: "⚠ Live updates paused"
7. Test on mobile: ensure the calendar day cells are at least 44px tall for touch targets. SlotBadge pills should be at least 32px tall.
8. Run vite build and confirm it compiles cleanly with no errors.
```

---

## 13. Booking Notification (Supabase Edge Function)

After a successful booking, call a Supabase Edge Function that sends a notification email to `monirhasnan@gmail.com`. This replaces the "Google Calendar invite" step in the demo — same result (Reliance inbox gets notified), zero OAuth complexity.

**Service:** Resend (free tier — 3,000 emails/month, no credit card)  
**Function location:** `supabase/functions/notify-booking/index.ts`  
**Environment secret:** `RESEND_API_KEY` set via `supabase secrets set`

**The notification email address is dynamic.** The Edge Function reads `notification_email` from the `settings` table at runtime. To change where booking emails go, update that row in Supabase — no code change, no redeploy.

```sql
-- Change the notification email anytime in Supabase dashboard:
update settings set value = 'irvine@reliance.services' where key = 'notification_email';
```

**What the email must contain:**
- Subject: `New Booking Confirmed — [Property Name] · [Date]`
- To: value of `settings.notification_email` (read at runtime)
- Reply-to: the contact's email from the booking form
- Body (plain + HTML): Date, Crew Name, Property Name, Contact Name, Contact Email, Notes

**How it is called from useBooking.js:**
```js
// After successful .update() — fire and forget, do not await or block UI
supabase.functions.invoke('notify-booking', {
  body: { date, crewName, propertyName, bookedByName, bookedByEmail, notes }
})
```

**Folder addition to project structure:**
```
supabase/
  functions/
    notify-booking/
      index.ts
```

---

## 14. Key Files Reference

### `src/lib/supabase.js`
```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars. Check .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### `src/lib/dateUtils.js`
```js
import { 
  startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, format, isBefore, isToday, startOfDay
} from 'date-fns'

// Returns array of date strings for a month including leading null padding
export function getCalendarDays(year, month) {
  const start = startOfMonth(new Date(year, month))
  const end = endOfMonth(new Date(year, month))
  const days = eachDayOfInterval({ start, end })
  const paddingDays = getDay(start) // 0 = Sunday
  return { days, paddingDays }
}

// Returns { start, end } as 'YYYY-MM-DD' strings for Supabase query
export function getMonthRange(year, month) {
  const start = startOfMonth(new Date(year, month))
  const end = endOfMonth(new Date(year, month))
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  }
}

export function isPastDate(date) {
  return isBefore(startOfDay(date), startOfDay(new Date()))
}

export function formatDisplayDate(dateStr) {
  return format(new Date(dateStr), 'EEEE, MMMM d, yyyy')
}
```

### `src/store/calendarStore.js`
```js
import { create } from 'zustand'

export const useCalendarStore = create((set) => ({
  selectedSlot: null,
  isModalOpen: false,
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),

  openModal: (slot) => set({ selectedSlot: slot, isModalOpen: true }),
  closeModal: () => set({ selectedSlot: null, isModalOpen: false }),
  goToNextMonth: () => set((state) => {
    const next = new Date(state.currentYear, state.currentMonth + 1)
    return { currentYear: next.getFullYear(), currentMonth: next.getMonth() }
  }),
  goToPrevMonth: () => set((state) => {
    const prev = new Date(state.currentYear, state.currentMonth - 1)
    return { currentYear: prev.getFullYear(), currentMonth: prev.getMonth() }
  }),
}))
```

---

## 14. Future Improvements (Post-Demo Scope)

These are intentionally excluded from the demo but the architecture supports them:

| Feature | Notes |
|---|---|
| Auth | Supabase Auth, roles: `reliance_admin`, `property_manager` |
| Shareable token links | `/book?token=abc` — scoped to one property |
| Google Calendar OAuth sync | Two-way sync via Google Calendar API — `irvine@reliance.services` |
| Admin panel | Slot management, block dates, view all bookings — route `/admin` |
| AI scheduling | Pass available slots + job requirements to AI, get optimal date suggestion |
| Export to CSV | Download bookings list |
| SMS notifications | Twilio on booking confirm |
| Recurring slot generation | Cron to auto-create available slots weekly |
| Environmental report attachment | Attach PDF to booking record, accessible from calendar |
| Multi-tenant | Separate Reliance from other contractors using the same platform |

---

## 15. Demo Script (For the Tuesday Meeting)

1. Open the URL on your phone — show the live green calendar
2. Say: *"Property Manager opens this link on their phone right now, while sitting with the tenant"*
3. Tap a green slot — booking modal opens
4. Fill in property name + contact — tap Confirm
5. Slot turns red on your phone **and** on the laptop screen simultaneously
6. Say: *"Every screen updates instantly — that slot is gone for everyone"*
7. Show the inbox at `monirhasnan@gmail.com` — the booking notification email has already arrived
8. Say: *"No emails back and forth. No phone calls. Reliance gets notified automatically."*

**The two moments that win the room:** the simultaneous slot update across devices, and the email already sitting in the Irvine inbox.

---

## 16. Checklist Before Demo

- [ ] Supabase project created and URL/key in `.env.local`
- [ ] Migrations run, seed data inserted (verify in Supabase table editor)
- [ ] Realtime enabled on `slots` table
- [ ] App runs on `npm run dev` with no console errors
- [ ] Calendar shows green slots for next 2 weeks
- [ ] Booking flow works end-to-end
- [ ] Two devices on same WiFi — booking on one updates the other in under 2 seconds
- [ ] Booking notification email arrives at `monirhasnan@gmail.com` within 30 seconds of confirming
- [ ] Mobile layout looks good (test on actual phone)
- [ ] `vite build` runs clean
- [ ] Deployed to Vercel or Netlify — shareable URL ready

---

*End of spec. Use each sprint's agent prompt sequentially. Do not skip sprints.*
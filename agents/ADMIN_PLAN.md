# Admin Panel Plan — Reliance Scheduler

> **Goal:** Give admins full control over crews, time slots, properties, bookings, and settings.  
> **Key requirement:** Every booked slot must show **who booked it** (name, email, property, notes, timestamp).  
> **No auth** for demo — open `/admin` route.  
> **Design:** Matches existing design system (brand blue `#1a56db`, DM Sans, existing UI primitives).

---

## 📐 Architecture

```
/admin
  └── AdminPanel (sidebar nav + <Outlet />)
       ├── /admin/slots       → SlotManager     ← Core: full slot CRUD
       ├── /admin/crews       → CrewManager      ← CRUD crews
       ├── /admin/properties  → PropertyManager  ← CRUD properties
       ├── /admin/bookings    → BookingsList     ← View + cancel bookings
       └── /admin/settings    → SettingsPanel    ← App config
```

**Existing data in DB** (already populated on booking):
- `slots.booked_by_name` — who booked
- `slots.booked_by_email` — their email
- `slots.property_name` — property name
- `slots.notes` — booking notes
- `slots.booked_at` — timestamp

Every admin view that touches booked slots **must** surface this data.

---

## 🗂 Files to Create

| # | File | Est. Lines | Purpose |
|---|---|---|---|
| 1 | `src/types/property.ts` | 15 | TS interface for Property |
| 2 | `src/hooks/useProperties.ts` | 55 | Fetch/create/update properties |
| 3 | `src/hooks/useAdminSlots.ts` | 80 | Fetch slots with crew join + booking filters |
| 4 | `src/components/admin/CrewManager.tsx` | 200 | Full crew CRUD |
| 5 | `src/components/admin/SlotManager.tsx` | 320 | Slot CRUD + bulk create + show booker info |
| 6 | `src/components/admin/PropertyManager.tsx` | 170 | Property CRUD |
| 7 | `src/components/admin/BookingsList.tsx` | 200 | All bookings table + cancel + detail modal |
| 8 | `src/components/admin/SettingsPanel.tsx` | 100 | Settings key-value editor |
| 9 | `src/pages/AdminPanel.tsx` | 140 | Sidebar nav + <Outlet /> layout |
| 10 | Modify `src/app/router.tsx` | +15 | Add admin route with lazy loading |

**Total: ~1,295 lines new code**

---

## 🧩 Tab-by-Tab Specification

---

### TAB 1: Slots (`/admin/slots`) — SlotManager.tsx

**This is the main admin tool.** Shows all slots grouped by day with full CRUD.

#### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Slots Management                          [Add] [Bulk]      │
│  ─────────────────────────────────────────────────────────── │
│  [← Prev Week]  May 11 – May 17, 2026  [Next →]             │
│  [All Crews ▾]  [All Statuses ▾]                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Monday, May 11                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🟢 8:00–10:00  ● Team Alpha   Available          [✎] [🗑] ││
│  │ 🟢 8:00–10:00  ● Team Beta    Available          [✎] [🗑] ││
│  │ 🔴 10:00–12:00 ● Team Alpha   Booked — John Smith   [🗑] ││
│  │          1800 Main St · john@email.com · May 11, 9:30AM  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Tuesday, May 12                                             │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ⚫ 8:00–10:00  ● Team Gamma  Unavailable          [✎] [🗑]││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ...                                                         │
└──────────────────────────────────────────────────────────────┘
```

#### Booker Info Display

**Every booked slot** shows a second line with full booker details:
```
🔴 10:00–12:00  ● Team Alpha   Booked                    [🗑]
   📋 John Smith · john@email.com · 1800 Main St · May 11, 9:30 AM
   📝 "Need extra cleaning supplies" (if notes exist)
```

This is the critical requirement — **admin sees who booked at a glance.**

#### Features

**Week navigation:** Prev/Next week with date range display, centered.

**Filters:** Crew dropdown (from DB), status dropdown (All/Available/Booked/Blocked/Cancelled).

**Add Slot Modal** (`Modal` + `Input` + `Button`):
- Date picker (`input type="date"`)
- Crew selector (dropdown from `useCrews`)
- Start time (`input type="time"`)
- End time (`input type="time"`)
- Status toggle (Available / Blocked)
- Validates: end > start, no overlapping available slots for same crew/time
- On submit: `supabase.from('slots').insert({...})` → success toast → refresh list

**Bulk Create Modal**:
- Date range (start date → end date)
- Time range (start time → end time)
- Slot duration (e.g. 2 hours)
- Crew checkboxes (pick one or multiple)
- Status (Available / Blocked)
- Generates slots matching the seed pattern: every weekday in range, at each time slot, for each selected crew
- Shows preview before confirming
- `INSERT` via supabase in loop or batch

**Edit Slot:** Click ✎ button → modal with same fields pre-filled (date, crew, start/end time, status, job_type). For booked slots, also show read-only booker info fields (can't change those through edit).

**Delete Slot:** 🗑 button → confirm dialog "Delete this slot? This cannot be undone." → `supabase.from('slots').delete().eq('id', slotId)` → toast → remove from list. If booked, warn: "This slot is booked. Are you sure?"

**States:**
- Loading: inline spinner per day group (or full skeleton for initial load)
- Empty: "No slots for this week. Add one or adjust filters."
- Error: toast on failed operations

#### Data Flow
```ts
// useAdminSlots.ts — fetches slots in a date range with crew join
const { data, error } = await supabase
  .from('slots')
  .select('*, crews(name, color, display_order)')
  .gte('date', start)
  .lte('date', end)
  .order('date')
  .order('start_time')
```

Group by date client-side:
```ts
const grouped = slots.reduce((acc, slot) => {
  (acc[slot.date] ??= []).push(slot)
  return acc
}, {} as Record<string, Slot[]>)
```

---

### TAB 2: Crews (`/admin/crews`) — CrewManager.tsx

```
┌──────────────────────────────────────────────────────┐
│  Crew Management                        [Add Crew]    │
│  ──────────────────────────────────────────────────── │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ # │ Name         │ Color   │ Order │ Active │     ││
│  ├──────────────────────────────────────────────────┤│
│  │ 1 │ ● Team Alpha │ #16a34a │  1    │  ✅   │ ✎ 🗑│
│  │ 2 │ ● Team Beta  │ #2563eb │  2    │  ✅   │ ✎ 🗑│
│  │ 3 │ ● Team Gamma │ #d97706 │  3    │  ✅   │ ✎ 🗑│
│  └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

**Add/Edit Crew Modal:**
- Name (text, required)
- Color (`input type="color"` + hex text field)
- Display Order (number, default next available)
- Max Jobs Per Day (number, default 1)
- Active (toggle)
- Notes (textarea, optional)

**Delete:** Sets `is_active = false` (soft-delete). If the crew has existing slots, show warning. Toast on success.

---

### TAB 3: Properties (`/admin/properties`) — PropertyManager.tsx

```
┌──────────────────────────────────────────────────────┐
│  Properties                           [Add Property]  │
│  ──────────────────────────────────────────────────── │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ Name             │ Address        │ Contact       ││
│  ├──────────────────────────────────────────────────┤│
│  │ 1800 Main St     │ 1800 Main St.. │ John Smith    ││
│  │ Oak Creek Apts   │ 42 Oak Creek.. │ Jane Doe      ││
│  └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

**Add/Edit Modal:** name, address, city, state, contact name, contact email, notes.

**Delete:** `is_active = false` soft-delete.

---

### TAB 4: Bookings (`/admin/bookings`) — BookingsList.tsx

**Dedicated view of all booked slots with full booker info.**

```
┌──────────────────────────────────────────────────────────────────┐
│  Bookings                                        Total: 12       │
│  ──────────────────────────────────────────────────────────────── │
│  [All Crews ▾]  [Date Range ▾]                                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Date       │ Time    │ Crew    │ Property    │ Booked By     ││
│  ├──────────────────────────────────────────────────────────────┤│
│  │ May 11     │ 8–10 AM │ Alpha   │ 1800 Main   │ John Smith    ││
│  │            │         │         │             │ john@em.com   ││
│  │ May 12     │ 10–12   │ Beta    │ Oak Creek   │ Jane Doe      ││
│  │            │         │         │             │ jane@em.com   ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Rows per page: [20 ▾]  ← 1-20 of 45 →                          │
└──────────────────────────────────────────────────────────────────┘
```

**Click row → Detail Modal:**
```
┌────────────────────────────────────────┐
│  Booking Details                   ✕   │
│  ────────────────────────────────────  │
│  Date:      Monday, May 11, 2026       │
│  Time:      8:00 AM – 10:00 AM         │
│  Crew:      ● Team Alpha               │
│  Status:    Booked                      │
│  ────────────────────────────────────  │
│  Property:  1800 Main St Irvine        │
│  Booked By: John Smith                 │
│  Email:     john@email.com             │
│  Booked At: May 11, 2026 9:30 AM       │
│  Notes:     "Need extra supplies"      │
│  ────────────────────────────────────  │
│  [Cancel Booking]                      │
└────────────────────────────────────────┘
```

**Cancel Booking:** Confirmation → `supabase.from('slots').update({status: 'cancelled', cancelled_at: now(), cancelled_reason: 'Admin cancelled'})` → toast → refresh.

**Features:**
- Fetch: `slots` where `status = 'booked'`, ordered by `booked_at DESC`, with crew join
- Crew filter dropdown
- Date range filter (start/end date inputs)
- Search by property name or contact name (client-side filter)
- Pagination: 20 per page
- Export to CSV button (future — just the button, no logic)
- Empty state: "No bookings yet"
- Loading: skeleton rows

---

### TAB 5: Settings (`/admin/settings`) — SettingsPanel.tsx

```
┌───────────────────────────────────────────────┐
│  Settings                                      │
│  ───────────────────────────────────────────── │
│                                                 │
│  Notification Email:  [monirhasnan@gmail.com ]  │
│  Company Name:        [Reliance Building...  ]  │
│  Calendar Title:      [Irvine Scheduling     ]  │
│                                                 │
│  [Save Settings]                                │
│                                                 │
│  ───────────────────────────────────────────── │
│  Database Tables                                │
│  ┌───────────────────────────────────────────┐ │
│  │ Crews:     3 active                        │ │
│  │ Slots:     372 total                       │ │
│  │ Bookings:  12 confirmed                    │ │
│  │ Properties: 0 registered                   │ │
│  └───────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
```

**Fetches** all rows from `settings` table on mount.
**Renders** a form with one input per setting.
**Save** updates each row individually (or batch via loop).
**Stats summary** at bottom (aggregate counts from each table).

---

## 🧱 AdminPanel Layout

```tsx
// src/pages/AdminPanel.tsx
// Sidebar navigation + <Outlet /> layout
//
// Sidebar links:
//   📅 Slots       /admin/slots
//   👥 Crews       /admin/crews
//   🏢 Properties  /admin/properties
//   📋 Bookings    /admin/bookings
//   ⚙️ Settings    /admin/settings
//
// Mobile: sidebar collapses to bottom tab bar
// Desktop: fixed left sidebar (220px), content area on right
```

**Sidebar design:**
- Background: white with right border
- "Admin" header with back-to-calendar link
- Active tab highlighted with brand blue left border
- Clean, compact nav items with icons

---

## 🧩 Build Order (Recommended)

| Step | File(s) | Why first |
|---|---|---|
| **1** | `src/types/property.ts` | Foundation — other files import this |
| **2** | `src/hooks/useProperties.ts` + `src/hooks/useAdminSlots.ts` | Data layer |
| **3** | `src/components/admin/CrewManager.tsx` | Simplest CRUD — quick win |
| **4** | `src/components/admin/SlotManager.tsx` | Core feature — most complex, biggest impact |
| **5** | `src/components/admin/SettingsPanel.tsx` | Simple form, good break |
| **6** | `src/components/admin/PropertyManager.tsx` | Medium complexity |
| **7** | `src/components/admin/BookingsList.tsx` | Read-heavy + cancel action |
| **8** | `src/pages/AdminPanel.tsx` + router changes | Wire everything up |

---

## 🔑 Key Requirement: Booker Info Visibility

Every place a booked slot appears in the admin panel, the admin **must** see:

| Field | Shown where |
|---|---|
| `booked_by_name` | Slot row (second line), Booking detail modal, Bookings table |
| `booked_by_email` | Slot row (second line), Booking detail modal, Bookings table |
| `property_name` | Slot row (second line), Booking detail modal, Bookings table |
| `notes` | Booking detail modal only (too long for inline) |
| `booked_at` | Booking detail modal, Bookings table (as "Booked At") |

In the **Slot Manager** list view, a booked slot displays as:
```
🔴 10:00–12:00  ● Team Alpha   Booked                    [🗑]
   📋 John Smith · john@email.com · 1800 Main St · May 11, 9:30 AM
```

This ensures admins can scan a day's schedule and immediately see **who** booked each slot without clicking into anything.

---

## ✅ Design Principles

1. **All existing UI primitives reused** — Button, Modal, Input, Textarea, Badge, Spinner, EmptyState, toastConfig
2. **All operations show toast feedback** — success green, error red
3. **Destructive actions confirm** — delete, cancel booking
4. **Loading state on every data fetch** — inline spinners or skeleton
5. **Empty state when no data** — meaningful message, not a blank page
6. **Mobile responsive** — sidebar collapses, tables stack, modals full-width
7. **No auth** — open access for demo, matching existing RLS policies

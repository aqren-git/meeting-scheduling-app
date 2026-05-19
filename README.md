# Reliance Scheduling

> A real-time crew scheduling calendar for Reliance Building Services.  
> Property managers can view crew availability, book time slots, and see updates across all devices instantly — no emails, no phone calls.

**Live demo:** [Coming after deployment]

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19 + Vite 8 | UI framework and build tool |
| Language | TypeScript 6 | Type safety |
| Styling | TailwindCSS v4 | Utility-first CSS with custom design tokens + skeleton loading states |
| Database | Supabase (PostgreSQL) | Hosted relational database |
| Realtime | Supabase Realtime | WebSocket channel for live slot updates |
| State | Zustand | Lightweight global state (calendar navigation, modal) |
| Routing | React Router v7 | Client-side routing (public + admin panels) |
| Dates | date-fns | Date manipulation and formatting |
| Icons | lucide-react | Icon set (chevrons, close, calendar, settings, etc.) |
| Notifications | react-hot-toast | Toast messages for booking success/errors |
| Email | Resend (via Supabase Edge Function) | Transactional email for booking notifications |

---

## Folder Structure

```
reliance-scheduler/
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql    # Core tables: crews, slots, properties, settings, audit_log
│   │   ├── 002_triggers.sql           # updated_at, audit log, booked_at triggers
│   │   └── 003_time_slots.sql         # [Optional] Migration from nullable to required time fields
│   ├── functions/
│   │   └── notify-booking/
│   │       └── index.ts               # Edge Function — sends booking confirmation email via Resend
│   └── seed.sql                       # Demo data: 3 crews + time slots for 5 weeks
│
├── src/
│   ├── components/
│   │   ├── calendar/
│   │   │   ├── CalendarGrid.tsx       # 7-column monthly grid with gap-px border trick
│   │   │   ├── DayCell.tsx            # Single day cell: day number + sorted SlotBadge list
│   │   │   ├── SlotBadge.tsx          # Time slot pill: time range + crew name, colored by status
│   │   │   ├── MonthNavigator.tsx     # Prev/next month arrows + "Today" button
│   │   │   └── CrewLegend.tsx         # Color-coded crew legend row
│   │   ├── booking/
│   │   │   └── BookingModal.tsx       # Booking form: date, time, crew, property name, contact, email, notes
│   │   ├── admin/                     # Admin panel components
│   │   │   ├── AdminPanel.tsx         # Main admin panel with tab navigation (mobile + desktop)
│   │   │   ├── SettingsPanel.tsx      # Settings management (notification email, company name, calendar title)
│   │   │   ├── PropertyManager.tsx    # Property CRUD operations with table view and modals
│   │   │   ├── CrewManager.tsx        # Crew management with color picker, ordering, and active/inactive toggle
│   │   │   ├── BookingsList.tsx       # View all bookings with filters (crew, date range, search), pagination
│   │   │   └── SlotManager.tsx        # Slot management: view, create, edit, delete slots by week
│   │   └── ui/                        # Reusable UI primitives
│   │       ├── button/                # Button — variants: primary, ghost
│   │       ├── skeleton/              # Skeleton — loading placeholder component
│   │       ├── badge/                 # Badge — status-aware coloring
│   │       ├── input/                 # Input + Textarea — label, error state
│   │       ├── modal/                 # Modal — backdrop, close on Escape/outside click
│   │       ├── empty-state/           # EmptyState — centered icon + message
│   │       ├── spinner/               # Spinner — configurable loading indicator
│   │       ├── full-page-loader/      # FullPageLoader — full-screen loading state
│   │       └── toast/                 # toastConfig — react-hot-toast presets
│   │
│   ├── hooks/
│   │   ├── useCrews.ts                # Fetch active crews from Supabase
│   │   ├── useSlots.ts                # Fetch slots in date range + Realtime subscription
│   │   ├── useBooking.ts              # Book a slot with race condition protection
│   │   ├── useCalendarMonth.ts        # Generate calendar day grid array
│   │   ├── useProperties.ts           # Fetch, add, update, delete properties
│   │   └── useAdminSlots.ts           # Admin slot management with pagination and filters
│   │
│   ├── store/
│   │   └── calendarStore.ts           # Zustand: selectedSlot, modal state, month navigation
│   │
│   ├── app/
│   │   └── router.tsx                # React Router configuration with lazy loading
│   │
│   ├── lib/
│   │   ├── supabase.ts                # Supabase client initialization
│   │   ├── dateUtils.ts               # getCalendarDays, getMonthRange, isPastDate, formatDisplayDate, formatTimeRange
│   │   └── routes.ts                  # Route constants (HOME, ADMIN)
│   │
│   ├── pages/
│   │   ├── PublicCalendar.tsx         # Main public calendar page
│   │   ├── AdminPanel.tsx             # Admin panel with lazy-loaded tab components
│   │   └── ErrorPage.tsx              # Error boundary page
│   │
│   ├── constants/
│   │   └── slotStatus.ts              # SLOT_STATUS enum + STATUS_STYLES mapping
│   │
│   ├── types/
│   │   ├── slot.ts                    # Slot and Crew TypeScript interfaces
│   │   └── property.ts                # Property TypeScript interface
│   │
│   ├── data/
│   │   └── mockSlots.ts               # Mock data generator (used when Supabase is unavailable)
│   │
│   ├── App.tsx                        # BrowserRouter + Toaster + Suspense + Routes
│   ├── main.tsx                       # React entry point
│   └── index.css                      # Tailwind v4 @theme tokens + CSS variables + body styles
│
├── .env.example                       # Environment variable template
├── .env.local                         # Local Supabase credentials (gitignored)
├── vite.config.ts                     # Vite config + @/ path alias
├── tsconfig.json                      # TypeScript config
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase account (free tier)

### 1. Clone and Install

```bash
git clone <repo-url>
cd reliance-scheduler
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Project Settings → API** and copy:
   - `Project URL` (looks like `https://xxxxx.supabase.co`)
   - `anon public` key (a long JWT string starting with `eyJ...`)

3. Copy `.env.example` to `.env.local` and fill in the values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Run Migrations

Open your Supabase project's **SQL Editor** and run these files in order:

1. **`supabase/migrations/001_initial_schema.sql`**
   - Creates enums (`slot_status`, `job_type`)
   - Creates tables: `crews`, `properties`, `slots`, `settings`, `slot_audit_log`
   - Creates indexes (including unique partial index for race-condition protection)
   - Enables RLS with open demo policies
   - Seeds default settings: `notification_email`, `company_name`, `calendar_title`

2. **`supabase/migrations/002_triggers.sql`**
   - `updated_at` auto-stamp on crews, properties, slots
   - `log_slot_change()` audit trigger on slots
   - `set_booked_at()` auto-timestamp on status changes

> **Note:** `003_time_slots.sql` is only needed if you ran an older version of `001` with nullable `start_time`/`end_time`. The current `001` already includes the final time-slot schema.

### 4. Seed Demo Data

Run **`supabase/seed.sql`** in the SQL Editor. This inserts:

- **3 crews**: Team Alpha, Team Beta, Team Gamma
- **Time slots**: 5 time slots per weekday per crew for the next 5 weeks:
  - 8:00–10:00 AM, 10:00 AM–12:00 PM, 12:00–2:00 PM, 2:00–4:00 PM, 4:00–6:00 PM
  - ~375 slots total (3 crews × 5 slots × ~25 weekdays)

### 5. Enable Realtime

1. In Supabase Dashboard, go to **Database → Replication**
2. Find the `slots` table
3. Enable Realtime for INSERT, UPDATE, DELETE

### 6. Start the Dev Server

```bash
npm run dev
```

Open `http://localhost:5173` — you should see the calendar with green time slots.

### 7. Access Admin Panel

Click the **Admin** button (Settings icon) in the top-right header to access the admin panel at `/admin`. Use the admin panel to:
- Configure notification email and company settings
- Manage properties (add, edit, deactivate)
- Manage crews (add, edit, activate/deactivate)
- View and manage bookings with filters
- Create, edit, and delete time slots

---

## Booking Flow

1. Click an **available (green)** time slot
2. A modal opens showing: date, time range (e.g., "Thu May 22 · 8:00 – 10:00 AM"), crew name
3. Fill in: Property Name, Contact Name, Email, Notes (optional)
4. Click **Confirm Booking**
5. On success: toast "Booking confirmed!", slot turns red in real time across all open browsers
6. On race condition (slot taken by someone else): error toast, modal stays open

### Race Condition Protection

The booking query includes `.eq('status', 'available')` — the update only succeeds if the slot is still available at the moment of the write. Combined with the unique partial index `idx_unique_crew_time_booked`, double-booking is impossible at the database level.

---

## Booking Notification Email

After a successful booking, the app calls a Supabase Edge Function that sends a confirmation email via Resend.

### Deploy the Edge Function

1. **Install Supabase CLI**

```bash
npm install -g supabase
supabase login
```

2. **Link to your project**

```bash
supabase link --project-ref your-project-ref
```

3. **Set environment secrets**

```bash
supabase secrets set supabase_url=https://your-project.supabase.co
supabase secrets set supabase_anon_key=eyJ...
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
```

Get the Resend API key from [resend.com](https://resend.com) (free tier: 3,000 emails/month).

4. **Deploy**

```bash
supabase functions deploy notify-booking
```

The function reads the recipient email from the `settings` table at runtime. To change where notifications go, either:

**Via Admin Panel:**
1. Access admin panel at `/admin`
2. Go to **Settings** tab
3. Update **Notification Email** field
4. Click **Save Settings**

**Via SQL:**
```sql
update settings set value = 'new-email@example.com' where key = 'notification_email';
```

---

## Admin Panel

The admin panel provides comprehensive management capabilities for scheduling operations. Access it via the Admin button (Settings icon) in the calendar header.

### Features

**Settings Panel**
- Configure notification email (destination for booking confirmations)
- Set company name and calendar title
- View aggregate stats: total crews, slots, bookings, and properties
- All changes persist to the `settings` table

**Property Management**
- View all properties in a table format
- Add new properties with: name, address, city, state, contact info, notes
- Edit existing property details
- Soft-delete properties (sets `is_active: false` instead of deleting)
- Default city/state pre-filled (Irvine, CA)

**Crew Management**
- View all crews with color indicators and display order
- Add new crews with: name, color (hex picker), display order, max jobs per day, notes
- Edit crew details including color assignment
- Toggle active/inactive status (inactive crews hidden from public calendar)
- Filter view to show/hide inactive crews
- Crews sorted by `display_order` for consistent calendar display

**Bookings List**
- View all bookings across all dates and crews
- Filter by crew, date range, and search text (property name or contact)
- Paginated results (20 per page) with navigation
- View booking details: date, time, crew, property, contact info, notes
- Cancel bookings (sets status to `cancelled` with confirmation)
- Real-time updates when new bookings come in via WebSocket

**Slot Manager**
- View slots organized by week with date navigation
- Filter slots by crew and status (available, booked, blocked, cancelled)
- Create new slots: select date, time range, crew, property, and notes
- Edit existing slot details
- Delete slots (with confirmation)
- Real-time sync with public calendar
- Shows status color coding: green (available), red (booked), gray (blocked), yellow (cancelled)

### Admin Routes

- **Public Calendar**: `/` — Main calendar for property managers
- **Admin Panel**: `/admin` — Full admin interface with tab navigation

### Responsive Design

- **Desktop**: Sidebar navigation with all tabs visible
- **Mobile**: Bottom tab bar with icons, same tab options
- All admin components use skeleton loading states for smooth perceived performance

### Admin Navigation

From the public calendar, click the **Admin** button (Settings icon) in the top-right header to access the admin panel. From admin, click **Back to Calendar** to return.

---

## Design System

This project follows a light, minimal, professional design system defined in `agents/SCHEDULER_DESIGN.md`:

- **Colors**: All defined as CSS variables in `src/index.css` and mapped to Tailwind v4 `@theme` tokens
- **Typography**: DM Sans (400/500/600) — imported via Google Fonts in `index.html`
- **Grid lines**: `gap-px` trick — the grid container has a `bg-border` background, and each cell sits on top of it
- **Slot status**: Green = available, Red = booked, Gray = blocked/unavailable
- **Responsive**: Mobile stacks day cells vertically; Desktop shows full 7-column grid

### Slot Categories

Each time-slot box shows:
- **Top line**: Time range (e.g., "8:00 AM – 10:00 AM") — 11px semibold
- **Bottom line**: Color dot + crew name — 10px (hidden on mobile)

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | TypeScript check + Vite production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous API key |

---

## Database Schema Overview

### `crews`
Deployable crew units. Key fields: `name`, `color` (hex for UI dot), `display_order`, `is_active`.

### `properties`
Locations where crews are deployed. Key fields: `name`, `address`, `city`, `state`, `contact_name`, `contact_email`, `is_active`.

### `slots`
Core scheduling unit. One row = one crew at a specific time on a specific date.
- `crew_id` → FK to crews
- `date` + `start_time` + `end_time` define the time window
- `status`: available → booked | blocked | cancelled
- `property_name`, `booked_by_name`, `booked_by_email`, `notes` populated on booking
- Unique partial index: `(crew_id, date, start_time)` where `status = 'booked'`

### `settings`
Key-value store for app config. Used by the Edge Function to read `notification_email` and by admin panel for company settings. Keys: `notification_email`, `company_name`, `calendar_title`.

### `slot_audit_log`
Append-only audit trail for all slot changes (INSERT, UPDATE, DELETE).

---

## Deployment

### Vercel

```bash
npm i -g vercel
vercel --prod
```

Set environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel dashboard.

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod
```

Set environment variables in Netlify dashboard → Site settings → Environment variables.

---

## Demo Script

1. Open the URL on your phone — shows the live calendar with green time slots
2. *"Property Manager opens this link on their phone right now, while sitting with the tenant"*
3. Tap a green time slot — booking modal opens with date + time + crew pre-filled
4. Fill in property name + contact — tap Confirm
5. Slot turns red on your phone **and** on the laptop screen simultaneously
6. *"Every screen updates instantly — that slot is gone for everyone"*
7. Check the inbox — the booking notification email has already arrived
8. *"No emails back and forth. No phone calls. Reliance gets notified automatically."*

---

## Sprint Completion

| Sprint | Task | Status |
|---|---|---|
| 1 | Project scaffold + Tailwind + CSS vars + folder structure | ✅ |
| 2 | Supabase schema + migrations + seed + lib | ✅ |
| 3 | UI primitives (Button, Spinner, Badge, Input, Textarea, Modal, EmptyState, Toast, Skeleton) | ✅ |
| 4 | Calendar shell (MonthNavigator, CrewLegend, SlotBadge, DayCell, CalendarGrid) | ✅ |
| 5 | Live data (useCrews, useSlots with Realtime, loading/empty/error states) | ✅ |
| 6 | Booking flow (useBooking with race protection, BookingModal, Toaster) | ✅ |
| 7 | Booking notification email (Edge Function + Resend) | ✅ |
| 8 | Admin panel (Settings, PropertyManager, CrewManager, BookingsList, SlotManager) | ✅ |
| 9 | Polish + demo prep | 🔜 |

---

*Built with React, Supabase, and TailwindCSS.*

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
│   │   ├── 001_initial_schema.sql        # Core tables: crews, slots, properties, settings, audit_log
│   │   ├── 002_triggers.sql              # updated_at, audit log, booked_at triggers
│   │   └── 003_google_calendar_fields.sql # Adds google_event_id & google_meet_link to slots
│   ├── functions/
│   │   ├── create-calendar-event/
│   │   │   └── index.ts                  # Edge Function — creates Google Calendar event + Meet link
│   │   └── notify-booking/
│   │       └── index.ts                  # Edge Function — sends email notification + customer confirmation
│   └── seed.sql                          # Demo data: 3 crews + time slots for 5 weeks
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
├── agents/
│   └── GC-SYNC.md                     # Google Calendar sync architecture documentation
├── generate-token.js                  # One-time script to generate Google OAuth refresh token
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

> **Note:** If you want Google Calendar integration, also run **`supabase/migrations/003_google_calendar_fields.sql`** after the initial setup (see the [Google Calendar section](#google-calendar--google-meet-integration) for full instructions).

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

## Google Calendar & Google Meet Integration

When someone books a slot, the system automatically:
- Creates a Google Calendar event on **your** business calendar
- Generates a **Google Meet** video link
- Sends a calendar invite to the customer (if they use Gmail)
- Sends a confirmation email to both you and the customer with the Meet link

> **Important:** This is a **single-owner calendar** setup. Only one Google account (the business owner's) is connected. Customers do NOT log in with Google or connect their own calendars.

### Architecture

```txt
Customer books a slot
        ↓
React frontend calls Edge Function
        ↓
create-calendar-event Edge Function runs
        ↓
Refreshes Google access token using stored refresh_token
        ↓
Creates Calendar event + Google Meet link
        ↓
Saves event ID & Meet link to the slots table
        ↓
notify-booking Edge Function sends emails
        ↓
Admin gets notification email (with Meet link)
        ↓
Customer gets confirmation email (with "Open Meet Link" button)
```

---

### Step 1: Create a Google Cloud Project

1. Go to **[Google Cloud Console](https://console.cloud.google.com)** — sign in with the Google account that owns the business calendar (the one where you want events to appear)
2. Click the project dropdown at the top of the page (next to the "Google Cloud" logo)
3. Click **New Project**
4. Give it a name like `Reliance-Scheduling` (or anything you'll recognize)
5. Click **Create**
6. Wait for the project to be created, then make sure it is selected in the project dropdown

---

### Step 2: Enable the Google Calendar API

1. In your Google Cloud project, go to **APIs & Services → Library** (use the left sidebar menu)
2. Search for **"Google Calendar API"**
3. Click on **Google Calendar API**
4. Click **Enable**

---

### Step 3: Configure the OAuth Consent Screen

Before you can create credentials, you need to set up the OAuth consent screen:

1. Go to **APIs & Services → OAuth consent screen** (left sidebar)
2. Select **External** user type and click **Create**
3. Fill in the required fields:
   - **App name**: `Reliance Scheduling`
   - **User support email**: your email address
   - **Developer contact information**: your email address
4. Click **Save and Continue**
5. On the **Scopes** page, click **Add or Remove Scopes**, search for `../auth/calendar`, select the **.../auth/calendar** scope, click **Add**, then **Update**, then **Save and Continue**
6. On the **Test users** page, click **Save and Continue** (you don't need to add test users — you'll use your own account)
7. Review and click **Back to Dashboard**

> If you see **"Publishing status: Testing"** — that is fine. Since only you (the calendar owner) will authorize this app, testing mode is sufficient.

---

### Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials** (top bar) → **OAuth 2.0 Client ID**
3. For **Application type**, select **Desktop app**
4. For **Name**, enter `Calendar Sync Token Generator`
5. Click **Create**
6. A popup appears with your **Client ID** and **Client Secret**
7. **Copy both values** — you'll need them in the next step
8. Click **OK**

> ⚠️ Keep your Client Secret private. Never commit it to Git or share it publicly.

---

### Step 5: Generate a Refresh Token

> This is a **one-time** setup step. You only do this once — the refresh token is permanent unless you manually revoke it.

The project includes a script at `generate-token.js` that walks you through the OAuth flow:

1. **Open `generate-token.js`** in your editor and replace the placeholder values at the top of the file:

```js
const CLIENT_ID = "paste-your-client-id-here";
const CLIENT_SECRET = "paste-your-client-secret-here";
```

2. **Run the script** from your terminal:

```bash
node generate-token.js
```

3. **Open the URL** that is printed in the terminal — it will open in your browser
4. **Sign in** with the Google account that owns your business calendar
5. **Click "Continue"** on the consent screen (it may warn that the app isn't verified — click "Advanced" → "Go to Reliance Scheduling (unsafe)" since this is your own app)
6. **You'll be redirected** to `http://localhost:5173/?code=XXXX...` (the page will show an error — that's expected)
7. **Copy the entire `code=XXXX...`** value from the browser's address bar (just the code parameter, not the whole URL)
8. **Paste it** into the terminal prompt and press Enter
9. The script will display your credentials:

```
SUCCESS! Generated Google OAuth Credentials:

GOOGLE_CLIENT_ID:      734445718565-xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET:  GOCSPX-xxxx
GOOGLE_REFRESH_TOKEN:  1//0goxxxx

supabase secrets set GOOGLE_CLIENT_ID="..." GOOGLE_CLIENT_SECRET="..." GOOGLE_REFRESH_TOKEN="..."
```

10. **Keep this terminal open** — you'll use these values in Step 7

---

### Step 6: Add Google Calendar Columns to the Database

1. Open your Supabase project's **SQL Editor**
2. Run the contents of **`supabase/migrations/003_google_calendar_fields.sql`**:

```sql
ALTER TABLE slots 
ADD COLUMN IF NOT EXISTS google_event_id text,
ADD COLUMN IF NOT EXISTS google_meet_link text;
```

3. Verify the columns were added in **Supabase Dashboard → Table Editor → `slots`** — you should see `google_event_id` and `google_meet_link` columns

---

### Step 7: Set Supabase Secrets

Now configure the Edge Functions with the Google credentials:

```bash
supabase secrets set GOOGLE_CLIENT_ID="paste-your-client-id" GOOGLE_CLIENT_SECRET="paste-your-client-secret" GOOGLE_REFRESH_TOKEN="paste-your-refresh-token"
```

If you still have the terminal from Step 5 open, you can copy-paste the full command that was printed.

Also set the Supabase connection secrets (if not already set):

```bash
supabase secrets set SUPABASE_URL="https://rnkqsnbildlpfzftfwpy.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

> Find your `SERVICE_ROLE_KEY` in **Supabase Dashboard → Project Settings → API** — it's under the `service_role` section. Keep this key private — it has full admin access to your database.

---

### Step 8: Deploy the Edge Functions

Deploy both Edge Functions to Supabase:

```bash
supabase functions deploy create-calendar-event
supabase functions deploy notify-booking
```

Verify they deployed successfully:

```bash
supabase functions list
```

You should see both functions in the list with status "ACTIVE".

---

### What Happens When a Booking is Made

1. Customer fills in the booking form and clicks **Confirm Booking**
2. The slot is saved in the database with status `booked`
3. The frontend calls `create-calendar-event` Edge Function:
   - It uses the stored refresh token to get a short-lived access token
   - Creates a Google Calendar event on your primary calendar
   - Generates a Google Meet link
   - Saves the event ID and Meet link to the `slots` table
4. The frontend then calls `notify-booking` Edge Function:
   - Sends an **admin notification** email with booking details + Meet link
   - Sends a **customer confirmation** email with a prominent "Open Meet Link" button

---

### How to Verify It Works

1. Run the app with `npm run dev`
2. Book a test slot through the public calendar
3. Check your **Google Calendar** — a new event should appear
4. Check your **email inbox** — you should receive a notification email with the Meet link
5. Check the **customer's email inbox** — they should receive a confirmation with the "Open Meet Link" button
6. In **Supabase Dashboard → Table Editor → `slots`**, the booked slot should have `google_event_id` and `google_meet_link` populated

---

### Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| `invalid_grant` error | Refresh token was revoked | Generate a new refresh token (repeat Step 5) |
| No Meet link in response | `conferenceDataVersion=1` missing | Check `create-calendar-event/index.ts` has `?conferenceDataVersion=1` in the URL |
| Calendar event not created | Google secrets not set correctly | Run `supabase secrets list` to verify `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` are set |
| "failed to refresh Google credentials" | Expired access / wrong credentials | Re-run Step 5 to generate a fresh refresh token |
| Customer not receiving email | `meetLink` is null (Calendar event failed first) | Check the Edge Function logs in Supabase Dashboard |
| `missing required fields` error | Payload doesn't include all fields | Ensure `slotId`, `customerEmail`, `startTime`, `endTime`, `title` are all present |

### Regenerating the Refresh Token

If you ever need to regenerate the refresh token (e.g., you change Google accounts or the token is revoked):

1. Go to **[Google Account Permissions](https://myaccount.google.com/permissions)** and remove access for your app
2. Open `generate-token.js`, make sure your CLIENT_ID and CLIENT_SECRET are still current
3. Run `node generate-token.js` again and follow the same steps
4. Update the Supabase secret with the new refresh token:

```bash
supabase secrets set GOOGLE_REFRESH_TOKEN="new-refresh-token"
```

> Under normal operation, you never need to do this. The refresh token works indefinitely.

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

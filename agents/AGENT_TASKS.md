# Reliance Scheduler — Agent Task Plan

> Prompt each task to the agent one at a time, in order.  
> For implementation details refer to: `RELIANCE_SCHEDULER_SPEC.md` and `RELIANCE_SCHEDULER_DESIGN.md`  
> Admin panel and auth are out of scope for this build.

---

## TASK 1 — Project Scaffold

- Create Vite + React project
- Install all dependencies listed in the spec
- Configure Tailwind with the design token values from the design doc
- Set up CSS variables and globals.css
- Import DM Sans font in index.html
- Create the full folder structure as defined in the spec (empty folders with .gitkeep)
- Create .env.example with placeholder keys
- Verify: `npm run dev` starts with no errors, blank white page

---

## TASK 2 — Supabase & Database

- Create Supabase project (manual step — human does this)
- Run migration 001_initial_schema.sql in Supabase SQL editor
- Run migration 002_triggers.sql in Supabase SQL editor
- Run seed.sql to populate crews and slots
- Enable Realtime on the slots table in Supabase dashboard
- Create .env.local with real VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Create src/lib/supabase.js
- Create src/lib/dateUtils.js
- Create src/constants/slotStatus.js
- Verify: query slots table returns seeded rows

---

## TASK 3 — UI Primitives

- Build src/components/ui/button/Button.jsx — variants: primary, ghost
- Build src/components/ui/spinner/Spinner.jsx
- Build src/components/ui/badge/Badge.jsx — status-aware coloring
- Build src/components/ui/input/Input.jsx — label + error state
- Build src/components/ui/input/Textarea.jsx — label + error state
- Build src/components/ui/modal/Modal.jsx — backdrop, close on Escape, close on outside click
- Build src/components/ui/empty-state/EmptyState.jsx
- Build src/components/ui/toast/toastConfig.js — success and error presets
- Add index.js re-export in each subfolder
- Verify: all components render without errors when imported

---

## TASK 4 — Calendar Shell (Static)

- Build src/store/calendarStore.js with Zustand
- Build src/hooks/useCalendarMonth.js
- Build src/components/calendar/MonthNavigator.jsx
- Build src/components/calendar/CrewLegend.jsx
- Build src/components/calendar/SlotBadge.jsx — each box shows time range on top line, crew name on second line, colored by status. Use mock data with start_time and end_time fields
- Build src/components/calendar/DayCell.jsx — renders a stacked list of SlotBadge boxes sorted by start_time ascending. Use mock data
- Build src/components/calendar/CalendarGrid.jsx using mock data
- Build src/pages/PublicCalendar.jsx wiring all calendar components together
- Set up App.jsx and routing with react-router-dom
- Verify: calendar grid renders with multiple time slot boxes per day, sorted by time, month navigation works, mobile layout looks correct

---

## TASK 5 — Live Data

- Build src/hooks/useCrews.js — fetch crews from Supabase
- Build src/hooks/useSlots.js — fetch slots for current month + Realtime subscription
- Replace all mock data in PublicCalendar.jsx with real hooks
- Group slots by date and pass correct arrays to each DayCell
- Show Spinner while loading
- Show EmptyState if no slots for the month
- Add "● Live" badge to the header — green dot, pulses, turns amber on disconnect
- Verify: open two browser tabs, manually update a slot in Supabase dashboard, confirm both tabs reflect the change without refresh

---

## TASK 6 — Booking Flow

- Build src/hooks/useBooking.js with race condition protection
- Build src/components/booking/BookingModal.jsx — pre-filled header shows date, time range (e.g. "Thu May 22 · 8:00 – 10:00 AM"), and crew name. Form fields: Property Name, Contact Name, Email, Notes
- Wire SlotBadge click → calendarStore.openModal(slot) — slot object must include date, start_time, end_time, crew name
- Wire BookingModal to calendarStore selectedSlot and closeModal
- Add Toaster to App.jsx
- Verify: click an available time slot → modal opens showing correct date and time → fill form → submit → that specific time slot turns red on both tabs simultaneously → success toast shown
- Verify: simulate race condition (manually book slot in Supabase mid-flow) → error toast shown, modal stays open

---

## TASK 7 — Booking Notification Email

> This is the "Google Calendar invite hits irvine@reliance.services automatically" step from the demo flow. We use Resend (free tier) via a Supabase Edge Function — no Google OAuth complexity, still delivers a professional calendar-style email to the right inbox.

- Create a Supabase Edge Function: `supabase/functions/notify-booking/index.ts`
- The function receives: slot date, crew name, property name, contact name, contact email
- The function reads `notification_email` from the `settings` table at runtime — do not hardcode the email address
- It sends an email to that address using the Resend API with subject: `New Booking — [Property Name] on [Date]`
- Email body includes: date, crew assigned, property, booked by name and email, notes
- Set `RESEND_API_KEY` as a Supabase secret
- Call this Edge Function from useBooking.js after a successful booking update — fire and forget (do not block the UI on it)
- Verify: complete a booking → check `monirhasnan@gmail.com` inbox → email arrives within 30 seconds

---

## TASK 8 — Polish & Demo Prep

- Add Reliance Building Services wordmark to header
- Add subtitle: "Select a green slot to schedule your crew"
- Handle Supabase connection error — show error banner, do not crash
- Ensure all touch targets are minimum 44px height on mobile
- Test full booking flow on a real mobile device or DevTools mobile view
- Run `vite build` — fix any errors until build is clean
- Deploy to Vercel or Netlify and get a shareable URL
- Verify full demo flow end to end: open on phone → pick green slot → fill form → confirm → slot vanishes on laptop simultaneously → email arrives at irvine@reliance.services

---

*Complete tasks in order. Do not proceed to the next task until the current one is verified.*
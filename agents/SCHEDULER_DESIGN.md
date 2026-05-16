# Reliance Scheduler — Design System & UI Specification

> **Aesthetic Direction:** Google Calendar clarity meets shadcn/ui precision  
> **Theme:** Light, minimal, professional — white canvas, subtle borders, purposeful color  
> **Feel:** A tool that respects the user's intelligence. Nothing decorative that isn't functional.

---

## 1. Design Principles

1. **White space is structure** — padding and margin do the layout work, not lines and dividers
2. **Color carries meaning** — green = go, red = stop, gray = unavailable. Never decorative
3. **Borders are whispers** — `1px` only, always `border-zinc-200`, never heavy or dark
4. **Radius is consistent** — one border-radius scale, used everywhere the same way
5. **Typography is the UI** — size and weight hierarchy replaces icons wherever possible

---

## 2. Color System

All colors defined as CSS variables in `globals.css`. Tailwind config maps to these.

```css
:root {
  /* --- Base --- */
  --background:       #ffffff;
  --surface:          #f8f9fa;        /* card backgrounds, sidebar */
  --surface-hover:    #f1f3f4;        /* hover state on rows, cells */
  --border:           #e2e8f0;        /* all borders */
  --border-focus:     #94a3b8;        /* input focus ring */

  /* --- Text --- */
  --text-primary:     #0f172a;        /* headings, labels */
  --text-secondary:   #64748b;        /* subtext, meta info */
  --text-muted:       #94a3b8;        /* disabled, placeholder */
  --text-inverse:     #ffffff;        /* text on colored backgrounds */

  /* --- Brand --- */
  --brand:            #1a56db;        /* primary action, today circle — Google Calendar blue */
  --brand-light:      #eff6ff;        /* brand tint for backgrounds */
  --brand-hover:      #1e40af;        /* brand on hover */

  /* --- Slot Status Colors --- */

  /* Available */
  --available-bg:     #dcfce7;        /* green-100 */
  --available-border: #86efac;        /* green-300 */
  --available-text:   #15803d;        /* green-700 */
  --available-hover:  #bbf7d0;        /* green-200 — on hover */
  --available-dot:    #16a34a;        /* green-600 — crew dot */

  /* Booked */
  --booked-bg:        #fee2e2;        /* red-100 */
  --booked-border:    #fca5a5;        /* red-300 */
  --booked-text:      #b91c1c;        /* red-700 */
  --booked-dot:       #dc2626;        /* red-600 */

  /* Blocked / Unavailable */
  --blocked-bg:       #f1f5f9;        /* slate-100 */
  --blocked-border:   #cbd5e1;        /* slate-300 */
  --blocked-text:     #94a3b8;        /* slate-400 */
  --blocked-dot:      #cbd5e1;        /* slate-300 */

  /* --- UI Chrome --- */
  --shadow-sm:        0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md:        0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --shadow-modal:     0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.08);

  /* --- Radius --- */
  --radius-sm:        4px;            /* badges, small tags */
  --radius-md:        8px;            /* cards, inputs, slot boxes */
  --radius-lg:        12px;           /* modals, panels */
  --radius-full:      9999px;         /* today dot, live badge */
}
```

### Color Usage Rules

| Element | Color |
|---|---|
| Page background | `--background` (#ffffff) |
| Calendar card surface | `--surface` (#f8f9fa) |
| Day cell background | `--background` (white) |
| Day cell hover | `--surface-hover` (#f1f3f4) |
| Weekend day cell | `--surface` (very subtle tint) |
| Today date circle | `--brand` (solid blue circle, white number) |
| Past dates (number) | `--text-muted` |
| Available slot box | `--available-bg` bg, `--available-border` border |
| Booked slot box | `--booked-bg` bg, `--booked-border` border |
| Blocked slot box | `--blocked-bg` bg, `--blocked-border` border |
| Primary button | `--brand` bg, white text |
| Cancel/ghost button | white bg, `--border` border |
| All borders | `--border` (#e2e8f0) |

---

## 3. Typography

### Font

```
Google Font: "DM Sans"
Weights: 400 (regular), 500 (medium), 600 (semibold)
```

Import in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

Set in `globals.css`:
```css
body {
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  background: var(--background);
  -webkit-font-smoothing: antialiased;
}
```

### Type Scale

| Use Case | Size | Weight | Color |
|---|---|---|---|
| Page title | `text-xl` / 20px | 600 | `--text-primary` |
| Month/year label | `text-base` / 16px | 600 | `--text-primary` |
| Day of week header (Mon, Tue…) | `text-xs` / 11px | 500 | `--text-secondary` — UPPERCASE |
| Day number (regular) | `text-sm` / 14px | 400 | `--text-primary` |
| Day number (today) | `text-sm` / 14px | 600 | white (inside blue circle) |
| Day number (past) | `text-sm` / 14px | 400 | `--text-muted` |
| Slot box crew name | `text-xs` / 12px | 500 | status text color |
| Slot box label | `text-xs` / 11px | 400 | status text color |
| Modal heading | `text-base` / 16px | 600 | `--text-primary` |
| Modal subtext | `text-sm` / 14px | 400 | `--text-secondary` |
| Input label | `text-sm` / 13px | 500 | `--text-primary` |
| Button text | `text-sm` / 14px | 500 | — |
| Toast text | `text-sm` / 14px | 400 | — |

---

## 4. Spacing System

Use Tailwind's default spacing scale. Key values used in this project:

| Token | Value | Used For |
|---|---|---|
| `p-1` | 4px | Slot box inner padding |
| `p-2` | 8px | Small elements |
| `p-3` | 12px | Day cell padding |
| `p-4` | 16px | Card padding, modal body |
| `p-6` | 24px | Modal padding |
| `gap-1` | 4px | Between slot boxes in a day cell |
| `gap-px` | 1px | Grid gap between day cells |
| `mb-6` | 24px | Section spacing |

---

## 5. Border Radius

| Token | Value | Used For |
|---|---|---|
| `rounded` / `rounded-md` | 6–8px | Slot boxes, inputs, buttons, cards |
| `rounded-lg` | 12px | Modal, admin panels |
| `rounded-full` | 9999px | Today date circle, live indicator dot, crew color dot |
| `rounded-sm` | 4px | Badges (status labels only) |

**Rule:** Slot boxes use `rounded-md` (8px). Everything nested inside a rounded container gets `rounded-sm` or none.

---

## 6. Component Specifications

> **Folder rule:** All reusable UI primitives live in `src/components/ui/` with their own subfolder and `index.js` re-export. Feature components (calendar, booking, admin) import from these. Example: `import { Modal } from '@/components/ui/modal'`

---

### 6.1 Page Header

```
┌─────────────────────────────────────────────────────┐
│  📅 Reliance Scheduling              ● Live          │
│  Irvine Properties — May 2026                        │
└─────────────────────────────────────────────────────┘
```

- Background: `--background` (white)
- Bottom border: `1px solid var(--border)`
- Height: `64px`
- Left: Logo/wordmark in `--text-primary`, `font-semibold`, `text-base`
- Right: Live badge (see section 6.8)
- Subtitle below title: `text-sm`, `--text-secondary`
- No box shadow — the bottom border is enough

```css
.header {
  height: 64px;
  padding: 0 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

---

### 6.2 Month Navigator

```
          ‹    May 2026    ›
               [Today]
```

- Centered layout
- `‹` and `›` are `lucide-react` `ChevronLeft` / `ChevronRight` icons
- Icon buttons: `w-8 h-8`, `rounded-md`, hover `--surface-hover`, no visible border until hover
- Month label: `text-base font-semibold text-primary`
- "Today" button: ghost style — `text-sm text-brand`, underline on hover, resets calendar to current month
- Disabled left arrow: `opacity-30 pointer-events-none` when on current month

---

### 6.3 Day-of-Week Header Row

```
  SUN    MON    TUE    WED    THU    FRI    SAT
```

- `text-xs font-medium text-secondary tracking-wide uppercase`
- 7 equal columns matching the calendar grid
- `py-2`, no background, no border
- Subtle `border-b border-border` below this row

---

### 6.4 Calendar Grid

- 7-column CSS grid with `gap-px` (1px gap between cells — Google Calendar style)
- Background of the grid container: `--border` (so the 1px gap shows as a grid line)
- Each cell sits on top of this background, giving the illusion of borders without actual borders

```css
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: var(--border);   /* gap color = border color */
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.day-cell {
  background-color: var(--background);
  min-height: 120px;                 /* desktop */
  padding: 8px;
  position: relative;
}

/* Mobile */
@media (max-width: 640px) {
  .day-cell { min-height: 80px; padding: 4px; }
}
```

---

### 6.5 Day Cell States

**Normal day:**
- White background
- Day number top-left, `text-sm text-primary`

**Today:**
- Day number wrapped in a filled circle: `w-7 h-7 rounded-full bg-brand text-inverse font-semibold flex items-center justify-center text-sm`

**Past day:**
- Day number: `text-muted`
- Slot boxes still render but are not clickable (show blocked style regardless of actual status)
- Cell background: unchanged (white) — don't tint past days, it's distracting

**Weekend day:**
- Day cell background: `--surface` (#f8f9fa) — very subtle, just barely off-white
- Day number: `text-secondary`

**Padding cell (before month starts):**
- Empty cell, white background, no content
- Do not show day number

**Hover (future available days):**
- `background: var(--surface-hover)` on the cell — not the slot box

---

### 6.6 Slot Box (The Core Component)

This is the most important component. Each crew's slot for a given day is a distinct box.

```
┌─────────────────────┐
│ ●  Team Alpha       │
│    Available        │
└─────────────────────┘
```

**Structure:**
```jsx
<div className="slot-box slot-available">
  <span className="slot-dot" />
  <div className="slot-content">
    <span className="slot-crew">Team Alpha</span>
    <span className="slot-label">Available</span>
  </div>
</div>
```

**CSS:**
```css
.slot-box {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 5px 7px;
  border-radius: 6px;               /* rounded-md */
  border: 1px solid;
  cursor: pointer;
  transition: background-color 200ms ease, opacity 200ms ease;
  margin-bottom: 3px;
  user-select: none;
}

/* Available */
.slot-available {
  background: var(--available-bg);
  border-color: var(--available-border);
  color: var(--available-text);
}
.slot-available:hover {
  background: var(--available-hover);
  box-shadow: var(--shadow-sm);
}

/* Booked */
.slot-booked {
  background: var(--booked-bg);
  border-color: var(--booked-border);
  color: var(--booked-text);
  cursor: not-allowed;
  opacity: 0.85;
}

/* Blocked */
.slot-blocked {
  background: var(--blocked-bg);
  border-color: var(--blocked-border);
  color: var(--blocked-text);
  cursor: not-allowed;
}

/* Dot */
.slot-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 3px;                  /* vertical align with first text line */
}
.slot-available .slot-dot  { background: var(--available-dot); }
.slot-booked .slot-dot     { background: var(--booked-dot); }
.slot-blocked .slot-dot    { background: var(--blocked-dot); }

/* Text */
.slot-crew  { display: block; font-size: 11px; font-weight: 500; line-height: 1.3; }
.slot-label { display: block; font-size: 10px; font-weight: 400; opacity: 0.8; }
```

**On mobile:** Hide `.slot-label` (just show dot + crew name). Reduce padding to `4px 6px`.

---

### 6.7 Booking Modal

```
┌────────────────────────────────────┐
│ Book a Crew                    ✕   │
│ ─────────────────────────────────  │
│ Thursday, May 22, 2026             │
│ ● Team Alpha                       │
│                                    │
│ Property Name          *           │
│ ┌──────────────────────────────┐   │
│ │ 1800 Main St Irvine          │   │
│ └──────────────────────────────┘   │
│                                    │
│ Contact Name           *           │
│ ┌──────────────────────────────┐   │
│ │                              │   │
│ └──────────────────────────────┘   │
│                                    │
│ Email                  *           │
│ ┌──────────────────────────────┐   │
│ └──────────────────────────────┘   │
│                                    │
│ Notes (optional)                   │
│ ┌──────────────────────────────┐   │
│ │                              │   │
│ └──────────────────────────────┘   │
│                                    │
│ [   Cancel   ]  [ Confirm Booking ]│
└────────────────────────────────────┘
```

**Backdrop:** `rgba(0, 0, 0, 0.4)` fixed, full-screen, `backdrop-blur: 2px`

**Modal card:**
- `bg-white rounded-lg` (12px radius)
- `shadow-modal`
- `max-w-md w-full mx-4`
- `p-6`

**Header:**
- Left: "Book a Crew" — `text-base font-semibold text-primary`
- Right: X button — `w-8 h-8 rounded-md` ghost, `lucide-react X` icon

**Divider:** `1px solid var(--border)`, `my-4`

**Date + crew info block:**
- Date: `text-sm font-medium text-primary`
- Crew: small dot + crew name in `text-sm text-secondary`
- `mb-5`

**Input fields:**
```css
.input-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  display: block;
}

.input {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 6px;               /* rounded-md */
  font-size: 14px;
  color: var(--text-primary);
  background: var(--background);
  transition: border-color 150ms ease, box-shadow 150ms ease;
  outline: none;
}

.input:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.12);
}

.input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
}

.input-error-msg {
  font-size: 12px;
  color: #ef4444;
  margin-top: 3px;
}
```

Textarea (Notes): same as input but `height: 72px`, `padding: 8px 12px`, `resize: none`

**Buttons:**
```css
/* Primary — Confirm Booking */
.btn-primary {
  height: 36px;
  padding: 0 16px;
  background: var(--brand);
  color: #fff;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 150ms ease;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-primary:hover  { background: var(--brand-hover); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

/* Ghost — Cancel */
.btn-ghost {
  height: 36px;
  padding: 0 16px;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms ease;
}
.btn-ghost:hover { background: var(--surface-hover); }
```

Button row: `display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px;`

**Loading state on confirm button:**
- Replace text with `<Spinner size="16" /> Booking...`
- Spinner: `border-2 border-white/30 border-t-white w-4 h-4 rounded-full animate-spin`

---

### 6.8 Live Badge

```
  ● Live
```

```css
.live-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;             /* green-500 */
  animation: pulse-live 2s infinite;
}

@keyframes pulse-live {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.85); }
}
```

When realtime disconnects: dot turns `#f59e0b` (amber), label changes to "Reconnecting…"

---

### 6.9 Toast Notifications

Use `react-hot-toast` with custom styles:

```js
toast.success('Booking confirmed!', {
  style: {
    background: '#fff',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
    padding: '10px 14px',
  },
  iconTheme: {
    primary: '#16a34a',
    secondary: '#fff',
  },
  duration: 3000,
  position: 'top-center',
})

toast.error('This slot was just taken. Please choose another.', {
  style: { /* same base */ },
  iconTheme: { primary: '#dc2626', secondary: '#fff' },
  duration: 4000,
})
```

---

### 6.10 Crew Legend

Sits below the month navigator, above the calendar grid.

```
  ● Team Alpha    ● Team Beta    ● Team Gamma
```

- `display: flex; gap: 16px; flex-wrap: wrap`
- Each item: `flex items-center gap-1.5 text-xs text-secondary`
- Dot: `w-2 h-2 rounded-full` in crew's assigned color
- Crew colors (assign in seed data):
  - Team Alpha: `#16a34a` (green-600)
  - Team Beta: `#2563eb` (blue-600)
  - Team Gamma: `#d97706` (amber-600)

> These colors are only for the crew dot in the legend and the dot inside the slot box. The slot box background color is always determined by status (green/red/gray), not crew.

---

### 6.11 Admin Panel

**Tab bar:**
```css
.tab-bar {
  display: flex;
  border-bottom: 1px solid var(--border);
  gap: 0;
  margin-bottom: 24px;
}

.tab {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.tab.active {
  color: var(--brand);
  border-bottom-color: var(--brand);
}
```

**Admin slot card (SlotManager list item):**
```
┌────────────────────────────────────────────────┐
│  Thu May 22   ● Team Alpha   🟢 Available   🗑  │
└────────────────────────────────────────────────┘
```
- `bg-surface border border-border rounded-md p-3 flex items-center justify-content-between`
- Status badge: same slot box style but inline/smaller
- Delete icon: `lucide-react Trash2`, `text-muted hover:text-red-500`, `w-4 h-4`

**Form inputs in admin:** Same input styles as booking modal.

---

## 7. Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| `< 640px` (mobile) | Day cell min-height 80px, hide slot label text (dot + crew name only), modal full-width with `mx-4` |
| `640px–1024px` (tablet) | Full calendar grid, normal slot boxes |
| `> 1024px` (desktop) | Max calendar width `1100px`, centered with `mx-auto px-6` |

**Mobile slot box (condensed):**
```css
@media (max-width: 640px) {
  .slot-label  { display: none; }
  .slot-crew   { font-size: 10px; }
  .slot-box    { padding: 3px 5px; }
  .slot-dot    { width: 6px; height: 6px; }
}
```

---

## 8. Empty & Error States

**No slots this month:**
```
        📅
   No availability
  for this month.
  Contact Reliance for
  custom scheduling.
```
- Centered in the calendar area
- `text-secondary text-sm`
- Icon: `lucide-react CalendarX2`, `w-10 h-10 text-muted`

**Connection error banner:**
```
┌─────────────────────────────────────────────────────────┐
│  ⚠  Unable to load schedule. Please refresh the page.  │
└─────────────────────────────────────────────────────────┘
```
- Sits below header, above calendar
- `bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-2 rounded-md`

**Realtime paused:**
- Live badge dot turns amber, text: "Reconnecting…"
- No banner — too disruptive for a temporary blip

---

## 9. Tailwind Config

```js
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1a56db',
          hover:   '#1e40af',
          light:   '#eff6ff',
        },
        available: {
          bg:     '#dcfce7',
          border: '#86efac',
          text:   '#15803d',
          hover:  '#bbf7d0',
          dot:    '#16a34a',
        },
        booked: {
          bg:     '#fee2e2',
          border: '#fca5a5',
          text:   '#b91c1c',
          dot:    '#dc2626',
        },
        blocked: {
          bg:     '#f1f5f9',
          border: '#cbd5e1',
          text:   '#94a3b8',
          dot:    '#cbd5e1',
        },
        surface: {
          DEFAULT: '#f8f9fa',
          hover:   '#f1f3f4',
        },
        border: {
          DEFAULT: '#e2e8f0',
          focus:   '#94a3b8',
        },
        text: {
          primary:   '#0f172a',
          secondary: '#64748b',
          muted:     '#94a3b8',
        },
      },
      borderRadius: {
        DEFAULT: '6px',
        sm:  '4px',
        md:  '8px',
        lg:  '12px',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        sm:    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md:    '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        modal: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
}
```

---

## 10. Visual Hierarchy Summary

```
PAGE
├── Header bar (white, bottom-border)
│   ├── Logo + title (left)
│   └── Live badge (right)
│
├── Calendar section (white, max-w centered)
│   ├── Month navigator (centered)
│   ├── Crew legend (left-aligned, small)
│   ├── Day-of-week row (gray uppercase labels)
│   └── Calendar grid (gap-px creates subtle grid lines)
│       └── Day cells (white bg)
│           ├── Day number (top-left)
│           └── Slot boxes (stacked, colored by status)
│               ├── ● dot (crew color)
│               ├── Crew name (11px medium)
│               └── Status label (10px regular, faded)
│
└── Booking Modal (when slot clicked)
    ├── Header (title + close button)
    ├── Divider
    ├── Date + crew info
    ├── Form fields (inputs with labels)
    └── Action buttons (cancel + confirm)
```

---

## 11. Do's and Don'ts

### ✅ Do
- Use `gap-px` + container background trick for grid lines — cleaner than borders
- Keep the modal form short — 4 fields max
- Use `cursor: not-allowed` on booked/blocked slots
- Dim past dates with `text-muted` only — don't tint the background
- Keep the header minimal — company name + live badge, nothing else

### ❌ Don't
- Add drop shadows to day cells — use the gap-line approach instead
- Use color for decoration — every color must mean something (status or brand)
- Add hover effects to booked/blocked slots — they're not interactive
- Use more than 2 font weights in any single component
- Add any border-radius to the calendar grid container that would clip the cell corners unevenly — use `overflow: hidden` on the grid wrapper instead
- Make the modal too wide — `max-w-md` is the limit
- Add striped rows or zebra patterns — this is a calendar, not a table

---

*End of design spec. Give this file to the agent along with RELIANCE_SCHEDULER_SPEC.md at the start of Sprint 2 (Calendar UI). UI primitives (Modal, Button, Badge, Spinner, Input, Textarea, EmptyState) must each live in their own subfolder under `src/components/ui/`.*

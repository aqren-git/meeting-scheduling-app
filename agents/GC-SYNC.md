# Google Calendar + Google Meet Integration
# React + Supabase Only
# Single Owner Calendar Architecture
# AI-Agent Friendly Documentation

This implementation is for:

```txt
ONE business owner calendar
```

NOT multi-user calendar sync.

Customers:

- do NOT login with Google
- do NOT connect calendars
- only receive booking emails + Meet links

The system automatically:

- creates Google Calendar events
- generates Google Meet links
- sends calendar invite emails
- syncs bookings to YOUR calendar

---

# FINAL ARCHITECTURE

```txt
Customer books meeting
        ↓
React frontend
        ↓
Supabase booking created
        ↓
Supabase Edge Function triggered
        ↓
Google Calendar event created
        ↓
Google Meet link generated
        ↓
Google sends invite email automatically
        ↓
Meeting added to YOUR calendar
```

---

# STACK

Frontend:

- React
- TypeScript
- Supabase JS

Backend:

- Supabase Edge Functions

External APIs:

- Google Calendar API

---

# IMPORTANT

You DO NOT need:

```txt
- Google login for customers
- Multi-user OAuth
- Complex auth systems
- Express backend
- Separate Node server
```

You ONLY connect:

```txt
YOUR Google account ONCE
```

Then all future bookings automatically sync.

---

# GOOGLE CLOUD SETUP

# 1. Create Google Cloud Project

Open:

https://console.cloud.google.com

---

# 2. Enable API

Enable:

```txt
Google Calendar API
```

---

# 3. Configure OAuth Consent Screen

Required:

- app name
- support email
- authorized domain

---

# 4. Create OAuth Credentials

Type:

```txt
OAuth 2.0 Client ID
```

Application Type:

```txt
Desktop App
```

This is ONLY for generating refresh token once.

---

# INSTALL GOOGLE APIS LOCALLY

```bash
npm install googleapis
```

---

# GENERATE GOOGLE REFRESH TOKEN

Create:

```txt
generate-token.js
```

---

# generate-token.js

```js
const { google } = require("googleapis");

const oauth2Client =
  new google.auth.OAuth2(
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "http://localhost:3000"
  );

const scopes = [
  "https://www.googleapis.com/auth/calendar",
];

const url =
  oauth2Client.generateAuthUrl({
    access_type: "offline",

    prompt: "consent",

    scope: scopes,
  });

console.log(url);
```

---

# RUN SCRIPT

```bash
node generate-token.js
```

Open generated URL in browser.

Approve access.

Google redirects to:

```txt
http://localhost:3000/?code=XXXX
```

Copy:

```txt
code
```

---

# EXCHANGE CODE FOR REFRESH TOKEN

Replace previous script with:

```js
const { google } = require("googleapis");

const oauth2Client =
  new google.auth.OAuth2(
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "http://localhost:3000"
  );

async function run() {
  const { tokens } =
    await oauth2Client.getToken(
      "PASTE_CODE_HERE"
    );

  console.log(tokens);
}

run();
```

Run:

```bash
node generate-token.js
```

Save:

```txt
refresh_token
```

IMPORTANT:

```txt
This refresh token is permanent
```

unless manually revoked.

You only do this ONCE.

---

# INSTALL SUPABASE CLI

```bash
npm install -g supabase
```

---

# LOGIN TO SUPABASE

```bash
supabase login
```

---

# LINK PROJECT

```bash
supabase link --project-ref YOUR_PROJECT_ID
```

---

# CREATE EDGE FUNCTION

```bash
supabase functions new create-calendar-event
```

---

# SET EDGE FUNCTION SECRETS

```bash
supabase secrets set GOOGLE_CLIENT_ID=xxx

supabase secrets set GOOGLE_CLIENT_SECRET=xxx

supabase secrets set GOOGLE_REFRESH_TOKEN=xxx
```

---

# CREATE CALENDAR EVENT FUNCTION

## supabase/functions/create-calendar-event/index.ts

```ts
import { serve }
  from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const body = await req.json();

  const {
    customerEmail,
    startTime,
    endTime,
    title,
  } = body;

  // refresh access token

  const refreshResponse = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },

      body: new URLSearchParams({
        client_id:
          Deno.env.get(
            "GOOGLE_CLIENT_ID"
          )!,

        client_secret:
          Deno.env.get(
            "GOOGLE_CLIENT_SECRET"
          )!,

        refresh_token:
          Deno.env.get(
            "GOOGLE_REFRESH_TOKEN"
          )!,

        grant_type:
          "refresh_token",
      }),
    }
  );

  const refreshed =
    await refreshResponse.json();

  const accessToken =
    refreshed.access_token;

  // create google calendar event

  const eventResponse = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${accessToken}`,

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        summary: title,

        start: {
          dateTime: startTime,

          timeZone:
            "Asia/Dhaka",
        },

        end: {
          dateTime: endTime,

          timeZone:
            "Asia/Dhaka",
        },

        attendees: [
          {
            email:
              customerEmail,
          },
        ],

        conferenceData: {
          createRequest: {
            requestId:
              crypto.randomUUID(),

            conferenceSolutionKey: {
              type:
                "hangoutsMeet",
            },
          },
        },
      }),
    }
  );

  const event =
    await eventResponse.json();

  return new Response(
    JSON.stringify({
      success: true,

      meetLink:
        event.hangoutLink,

      eventId:
        event.id,
    }),
    {
      headers: {
        "Content-Type":
          "application/json",
      },
    }
  );
});
```

---

# CRITICAL REQUIREMENT

THIS IS REQUIRED:

```txt
conferenceDataVersion=1
```

Without it:

```txt
Google Meet links WILL NOT generate
```

---

# DEPLOY FUNCTION

```bash
supabase functions deploy create-calendar-event
```

---

# FRONTEND INTEGRATION

After booking is created in your app:

```ts
await fetch(
  "https://YOUR_PROJECT.supabase.co/functions/v1/create-calendar-event",
  {
    method: "POST",

    headers: {
      "Content-Type":
        "application/json",
    },

    body: JSON.stringify({
      customerEmail:
        booking.customer_email,

      startTime:
        booking.start_time,

      endTime:
        booking.end_time,

      title:
        "Discovery Call",
    }),
  }
);
```

---

# WHAT HAPPENS AUTOMATICALLY

Google automatically:

✅ creates calendar event  
✅ creates Google Meet link  
✅ sends invite email  
✅ sends calendar attachment  
✅ adds event to your calendar  
✅ adds event to customer calendar (if Gmail user)

---

# CUSTOMER EMAIL EXAMPLE

Customer receives:

```txt
You have been invited to:

Discovery Call

Join with Google Meet:
https://meet.google.com/abc-defg-hij
```

No custom email system required.

---

# OPTIONAL: SAVE MEET LINK TO DATABASE

If needed:

```ts
const data = await response.json();

await supabase
  .from("bookings")
  .update({
    google_meet_link:
      data.meetLink,

    google_event_id:
      data.eventId,
  });
```

---

# OPTIONAL: CHECK AVAILABILITY

Before creating booking:

Use Google FreeBusy API.

Endpoint:

```txt
POST
https://www.googleapis.com/calendar/v3/freeBusy
```

Purpose:

```txt
Prevent double booking
```

---

# OPTIONAL: UPDATE EVENT

Google API:

```txt
PATCH
/calendar/v3/calendars/primary/events/{eventId}
```

Use when booking reschedules.

---

# OPTIONAL: DELETE EVENT

Google API:

```txt
DELETE
/calendar/v3/calendars/primary/events/{eventId}
```

Use when booking canceled.

---

# SECURITY NOTES

# NEVER EXPOSE

```txt
GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN
```

to frontend.

---

# ALWAYS USE

```txt
Supabase Edge Functions
```

for Google API operations.

---

# RECOMMENDED PRODUCTION IMPROVEMENTS

# Add Retry Logic

Google APIs occasionally fail.

Recommended:

```txt
retry 3 times with exponential backoff
```

---

# Add Async Queue Processing

Better architecture:

```txt
Booking Created
      ↓
Queue / Trigger
      ↓
Calendar sync
```

instead of blocking UI.

---

# COMMON ERRORS

# Meet Link Missing

Cause:

```txt
conferenceDataVersion missing
```

Fix:

```txt
conferenceDataVersion=1
```

---

# Missing Refresh Token

Cause:

```txt
prompt=consent missing
```

Fix:

```txt
access_type=offline
prompt=consent
```

---

# invalid_grant

Cause:

```txt
refresh token revoked
```

Fix:

```txt
Generate new refresh token
```

---

# FINAL FLOW

```txt
Customer books
      ↓
Booking saved in Supabase
      ↓
Edge Function triggered
      ↓
Google Calendar event created
      ↓
Meet link generated
      ↓
Google sends invite email
      ↓
Meeting appears in YOUR calendar
```

---

# OFFICIAL DOCS

Google Calendar API:

https://developers.google.com/calendar/api

Google OAuth:

https://developers.google.com/identity/protocols/oauth2

Supabase Edge Functions:

https://supabase.com/docs/guides/functions

---

# END
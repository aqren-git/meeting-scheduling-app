import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function respond(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return respond({ error: 'invalid json' }, 400)
  }

  const { slotId, customerEmail, startTime, endTime, title, description } = body

  if (!slotId || !customerEmail || !startTime || !endTime || !title) {
    return respond({ error: 'missing required fields' }, 400)
  }

  try {
    // 1. Fetch fresh Google OAuth access token
    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
        refresh_token: Deno.env.get('GOOGLE_REFRESH_TOKEN')!,
        grant_type: 'refresh_token',
      }),
    })

    if (!refreshResponse.ok) {
      const errText = await refreshResponse.text()
      console.error('Google token refresh failed:', refreshResponse.status, errText)
      return respond({ error: 'failed to refresh Google credentials' }, 500)
    }

    const refreshed = await refreshResponse.json()
    const accessToken = refreshed.access_token

    // 2. Create calendar event on primary Google Calendar with Google Meet link
    const eventResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: title,
          description: description,
          start: {
            dateTime: startTime,
            timeZone: 'America/Los_Angeles',
          },
          end: {
            dateTime: endTime,
            timeZone: 'America/Los_Angeles',
          },
          attendees: [
            { email: customerEmail }
          ],
          conferenceData: {
            createRequest: {
              requestId: crypto.randomUUID(),
              conferenceSolutionKey: {
                type: 'hangoutsMeet',
              },
            },
          },
        }),
      }
    )

    if (!eventResponse.ok) {
      const errText = await eventResponse.text()
      console.error('Google Calendar event creation failed:', eventResponse.status, errText)
      return respond({ error: 'failed to create calendar event' }, 500)
    }

    const event = await eventResponse.json()
    const meetLink = event.hangoutLink ?? null
    const eventId = event.id

    // 3. Save the event credentials directly back to the slots database row
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error: dbError } = await supabaseClient
      .from('slots')
      .update({
        google_event_id: eventId,
        google_meet_link: meetLink,
      })
      .eq('id', slotId)

    if (dbError) {
      console.error('Failed to update slot with google credentials:', dbError)
      return respond({ error: 'failed to save credentials to database', eventId, meetLink }, 500)
    }

    return respond({ success: true, eventId, meetLink })
  } catch (e) {
    console.error('create-calendar-event exception:', e)
    return respond({ error: e instanceof Error ? e.message : 'Unknown server error' }, 500)
  }
})

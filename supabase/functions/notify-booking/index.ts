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

function buildHtml(date: string, crewName: string, propertyName: string, bookedByName: string, bookedByEmail: string, notes: string | null): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:'DM Sans',system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

          <!-- Logo + Brand -->
          <tr>
            <td style="padding-bottom:20px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:32px;height:32px;background-color:#1a56db;border-radius:8px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:15px;font-weight:600;line-height:32px;">R</span>
                  </td>
                  <td style="padding-left:10px;">
                    <span style="font-size:13px;font-weight:600;color:#0f172a;">Reliance Building Services</span>
                    <br>
                    <span style="font-size:11px;color:#64748b;">Irvine Scheduling \u2014 Booking Confirmation</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;padding:0;box-shadow:0 1px 3px 0 rgba(0,0,0,0.04),0 1px 2px -1px rgba(0,0,0,0.06);">

              <!-- Status badge -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:24px 28px 0 28px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:8px;height:8px;border-radius:50%;background-color:#16a34a;vertical-align:middle;"></td>
                        <td style="padding-left:6px;font-size:12px;font-weight:600;color:#15803d;vertical-align:middle;">BOOKING CONFIRMED</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:16px 28px 0 28px;">
                    <h1 style="margin:0;font-size:18px;font-weight:600;color:#0f172a;line-height:1.3;">
                      ${propertyName}
                    </h1>
                    <p style="margin:4px 0 0 0;font-size:14px;color:#64748b;">
                      A new crew has been scheduled for <strong style="color:#0f172a;">${date}</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:0 28px;height:1px;background-color:#e2e8f0;font-size:1px;line-height:1px;">&nbsp;</td></tr>
              </table>

              <!-- Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 28px;">
                <tr>
                  <td style="padding:6px 0;">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="width:100px;font-size:13px;color:#64748b;vertical-align:top;padding:4px 0;">Date</td>
                        <td style="font-size:13px;font-weight:600;color:#0f172a;padding:4px 0;">${date}</td>
                      </tr>
                      <tr>
                        <td style="width:100px;font-size:13px;color:#64748b;vertical-align:top;padding:4px 0;">Crew Assigned</td>
                        <td style="font-size:13px;font-weight:600;color:#0f172a;padding:4px 0;">
                          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background-color:#16a34a;vertical-align:middle;margin-right:4px;"></span>
                          ${crewName}
                        </td>
                      </tr>
                      <tr>
                        <td style="width:100px;font-size:13px;color:#64748b;vertical-align:top;padding:4px 0;">Property</td>
                        <td style="font-size:13px;font-weight:600;color:#0f172a;padding:4px 0;">${propertyName}</td>
                      </tr>
                      <tr>
                        <td style="width:100px;font-size:13px;color:#64748b;vertical-align:top;padding:4px 0;">Contact</td>
                        <td style="font-size:13px;font-weight:600;color:#0f172a;padding:4px 0;">${bookedByName}</td>
                      </tr>
                      <tr>
                        <td style="width:100px;font-size:13px;color:#64748b;vertical-align:top;padding:4px 0;">Email</td>
                        <td style="font-size:13px;color:#0f172a;padding:4px 0;">
                          <a href="mailto:${bookedByEmail}" style="color:#1a56db;text-decoration:none;font-weight:500;">${bookedByEmail}</a>
                        </td>
                      </tr>
                      ${notes ? `
                      <tr>
                        <td style="width:100px;font-size:13px;color:#64748b;vertical-align:top;padding:4px 0;">Notes</td>
                        <td style="font-size:13px;color:#334155;padding:4px 0;font-style:italic;">${notes}</td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Footer note -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:0 0 12px 12px;">
                <tr>
                  <td style="padding:16px 28px;">
                    <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                      This booking was made through the Reliance Scheduling portal.
                      Reply-to has been set to the contact's email for direct communication.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:20px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                Reliance Building Services \u00b7 Irvine, CA
              </p>
              <p style="margin:4px 0 0 0;font-size:11px;color:#94a3b8;">
                Sent automatically by the Reliance Scheduling System
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildText(date: string, crewName: string, propertyName: string, bookedByName: string, bookedByEmail: string, notes: string | null): string {
  const lines = [
    `BOOKING CONFIRMED`,
    ``,
    `${propertyName}`,
    `A new crew has been scheduled for ${date}.`,
    ``,
    `Date:           ${date}`,
    `Crew Assigned:  ${crewName}`,
    `Property:       ${propertyName}`,
    `Contact:        ${bookedByName}`,
    `Email:          ${bookedByEmail}`,
  ]
  if (notes) lines.push(`Notes:          ${notes}`)
  lines.push(
    ``,
    `---`,
    `Reliance Building Services · Irvine, CA`,
    `Sent automatically by the Reliance Scheduling System`,
  )
  return lines.join('\n')
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

  const { date, crewName, propertyName, bookedByName, bookedByEmail, notes } = body

  if (!date || !crewName || !propertyName || !bookedByName || !bookedByEmail) {
    return respond({ error: 'missing required fields' }, 400)
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('supabase_url')!,
      Deno.env.get('supabase_anon_key')!
    )

    const { data: settings } = await supabaseClient
      .from('settings')
      .select('value')
      .eq('key', 'notification_email')
      .single()

    const notificationEmail = settings?.value ?? 'monirhasnan@gmail.com'

    const html = buildHtml(date, crewName, propertyName, bookedByName, bookedByEmail, notes ?? null)
    const text = buildText(date, crewName, propertyName, bookedByName, bookedByEmail, notes ?? null)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Reliance Scheduling <onboarding@resend.dev>',
        to: notificationEmail,
        reply_to: bookedByEmail,
        subject: `New Booking Confirmed — ${propertyName} · ${date}`,
        html,
        text,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend API error:', res.status, err)
      return respond({ error: 'failed to send email' }, 500)
    }

    return respond({ ok: true })
  } catch (e) {
    console.error('notify-booking error:', e)
    return respond({ error: e.message }, 500)
  }
})

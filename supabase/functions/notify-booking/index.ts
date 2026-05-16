import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { date, crewName, propertyName, bookedByName, bookedByEmail, notes } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('supabase_url')!,
      Deno.env.get('supabase_anon_key')!
    )

    const { data: settings } = await supabaseClient
      .from('settings')
      .select('value')
      .eq('key', 'notification_email')
      .single()

    const notificationEmail = settings?.value

    const html = `
      <div style="font-family: 'DM Sans', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="font-size: 16px; font-weight: 600; color: #0f172a; margin: 0 0 16px;">New Booking Confirmed</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
          <tr><td style="padding: 8px 0; color: #64748b;">Date</td><td style="padding: 8px 0;"><strong>${date}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Crew</td><td style="padding: 8px 0;"><strong>${crewName}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Property</td><td style="padding: 8px 0;"><strong>${propertyName}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Contact</td><td style="padding: 8px 0;"><strong>${bookedByName}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;"><strong>${bookedByEmail}</strong></td></tr>
          ${notes ? `<tr><td style="padding: 8px 0; color: #64748b;">Notes</td><td style="padding: 8px 0;"><strong>${notes}</strong></td></tr>` : ''}
        </table>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Sent by Reliance Scheduling System</p>
      </div>
    `

    const text = [
      `New Booking Confirmed`,
      ``,
      `Date:     ${date}`,
      `Crew:     ${crewName}`,
      `Property: ${propertyName}`,
      `Contact:  ${bookedByName}`,
      `Email:    ${bookedByEmail}`,
      ...(notes ? [`Notes:    ${notes}`] : []),
    ].join('\n')

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
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e) {
    console.error('notify-booking error:', e)
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

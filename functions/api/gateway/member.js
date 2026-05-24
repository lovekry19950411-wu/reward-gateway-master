import { json, memberIdFromEmail, readBody, referralCodeFromEmail, supabase } from '../_supabase.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await readBody(request);
    const email = String(body.email || '').trim().toLowerCase();
    if (!email) return json({ error: 'Email is required' }, 400);

    const memberId = body.memberId || memberIdFromEmail(email);
    const referralCode = body.referralCode || referralCodeFromEmail(email);
    const sourceApp = body.sourceApp || 'default';

    const rows = await supabase(env, 'gateway_members?on_conflict=member_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({
        member_id: memberId,
        email,
        invite_code: body.inviteCode || '',
        referral_code: referralCode,
        source_app: sourceApp,
        points: Number(body.points || 0),
        tickets: Number(body.tickets || 0),
        metadata: body.metadata || {},
        updated_at: new Date().toISOString()
      })
    });

    await supabase(env, 'gateway_events', {
      method: 'POST',
      body: JSON.stringify({
        member_id: memberId,
        source_app: sourceApp,
        event_type: 'member_claimed',
        card: 'claim_pass',
        metadata: { email, inviteCode: body.inviteCode || '', referralCode }
      })
    });

    return json({ ok: true, member: rows[0] });
  } catch (error) {
    return json({ error: error.message, details: error.details }, error.status || 500);
  }
}

export function onRequest(context) {
  return json({ error: 'Method not allowed' }, 405);
}

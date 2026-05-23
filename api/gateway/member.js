import { json, memberIdFromEmail, readBody, referralCodeFromEmail, supabase } from '../_supabase.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      json(res, 405, { error: 'Method not allowed' });
      return;
    }

    const body = await readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    if (!email) {
      json(res, 400, { error: 'Email is required' });
      return;
    }

    const memberId = body.memberId || memberIdFromEmail(email);
    const referralCode = body.referralCode || referralCodeFromEmail(email);
    const sourceApp = body.sourceApp || 'default';

    const rows = await supabase('gateway_members?on_conflict=member_id', {
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

    await supabase('gateway_events', {
      method: 'POST',
      body: JSON.stringify({
        member_id: memberId,
        source_app: sourceApp,
        event_type: 'member_claimed',
        card: 'claim_pass',
        metadata: { email, inviteCode: body.inviteCode || '', referralCode }
      })
    });

    json(res, 200, { ok: true, member: rows[0] });
  } catch (error) {
    json(res, error.status || 500, { error: error.message, details: error.details });
  }
}

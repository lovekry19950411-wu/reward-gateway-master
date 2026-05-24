import { json, readBody, supabase } from '../_supabase.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await readBody(request);
    const memberId = body.memberId || '';
    const sourceApp = body.sourceApp || 'default';
    const pointsDelta = Number(body.pointsDelta || 0);
    const ticketsDelta = Number(body.ticketsDelta || 0);

    const ledger = await supabase(env, 'gateway_ledger', {
      method: 'POST',
      body: JSON.stringify({
        member_id: memberId,
        source_app: sourceApp,
        points_delta: pointsDelta,
        tickets_delta: ticketsDelta,
        reason: body.reason || 'reward',
        metadata: body.metadata || {}
      })
    });

    if (memberId) {
      const existing = await supabase(env, `gateway_members?member_id=eq.${encodeURIComponent(memberId)}&select=points,tickets`, {
        method: 'GET'
      });
      const current = existing[0] || { points: 0, tickets: 0 };
      await supabase(env, `gateway_members?member_id=eq.${encodeURIComponent(memberId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          points: Number(current.points || 0) + pointsDelta,
          tickets: Number(current.tickets || 0) + ticketsDelta,
          updated_at: new Date().toISOString()
        })
      });
    }

    return json({ ok: true, ledger: ledger[0] });
  } catch (error) {
    return json({ error: error.message, details: error.details }, error.status || 500);
  }
}

export function onRequest(context) {
  return json({ error: 'Method not allowed' }, 405);
}

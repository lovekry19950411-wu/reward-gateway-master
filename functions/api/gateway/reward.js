import { json, readBody, supabase } from '../_supabase.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await readBody(request);
    const memberKey = body.memberId || '';
    const sourceApp = body.sourceApp || 'default';
    const pointsDelta = Number(body.pointsDelta || 0);
    const ticketsDelta = Number(body.ticketsDelta || 0);
    let member = null;
    if (memberKey) {
      const members = await supabase(env, `gateway_members?display_name=eq.${encodeURIComponent(memberKey)}&select=id,points,tickets&limit=1`, {
        method: 'GET'
      });
      member = members[0] || null;
    }

    const ledger = await supabase(env, 'gateway_ledger', {
      method: 'POST',
      body: JSON.stringify({
        member_id: member?.id || null,
        action: body.reason || 'reward',
        points_delta: pointsDelta,
        tickets_delta: ticketsDelta,
        note: JSON.stringify({
          memberId: memberKey,
          sourceApp,
          metadata: body.metadata || {}
        })
      })
    });

    if (member) {
      await supabase(env, `gateway_members?id=eq.${encodeURIComponent(member.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          points: Number(member.points || 0) + pointsDelta,
          tickets: Number(member.tickets || 0) + ticketsDelta
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

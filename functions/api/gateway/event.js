import { json, readBody, supabase } from '../_supabase.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await readBody(request);
    const memberKey = body.memberId || '';
    let memberUuid = null;
    if (memberKey) {
      const members = await supabase(env, `gateway_members?display_name=eq.${encodeURIComponent(memberKey)}&select=id&limit=1`, {
        method: 'GET'
      });
      memberUuid = members[0]?.id || null;
    }

    const rows = await supabase(env, 'gateway_events', {
      method: 'POST',
      body: JSON.stringify({
        member_id: memberUuid,
        source: body.sourceApp || 'default',
        event_type: body.eventType || 'event',
        payload: {
          memberId: memberKey,
          card: body.card || '',
          metadata: body.metadata || {}
        }
      })
    });

    return json({ ok: true, event: rows[0] });
  } catch (error) {
    return json({ error: error.message, details: error.details }, error.status || 500);
  }
}

export function onRequest(context) {
  return json({ error: 'Method not allowed' }, 405);
}

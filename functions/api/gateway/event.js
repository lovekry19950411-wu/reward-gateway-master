import { json, readBody, supabase } from '../_supabase.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await readBody(request);
    const rows = await supabase(env, 'gateway_events', {
      method: 'POST',
      body: JSON.stringify({
        member_id: body.memberId || '',
        source_app: body.sourceApp || 'default',
        event_type: body.eventType || 'event',
        card: body.card || '',
        metadata: body.metadata || {}
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

import { json, readBody, supabase } from '../_supabase.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      json(res, 405, { error: 'Method not allowed' });
      return;
    }

    const body = await readBody(req);
    const rows = await supabase('gateway_events', {
      method: 'POST',
      body: JSON.stringify({
        member_id: body.memberId || '',
        source_app: body.sourceApp || 'default',
        event_type: body.eventType || 'event',
        card: body.card || '',
        metadata: body.metadata || {}
      })
    });

    json(res, 200, { ok: true, event: rows[0] });
  } catch (error) {
    json(res, error.status || 500, { error: error.message, details: error.details });
  }
}

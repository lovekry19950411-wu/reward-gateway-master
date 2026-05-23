import { json, readBody, supabase } from '../_supabase.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      json(res, 405, { error: 'Method not allowed' });
      return;
    }

    const body = await readBody(req);
    const memberId = body.memberId || '';
    const sourceApp = body.sourceApp || 'default';
    const pointsDelta = Number(body.pointsDelta || 0);
    const ticketsDelta = Number(body.ticketsDelta || 0);

    const ledger = await supabase('gateway_ledger', {
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
      const existing = await supabase(`gateway_members?member_id=eq.${encodeURIComponent(memberId)}&select=points,tickets`, {
        method: 'GET',
        headers: { Prefer: 'return=representation' }
      });
      const current = existing[0] || { points: 0, tickets: 0 };
      await supabase(`gateway_members?member_id=eq.${encodeURIComponent(memberId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          points: Number(current.points || 0) + pointsDelta,
          tickets: Number(current.tickets || 0) + ticketsDelta,
          updated_at: new Date().toISOString()
        })
      });
    }

    json(res, 200, { ok: true, ledger: ledger[0] });
  } catch (error) {
    json(res, error.status || 500, { error: error.message, details: error.details });
  }
}

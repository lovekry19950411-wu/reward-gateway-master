import { json, supabase } from '../_supabase.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      json(res, 405, { error: 'Method not allowed' });
      return;
    }

    const [members, events, ledger] = await Promise.all([
      supabase('gateway_members?select=*&order=created_at.desc&limit=20', { method: 'GET' }),
      supabase('gateway_events?select=*&order=created_at.desc&limit=30', { method: 'GET' }),
      supabase('gateway_ledger?select=*&order=created_at.desc&limit=30', { method: 'GET' })
    ]);

    json(res, 200, {
      checkedAt: new Date().toISOString(),
      members,
      events,
      ledger
    });
  } catch (error) {
    json(res, error.status || 500, { error: error.message, details: error.details });
  }
}

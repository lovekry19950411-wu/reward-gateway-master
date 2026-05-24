import { json, supabase } from '../_supabase.js';

export async function onRequestGet({ env }) {
  try {
    const [members, events, ledger] = await Promise.all([
      supabase(env, 'gateway_members?select=*&order=created_at.desc&limit=20', { method: 'GET' }),
      supabase(env, 'gateway_events?select=*&order=created_at.desc&limit=30', { method: 'GET' }),
      supabase(env, 'gateway_ledger?select=*&order=created_at.desc&limit=30', { method: 'GET' })
    ]);

    return json({
      checkedAt: new Date().toISOString(),
      members,
      events,
      ledger
    });
  } catch (error) {
    return json({ error: error.message, details: error.details }, error.status || 500);
  }
}

export function onRequest(context) {
  return json({ error: 'Method not allowed' }, 405);
}

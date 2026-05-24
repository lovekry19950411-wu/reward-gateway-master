export function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

export async function readBody(request) {
  const text = await request.text();
  if (!text) return {};
  return JSON.parse(text);
}

export function requireSupabase(env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    const error = new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    error.status = 500;
    throw error;
  }
}

export async function supabase(env, path, options = {}) {
  requireSupabase(env);
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.message || data?.error_description || 'Supabase request failed');
    error.status = response.status;
    error.details = data;
    throw error;
  }
  return data;
}

export function memberIdFromEmail(email) {
  const input = String(email || `guest-${Date.now()}`);
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return `M-${Math.abs(hash).toString().slice(0, 8)}`;
}

export function referralCodeFromEmail(email) {
  const input = `${email}:ref`;
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
  }
  return `REF-${Math.abs(hash).toString().slice(0, 8)}`;
}

// Minimal Supabase Edge Function in TypeScript
// Receives POST JSON { path, name, text, time } and appends to <dir>/comments.json
// WARNING: intentionally minimal / permissive as requested. Do NOT use in production with sensitive tokens.

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return new Response('Invalid JSON', { status: 400 });
  }

  const { path, name, text, time } = body || {};
  if (!path || !text) return new Response('Bad Request', { status: 400 });

  const rel = path.replace(/^\/+/,'');
  const dir = rel.split('/').slice(0, -1).join('/');
  const repoPath = dir ? `${dir}/comments.json` : `comments.json`;

  const owner = Deno.env.get('GITHUB_OWNER') || '';
  const repo = Deno.env.get('GITHUB_REPO') || '';
  const token = Deno.env.get('GITHUB_TOKEN') || '';

  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`;
  console.log('apiBase', apiBase);

  // Fetch existing comments if present
  let comments: any[] = [];
  let existingSha: string | undefined;
  try {
    const res = await fetch(apiBase, { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } });
    console.log('fetch status', res.status);
    if (res.status === 200) {
      const existing = await res.json();
      const content = atob((existing.content || '').replace(/\n/g, ''));
      comments = JSON.parse(content || '[]');
      existingSha = existing.sha;
    }
  } catch (e) {
    console.log('fetch error', e);
  }

  comments.push({ name: name || '匿名', text, time: time || Date.now() });

  const contentBase64 = btoa(JSON.stringify(comments, null, 2));
  const payload: any = {
    message: `Add comment to ${repoPath}`,
    content: contentBase64,
    committer: { name: Deno.env.get('GIT_COMMITTER_NAME') || 'Automated Bot', email: Deno.env.get('GIT_COMMITTER_EMAIL') || 'no-reply@example.com' }
  };
  if (existingSha) payload.sha = existingSha;

  try {
    const putRes = await fetch(apiBase, {
      method: 'PUT',
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
      body: JSON.stringify(payload),
    });
    const putJson = await putRes.json().catch(() => ({}));
    console.log('put status', putRes.status);
    if (!putRes.ok) return new Response(JSON.stringify({ ok: false, error: putJson }), { status: 500, headers: { 'content-type': 'application/json' } });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (e) {
    console.log('put error', e);
    return new Response('Error writing to GitHub', { status: 500 });
  }
}

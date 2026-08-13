// Supabase Edge Function (Deno-compatible) example
// Receives POST requests with JSON body { path, name, text, time }
// and appends the comment to a `comments.json` file inside the same repo directory via GitHub Contents API.
// Environment variables required (set as Supabase secrets):
// - GITHUB_TOKEN: GitHub personal access token with `repo` permission for the target repo
// - GITHUB_OWNER: GitHub owner/org name
// - GITHUB_REPO: Repository name
// Optional:
// - GIT_COMMITTER_NAME
// - GIT_COMMITTER_EMAIL

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  console.log('handler start');
  const hdrShort = req.headers.get('x-short-circuit') || '';
  const envShort = Deno.env.get('SHORT_CIRCUIT') || '';
  console.log('SHORT_CIRCUIT env present:', !!envShort, 'header present:', !!hdrShort);
  const norm = (s) => String(s || '').toLowerCase();
  const isShort = ['1', 'true', 'on'].includes(norm(envShort)) || ['1', 'true', 'on'].includes(norm(hdrShort));
  if (isShort) {
    console.log('SHORT_CIRCUIT active - returning early (env/header)');
    return new Response(JSON.stringify({ ok: true, short: true }), { status: 200, headers: { 'content-type': 'application/json' } });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response('Invalid JSON', { status: 400 });
  }
  console.log('req body:', JSON.stringify(body));
  const { path, name, text, time } = body || {};
  if (!path || !text) return new Response('Bad Request', { status: 400 });

  const rel = path.replace(/^\/+/, '');
  const dir = rel.split('/').slice(0, -1).join('/');
  const repoPath = dir ? `${dir}/comments.json` : `comments.json`;

  const owner = Deno.env.get('GITHUB_OWNER');
  const repo = Deno.env.get('GITHUB_REPO');
  const token = Deno.env.get('GITHUB_TOKEN');
  if (!owner || !repo || !token) return new Response('Server misconfigured', { status: 500 });

  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`;
  console.log('github apiBase:', apiBase);
  console.log('env owner/repo/token present:', !!owner, !!repo, !!token);

  // Fetch existing file
  let existing = null;
  let comments = [];
  try {
    const res = await fetch(apiBase, { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' } });
    console.log('fetch existing status:', res.status);
    if (res.status === 200) {
      existing = await res.json();
      const content = atob(existing.content.replace(/\n/g, ''));
      comments = JSON.parse(content || '[]');
    }
  } catch (e) {
    // treat as not existing
    console.error('fetch existing failed', e && e.stack ? e.stack : e);
  }

  comments.push({ name: name || '匿名', text, time: time || Date.now() });

  const newContent = btoa(JSON.stringify(comments, null, 2));
  const commitMessage = `Add comment to ${repoPath}`;

  const payload = {
    message: commitMessage,
    content: newContent,
    committer: {
      name: Deno.env.get('GIT_COMMITTER_NAME') || 'Automated Comment Bot',
      email: Deno.env.get('GIT_COMMITTER_EMAIL') || 'no-reply@example.com',
    },
  };
  if (existing && existing.sha) payload.sha = existing.sha;

  try {
    const putRes = await fetch(apiBase, {
      method: 'PUT',
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
      body: JSON.stringify(payload),
    });
    let putJson = null;
    try { putJson = await putRes.json(); } catch(e) { putJson = { parseError: true }; }
    console.log('put status:', putRes.status, 'putJson:', JSON.stringify(putJson));
    if (!putRes.ok) return new Response(JSON.stringify(putJson), { status: 500 });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (e) {
    console.error('put failed', e && e.stack ? e.stack : e);
    return new Response('Error writing to GitHub', { status: 500 });
  }

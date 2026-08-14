Supabase Edge Function: comments writer

This folder contains a Supabase Edge Function that accepts POST requests with a JSON body:

  { "path": "/rankings/{slug}/page-xx-yy.html", "name": "ユーザ名", "text": "コメント本文", "time": 123456789 }

The function appends the comment to a `comments.json` file inside the same repository directory using the GitHub Contents API.

Required environment variables (set as Supabase project secrets):

- GITHUB_TOKEN — GitHub Personal Access Token with `repo` permission to the target repository.
- GITHUB_OWNER — GitHub owner or organization name.
- GITHUB_REPO — Repository name where pages live.

Optional environment variables:

- GIT_COMMITTER_NAME — Committer name used for the Git commit (default: "Automated Comment Bot").
- GIT_COMMITTER_EMAIL — Committer email used for the Git commit (default: "no-reply@example.com").

Deployment (Supabase CLI)

1. Install supabase CLI: https://supabase.com/docs/guides/cli

2. Login and link your project:

```bash
supabase login
# set project ref, or pass --project-ref on deploy
```

3. (Optional) Set secrets in Supabase (recommended) — replace values accordingly:

```bash
supabase secrets set GITHUB_TOKEN="<token>"
supabase secrets set GITHUB_OWNER="<owner>"
supabase secrets set GITHUB_REPO="<repo>"
supabase secrets set GIT_COMMITTER_NAME="Automated Comment Bot"
supabase secrets set GIT_COMMITTER_EMAIL="no-reply@example.com"
```

4. Deploy the function:

```bash
supabase functions deploy comments --project-ref <your-project-ref>
```

5. After deploy, set the function URL in your site's pages by setting the `COMMENTS_API` environment variable before running `tools/create_article.py` (it will embed the value into generated pages). Alternatively, edit generated pages to add `data-comments-api` on `<body>`.

Usage notes

- The function performs writes to the repository via the GitHub Contents API. Ensure the token used has the minimal required permissions and consider using a dedicated machine account.
- Reads in the site are intentionally done from `localStorage` to avoid read-side costs; this function is for write-through/backups to a Git repo and for sharing comments between clients.
- The function returns JSON `{ ok: true }` on success.

# SiteQuote SA — Production setup

**Live app:** https://sitequote-sa.vercel.app

**Vercel project:** [novaclaw38s-projects/sitequote-sa](https://vercel.com/novaclaw38s-projects/sitequote-sa)

## Already configured

- `AUTH_SECRET` (production)
- `NEXT_PUBLIC_APP_URL` = `https://sitequote-sa.vercel.app` (after redeploy)

## Required — add in Vercel dashboard

Go to **Project → Settings → Environment Variables** and add for **Production**:

| Variable | Where to get it |
|----------|-----------------|
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys |
| `SERPER_API_KEY` | https://serper.dev (live SA supplier prices) |
| `DATABASE_URL` | Neon Postgres (see below) |
| `RESEND_API_KEY` | https://resend.com (email quotes to clients) |
| `RESEND_FROM_EMAIL` | Verified sender, e.g. `SiteQuote <quotes@yourdomain.com>` |

Then **Redeploy** (Deployments → ⋯ → Redeploy).

### Or via CLI

```bash
cd sitequote-sa
vercel env add OPENAI_API_KEY production
vercel env add SERPER_API_KEY production
vercel env add DATABASE_URL production
vercel deploy --prod --yes
```

## Database (Neon) — required on Vercel

Serverless cannot use the local `.data/` file store. Use Neon:

1. Create a free project at https://neon.tech
2. Copy the **pooled** connection string (`postgresql://...`)
3. Add as `DATABASE_URL` in Vercel
4. Push schema from your machine:

```bash
DATABASE_URL="postgresql://..." npm run db:push
```

## Verify

1. Open https://sitequote-sa.vercel.app/register — create an account
2. **New quote** → paste demo transcript → generate
3. **Send via WhatsApp** — link should use `sitequote-sa.vercel.app`

## Mobile app

```bash
# mobile/.env
EXPO_PUBLIC_API_URL=https://sitequote-sa.vercel.app
```

## Optional

- `BLOB_READ_WRITE_TOKEN` — store voice/video on Vercel Blob
- Custom domain in Vercel → update `NEXT_PUBLIC_APP_URL`

# SiteQuote SA

Construction quotations for **South African general building** contractors. Record a site voice note or walkthrough video; the agent transcribes, extracts materials and labour, looks up **live prices** from major SA suppliers, and returns an editable VAT-ready quote.

## Features

- Voice note or site video → transcript (Whisper)
- AI scope extraction (metric units, local terminology)
- Live supplier lookup (Builders, Cashbuild, Build It, Leroy Merlin, BUCO, Plumblink)
- **Contractor accounts** with saved labour rates and markup
- **Persistent storage** (Postgres/Neon or local `.data/` file store)
- **Client share link** + **WhatsApp** send
- Editable line items, PDF export
- **Web PWA** + **Expo** iOS/Android

## Quick start

```bash
cd sitequote-sa
cp .env.example .env.local
```

Add to `.env.local`:

| Variable | Required |
|----------|----------|
| `OPENAI_API_KEY` | Yes |
| `SERPER_API_KEY` | For live pricing |
| `AUTH_SECRET` | Yes (any long random string) |

```bash
npm run dev
```

Open http://localhost:3000

- **Sign up** to save quotes and set default R/hour + markup
- Use **Demo transcript** on the record page to test without audio

### Production database (optional locally)

```bash
# Neon: https://neon.tech — paste connection string
DATABASE_URL=postgresql://...
npm run db:push
```

Without `DATABASE_URL`, data is stored in `.data/sitequote.json` (fine for dev).

## Send quotes to clients

1. Open a quote → **Copy link** or **Send via WhatsApp**
2. Client opens `/q/{token}` — read-only view, no login
3. **Export PDF** for email or print

## Mobile app

```bash
cd mobile
npm install
cp .env.example .env
# EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:3000 on a physical device
npx expo start
```

After generating a quote, tap **View quote** for in-app WebView.

## Deploy (Vercel)

1. Push to GitHub and import on Vercel
2. Add env vars from `.env.example`
3. Create Neon database, set `DATABASE_URL`, run `npm run db:push` locally or via CI
4. Set `NEXT_PUBLIC_APP_URL` to your production domain

## Architecture

```
Record → POST /api/quotes → Whisper → GPT scope → Serper (per material) → DB → Review / Share / PDF
```

## South African defaults

- Currency: ZAR · VAT: 15% · Labour default: R350/hr · Quote validity: 14 days

## License

Private — your project.

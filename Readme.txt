SITEQUOTE SA
============

Construction quotations for South African general building contractors. Record a site voice
note or walkthrough video; the app transcribes it, extracts materials and labour, looks up
live prices from major South African suppliers, and returns an editable, VAT-ready quote.

FEATURES
--------
- Voice note or site video -> transcript (Whisper) -> AI scope extraction (metric units,
  local terminology)
- Live supplier price lookup (Builders, Cashbuild, Build It, Leroy Merlin, BUCO, Plumblink)
- Contractor accounts with saved labour rate and markup
- Editable line items, PDF export
- Client share link (/q/{token}, read-only, no login) and WhatsApp send
- Web PWA plus an Expo mobile app (iOS/Android)
- Defaults: ZAR, 15% VAT, R350/hour labour, 14-day quote validity

FLOW
----
  Record -> POST /api/quotes -> Whisper -> GPT scope -> Serper (per material) -> DB ->
  Review / Share / PDF

GETTING STARTED
---------------
  cp .env.example .env.local     (OPENAI_API_KEY, SERPER_API_KEY, AUTH_SECRET)
  npm run dev                    (http://localhost:3000)
  Use "Demo transcript" on the record page to test without audio.

Optional production database: set DATABASE_URL (Neon Postgres) and run npm run db:push.
Without it, data is stored in .data/sitequote.json.

Mobile app: cd mobile, npm install, copy .env.example to .env, set EXPO_PUBLIC_API_URL,
then npx expo start.

PROJECT LAYOUT
--------------
  src/, public/, mobile/, .vercel/ (Vercel project link), DEPLOY.md, drizzle.config.ts

See DEPLOY.md and README.md for deployment steps.

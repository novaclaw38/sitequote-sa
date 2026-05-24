# SiteQuote SA — Mobile (Expo)

Native iOS and Android app sharing the same API as the web PWA.

## Setup

```bash
cd mobile
npm install
cp .env.example .env
```

Set `EXPO_PUBLIC_API_URL` to your machine or deployed API:

- Simulator: `http://localhost:3000` (use your LAN IP on a physical device)
- Production: `https://your-app.vercel.app`

## Run

```bash
npx expo start
```

Press `i` for iOS simulator or `a` for Android.

## Notes

- Audio is recorded with `expo-av` and sent as multipart to `POST /api/quotes`
- Quote review opens in the mobile browser via the web app URL (deep link screen can be added later)
- Add `assets/icon.png` (1024×1024) before store submission — placeholder omitted in MVP

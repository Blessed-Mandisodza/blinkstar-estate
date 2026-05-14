# BlinkStar Mobile

JSX-based Expo mobile app for BlinkStar Properties.

## Setup

1. Copy `.env.example` to `.env`
2. Set:

```env
EXPO_PUBLIC_API_URL=https://estate-backend-chi.vercel.app
EXPO_PUBLIC_WEB_URL=https://blinkstar-estate.vercel.app
```

3. Install dependencies:

```bash
npm install
```

4. Start Expo:

```bash
npx expo start
```

## Local backend note

If you want the mobile app to talk to a local backend:

- Android emulator: `http://10.0.2.2:5000`
- iOS simulator: `http://localhost:5000`
- Physical phone: use your computer's LAN IP, for example `http://192.168.1.10:5000`

Set that value in `EXPO_PUBLIC_API_URL`.

## Included in v1 scaffold

- Home
- Properties
- Property details
- Favorites
- Profile
- Sign in
- Sign up
- Inquiry form
- WhatsApp / call / email actions

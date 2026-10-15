# MasqueGame

Mobile-first Svelte 5 + Vite prototype for the myAIS WebView. The app is a static SPA with hash navigation and a centered 430px mobile preview on desktop.

## Run

```sh
npm install
npm run dev
npm run check
npm run build
```

Production assets are built with the `/maque-center/` base path. Deploy the **contents** of `dist/` into the server directory mounted at `https://masque-lab.adldigitalservice.com/maque-center/`. Keep the trailing slash so relative game covers resolve correctly. Game covers belong in `public/images/`; the current catalog uses the supplied images copied from `ตัวอย่าง/images`.

Player details, AIS Points, pass expiration, and free-play time are browser-only mock data in localStorage. Rankings are sample data separated by game. Linked games load in an iframe, but scores are not received or verified. None of these client-side values enforce real access or payments.
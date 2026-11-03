# frequency-mobile

Expo (SDK 54) iOS app for Frequency — a **secondary** client that mirrors the web app in `../frequency`. Features are built and verified on web + BE first, then synced here; don't add mobile-only features unless asked. See `../CLAUDE.md` for the system overview.

## Commands

- Dev (web preview, for Claude to check UI): `npx expo start --web` → http://localhost:8081
- Dev (device): `npm start`, then scan the QR code with Expo Go on the iPhone
- Verify: `npx tsc --noEmit` and `npm test` — must pass before any commit (no linter yet)
- `npm test` — Vitest unit tests for pure logic (`src/**/*.test.ts`), pinned to `TZ=Asia/Ho_Chi_Minh`. No React Native rendering and no UI e2e yet: `expo-secure-store` has no web implementation, so login fails in the web preview.
- Build `loggedAt` only through `src/lib/time.ts` (mirror of web `src/lib/time.ts`); send ISO instants (`toISOString()`), never `<date>T<HH:MM>:00` strings.

## Layout

- `app/` — expo-router routes
  - `_layout.tsx` root (fonts, auth provider), `index.tsx` redirect
  - `(auth)/login.tsx`
  - `(tabs)/` — `dashboard`, `log`, `calendar`, `settings`
  - `create.tsx`, `edit.tsx`, `register.tsx`, `manage-actions.tsx` — stack screens
- `src/components/` — kebab-case files (`action-item.tsx`, `calendar-grid.tsx`, ...)
- `src/lib/api.ts` — fetch wrapper + API types; base URL from `EXPO_PUBLIC_API_URL`
- `src/hooks/use-auth.tsx` — auth context, token in `expo-secure-store`
- `src/data/mock-data.ts` — temporary mock data (still used by `(tabs)/dashboard.tsx`)
- `plans/react-native-migration-plan.md` — migration plan with a verification checklist

## Conventions

- Styling with NativeWind `className` only; theme tokens live in `tailwind.config.js` + `global.css`.
- File names kebab-case; components PascalCase exports.
- When porting a screen, use the matching file in `../frequency/src/pages/` as the reference for behavior and API calls, then convert web tags (`div`, `button`, `input`) to RN (`View`, `Pressable`, `TextInput`).
- All network calls go through `src/lib/api.ts`; keep its types in sync with `../frequency-be/src/db/schema.ts`.

## Gotchas

- `EXPO_PUBLIC_API_URL` falls back to port 3000 but the local BE runs on 3001. To use the local BE, set it to `http://localhost:3001/api` (web preview) or `http://<PC LAN IP>:3001/api` (real iPhone).
- `.env.local` currently points at the deployed BE — changes there hit real data.
- Google OAuth (`expo-auth-session`) does not fully work in the web preview; test it on device.
- Target is iOS only (EAS Build + Sideloadly); don't add Android-specific work unless asked.

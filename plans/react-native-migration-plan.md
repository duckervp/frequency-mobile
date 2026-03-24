# Frequency → React Native (Expo) Migration Plan

Full migration of the Frequency web app to React Native using Expo + NativeWind.
Build IPA via **EAS Build** (cloud — no Mac required). Install on iPhone 13 via **Sideloadly** (Windows).
Backend stays on Vercel/Turso unchanged.

## Decisions

| Decision | Choice |
|---|---|
| IPA Install method | Sideloadly (free, 7-day expiry — re-sign weekly) |
| Google OAuth | Yes — via `expo-auth-session` + Google Cloud Console |
| Platform | iOS only (iPhone 13) |
| Build pipeline | EAS Build (cloud, no Mac needed) |

---

## Architecture

```
┌──────────────────────────────┐
│   frequency-mobile/ (NEW)    │
│   Expo SDK 52 + TypeScript   │
│   NativeWind v4 (Tailwind)   │
│   expo-router (file-based)   │
│   expo-secure-store (tokens) │
│   expo-auth-session (OAuth)  │
└────────────┬─────────────────┘
             │ HTTPS (fetch)
┌────────────▼─────────────────┐
│   frequency-be/ (UNCHANGED)  │
│   Hono + Drizzle + Turso     │
│   Deployed on Vercel         │
└──────────────────────────────┘
```

---

## Phase 1 — Project Scaffold

### 1.1 Init Expo project

```bash
cd d:\antigravity
npx create-expo-app@latest frequency-mobile --template blank-typescript
cd frequency-mobile
```

### 1.2 Install core dependencies

```bash
# Navigation
npx expo install expo-router react-native-safe-area-context react-native-screens

# NativeWind (Tailwind for RN)
npm install nativewind tailwindcss
npx tailwindcss init

# Auth & Storage
npx expo install expo-secure-store expo-web-browser expo-auth-session

# Fonts
npx expo install expo-font @expo-google-fonts/lexend

# Animations & Haptics
npx expo install react-native-reanimated expo-haptics

# Async Storage (user profile cache)
npx expo install @react-native-async-storage/async-storage

# Icons
npm install @expo/vector-icons
```

### 1.3 EAS Setup

```bash
npm install -g eas-cli
eas login
eas build:configure   # creates eas.json
```

---

## Phase 2 — Design System

### 2.1 `global.css` (NativeWind)

Theme tokens from existing `index.css`:

| Token | Value |
|---|---|
| `primary` | `#2bee79` |
| `background-light` | `#f6f8f7` |
| `background-dark` | `#102217` |
| Font | Lexend |

### 2.2 `tailwind.config.ts`

Extend NativeWind config with custom colors + font.

---

## Phase 3 — Shared Logic Port

### 3.1 `src/lib/api.ts`

Copy from web with these replacements:

| Web | Mobile |
|---|---|
| `import.meta.env.VITE_API_URL` | `process.env.EXPO_PUBLIC_API_URL` |
| `localStorage.getItem/setItem` | `expo-secure-store` get/set |
| `window.location.href` | *(removed — handled in OAuth flow)* |

`fetch` API is identical in React Native — no changes needed.

### 3.2 `src/hooks/use-auth.tsx`

Port `useAuth` context with:

| Web source | Mobile replacement |
|---|---|
| `localStorage` | `expo-secure-store` |
| `useNavigate()` | `useRouter()` from expo-router |
| `window.location.hash` | Deep link / `expo-auth-session` callback |
| `window.location.href` (Google) | `WebBrowser.openAuthSessionAsync()` |

### 3.3 Google OAuth mobile flow

1. Create new **OAuth 2.0 client** in Google Cloud Console → iOS app type
2. Add bundle ID (e.g. `com.frequency.app`)
3. Use `expo-auth-session/providers/google` with `clientId` for iOS
4. Redirect URI becomes a deep link: `com.frequency.app://auth/callback`
5. Backend must accept the same token — may need to update redirect URI on backend
6. Token returned as deep link query param, stored in `expo-secure-store`

---

## Phase 4 — Navigation (expo-router file structure)

```
app/
├── _layout.tsx              # Root layout with AuthProvider + font loading
├── index.tsx                # Redirect → /(auth)/login or /(tabs)/dashboard
├── (auth)/
│   └── login.tsx            # LoginPage
├── (tabs)/
│   ├── _layout.tsx          # Bottom tab navigator (4 tabs)
│   ├── dashboard.tsx        # DashboardPage
│   ├── log.tsx              # LogPage
│   ├── calendar.tsx         # CalendarPage
│   └── settings.tsx         # SettingsPage
├── create.tsx               # CreateActionPage
├── register.tsx             # RegisterActionPage
├── edit.tsx                 # EditActionPage
└── manage-actions.tsx       # ManageActionsPage
```

---

## Phase 5 — UI Component Conversion

### JSX Transform Cheatsheet

| Web | React Native |
|---|---|
| `<div>` | `<View>` |
| `<span>`, `<p>`, `<h1>` | `<Text>` |
| `<input>` | `<TextInput>` |
| `<button>` | `<Pressable>` |
| `<img>` | `<Image>` |
| `onClick` | `onPress` |
| `<form onSubmit>` | manual `handleSubmit()` call |
| `className="..."` | `className="..."` (NativeWind keeps this) ✅ |
| Material Symbols font icon | `@expo/vector-icons` `MaterialIcons` |

### Component Migration Map

| Web Component | Mobile Component | Effort |
|---|---|---|
| `BottomNav.tsx` | `app/(tabs)/_layout.tsx` (expo-router tabs) | Low |
| `Header.tsx` | `src/components/header.tsx` | Low |
| `ActionItem.tsx` | `src/components/action-item.tsx` | Low |
| `CalendarGrid.tsx` | `src/components/calendar-grid.tsx` | High |
| `CalendarSelect.tsx` | `src/components/calendar-select.tsx` | Medium |
| `CalendarStats.tsx` | `src/components/calendar-stats.tsx` | Low |
| `SummaryCard.tsx` | `src/components/summary-card.tsx` | Low |
| `TimePicker.tsx` | `src/components/time-picker.tsx` | Medium |

### Page Migration Map

| Web Page | Mobile Screen | Effort |
|---|---|---|
| `LoginPage.tsx` | `app/(auth)/login.tsx` | Medium |
| `DashboardPage.tsx` | `app/(tabs)/dashboard.tsx` | High |
| `LogPage.tsx` | `app/(tabs)/log.tsx` | High |
| `CalendarPage.tsx` | `app/(tabs)/calendar.tsx` | High |
| `SettingsPage.tsx` | `app/(tabs)/settings.tsx` | Medium |
| `ManageActionsPage.tsx` | `app/manage-actions.tsx` | Medium |
| `CreateActionPage.tsx` | `app/create.tsx` | High |
| `RegisterActionPage.tsx` | `app/register.tsx` | Medium |
| `EditActionPage.tsx` | `app/edit.tsx` | Medium |

---

## Phase 6 — Build & Install

### 6.1 Dev Testing (Expo Go — fastest iteration)

```bash
cd frequency-mobile
npx expo start
# Scan QR code with iPhone Camera → opens Expo Go
```

Test each screen as you build it — no IPA needed.

### 6.2 IPA Build (EAS Cloud)

```bash
eas build --platform ios --profile preview
# Wait ~10-15 min for cloud build
# Download .ipa from https://expo.dev
```

### 6.3 Install on iPhone 13 (Sideloadly — Windows)

1. Download [Sideloadly](https://sideloadly.io/) for Windows
2. Connect iPhone 13 via USB
3. Open Sideloadly → drag `.ipa` file
4. Sign in with Apple ID
5. Click Start → app installs
6. On iPhone: Settings → General → VPN & Device Management → Trust your Apple ID
7. ⚠️ Re-sign every 7 days (same Sideloadly steps)

---

## Verification Checklist

### Auth Flows
- [ ] Email login → navigates to dashboard
- [ ] Email register → navigates to dashboard
- [ ] Google OAuth → browser opens → returns to app with token
- [ ] Logout → clears storage → returns to login
- [ ] Token persists across app restarts (expo-secure-store)

### Core Flows
- [ ] Dashboard: actions grid loads, "last 24h" logs appear
- [ ] Log action → log appears in dashboard + log tab
- [ ] Calendar: month grid renders, tap date shows logs
- [ ] Settings: profile info correct, logout works
- [ ] Create action → appears in manage actions + dashboard
- [ ] Edit log → updates note/time correctly
- [ ] Delete log → removed from list

### Polish
- [ ] Dark mode (matches `#102217` background)
- [ ] Lexend font loaded correctly
- [ ] Bottom tab icons render (MaterialIcons)
- [ ] Skeleton loaders show during API calls
- [ ] Error messages display on failed API calls
- [ ] Haptic feedback on button press

---

## Environment Variables

Create `frequency-mobile/.env.local`:

```env
EXPO_PUBLIC_API_URL=https://your-vercel-backend.vercel.app/api
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=<ios-client-id-from-google-cloud-console>
```

---

## Out of Scope (this migration)

- Android build (iOS only)
- Push notifications (reminder feature deferred)
- App Store submission (personal use via Sideloadly)
- Web version maintenance

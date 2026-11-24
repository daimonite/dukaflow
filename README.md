# DukaFlow / DukaSmart

Offline-first shop management for small retail businesses: fast POS sales, stock and
weighted-average profit tracking, a daily sales calendar, debtors & creditors ledgers,
expenses and owner drawings, an audit log, and shared electricity (LUKU) sub-meter billing.

Built with React 19 + TypeScript + Vite, Tailwind CSS, Dexie-free local storage, Supabase
auth/backup, and Capacitor for the Android build.

## Requirements

- Node.js 20+
- npm (the project uses `package-lock.json`)
- Optional: Android Studio for the APK build

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from `.env.example` and add your Supabase project values:
   ```
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
   ```
3. Run the Supabase schema in `supabase_schema.sql` once in the Supabase SQL Editor.
   It creates the owner-scoped `business_state` table with row-level security.

Without Supabase credentials the app shows a setup screen instead of the sign-in page.

### Confirmation links

Sign-up emails return to `VITE_AUTH_REDIRECT_URL`, or to the current site origin when
that is unset. In Supabase, open **Authentication → URL Configuration** and make sure:

- **Site URL** is your deployed app (for example `https://your-app.example.com`), not
  `http://localhost:3000` — this is the fallback used whenever a redirect URL is not
  allow-listed.
- **Redirect URLs** contains every origin you use, for example
  `https://your-app.example.com/**` and `http://localhost:3000/**`.

Emails sent before the configuration change keep pointing at the old URL; use
“Resend confirmation” on the sign-in screen after fixing the settings.

Signing up inside the Android app opens the link in the phone's browser, not in the
app, so the redirect must be a hosted web URL. After confirming there, sign in inside
the app. Returning into the app from the email would need a custom intent filter and
`App.addListener('appUrlOpen')`, which is not set up.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server on http://localhost:3000 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | TypeScript typecheck (`tsc --noEmit`) |
| `npm test` | Vitest unit tests |
| `npm run android:build` | Build the Android debug APK (finds a compatible JDK) |
| `npm run clean` | Remove `dist/` |

## Android

```bash
npm run build
npx cap sync android
npm run android:build
```

`android:build` locates a JDK that Gradle 8.14 supports (17–24) and copies the debug
APK to `apk/DukaSmart-v1.0-debug.apk`. No machine-specific path is committed to the
repo: it checks `ANDROID_JAVA_HOME`, then `JAVA_HOME`, then `~/.jdks`, then the usual
Android Studio and OS install locations. Newer JDKs (for example Java 25/26) do not
work with this Gradle version, so the system default is deliberately skipped when it
is too new. Set `ANDROID_JAVA_HOME` to choose a JDK explicitly, e.g.:

```bash
ANDROID_JAVA_HOME=/path/to/jdk-21 npm run android:build
```

In Android Studio, set **Settings → Build Tools → Gradle → Gradle JDK** to a JDK
21 install so IDE builds use the same runtime.

## Data & sync

Business data lives in `localStorage` first, so the POS keeps working offline. When a
user is signed in and online, the full snapshot is debounced and upserted to
`business_state` for that user. `src/services/cloudBusinessState.ts` owns the
cloud read/write; `src/services/supabaseClient.ts` creates the client.

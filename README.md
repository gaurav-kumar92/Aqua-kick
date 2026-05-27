# Underwater Football — Web Game

A top-down underwater soccer game playable in browser. 8 themed levels, ad break between matches, local high-score saving, and optional Firebase cloud sync.

## Project structure

```
project/
├── api/
│   └── firebase-config.js   # Vercel serverless function — serves Firebase config from env vars
├── index.html                # The game (HTML + CSS + JS in one file)
├── vercel.json               # Vercel config
├── .env.example              # Template for local dev env vars
└── README.md                 # This file
```

## Deploy to Vercel

This is a static site + one serverless function — no build step needed.

**Option A — drag and drop:**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Drag the project folder onto the page
3. Vercel auto-deploys; you get a `*.vercel.app` URL

**Option B — Vercel CLI:**
```bash
npm i -g vercel
cd path/to/project
vercel deploy --prod
```

**Option C — Git integration:** push to GitHub/GitLab, import at [vercel.com/new](https://vercel.com/new).

## Enable Firebase cloud sync

### 1. Create a Firebase project
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. Once created, click the **`</>`** (Web) icon to add a web app
3. Register the app — Firebase shows you a `firebaseConfig` object with 6 values: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`

### 2. Set the values in Vercel (production)

Vercel Dashboard → your project → **Settings → Environment Variables**, add these 6 variables:

| Variable | Value |
|---|---|
| `FIREBASE_API_KEY` | (from Firebase config) |
| `FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `your-project-id` |
| `FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | (numeric) |
| `FIREBASE_APP_ID` | `1:000:web:abc...` |

Choose **Production, Preview, Development** when adding each one. Then redeploy (Vercel → Deployments → ⋯ → Redeploy) so the new env vars take effect.

### 3. Local development

For testing locally with `vercel dev`:

1. Copy `.env.example` to `.env.local`
2. Fill in the 6 Firebase values
3. Run `vercel dev`
4. Open `http://localhost:3000`

`.env.local` is automatically ignored by git (Vercel and most templates have it in `.gitignore`).

### 4. Enable Google Sign-In
1. Firebase Console → **Authentication** → **Get started**
2. **Sign-in method** tab → click **Google** → **Enable** → set support email → **Save**
3. **Authentication → Settings → Authorized domains** → add your Vercel domain (e.g. `your-app.vercel.app`)

### 5. Create the Firestore database
1. Firebase Console → **Firestore Database** → **Create database**
2. Production mode; pick a region close to your players
3. Go to **Rules** tab and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{userId} {
      allow read: if true;                              // public leaderboard
      allow write: if request.auth != null
                   && request.auth.uid == userId;       // only sign your own row
    }
  }
}
```

Click **Publish**.

### Verify
1. Open the deployed site, click **SIGN IN**, complete Google popup
2. Play a match
3. Open browser DevTools console — you should see `[Firebase] Initialized — cloud sync enabled`
4. Check Firebase Console → **Firestore Database** → there should be a `players/{your-uid}` document with your stats
5. From the console, run `fetchLeaderboard().then(console.log)` — returns top 10 players by wins

## A note on Firebase config and "secrets"

The 6 Firebase config values **are visible in the browser** even when served from this backend route. Anyone can open DevTools → Network and read the response from `/api/firebase-config`. This is by design — Firebase web config is a project identifier, not a credential. Google [documents this explicitly](https://firebase.google.com/docs/projects/api-keys).

What actually protects your data:

- **Firestore Security Rules** (the rules above) — restrict who can write what
- **Firebase Authentication** — only signed-in users can write their own row
- **Authorized domains** in Firebase Console — restrict where the sign-in flow can run

The backend route exists for **clean configuration**:
- Env vars instead of values in source code
- Different configs per environment (dev / preview / prod)
- Nothing sensitive committed to git

If you ever do have a real secret (e.g. a server-side admin SDK key for sensitive operations), it would never be sent to the browser — those operations live entirely inside a serverless function and the secret stays in `process.env`.

## URL features

| URL | Behavior |
|---|---|
| `/` | Normal game, starts at level 1 |
| `/#level=N` | Start directly on level N (1–8) — useful for testing |

## What's saved (without Firebase)

`localStorage` key `underwater_football_v1`:
- `name`, `signedIn` — display name + signed-in flag
- `wins` / `losses` — lifetime match record
- `bestByLevel` — best score per level
- `highestLevel` — highest level index reached

With Firebase, same data mirrors to `players/{userId}` in Firestore on every save.

## About Google Play Games Services

Play Games Services (achievements, native leaderboard UI, cloud save) is designed primarily for Android apps. To use it:

1. Wrap this game in [Capacitor](https://capacitorjs.com)
2. Add the Play Games Services plugin
3. Publish to Play Store ($25 one-time dev fee)

For web-only deployment, Firebase Auth + Firestore (above) gives you the equivalent end-user experience.

## Ad integration

The game shows a placeholder ad after every match. To plug in a real ad network, see the comment block above `showAd()` in `index.html`. Patterns documented for: CrazyGames SDK, Poki SDK, AdMob (Capacitor), Google AdSense H5.

## License

You own this code; do what you want with it.

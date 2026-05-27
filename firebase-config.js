// Vercel serverless function — returns Firebase web config from env vars.
// Set these in Vercel Dashboard → Project → Settings → Environment Variables:
//   FIREBASE_API_KEY
//   FIREBASE_AUTH_DOMAIN
//   FIREBASE_PROJECT_ID
//   FIREBASE_STORAGE_BUCKET
//   FIREBASE_MESSAGING_SENDER_ID
//   FIREBASE_APP_ID
//
// Note: Firebase web config is NOT a secret — it's a project identifier and
// is intentionally visible to browser clients. This route exists for clean
// configuration management (env-driven, no values in git), not as a security
// layer. Real Firebase security lives in your Firestore Rules and Auth setup.

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cfg = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  };

  // If any required field is missing, signal "not configured" — client falls back to localStorage-only
  const missing = Object.entries(cfg).filter(([_, v]) => !v).map(([k]) => k);
  if (missing.length > 0) {
    return res.status(503).json({
      error: 'Firebase env vars not set',
      missing,
      hint: 'Set them in Vercel Dashboard → Project → Settings → Environment Variables',
    });
  }

  // Short cache so config updates propagate within a minute
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.status(200).json(cfg);
}

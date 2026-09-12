# Firebase service account

Drop your Firebase **service-account private key** here as:

```text
firebase/serviceAccountKey.json
```

The backend auto-detects it (mounted at `/firebase/serviceAccountKey.json`) and
starts verifying Firebase ID tokens — no environment variable needed.

## How to get the key

1. Firebase console → project `gridmitra` → **Project settings → Service accounts**.
2. **Generate new private key** → downloads a JSON file.
3. Save it as `firebase/serviceAccountKey.json` in this repo.
4. `docker compose restart backend`.

## Security

- This file is a **secret**. `.gitignore` excludes `firebase/*.json` — it is never
  committed. If it is ever committed or leaked, rotate it immediately in Firebase.
- Alternative: set `FIREBASE_SERVICE_ACCOUNT_JSON` (JSON string) or
  `FIREBASE_SERVICE_ACCOUNT_PATH` in the backend environment instead of a file.

## Before first sign-in

In Firebase console → **Authentication → Sign-in method**, enable **Google** and
**Email/Password**, and add `localhost` to **Authorized domains**
(Authentication → Settings → Authorized domains).
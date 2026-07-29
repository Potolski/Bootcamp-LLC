# Deploying the frontend (Vercel / Netlify)

The web app is a **Vite** app living in the **`app/`** subfolder of this repo.
The repo root is the Anchor program (its `package.json` has no `next`/`vite`),
which is why a host building from the root fails with
"No Next.js version detected".

## Vercel

In the Vercel project settings:

1. **Root Directory** → `app`  (Settings → General → Root Directory → Edit)
2. **Framework Preset** → `Vite` (auto-detected once Root Directory is `app`;
   `app/vercel.json` also pins it)
3. Build command: `npm run build` · Output directory: `dist` (already default)
4. Env vars are **optional** — the app has correct devnet defaults baked in.
   To override, add under Settings → Environment Variables:
   - `VITE_RPC_URL` = `https://api.devnet.solana.com`
   - `VITE_PROGRAM_ID` = `G96NupAUcEpd284gAN7FN5ZZiQRCnz36uf5bvVmcveCG`
   - `VITE_TREASURY` = `4R3PG1oh3zFLjtHJ19nNqR2MQ9G5kbf7q9hmi56JpdWC`

Then Redeploy.

## Netlify

- Base directory: `app`
- Build command: `npm run build`
- Publish directory: `app/dist`

## CLI alternative (from the app folder)

```bash
cd app
npm i -g vercel
vercel --prod   # answer "app" is the project root when prompted
```

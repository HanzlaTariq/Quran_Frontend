# Frontend update — existing GitHub repository

Yeh PATCH hai. Baseline: aap ka uploaded `Quran_Frontend-main.zip`.
GitHub ki live/latest files is task mein fetch nahi ki gayin. Agar repository mein upload ke baad custom changes ki hain, pehle Git diff review karein.

## 1. Files copy karein

Apni current frontend repo ka backup ya commit bana lein. ZIP ke `frontend` folder ke **andar wali files** repo ke root mein copy/merge karein. Same-name files replace karein; poora `src` folder delete na karein. Repo ke andar ek extra `frontend` folder na banayein. `.git`, private `.env`, aur unknown custom files ko overwrite/delete na karein.

Naya design coordinated v2 upgrade hai, sirf CSS change nahi. Is frontend ko matching backend patch ke saath deploy karein.

## 2. Backend address set karein

`vercel.json` mein `https://YOUR-BACKEND-PROJECT.vercel.app` ko apne **backend ke production origin** se replace karein — yeh do jagah aata hai. `/api/:path*` aur `/socket.io/:path*` suffix waise hi rehne dein.

Example: backend origin `https://my-quran-api.vercel.app` ho to:

```json
{"source":"/api/:path*","destination":"https://my-quran-api.vercel.app/api/:path*"}
```

`YOUR-BACKEND-PROJECT` placeholder deploy se pehle remove hona chahiye. `VITE_API_URL` ki zaroorat nahi: browser same-origin `/api` requests bhejta hai. Backend URL ko browser fetch mein seedha use karke cookie flow na badlein.

## 3. Dependencies aur optional cleanup

```sh
npm run update:check
# Optional, sirf reviewed untouched old files remove karta hai:
npm run update:clean
npm install
npm run build
```

Cleanup pehle dry run dikhata hai aur sirf uploaded baseline se exact hash match karne wali obsolete files remove karta hai. Edited custom files ko preserve karta hai. Yeh `.env` ya `.git` remove nahi karta.

Purana `package-lock.json` naye package versions ka nahi hai. `npm install` usko regenerate karta hai; phir naya lock commit kar sakte hain. `npm ci` purane lock ke saath na chalayein. Included Vercel install command `npm install --package-lock=false` old lock ignore karta hai; dependency install yahan perform nahi hua, is liye fabricated lockfile include nahi ki gayi.

## 4. Vercel frontend project

| Setting | Value |
| --- | --- |
| Git repository | Aap ki existing frontend repo |
| Root Directory | Repo root, `.`; `frontend` subfolder nahi |
| Framework Preset | Vite |
| Node.js | 22.x |
| Install Command | `npm install --package-lock=false` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

`vercel.json` mein commands/output already configured hain. Dashboard mein purane conflicting overrides remove karein. Apni current Git branch par commit/push karein; `main` assume na karein.

```sh
git status
git add .
git diff --cached --stat
# Private .env ya secrets staged na hon.
git commit -m "Apply Noor UI and separate Vercel deployment patch"
git push
```

## 5. Backend ka required matching configuration

Backend `ALLOWED_ORIGINS` aur `PUBLIC_URL` mein frontend ka exact HTTPS production origin hona chahiye; trailing slash na dein. Custom domain use karte hain to usay add karein. Random preview domains allowlist mein khud-ba-khud add nahi hote. Backend ko MongoDB Atlas / replica set aur private secrets chahiye — backend `UPDATE_GUIDE.md` dekhein.

## 6. Deploy ke baad checks

Open frontend `/api/health`; JSON mein `status: "ok"` aur version `2.0.1` aana chahiye, HTML page nahi. Phir direct `/quran`, `/hadith`, `/login` aur nested reader route refresh karein. Register/login, role permissions, search, bookmark aur teacher-student messages check karein. Do alag browsers/devices se messaging/call test karein.

Socket.IO ko WebSocket-only transport par configure kiya gaya hai. Text messages HTTP se save/load hote hain, aur 15-second fallback refresh maujood hai. Vercel ki function duration limit / redeploy live connection close kar sakta hai; classroom currently explicit rejoin mangta hai. Unlimited uninterrupted video-call hosting ka promise nahi hai. Approved class ka external HTTPS meeting link bhi UI mein supported hai.

## Testing status

See backend `docs/PATCH_TEST_REPORT.md`. Static/syntax/unit/overlay checks full live production validation nahi hote. Installed React build, MongoDB/Atlas workflows, actual Vercel proxy cookies and two-device realtime calls were not run here.

Official deployment references, checked 2026-10-02:
- https://vercel.com/docs/frameworks/frontend/vite
- https://vercel.com/docs/routing/rewrites
- https://vercel.com/docs/functions/websockets
- https://vercel.com/docs/functions/configuring-functions/duration

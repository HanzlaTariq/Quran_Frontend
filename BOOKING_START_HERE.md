# Noor 2.1 — frontend update

`frontend/` ke **andar wali files** existing frontend repository ke root mein merge/replace karein. Poora `src` delete na karein aur repo ke andar extra `frontend` folder na banayein. Matching `backend/` patch bhi apply karna zaroori hai.

Apni actual `.env`, Vercel API destination, `vercel.json` aur existing dependencies preserve karein. Is patch mein koi nayi runtime dependency nahi hai.

```bat
cd /d F:\Quran\Quran_Frontend
npm run dev
```

Backend OTP ab mandatory hai; pehle us repo ki `BOOKING_START_HERE.md` ke mutabiq SMTP check karein. Admin course/teacher setup aur teacher ki availability save hone par student ko real slots nazar aayenge.

New/updated pages: signup + OTP, login + OTP, teacher directory, detailed teacher profile, course/teacher/weekly-slot booking, enrollment approval, automatic timetable, profile/availability/admin booking settings.

Frontend detail: `docs/BOOKING_UPDATE.md`. Full setup / test report: matching backend ke `docs/BOOKING_UPDATE.md` aur `docs/BOOKING_TEST_REPORT.md`.

Before pushing to Vercel, run `npm run build` in this installed project and check the complete admin → teacher → student → approval → class workflow. Installed Vite/React build and actual browser/device/deployment testing were not executed in the packaging environment.

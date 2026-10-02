# Noor Academy frontend 2.1 — apply to your existing frontend repository

This is a changed/new-files patch, NOT a complete project. Copy the contents of this ZIP's `frontend/` folder into your existing frontend repo root. Merge folders and replace matching files. Do not delete the entire old `src`, add a nested `frontend` wrapper, or overwrite your private environment files/custom Vercel configuration.

Apply the `backend/` folder to the matching existing backend repo at the same time. These new screens require the new 2.1 API; the old backend does not have OTP, slot reservations or schedule generation.

No new runtime dependency has been added. Restart the existing dev server:

```bat
cd /d F:\Quran\Quran_Frontend
npm run dev
```

Before production deployment, run `npm run build` in your installed project. The packaging environment could check JSX syntax but could not execute an installed React/Vite build.

## New pages and routes

- `/register`, `/login`: complete personal profile plus emailed OTP; no login session is accepted before the code is verified.
- `/courses`: all published admin courses, paginated/searchable; course cards link to teacher browsing and the new booking flow.
- `/teachers`: searchable/filterable verified approved teachers.
- `/teachers/:id`: photo, teaching profile, qualifications, offered courses and two-zone availability.
- `/enroll?course=...&teacher=...`: authenticated student slot selection, real availability, recurrence/fee review and submission to admin.
- `/enrollments`: role-scoped held/approved/expired requests, full schedule details and admin approval controls.
- `/classes`: student/teacher/admin timetable with both participants' local times; create/start/join/cancel controls based on server authorization.
- `/settings`: photo, country, city, IANA zone, languages, gender, age/phone, teacher availability/courses/qualifications, and admin duration/booking rules.

Teacher photos use a FileReader + canvas raster conversion compatible with the existing `img-src 'self' data:` policy, and are stored on the backend in MongoDB. Existing local upload URLs may need a new upload; absent photo files are not recreated.

## Setup order after applying both patches

1. Configure and verify backend SMTP. OTP is mandatory, including admin login.
2. Use the existing MongoDB Atlas URI; scheduling requires transactions.
3. Admin publishes courses, chooses lesson duration (default 30 minutes), and approves email-verified teachers.
4. Teacher signs in and saves a real time zone, languages, photo and seven-day availability.
5. Student saves their own time zone, chooses course/teacher/slots, reviews the plan and submits.
6. Admin approves; both participants see generated classes and the student/admin see monthly invoices.

The backend's `docs/BOOKING_UPDATE.md` contains exact environment names, email troubleshooting, legacy-data audit, billing/DST rules, Vercel requirements and optional integration-test instructions.

## Existing deployment configuration

This patch deliberately does NOT include `vercel.json` or `vite.config.js`, so your customized backend URL is preserved. Keep your current same-origin `/api` and `/socket.io` proxy/rewrites. Do not add private keys to frontend environment variables.

The UI uses flexible layouts and media queries for phone/tablet/desktop. That is implementation, not a claim of verified compatibility on every physical device. Installed React/Vite production build, live OTP delivery, Atlas booking concurrency and actual camera calls still require verification in your environment.

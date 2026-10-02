# Historical README — superseded by START_HERE_CLASSROOM.md

# Noor Academy — frontend patch

Start with [UPDATE_GUIDE.md](UPDATE_GUIDE.md).

Merge these changed/new files into the root of your existing frontend repository. They accompany the matching backend patch. The API and Socket.IO requests use the same-origin rewrites in `vercel.json`; replace both backend-origin placeholders before deploying.

```sh
npm install
npm run dev
# or:
npm run build
```

No secrets, dependency folders, build artifacts or private data are included. `PATCH_MANIFEST.json` records file changes relative to your uploaded original ZIP. Optional `npm run update:check` previews cleanup; `npm run update:clean` removes only untouched, obsolete baseline files.

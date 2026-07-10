
# Levitate Rebuild — Keep-in-Touch Cloud OS

Rebuild of Levitate's core (keep-in-touch marketing, not blast email) as a cloud web app.

**Current build:** Phase 1.1 layout tightening. Fully client-side with localStorage `levitate-rebuild-v1`, 24 seeded contacts, campaigns, automations, inbox, reporting, Lev AI mock.

**Live preview from Meta AI:** see artifact HTML in repo root backup if needed.

## Quick start
```bash
npm install
npm run dev
# open http://localhost:5173
```

## Phased plan (token-safe)
See `PLAN.md` for the 4-phase, 11-step plan that avoids rebuilds.

- Phase 0: Save strategy (versioned patches)
- Phase 1: Layout polish (1.1 done, 1.2 tables scroll + gap fixes)
- Phase 2: Supabase Auth + Postgres + Gmail API real sending (looks 1:1 via your Gmail)
- Phase 3: Handwritten cards fulfillment (Lob/Handwrytten adapter)
- Phase 4: Vertafore AMS360 / QQ Catalyst + Redtail / Wealthbox sync mocks

## Repo structure
- `src/App.tsx` - entire app currently (will split into features/ as we go)
- `PLAN.md` - detailed execution plan
- `supabase/` - will hold schema.sql and migrations
- `docs/` - research notes

## Next to push to GitHub
```bash
git init
git add .
git commit -m "init: levitate rebuild v0.2 - layout tightened"
gh repo create levitate-rebuild --public --source=. --remote=origin --push
# or:
# git remote add origin https://github.com/YOU/levitate-rebuild.git
# git push -u origin main
```

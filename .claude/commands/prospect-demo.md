# /prospect-demo - Suggested Landing Structure

`$ARGUMENTS`: business name (must already exist via `/prospect`).

---

1. Read `freelance/local/<negocio>/prospect.md` for context (sector, detected need). If it
   doesn't exist, tell the user to run `/prospect` first.
2. Generate a landing page **structure** per `.claude/skills/freelance-assistant/02-local-prospects.md`'s
   Demo Scope section: section names, what goes in each, enough copy direction to build from.
   **Not full code** - this is a spec for a developer (Freddy) to implement in Next.js or
   Astro, sized to a realistic 2-3 hour build, not a 10-section dream site.
3. Save to `freelance/local/<negocio>/demo.md`.
4. Update the `freelance/tracker.csv` row for this business: `Estado=Demo listo`.
5. Confirm with a one-line summary of the sections proposed.

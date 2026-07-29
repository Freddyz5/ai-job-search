# /upwork-sync - Push Upwork Rows to Notion

Syncs `freelance/tracker.csv` rows where `Canal=Upwork` to the **🏢 Clientes Freelance**
database (`collection://4238a325-d988-41c9-ac56-5c39810d3a2f`) in Notion.

**Different philosophy from `/notion-sync` (Job Tracker):** there, Notion is manually edited
by Freddy and treated as more current than the local file, so most properties are write-once.
Here, **the local CSV is the source of truth and Notion is the synced view** - Freddy edits the
CSV (or uses `/upwork-outcome`), not Notion directly, for this database. So this command
**overwrites `Estado` and prices from the CSV every run** - that's correct here, not a bug.

---

1. Add these properties to the database if they don't already exist (additive only - never
   rename or remove `Sector`, `Necesidad detectada`, `Demo hecho`, or any other existing
   property, even though this command never writes to them):
   - `Link` (url)
   - `Propuestas al aplicar` (number)
   - `Review obtenida` (checkbox)
2. For each `Canal=Upwork` row in the CSV with `Estado` other than `Prospecto` (drafted but
   unsent proposals stay local-only, same rule as `/apply-json` never syncing an unconfirmed
   application):
   - Match an existing Notion page by `Link`, falling back to exact `Negocio / Proyecto` title
     match.
   - **No match** → create a page: `Negocio / Proyecto`, `Canal=Upwork`, `Estado`,
     `Precio ofertado`, `Precio cerrado` (if set), `Link`, `Review obtenida`, `Notas`.
   - **Match** → update the same fields from the CSV values. This is the one sync command in
     this repo allowed to overwrite `Estado` unconditionally - the CSV is authoritative here.
3. **Never write to `Sector`, `Necesidad detectada`, `Demo hecho`, `Fecha contacto`, or
   `Fecha seguimiento`** on an Upwork row - those are local-client-only fields, leave them
   blank.
4. Report a one-line summary: rows created, rows updated, rows skipped (still `Prospecto`).

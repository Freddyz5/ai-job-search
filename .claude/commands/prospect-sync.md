# /prospect-sync - Push Local Client Rows to Notion

Syncs `freelance/tracker.csv` rows where `Canal=Local Quito` to the **🏢 Clientes Freelance**
database (`collection://4238a325-d988-41c9-ac56-5c39810d3a2f`) in Notion. Every property this
command needs (`Sector`, `Necesidad detectada`, `Demo hecho`, `Estado`, `Precio ofertado`,
`Precio cerrado`, `Mantenimiento mensual`, `Contacto`, `Fecha contacto`, `Fecha seguimiento`,
`Notas`) already exists in the database - nothing to add here.

**Same philosophy as `/upwork-sync`:** the local CSV is the source of truth, Notion is the
synced view. This command overwrites `Estado` and the other synced fields from the CSV every
run - that's intentional, not a bug (contrast with `/notion-sync` for the Job Tracker, where
Notion itself is manually edited and treated as current).

---

1. For each `Canal=Local Quito` row in the CSV:
   - Match an existing Notion page by exact `Negocio / Proyecto` title match.
   - **No match** → create a page with `Negocio / Proyecto`, `Canal=Local Quito`, `Sector`,
     `Necesidad detectada`, `Estado`, `Precio ofertado`, `Precio cerrado` (if set),
     `Mantenimiento mensual` (if set), `Contacto`, `Fecha contacto`, `Fecha seguimiento`,
     `Notas`. Set `Demo hecho=Si` if `freelance/local/<negocio>/demo.md` exists, else `No`.
   - **Match** → update the same fields from the CSV.
2. **Never write to `Link`, `Propuestas al aplicar`, or `Review obtenida`** on a local-client
   row - those are Upwork-only fields, leave them blank.
3. Report a one-line summary: rows created, rows updated.

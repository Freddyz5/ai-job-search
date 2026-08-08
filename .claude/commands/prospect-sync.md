# /prospect-sync - Publish Local Prospects to Notion, and Pull Their State Back

Syncs local-client rows to the **🏢 Clientes Freelance** database
(`collection://4238a325-d988-41c9-ac56-5c39810d3a2f`).

`$ARGUMENTS`: optional. `--pull` runs only the reconciliation half (Step 4); with no arguments,
both halves run.

**Notion is the source of truth for pipeline state; the CSVs are the history.** This is the
opposite of `/upwork-sync`, which sits in the same database, and the inversion is deliberate:
Freddy works the local pipeline *from the Notion board* — triaging qualified prospects, moving
states after a visit, adding notes from his phone. Overwriting that from a file would silently
destroy the only record of what actually happened. Upwork keeps the old rule because he does not
work that channel from the board.

The two commands are separate for exactly this reason. **Never unify them.**

---

## Ownership contract

This is the load-bearing rule of the whole local pipeline. Violating it loses real fieldwork.

**Claude owns (writes and updates freely):** `Negocio / Proyecto`, `Canal`, `Sector`,
`Necesidad detectada`, `Score`, `Capa`, `Place ID`, `Precio ofertado`, and the page body.

**Freddy owns (never overwritten on an existing page):** `Estado`, `Fecha contacto`,
`Fecha seguimiento`, `Notas`, `Precio cerrado`, `Demo hecho`.

Claude sets Freddy-owned fields **once, at page creation** (`Estado=Prospecto`, the rest empty)
and never touches them again.

---

## Step 0: Preflight

Confirm Notion MCP tools are available in this session. If not, say so in one line and stop —
same graceful exit as `/notion-sync`. Never start an OAuth flow from this command.

## Step 1: Ensure the schema

Add these properties to the database if missing (**additive only** — never rename, retype, or
remove an existing property, and never touch `Review obtenida` or `Propuestas al aplicar`, which
are Upwork-only):

| Property | Type | Notes |
|---|---|---|
| `Score` | number | 0-100 weighted total |
| `Capa` | select | `Grande` / `Mediana` / `Micro` |
| `Place ID` | rich text | Dedup anchor. Never shown to Freddy, never hand-edited |
| `Maps` | url | Link to the Google listing, derived from `Place ID` |
| `Web / Redes` | url | The business's own site, or its Facebook/Instagram when that is all it has |
| `Origen` | select | `Maps` / `Referido` / `Red personal` / `Observado` |

Also ensure `Estado` contains the option **`Preparado`** (set by `/prospect` once the approach
script and priced proposal exist). Add it if missing; **never rename or remove** the existing
options — they belong to Freddy's own pipeline stages.

**Never write `Canal=Referido`.** That option exists on the database but a referral is still a
local client: `Canal` is always `Local Quito` here, and how the prospect was found goes in
`Origen`. A row tagged `Canal=Referido` is invisible to this command and to
`/prospect-followup`, both of which filter on `Canal=Local Quito` — it would silently never sync
and never generate a follow-up.

These properties stay empty on `Canal=Upwork` rows, exactly as `Review obtenida` stays empty on
local ones.

## Step 2: Publish qualified prospects

Read `freelance/local/prospects_qualified.csv`. For every row with `Estado sourcing=Calificado`:

1. Look for a Notion page whose `Place ID` matches. Match on Place ID only — business names in
   Quito collide (there are several "Ferretería Central"), and a name-based match would either
   duplicate or overwrite the wrong client.
2. **No match** → create the page:
   - `Negocio / Proyecto`, `Canal=Local Quito`, `Sector`, `Necesidad detectada`, `Score`,
     `Capa`, `Place ID`, `Origen`, `Contacto` (phone), `Maps`, `Web / Redes`
   - `Estado=Prospecto` — set here once, and never again
   - Leave `Fecha contacto`, `Fecha seguimiento`, `Notas`, `Precio cerrado`, `Demo hecho` empty
   - Write the body (Step 3)
3. **Match exists** → update **only** `Score`, `Capa`, `Sector`, `Necesidad detectada`, `Maps`
   and `Web / Redes`. Leave every Freddy-owned property and the page body alone.
4. Set `Estado sourcing=Publicado` on the CSV row.

Rows already `Publicado`, `Promovido` or `Descartado` are skipped.

### Building the `Maps` link

From the `Place ID`, deterministically:

```
https://www.google.com/maps/place/?q=place_id:<PLACE_ID>
```

For a synthetic `manual:<slug>` anchor there is no listing, so fall back to a search URL built
from the business name:

```
https://www.google.com/maps/search/?api=1&query=<nombre+urlencoded>+Quito
```

Never fetch either URL and never verify it resolves — these are links for Freddy to open, and a
search URL that finds nothing is a fine outcome. This is the same rule `/scrape` follows for its
LinkedIn contact links: generate the search, never scrape the results.

## Step 3: Write the page body (new pages only)

The body is what Freddy reads to decide whether this prospect is worth 15 minutes. Build it
**only** from the CSV row — never invent, never re-derive, never fetch:

- **Dolor detectado** — the verbatim quote from `Dolor citado` with its `Fecha resena`, then the
  operational process behind it from `Proceso operativo`. Quote it exactly as recorded; this
  text is what the approach script gets built on, and an embellished quote read back to a
  business owner ends the relationship.
- **Calificación** — a small table of the four dimension scores from the `Score *` columns, the
  weighted total, and the assigned layer.
- **Datos** — phone, address, zone, tier, rubro, origin.
- **Para investigar** — the research links (below).

### Research links

The Places data only ever carries a handful of reviews, so the Maps link is how Freddy reads the
rest before a visit — that is the point of including it, not decoration.

- **Ficha en Maps** — the URL built above. Say plainly when it is a name search rather than a
  real listing, so he knows it may land on the wrong business.
- **Sitio web** — from `Web`, or `sin web` when empty. If the value is a facebook.com or
  instagram.com URL, label it as such: for many small businesses in Quito that *is* the
  storefront, and it changes how the approach reads.
- **Búsqueda en redes** — two search links, generated, never fetched:
  - `https://www.facebook.com/search/top?q=<nombre+urlencoded>+Quito`
  - `https://www.google.com/search?q=<nombre+urlencoded>+Quito+instagram`

  Google Places does not return social profiles. **Never state that a business has an Instagram
  or Facebook account, and never write a profile URL that was not in the data.** A fabricated
  handle is worse than an empty field: it sends Freddy into a visit believing something about
  the business that is not true.

Keep it under ~20 blocks. Bodies are **write-once**: Freddy adds his own notes there after a
visit, and a rewrite would erase them.

## Step 4: Pull state back to the CSV

The reverse half, so the local files do not drift into lying about the pipeline.

For each `Canal=Local Quito` page in Notion, find the matching row in `freelance/tracker.csv` by
`Place ID` and update `Estado`, `Fecha contacto`, `Fecha seguimiento`, `Notas`, `Precio cerrado`
and `Demo hecho` **from Notion into the CSV**. Notion wins every conflict here.

Also mirror terminal states back to `prospects_qualified.csv`: a page Freddy set to `Descartado`
sets `Estado sourcing=Descartado` on its qualified row, so `/maps-qualify` never resurrects a
business he already rejected.

If a Notion page has no matching tracker row (it is still only a qualified prospect, not yet
prepared), that is expected — skip it silently.

## Step 5: Report

One short summary: pages created, pages updated, rows skipped, and state changes pulled back
from Notion. Then point at the next step: **review the board and run `/prospect "<Negocio>"` on
the ones worth preparing.**

---

## Important rules

1. **Never overwrite a Freddy-owned property on an existing page.** The ownership contract above
   is absolute. `Estado` in particular is set exactly once, at creation.
2. **Place ID is the only dedup key.** Never fall back to fuzzy name matching for local rows.
3. **Page bodies are write-once.** They accumulate Freddy's own field notes.
4. **Never write `Score`, `Capa`, `Place ID`, `Maps` or `Origen` on an Upwork row**, and never
   touch `Review obtenida` or `Propuestas al aplicar` on a local one.
5. **`Canal` is always `Local Quito` for these rows.** Never `Referido` — origin belongs in
   `Origen`, and mis-tagging `Canal` makes the row invisible to every local command.
6. **Never merge this command with `/upwork-sync`.** They share a database and contradict each
   other on purpose.
7. **Additive schema changes only.** Existing select options are Freddy's; new ones may be added,
   existing ones never renamed or removed.
8. **Links are generated, never fetched, never invented.** Social profiles in particular are not
   in the Places data — only search links may be written.

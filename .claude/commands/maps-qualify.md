# /maps-qualify - Qualify Google Maps Prospects

`$ARGUMENTS`: optional filter (vertical, zone, or `--all`). With no arguments, qualifies every
unscored row in the raw file.

Reads `freelance/local/prospects_raw.csv` (dumped from a Google Maps sourcing session), applies
the gate and scoring in `.claude/skills/freelance-assistant/03-prospect-evaluation.md`, and
writes the survivors to `freelance/local/prospects_qualified.csv`.

**This command does not touch `freelance/tracker.csv` and does not write to Notion.** It ends at
`prospects_qualified.csv`; `/prospect-sync` publishes from there. A business enters the tracker
only when `/prospect` is run on it.

---

## Step 0: Input check

If `freelance/local/prospects_raw.csv` doesn't exist or is empty, stop and tell Freddy the
sourcing session hasn't produced a file yet. Expected columns:

```
Negocio,Rubro,Direccion,Telefono,Rating,Num resenas,Horario,Resenas negativas,Resenas positivas,Web,Tipo web,Place ID
```

Missing columns are tolerated — score what's there and note in the output which dimension had
to be estimated on incomplete data. Never silently score a dimension with no evidence behind
it.

**A blank `Web` is not proof of no website.** Older raw files predate the `Tipo web` column; if
it is absent, treat every row as `Desconocido` rather than assuming absence, and say so in the
report. That assumption produced real false positives — prospects flagged as needing a site who
already had one, findable from their own Maps listing.

## Step 1: Dedup

For each raw row, check `freelance/local/prospects_qualified.csv` and `freelance/tracker.csv`
(`Canal=Local Quito`) for a matching **`Place ID`**, falling back to business name where a row
predates the Place ID column. Already-present businesses are skipped and reported at the end as
skipped, not re-scored.

Place ID is the dedup anchor for this whole pipeline — the local equivalent of the Job
Tracker's `Key`. Never drop it from a row, and never alter its casing.

## Step 2: Eligibility gate

Apply the gate table from `03-prospect-evaluation.md` verbatim. A FAIL is dropped without a
score. **Report every drop with its reason** — a silently discarded row is a row Freddy can't
argue with, and the gate rules are still unvalidated. He may know something about a business
that Google doesn't.

## Step 3: Score

Score the four dimensions, apply the weights, compute the total, assign the layer from the
threshold table. Show the arithmetic — a total that can't be traced back to its dimensions is
a number Freddy can't correct.

## Step 4: Extract pain evidence

Per the pain extraction rules in `03-prospect-evaluation.md`: verbatim quotes, original
language, dated, max 3 per business, each mapped to the operational process behind it. Never
invent a quote. If there is none, dimension 1 scores low and that is the answer.

## Step 5: Write

Append survivors to `freelance/local/prospects_qualified.csv`, creating it with this header if
it doesn't exist:

```
Negocio,Place ID,Origen,Sector,Rubro,Tier,Score,Score pain,Score volumen,Score madurez,Score alcance,Capa,Dolor citado,Fecha resena,Proceso operativo,Necesidad detectada,Telefono,Direccion,Zona,Web,Tipo web,Estado sourcing,Fecha calificacion,Notas
```

- `Tipo web` is one of `Propia` / `Facebook` / `Instagram` / `Ninguna` / `Desconocido`. Default
  to `Desconocido` whenever the raw row is blank — `Ninguna` is a claim, and it requires that
  someone actually looked.
- Leave `Necesidad detectada` **empty** when `Tipo web=Desconocido` and no review-based need is
  evident. An empty cell is honest; `Sin web` on unverified data becomes a false statement made
  to the owner's face.

- `Place ID` is mandatory. A row without one cannot be synced or deduped — if the raw row is
  missing it, report the row as unusable rather than writing it with an empty anchor.
- `Origen` is `Maps` for every row this command writes. `/add-prospect` writes `Referido`,
  `Red personal` or `Observado` — keeping those separate is what stops warm-lead conversion
  rates from masking a broken cold pitch.
- The four `Score *` columns carry the per-dimension scores so `/prospect-sync` can publish the
  breakdown into the Notion page body without re-deriving it.

- `Sector` and `Necesidad detectada` must use the **existing** taxonomies in
  `02-local-prospects.md`. Never invent a new value — the tracker and Notion both depend on
  that vocabulary being closed.
- `Estado sourcing` is one of `Calificado` / `Publicado` / `Promovido` / `Descartado`. Set
  `Calificado` here. `/prospect-sync` sets `Publicado` when the Notion page exists; `/prospect`
  sets `Promovido` when the tracker row is created.
- `Dolor citado` holds the strongest single quote; the rest go in `Notas`.

## Step 6: Report

Show a table sorted by score descending: business, tier, score, layer, one-line pain. Mark any
row whose total is partial (a dimension went unscored) so it is visibly less trustworthy than a
fully scored one. Then a summary: rows read, dropped (with the reason breakdown), skipped as
duplicates, qualified, and **how many carry `Tipo web=Desconocido`** — that count is the size of
the verification backlog `/prospect` will have to close before any of them can be pitched.

Close with the top 3 by score and remind that the next step is **`/prospect-sync`**, which
publishes everything qualified to Notion for triage — not `/prospect`, which comes after Freddy
picks from the board. With 3-5 h/week the realistic target is **10-12 first contacts per
month**, so if more than 12 rows qualify, say so: they can all be published, but they should not
all be prepared at once.

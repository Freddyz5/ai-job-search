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
Negocio,Rubro,Direccion,Telefono,Rating,Num resenas,Horario,Resenas negativas,Resenas positivas,Web,Place ID
```

Missing columns are tolerated — score what's there and note in the output which dimension had
to be estimated on incomplete data. Never silently score a dimension with no evidence behind
it.

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
Negocio,Place ID,Sector,Rubro,Tier,Score,Score pain,Score volumen,Score madurez,Score alcance,Capa,Dolor citado,Fecha resena,Proceso operativo,Necesidad detectada,Telefono,Direccion,Zona,Web,Estado sourcing,Fecha calificacion,Notas
```

- `Place ID` is mandatory. A row without one cannot be synced or deduped — if the raw row is
  missing it, report the row as unusable rather than writing it with an empty anchor.
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

Show a table sorted by score descending: business, tier, score, layer, one-line pain. Then a
summary: rows read, dropped (with the reason breakdown), skipped as duplicates, qualified.

Close with the top 3 by score and remind that the next step is **`/prospect-sync`**, which
publishes everything qualified to Notion for triage — not `/prospect`, which comes after Freddy
picks from the board. With 3-5 h/week the realistic target is **10-12 first contacts per
month**, so if more than 12 rows qualify, say so: they can all be published, but they should not
all be prepared at once.

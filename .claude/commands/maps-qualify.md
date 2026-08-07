# /maps-qualify - Qualify Google Maps Prospects

`$ARGUMENTS`: optional filter (vertical, zone, or `--all`). With no arguments, qualifies every
unscored row in the raw file.

Reads `freelance/local/prospects_raw.csv` (dumped from a Google Maps sourcing session), applies
the gate and scoring in `.claude/skills/freelance-assistant/03-prospect-evaluation.md`, and
writes the survivors to `freelance/local/prospects_qualified.csv`.

**This command does not touch `freelance/tracker.csv`.** The tracker's columns are mapped 1:1
to the 🏢 Clientes Freelance Notion database and have nowhere to put a score, a layer or a
pain quote. A business enters the tracker only when `/prospect` is run on it — that is the
moment it stops being a lead and becomes a prospect.

---

## Step 0: Input check

If `freelance/local/prospects_raw.csv` doesn't exist or is empty, stop and tell Freddy the
sourcing session hasn't produced a file yet. Expected columns:

```
Negocio,Rubro,Direccion,Telefono,Rating,Num resenas,Horario,Reseñas negativas,Reseñas positivas,Web,Place ID
```

Missing columns are tolerated — score what's there and note in the output which dimension had
to be estimated on incomplete data. Never silently score a dimension with no evidence behind
it.

## Step 1: Dedup

For each raw row, check both `freelance/local/prospects_qualified.csv` and
`freelance/tracker.csv` (`Canal=Local Quito`) for a matching business name. Already-present
businesses are skipped and reported at the end as skipped, not re-scored.

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
Negocio,Sector,Rubro,Tier,Score,Capa,Dolor citado,Fecha resena,Proceso operativo,Necesidad detectada,Telefono,Direccion,Zona,Web,Estado sourcing,Fecha calificacion,Notas
```

- `Sector` and `Necesidad detectada` must use the **existing** taxonomies in
  `02-local-prospects.md`. Never invent a new value — the tracker and Notion both depend on
  that vocabulary being closed.
- `Estado sourcing` is one of `Calificado` / `Contactado` / `Promovido` / `Descartado`. Set
  `Calificado` here. `/prospect` sets `Promovido` when it creates the tracker row.
- `Dolor citado` holds the strongest single quote; the rest go in `Notas`.

## Step 6: Report

Show a table sorted by score descending: business, tier, score, layer, one-line pain. Then a
summary: rows read, dropped (with the reason breakdown), skipped as duplicates, qualified.

Close with the top 3 by score and the exact `/prospect` command line for each. With 3-5 h/week
the realistic target is **10-12 first contacts per month**, so if more than 12 rows qualify,
say so and recommend holding the rest in the file rather than contacting everything at once.

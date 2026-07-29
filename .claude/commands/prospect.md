# /prospect - Register a Local Business Prospect

`$ARGUMENTS`: business name and sector (e.g. `/prospect "Cevichería El Puerto" Restaurante`).

---

## Step 0: Dedup Check

Read `freelance/tracker.csv`. If a row already exists for this business name (`Canal=Local
Quito`), stop and show its current state instead of creating a duplicate.

## Step 1: Detect the Need

Don't assume - check. `WebSearch` the business name + "Quito" to see if they have a real
website, and what state it's in. Classify against `Necesidad detectada` in
`.claude/skills/freelance-assistant/02-local-prospects.md` (Sin web / Web desactualizada /
Sin agendamiento / Sin tienda online / Automatizacion / Dashboard / Otro). If the search is
inconclusive, say so and ask Freddy rather than guessing - he may have seen the business in
person.

## Step 2: Approach Script

Read `02-local-prospects.md` and write the in-person approach script per its rules: short,
spoken (not read), opens with the specific thing noticed, adapted to the sector, ends with a
low-friction ask (show the demo) rather than a hard sell.

## Step 3: Priced Proposal

Using the reference rates and anti-underquoting rule from `02-local-prospects.md`, draft a
proposal with a specific price (not a vague range) matched to the detected need and a
realistic scope.

## Step 4: Save

Write to `freelance/local/<negocio>/prospect.md` (slugify the business name for the folder).

## Step 5: Local Tracker

Add a row to `freelance/tracker.csv`: `Canal=Local Quito`, `Negocio / Proyecto=<nombre>`,
`Sector`, `Necesidad detectada`, `Estado=Prospecto`, `Precio ofertado`.

## Step 6: Confirm

Show the script and the proposal. Remind: `/prospect-demo` next if a landing demo would help
close it, `/prospect-outcome` after the actual visit.

# /prospect - Register a Local Business Prospect

`$ARGUMENTS`: business name and sector (e.g. `/prospect "Cevichería El Puerto" Restaurante`).
Sector is optional when the business already has a qualified row — it is read from there.

This command runs on a business Freddy has **already picked off the Notion board**. It does not
select prospects; `/maps-qualify` scores them and `/prospect-sync` publishes them for triage.

---

## Step 0: Dedup Check

Read `freelance/tracker.csv`. If a row already exists for this business (`Canal=Local Quito`),
match by `Place ID` where present and by name otherwise, then stop and show its current state
instead of creating a duplicate.

## Step 0.5: Check for a Qualified Row

Read `freelance/local/prospects_qualified.csv`. If this business is already there (from
`/maps-qualify`), **use it** - it carries the score, the assigned layer, the verbatim pain
quote and the operational process behind it. That is far stronger material than anything a
fresh search will produce, and re-deriving it wastes the sourcing work.

When a qualified row exists:
- Skip the guesswork in Step 1; `Necesidad detectada` and `Sector` are already set
- Build the Step 2 script around the **quoted review**, not around the website's state
- Price to the assigned `Capa` in Step 3
- Carry its `Place ID` into the tracker row — it is the dedup anchor `/prospect-sync` matches on
- Set `Estado sourcing=Promovido` on the qualified row once the tracker row is written

If there's no qualified row, continue below - manual prospects stay fully supported.

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

For `Capa=Mediana` or `Micro`, the three **detachability conditions** in
`03-prospect-evaluation.md` are mandatory: written closed scope with an explicit end date,
post-delivery changes quoted separately, and optional cancellable maintenance. A small project
without them turns into unpaid lifetime support.

For `Capa=Grande`, check whether the panel offer has actually been defined. If it's still the
placeholder range in `02-local-prospects.md`, say so and stop rather than quoting a number.

## Step 4: Save

Write to `freelance/local/<negocio>/prospect.md` (slugify the business name for the folder).

## Step 5: Local Tracker

Add a row to `freelance/tracker.csv`: `Canal=Local Quito`, `Negocio / Proyecto=<nombre>`,
`Sector`, `Necesidad detectada`, `Estado=Preparado`, `Precio ofertado`, and the `Place ID` from
the qualified row.

## Step 5.5: Update Notion

If a Notion page exists for this `Place ID` in **🏢 Clientes Freelance**, set `Estado=Preparado`
and `Precio ofertado` on it, so the board shows what is ready to go out this week.

This is the **one** exception to the ownership contract in `/prospect-sync`, and it is narrow on
purpose: `Preparado` is a fact about work Claude just produced, not a judgement about the
client relationship. Only make this write when the page is currently `Prospecto`. If Freddy has
already moved it to anything else, leave it alone and say so — he knows something about that
business that the file does not.

If no page exists (a manual prospect that never went through sourcing), skip this and mention
that `/prospect-sync` will not publish it, since it has no `Place ID`.

## Step 6: Confirm

Show the script and the proposal. Remind Freddy that after the real visit he updates `Estado`
and `Fecha contacto` **in Notion** — that board is the source of truth for pipeline state, and
`/prospect-followup` reads its dates to decide what is due.

Then: `/prospect-demo` if a landing demo would help close it, `/prospect-followup` if there is
no reply in 5-7 days.

**Never build a demo before the first contact gets a reply.** At 3-5 h/week a demo consumes the
entire prospecting budget on a single business that hasn't shown any interest yet. The demo is
the second touch, not the first.

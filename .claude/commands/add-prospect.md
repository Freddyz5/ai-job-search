# /add-prospect - Register a Local Prospect Found Outside Google Maps

`$ARGUMENTS`: business name, optionally with a hint (`/add-prospect "Ferretería El Tornillo"
referido`). With no arguments, ask for the name.

The local equivalent of `/add-job`: a business Freddy found in person, through his network, or
by referral. Maps sourcing covers cold prospecting; this covers everything warm, which is the
higher-converting half and cannot be allowed to bypass the board.

Output is a row in `freelance/local/prospects_qualified.csv`, ready for `/prospect-sync` to
publish. **Same funnel, different entrance** — a manual prospect gets triaged on the Notion
board like every other one, so the pipeline stays complete and the ratios stay honest.

---

## Step 0: Dedup

Check `prospects_qualified.csv` and `freelance/tracker.csv` for the business, by name (there is
no Place ID yet). If found, stop and show its current state. Warn on near-matches too rather
than creating a second row — Quito business names collide, and a duplicate on the board is worse
than a missing one.

## Step 1: Classify the origin

Ask which this is, and record it in the `Origen` column:

| `Origen` | What it means |
|---|---|
| `Referido` | Someone vouched for Freddy to this business, or vice versa |
| `Red personal` | Freddy knows the owner or someone inside |
| `Observado` | He walked past, was a customer, or saw the operation himself |
| `Otro` | Anything else — say what in `Notas` |

**This field is not bookkeeping.** Warm prospects convert several times better than cold ones,
and mixing both into one conversion rate makes both numbers meaningless — a healthy referral
pipeline can hide a completely broken cold pitch, and vice versa. `/prospect-outcome`'s
calibration reads this column to keep them separate.

## Step 2: Gather what Freddy actually knows

Ask, in one or two open questions rather than a form. Missing answers are fine; say which
dimensions ended up unscored rather than inventing values.

- What the business does, and roughly how big (branches, staff, whether it looks busy)
- **What operational problem he saw or was told about** — this is the core of the whole record
- Who said it, or how he saw it
- Contact: name of the person, phone, address, zone
- Whether they have a website or run on social media only

Then check Maps anyway: many businesses are listed even when Freddy did not find them that way.
If a listing exists, take its `Place ID`, rating, review count and any operational complaints —
free evidence, and it makes the row behave exactly like a sourced one.

## Step 3: Score, with observed evidence allowed

Apply `03-prospect-evaluation.md` normally, with two adjustments this command owns:

**Dimension 1 (operational pain) accepts three sources**, not just reviews:

| Source | Ceiling | Why |
|---|---|---|
| Owner or insider stated the problem directly | 100 | Stronger than any review — it is the buyer naming his own pain |
| Freddy observed it himself | 85 | Real, but one visit is a small sample |
| Third-hand ("my cousin says they're a mess") | 60 | Hearsay; verify on the first visit |
| Nothing concrete | 0-30 | Same as a Maps row with no useful reviews |

Record the source next to the pain, always. A claim whose origin is not recorded becomes
indistinguishable from a guess three weeks later, and it is what the approach script gets built
on.

**The eligibility gate is relaxed for `Referido` and `Red personal` only.** The
under-10-reviews and no-digital-presence rules exist to filter cold noise; a warm introduction
carries the trust those rules were proxying for. The rules that still apply without exception:
chain or franchise, medical clinic, and vertical outside Tier A/B/C. A referral to a business
Freddy cannot actually help is still a no.

## Step 4: Write the row

Append to `freelance/local/prospects_qualified.csv` with `Estado sourcing=Calificado`.

- `Place ID`: use the real one if Maps had a listing. Otherwise generate `manual:<slug>` from
  the business name (lowercase, hyphens). It is the same anchor field the whole pipeline
  deduplicates on — never leave it empty, and never reuse a slug.
- `Sector` and `Necesidad detectada` must come from the closed taxonomies in
  `02-local-prospects.md`. No new values, ever.
- `Dolor citado`: what was said or seen, as close to verbatim as Freddy can recall, followed by
  the source in parentheses. Never smooth it into marketing language.
- Leave any dimension he could not answer blank in `Notas` rather than scoring it on nothing.

## Step 5: Confirm

Show the scored row: total, layer, the pain and its source. Then point at `/prospect-sync` to
publish it to the board.

If `Origen` is `Referido` or `Red personal`, say so plainly in the summary: these should be
worked before anything cold on the board, whatever the score says. Score measures the size of
the problem; a warm introduction measures the odds of being listened to at all, and at 3-5 h a
week the second one is worth more.

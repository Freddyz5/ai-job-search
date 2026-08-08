---
framework_version: 1.0.0
---

# Local Prospect Evaluation Framework (Quito)

Mirrors `job-application-assistant/04-job-evaluation.md`, but for local client acquisition.
Sourcing runs on **Google Maps** data. This file is the rulebook for `/maps-qualify`; the
pricing, sector taxonomy and approach-script rules stay in `02-local-prospects.md`.

## Where this sits in the pipeline

The local channel mirrors the job-search flow: `/maps-qualify` is its `/rank`, `/prospect-sync`
is its `/notion-sync`, and `/prospect` is its `/apply-json`.

```
Google Maps -> prospects_raw.csv -> /maps-qualify -> prospects_qualified.csv
                                                            |
         /add-prospect (referrals, walk-ins) --------------->|
                                                            |
                                                   /prospect-sync -> Notion board
                                                            |
                                              Freddy triages, picks one
                                                            |
                                              /prospect -> tracker.csv
```

Two entrances, one funnel. Cold rows arrive through Maps; warm ones — referrals, walk-ins,
network — through `/add-prospect`. Both land in the same qualified file and reach the same
board, so nothing bypasses triage.

**Notion is the source of truth for pipeline state; the CSVs are history.** Scoring exists to
rank what reaches the board — it never decides who gets contacted. That call is Freddy's, made
on the board, and a score is an argument he can overrule.

**Read this before scoring anything:** the qualifying signal is *not* "has no website". It is
**operational pain published in the business's own Google reviews** by its own customers, with
a date and a quotable sentence. A business with a bad website and happy customers is a $400
job at best. A business with a decent website and six reviews complaining that orders arrive
late is the $2,000+ job.

## Capacity constraint

Freddy has **3-5 h/week** for prospecting, on top of employment. Every rule below exists to
protect that budget. If a step would blow it, the step is wrong, not the budget.

---

## The three layers

All three run in parallel and are fed by **one** prospecting motion. There are not two funnels;
there is one funnel with three price exits. The small layers are cash flow while the big layer
matures — they are not a different business.

| Layer | Ticket | What it is | `Necesidad detectada` |
|---|---|---|---|
| **Grande** | $2,000+ | Internal panel: inventory, orders, quotes, customers | `Dashboard` or `Automatizacion` |
| **Mediana** | $400-800 | Website + product catalogue | `Sin web` / `Web desactualizada` / `Sin tienda online` |
| **Micro** | $100-200 | Fixes, small changes, maintenance | `Otro` (describe in `Notas`) |

The mediana/micro layers are normally reached as a **downsell of the same contact**, not as a
separate search. The pitch goes out about operational pain; if the owner says "that's too
expensive, but I do need X", that is the downsell, at zero extra prospecting cost.

### Governance rule — cap by hours, not by client count

<!-- This is the rule that keeps the small layer from eating the big one. -->

The control metric is **$/hour**, not client count and not total revenue. If the mediana +
micro layers together consume more than **8 h/month**, raise prices or drop clients. Below
that, five small clients are healthy.

When `/prospect-outcome` records a close in the mediana or micro layer, remind Freddy of this
cap and ask for an estimate of monthly hours committed.

### Detachability conditions (mediana and micro only)

Never quote a mediana or micro project without all three. Without them a $400 client becomes
lifetime free support, and the cost lands exactly when the big project needs the hours.

1. Scope closed in writing, with an **explicit project end date**
2. Post-delivery changes quoted separately, **always**, no exceptions
3. Monthly maintenance **optional and cancellable** ($50-150/mo, per `02-local-prospects.md`)

If the user drafts a proposal missing any of these, flag it before saving.

---

## Target verticals

Ordered by operational pain x ability to pay x decision speed. The `Sector` column is the value
to write to the CSV — these all map onto the **existing** taxonomy in `02-local-prospects.md`,
so no new Notion select options are needed.

### Tier A — target for the grande layer

| Vertical | `Sector` | Typical pain |
|---|---|---|
| Distributors / mass-consumption wholesalers | `Comercio` | Orders, stock, routes, overdue receivables |
| Food distributors with refrigeration | `Comercio` | Cold chain (direct MTC parallel) |
| Small importers | `Comercio` | Serials, batches, customs clearance |
| Hardware stores with 2+ branches | `Comercio` | Stock visibility across locations |
| Transport, courier, moving companies | `Servicios` | Dispatch, waybills, tracking |

### Tier B — good ticket, slower cycle

| Vertical | `Sector` | Typical pain |
|---|---|---|
| Mechanic shops / tyre-and-service centres | `Servicios` | Work orders, parts, per-vehicle history |
| Dental labs and opticians | `Clinica / Salud` | Traceable orders (direct Media Value parallel) |
| Print shops and screen printing | `Servicios` | Quotes and production orders |
| Agri-supply and veterinary distributors | `Comercio` | Stock, batches, expiry dates |

### Tier C — mediana / micro layer only

Consultancies, gyms, restaurants with multiple locations → `Servicios` / `Restaurante`.
Never pitch the grande layer here; the ticket does not support it.

### Excluded for now

**Medical clinics.** Sensitive patient data, committee decisions, multi-month cycles. If Freddy
asks for them anyway, quote this line back and let him override explicitly.

---

## Eligibility gate — run before scoring

Hard filter, not a scoring dimension. A FAIL is dropped without a score and without a draft.

| Condition | Verdict |
|---|---|
| Fewer than 10 reviews | **FAIL** — no operational volume, and no public pain to cite |
| Chain or franchise | **FAIL** — the decision is not made in Quito |
| Vertical outside Tier A/B/C | **FAIL** — off-niche, the testimonial would not compound |
| Negative reviews are **only** about price or staff rudeness | **FAIL** for the grande layer — that is a service problem, not a systems problem. May still pass as mediana/micro |
| Medical clinic | **FAIL** unless Freddy explicitly overrides |
| No phone number and no other reachable contact | **FAIL** — unreachable |

**Rating alone is never a gate.** A 4.6-star business with 200 reviews and three complaints
about late orders is a better prospect than a 3.2-star business with eleven reviews about rude
staff. Read the review text, not the score.

**The gate is relaxed for warm prospects.** The review-count and digital-presence rules exist to
filter cold noise; a referral or a personal contact already carries the trust those rules were
standing in for. Chain/franchise, medical clinic, and off-tier vertical still apply with no
exception — see `/add-prospect`.

---

## Scoring dimensions

Score only what passed the gate.

### 1. Operational pain evidence (0-100) — weight 40%

For Maps-sourced rows the evidence is the reviews:

| Score | Meaning |
|---|---|
| 80-100 | 3+ reviews naming delays, stock errors, unanswered orders, invoicing or quoting failures |
| 60-79 | 1-2 such reviews, specific and recent |
| 40-59 | Pain implied but not stated ("slow", "disorganised") with no detail |
| 0-39 | No operational signal in the reviews |

Rows added by `/add-prospect` score this dimension from **observed or stated** evidence instead
— see that command's Step 3 for the ceilings. A problem the owner named out loud outranks any
review; a review is only a proxy for exactly that.

Anything below 40 here caps the prospect at the mediana layer regardless of other scores.

### 2. Operational volume (0-100) — weight 25%

Proxy for ability to pay and for the problem being worth solving.

| Score | Meaning |
|---|---|
| 80-100 | 100+ reviews, or 2+ branches, or wide hours (open Sundays / 12h+ days) |
| 60-79 | 40-99 reviews, single busy location |
| 40-59 | 20-39 reviews |
| 0-39 | Under 20 reviews |

### 3. Digital maturity (0-100) — weight 15%

Counter-intuitive scoring: **too little maturity is as bad as too much**. A business with no
digital presence at all usually has no budget and no internal champion; one with a full
existing ERP has no need.

| Score | Meaning |
|---|---|
| 80-100 | Has a basic site or active social commerce, clearly outgrown it, no visible internal system |
| 60-79 | Outdated site, or Facebook/Instagram used as the whole storefront |
| 40-59 | Confirmed no digital presence whatsoever |
| 0-39 | Already runs a real ERP or custom system |

#### Absent is not unknown

**An empty `Web` field is missing data, not evidence of absence.** Places does not reliably
return a website, and social-only businesses were being recorded as blank. Treating blank as
"has no website" produced a run of false positives — businesses pitched as needing a site that
already had one.

The `Tipo web` column carries the distinction: `Propia`, `Facebook`, `Instagram`, `Ninguna`,
`Desconocido`.

- `Ninguna` is a **positive finding** and only valid when someone actually looked. Score 40-59.
- `Desconocido` means nobody has checked. **Do not score this dimension at all.** Redistribute
  its 15% across the other three proportionally, report the total as partial, and say which
  dimension went unscored.
- Never write `Necesidad detectada=Sin web` from a `Desconocido`. That value is a factual claim
  about the business that ends up spoken out loud in the approach script, and being wrong about
  it in the first sentence costs the whole visit.

The same rule generalises: for every dimension, a blank source field means *unscored*, never
zero. A confident number derived from no data is worse than an honest gap, because only the gap
can be checked before Freddy walks in.

### 4. Reachability (0-100) — weight 20%

| Score | Meaning |
|---|---|
| 80-100 | Direct phone and physical address in a zone Freddy can visit in person |
| 60-79 | Phone only, or address far from his usual routes |
| 40-59 | Generic contact form or shared switchboard |
| 0-39 | Reachable only through a gatekeeper |

In-person visit is the highest-converting first touch for this market — `02-local-prospects.md`
is written around a spoken script for a reason. Weight physical reachability accordingly.

## Weighted total and layer assignment

| Total | Layer to pitch | Action |
|---|---|---|
| 75+ | **Grande** | Publish; recommend preparing this week |
| 60-74 | **Grande**, mediana as fallback | Publish; prepare the downsell in advance |
| 45-59 | **Mediana** | Publish; lower priority on the board |
| 30-44 | **Micro** | Publish only if the visit costs nothing extra (same street as another prospect) |
| <30 | None | Drop — never reaches the board |

Everything above 30 is published to Notion. The threshold sorts the board; it does not decide
who gets a visit.

---

## Pain extraction rules

The extracted pain is the raw material for `/prospect`'s approach script. It is the difference
between "hi, do you have a website?" and "I saw three customers this year complaining that
quotes come back incomplete". Get it right or the whole pitch collapses.

- **Quote verbatim, in the review's original language.** Never paraphrase into the pitch and
  never translate unless Freddy asks. If the review was left in English on a Spanish-language
  business, note that.
- **Record the date.** A complaint from 2019 is not evidence about how the business runs today;
  prefer the last 18 months and mark anything older as stale.
- **Extract at most 3 pains per business.** More than that is not a prospect, it is a dying
  business.
- **Name the operational process behind the complaint**, not just the complaint. "Tarda en
  entregar la factura" → *invoicing is manual and downstream of dispatch*. That translation is
  the actual product insight, and it is what makes the pitch sound like a specialist.
- **Never invent or embellish a quote.** If no usable quote exists, the business scores low on
  dimension 1 and that is the honest answer. A fabricated pain quoted to a business owner's
  face ends the relationship and the referral chain with it.

## Output format

```
## Prospect Evaluation: [Business] ([Vertical])

| Dimension | Score | Notes |
|---|---|---|
| Operational pain | XX/100 | [brief] |
| Operational volume | XX/100 | [brief] |
| Digital maturity | XX/100 | [brief] |
| Reachability | XX/100 | [brief] |

**Total: XX/100** → Layer: [Grande / Mediana / Micro / Drop]

### Pain evidence
1. "[verbatim quote]" ([date]) → [operational process behind it]
2. ...

### Suggested `Necesidad detectada`
[value from the taxonomy in 02-local-prospects.md]

### Next step
[/prospect-sync to publish | drop]
```

## State vocabulary

Two separate state fields, and confusing them corrupts the pipeline.

**`Estado sourcing`** (in `prospects_qualified.csv`, owned by the commands) tracks how far a
lead has moved through the machinery: `Calificado` -> `Publicado` -> `Promovido`, or
`Descartado`.

**`Estado`** (in Notion, owned by Freddy) tracks the real client relationship:

| Estado | Meaning | Who sets it |
|---|---|---|
| `Prospecto` | Qualified and on the board, untouched | `/prospect-sync`, at page creation |
| `En revision` | Freddy is studying this one right now — reading the full Maps reviews, checking socials. A bookmark so he does not lose his place mid-triage | Freddy |
| `Preparado` | Approach script and priced proposal exist | `/prospect`, once |
| `Contactado` | Real contact happened. **This is what arms `/prospect-followup`** | Freddy |
| `Demo listo` | Demo built and shown — only ever after a reply | Freddy |
| `En negociacion` | Actively discussing scope or price | Freddy |
| `Cliente activo` | Closed, project running or delivered | Freddy |
| `Mantenimiento` | Delivered, with a recurring monthly retainer | Freddy |
| `Descartado` | Dead. Also stops `/maps-qualify` resurrecting it | Freddy |

`Prospecto`, `En revision` and `Preparado` all mean *not yet contacted*: nothing is due for
follow-up, and `/prospect` may advance the first two to `Preparado`.

Only two commands write `Estado`: `/prospect-sync` sets `Prospecto` once at page creation, and
`/prospect` sets `Preparado` once, and only from `Prospecto` or `En revision`. Everything after
that is Freddy's, moved by hand on the board.

## `Canal` is not `Origen`

Local rows are **always** `Canal=Local Quito`. The database also carries a `Canal=Referido`
option; never use it. `/prospect-sync` and `/prospect-followup` both filter on
`Canal=Local Quito`, so a referral tagged that way silently never syncs and never generates a
follow-up. How a prospect was found belongs in `Origen`.

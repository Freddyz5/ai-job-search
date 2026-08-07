# /prospect-followup - Generate Pending Follow-ups

`$ARGUMENTS`: optional business name to follow up on one specific prospect. With no arguments,
scans the whole tracker for everything due.

Most of the money in this channel is in touches 2 and 3, and most freelancers send zero. This
command exists so that "following up" is a scheduled output of the system rather than something
Freddy remembers to do.

---

## Step 1: Find what's due

Read `freelance/tracker.csv`, rows where `Canal=Local Quito`. A row is due when:

- `Estado` is `Contactado` or `Demo listo`, **and**
- `Fecha seguimiento` is today or earlier, **or** `Fecha seguimiento` is empty and
  `Fecha contacto` is 5+ days ago

Skip rows in `Cliente activo`, `Mantenimiento`, `Descartado`, or `En negociacion` — a live
negotiation needs a real reply, not a templated nudge.

## Step 2: Determine the touch number

Count prior touches from `Notas` (each follow-up appends a dated line). Then:

| Touch | Timing after previous | Angle |
|---|---|---|
| **2** | 5-7 days | New information, not a reminder. Something concrete: a competitor's site, a detail noticed since, a narrower scope at a lower price |
| **3** | 10-14 days after touch 2 | Explicit close-the-loop. Offer a clear exit ("if this isn't the moment, tell me and I'll stop writing") |
| **4+** | — | Don't. Set `Estado=Descartado` and move it to a 3-month nurture note in `Notas` |

The fourth touch is where a prospect becomes an irritation, and Quito is small enough that a
reputation for pestering travels. Recommend the drop; don't draft it.

## Step 3: Draft

Read the prospect's `freelance/local/<negocio>/prospect.md` for the original detected need and
approach angle, and `demo.md` if it exists.

Per `02-local-prospects.md`'s script rules, adapted for a written follow-up:

- **Short.** Three or four sentences. A follow-up longer than the first message reads as
  desperation.
- **Never "just checking in"** or "following up on my previous message". Every touch carries
  something new or it isn't sent.
- Reference the **specific** thing from the first contact — the operational pain, the quoted
  review, the demo — not a generic reminder that Freddy exists.
- Ends with one low-friction ask, and only one.
- Written in Spanish, for WhatsApp or a spoken second visit. Say which channel it's for.

If touch 1 got no response at all, consider recommending an in-person visit instead of a
written touch 2. For this market that converts better than any message, and Step 1's date data
tells you whether the business is on a route Freddy already walks.

## Step 4: Update the tracker

For each follow-up Freddy confirms he actually sent:

- Append a dated line to `Notas`: `YYYY-MM-DD toque N enviado (canal)`
- Set `Fecha seguimiento` to the next due date per the touch table
- Leave `Estado` unchanged — a follow-up isn't a state change; `/prospect-outcome` owns that

**Only write after confirmation.** Drafting isn't sending, and a tracker that records unsent
messages is worse than no tracker: it silently kills the follow-up that was actually needed.

## Step 5: Report

List what's due, what was drafted, and what's coming due in the next 7 days so Freddy can plan
the week's 1 h follow-up block. Flag anything sitting at touch 3 with no reply as ready to drop.

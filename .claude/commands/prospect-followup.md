# /prospect-followup - Generate Pending Follow-ups

`$ARGUMENTS`: optional business name to follow up on one specific prospect. With no arguments,
scans the whole tracker for everything due.

Most of the money in this channel is in touches 2 and 3, and most freelancers send zero. This
command exists so that "following up" is a scheduled output of the system rather than something
Freddy remembers to do.

---

## Step 1: Find what's due

**Read the state from Notion, not from the CSV.** Query the **🏢 Clientes Freelance** database
(`collection://4238a325-d988-41c9-ac56-5c39810d3a2f`) for `Canal=Local Quito` pages. Freddy
moves states and dates on that board after a real visit, often from his phone, so the CSV can be
hours or days stale — and a stale date here means missing the follow-up at the moment it still
mattered. If Notion MCP is unavailable, say so, fall back to `freelance/tracker.csv`, and warn
in the report that the dates may be out of date.

A page is due when:

- `Estado` is `Contactado` or `Demo listo`, **and**
- `Fecha seguimiento` is today or earlier, **or** `Fecha seguimiento` is empty and
  `Fecha contacto` is 5+ days ago

Skip `Prospecto`, `En revision` and `Preparado` — those have never been contacted, so there is
nothing to follow up on. Skip `Cliente activo`, `Mantenimiento`, `Descartado`, and
`En negociacion` — a live negotiation needs a real reply, not a templated nudge.

## Step 2: Determine the touch number

Count prior touches from the page's `Notas` in Notion (each follow-up appends a dated line).
Then:

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

## Step 4: Record the touch

For each follow-up Freddy confirms he actually sent:

- Append a dated line to the Notion page's `Notas`: `YYYY-MM-DD toque N enviado (canal)`
- Set `Fecha seguimiento` on the page to the next due date per the touch table
- Leave `Estado` unchanged — a follow-up is not a state change

`Notas` and `Fecha seguimiento` are Freddy-owned fields under `/prospect-sync`'s ownership
contract, so this command **appends** to them rather than rewriting, and only after he confirms.
Never clear an existing note.

The local CSV is not written here. `/prospect-sync --pull` brings these values down to
`tracker.csv` on its next run.

**Only write after confirmation.** Drafting isn't sending, and a board that records unsent
messages is worse than no board: it silently kills the follow-up that was actually needed.

## Step 5: Report

List what's due, what was drafted, and what's coming due in the next 7 days so Freddy can plan
the week's 1 h follow-up block. Flag anything sitting at touch 3 with no reply as ready to drop — recommend it, but let Freddy
set `Descartado` on the board himself. Terminal states are his call, not this command's.

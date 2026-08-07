# /prospect-outcome - Record Closing Details for a Local Prospect

`$ARGUMENTS`: a business name (or enough of it to match uniquely).

**This command no longer moves pipeline state.** Freddy moves `Estado` himself on the
**🏢 Clientes Freelance** board in Notion — that is the source of truth for the local channel.
What this command owns is the long-form record that does not fit in a Notion property: what was
agreed, what was quoted versus what closed, and what to do differently next time.

Run it after a close, a rejection, or any conversation worth remembering. For a plain status
change, editing the Notion card is faster and this command is unnecessary.

---

## Step 1: Locate

Find the business in `freelance/tracker.csv` (`Canal=Local Quito`), matching by `Place ID` where
present and by name otherwise. More than one match → ask which, never guess.

Read its Notion page too, so the record reflects the state Freddy actually set.

## Step 2: Collect what happened

Ask what came out of it, and keep it to one or two open questions rather than an interrogation:

- What was agreed, and at what price
- What the owner objected to, verbatim where he remembers it
- Whether the pitch landed on the operational pain or fell flat
- What he would do differently

Concrete beats polished — this is what calibrates the scoring in `03-prospect-evaluation.md`
later.

## Step 3: Write the record

Append a dated entry to `freelance/local/<negocio>/prospect.md`, never overwriting earlier
history. If the folder does not exist (a prospect that never went through `/prospect`), create
it with a minimal file.

If a price closed, set `Precio cerrado` in `freelance/tracker.csv`.

**Do not write `Estado` anywhere.** If the CSV's state disagrees with Notion, say so and point
at `/prospect-sync --pull` rather than fixing it here — that command owns reconciliation, and
two commands writing the same field is how state gets silently clobbered.

## Step 4: Layer check on a close

If this closed in the **Mediana** or **Micro** layer, verify the three detachability conditions
from `03-prospect-evaluation.md` were actually agreed in writing: closed scope with an explicit
end date, changes quoted separately, maintenance optional and cancellable. If any is missing,
flag it now — it is far easier to add before delivery than to claw back afterwards.

Then ask for an estimate of monthly hours committed and record it in the prospect file. The
governance cap is **8 h/month across mediana + micro**; if this close pushes past it, say so
plainly. The metric that matters is $/hour, and a small layer quietly eating the week is exactly
what kills the grande track.

## Step 5: Calibration signal

Once three or more local prospects have a recorded outcome, check whether a pattern is visible —
a vertical that never answers, a layer that always objects on price, a score band that
consistently overpredicts. Report it as an observation and suggest updating the weights or gates
in `03-prospect-evaluation.md`. **Do not edit that file here**; the framework changes on Freddy's
judgement, not automatically.

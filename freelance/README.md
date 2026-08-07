# Freelance Module

One tracker, two channels: `freelance/tracker.csv`, discriminated by `Canal` (`Upwork` /
`Local Quito`), mirroring the single **🏢 Clientes Freelance** Notion database - not two
separate ones. See `.claude/skills/freelance-assistant/` for the shared rules (proposal
structure, local pricing, sector taxonomy, prospect scoring).

- `upwork/proposals/` - one file per drafted proposal (`/upwork-apply`)
- `local/<negocio>/` - one folder per prospect: `prospect.md` (`/prospect`), `demo.md`
  (`/prospect-demo`)
- `local/prospects_raw.csv` - raw Google Maps sourcing dump (produced outside this repo)
- `local/prospects_qualified.csv` - scored survivors (`/maps-qualify`)

Commands: `/upwork-apply`, `/upwork-outcome`, `/upwork-sync` · `/maps-qualify`,
`/prospect-sync`, `/prospect`, `/prospect-demo`, `/prospect-followup`, `/prospect-outcome`.

## Two directions of truth, one database

The two channels sit in the same Notion database and follow **opposite** sync rules. This is
deliberate, and the commands must never be unified.

| | Source of truth | `Estado` behaviour |
|---|---|---|
| **Upwork** | the CSV | `/upwork-sync` overwrites Notion every run |
| **Local Quito** | **Notion** | `/prospect-sync` never overwrites it |

The reason is how Freddy actually works each channel. Local prospects are triaged and moved on
the Notion board - often from his phone, right after a visit. Overwriting that from a file would
silently destroy the only record of what happened in the field. Upwork he works from the CSV, so
there the file wins.

### Ownership contract (local rows)

**Claude owns:** `Negocio / Proyecto`, `Canal`, `Sector`, `Necesidad detectada`, `Score`,
`Capa`, `Place ID`, `Precio ofertado`, page body.

**Freddy owns, never overwritten:** `Estado`, `Fecha contacto`, `Fecha seguimiento`, `Notas`,
`Precio cerrado`, `Demo hecho`.

Two narrow exceptions, both write-once: `/prospect-sync` sets `Estado=Prospecto` at page
creation, and `/prospect` sets `Estado=Preparado` if - and only if - the page is still
`Prospecto`.

## The local funnel

```
Google Maps  →  prospects_raw.csv  →  /maps-qualify  →  prospects_qualified.csv
                                                                  ↓
                                                          /prospect-sync
                                                                  ↓
                                                      Notion board (triage)
                                                                  ↓
                                                    Freddy picks one → /prospect
                                                                  ↓
                                                           tracker.csv
```

This mirrors the job-search flow one-to-one: `/maps-qualify` is `/rank`, `/prospect-sync` is
`/notion-sync`, `/prospect` is `/apply-json`. The scoring ranks what reaches the board; it never
decides who gets contacted.

`/prospect-sync --pull` runs the reverse half, bringing state from Notion down into the CSVs so
the local files stay an accurate history rather than drifting into fiction.

**`Place ID` is the dedup anchor** for the whole local pipeline - the equivalent of the Job
Tracker's `Key`. Business names in Quito collide, so name matching would duplicate or, worse,
overwrite the wrong client. A local row without a Place ID cannot be synced.

`/prospect-followup` reads its dates from **Notion**, not the CSV, since that is where Freddy
records a real visit. `/prospect-outcome` no longer moves state at all; it records the long-form
outcome and `Precio cerrado`.

## Google Maps sourcing (manual, for now)

Claude Code has no Google Maps access. Sourcing happens in a Claude.ai session with Places
access; the resulting CSV is dropped into `local/prospects_raw.csv` by hand. Once the flow is
validated, the intended migration is a Google Places API key and a `/maps-scrape` command so
sourcing runs locally without a chat session.

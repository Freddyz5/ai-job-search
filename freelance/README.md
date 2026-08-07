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

Commands: `/upwork-apply`, `/upwork-outcome`, `/upwork-sync` · `/maps-qualify`, `/prospect`,
`/prospect-demo`, `/prospect-followup`, `/prospect-outcome`, `/prospect-sync`.

The CSV is the source of truth; Notion is the synced view (opposite of the Job Tracker, where
Notion itself is manually edited). The `*-sync` commands overwrite Notion from the CSV on
every run - that's intentional here.

## Two-stage local funnel

The sourcing files are deliberately **upstream of and separate from** `tracker.csv`:

```
Google Maps  →  prospects_raw.csv  →  /maps-qualify  →  prospects_qualified.csv
                                                                  ↓
                                                            /prospect
                                                                  ↓
                                            tracker.csv  →  /prospect-sync  →  Notion
```

`tracker.csv`'s 15 columns map 1:1 onto the Notion database and have nowhere to hold a score,
a layer or a review quote. Keeping the funnel separate means dozens of unqualified leads never
pollute the tracker, and the tracker stays exactly as wide as Notion is. A business crosses
over only when `/prospect` runs on it - the point where a lead becomes a real prospect.

## Google Maps sourcing (manual, for now)

Claude Code has no Google Maps access. Sourcing currently happens in a Claude.ai session with
Places access; the resulting CSV is dropped into `local/prospects_raw.csv` by hand. Once the
flow is validated, the intended migration is a Google Places API key and a `/maps-scrape`
command so sourcing runs locally without a chat session.

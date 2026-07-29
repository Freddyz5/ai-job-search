# Freelance Module

One tracker, two channels: `freelance/tracker.csv`, discriminated by `Canal` (`Upwork` /
`Local Quito`), mirroring the single **🏢 Clientes Freelance** Notion database - not two
separate ones. See `.claude/skills/freelance-assistant/` for the shared rules (proposal
structure, local pricing, sector taxonomy).

- `upwork/proposals/` - one file per drafted proposal (`/upwork-apply`)
- `local/<negocio>/` - one folder per prospect: `prospect.md` (`/prospect`), `demo.md`
  (`/prospect-demo`)

Commands: `/upwork-apply`, `/upwork-outcome`, `/upwork-sync` · `/prospect`, `/prospect-demo`,
`/prospect-outcome`, `/prospect-sync`.

The CSV is the source of truth; Notion is the synced view (opposite of the Job Tracker, where
Notion itself is manually edited). The `*-sync` commands overwrite Notion from the CSV on
every run - that's intentional here.

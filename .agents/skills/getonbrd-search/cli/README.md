# getonbrd-cli

CLI for searching tech jobs on GetOnBrd (getonbrd.com), covering **Chile and other
Latin American markets** (Peru, Colombia, Mexico, Argentina, remote-LatAm).

**Data source**: GetOnBrd's public, server-rendered pages (`/jobs-<query>` search results, `/jobs/<category>/<slug>` detail).
**Authentication**: None required.
**Dependencies**: None (plain `bun` + `fetch`). `bun install` is optional and only pulls dev type defs.

> **Personal use only.** GetOnBrd's `robots.txt` explicitly disallows `ClaudeBot` (and most
> other AI crawlers) sitewide. This CLI is used anyway at the explicit direction of the
> person who generated it, strictly for their own personal job search. Keep volume low,
> don't use it commercially or for bulk data collection, and run it on your own
> responsibility. See `../SKILL.md` for the full warning.

## Installation

```bash
cd .agents/skills/getonbrd-search/cli
bun install   # optional — only installs TypeScript dev types
```

The CLI runs without any install because it has zero runtime dependencies.

## Commands

| Command | Description |
|---------|-------------|
| `search` | Search for job listings (`--query` required) |
| `detail` | Fetch full detail for a single job listing |

`search` accepts `--format json|table|plain` (default `json`); `detail` accepts `--format json|plain`.
All errors are written to **stderr** as `{ "error": "...", "code": "..." }` with exit code `1`.

## Quick examples

```bash
# Data scientist roles
bun run src/cli.ts search -q "data scientist" --format table

# Full stack developer roles in Santiago
bun run src/cli.ts search -q "full stack developer" -l "santiago" --format table

# Remote product manager roles, last 14 days
bun run src/cli.ts search -q "product manager" -l "remote" --jobage 14 --format table

# Full detail for one job
bun run src/cli.ts detail programacion/senior-full-stack-software-developer-puente-talent-partners-remote --format plain
```

See `../SKILL.md` for the full flag reference and the personal-use warning.

## Search flags

| Flag | Alias | Description |
|------|-------|-------------|
| `--query` | `-q` | **Required.** Keywords (title / skill / role). |
| `--location` | `-l` | City or "remote"; appended to the search text (no separate location param — see `../url-reference.md`). |
| `--jobage` | | Posted within N days. Best-effort client-side filter (source omits the year). |
| `--page` | | 1-indexed page (~100 results/page). |
| `--limit` | `-n` | Cap results emitted. |
| `--format` | | `json` \| `table` \| `plain`. |

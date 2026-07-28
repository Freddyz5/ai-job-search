# arc-dev-cli

CLI for searching remote tech jobs on Arc (arc.dev) — a **global, remote-first** job board
covering jobs sourced directly on Arc and jobs aggregated from other boards.

**Data source**: Arc's public, server-rendered Next.js pages — the search-results page and job-detail pages embed their full JSON props in a `__NEXT_DATA__` script tag, which this CLI parses directly (no HTML card scraping).
**Authentication**: None required.
**Dependencies**: None (plain `bun` + `fetch`). `bun install` is optional and only pulls dev type defs.

Arc's `robots.txt` is permissive (`Allow: /`; `ClaudeBot` is named explicitly with only a
`Crawl-Delay: 10`, not disallowed) — no personal-use restriction applies to this skill.

## Installation

```bash
cd .agents/skills/arc-dev-search/cli
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
# Backend developer roles
bun run src/cli.ts search -q "backend developer" --format table

# React roles, last 14 days
bun run src/cli.ts search -q "react" --jobage 14 --format table

# Only jobs aggregated from other boards (full company names visible)
bun run src/cli.ts search -q "product designer" --source external --format table

# Full detail for one job
bun run src/cli.ts detail j/asana-backend-engineer-p6uesb1mf7 --format plain
```

See `../SKILL.md` for the full flag reference.

## Search flags

| Flag | Alias | Description |
|------|-------|-------------|
| `--query` | `-q` | **Required.** Keywords (title / skill / role). |
| `--jobage` | | Posted within N days — exact, from Arc's real `postedAt` timestamp. |
| `--source` | | `arc` \| `external` \| `all` (default). |
| `--limit` | `-n` | Cap results emitted. |
| `--format` | | `json` \| `table` \| `plain`. |

**Not supported by Arc's search endpoint** (confirmed during generation): server-side
pagination beyond the first ~30+30 results per query, and location/country filtering. See
`../url-reference.md` for what was tried.

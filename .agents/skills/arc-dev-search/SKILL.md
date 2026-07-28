---
name: arc-dev-search
version: 1.0.0
description: >
  Use this skill whenever the user wants to search for remote tech jobs on Arc
  (arc.dev), a global remote-first developer job board covering software engineering,
  design, and product roles worldwide, in English. Invoke for open positions, remote jobs,
  freelance/contract tech work, and hiring searches that are not tied to a specific city or
  country. Trigger phrases: Arc.dev, arc dev jobs, remote developer jobs, remote software
  engineering jobs, remote tech jobs, freelance developer work, contract developer jobs,
  worldwide remote jobs.
context: fork
enabled: true  # set to false to keep this portal installed but have /scrape skip it
allowed-tools: Bash(bun run .agents/skills/arc-dev-search/cli/src/cli.ts *)
---

# Arc.dev Search Skill

Search live remote tech job listings from Arc (arc.dev) — a global, remote-first job board
covering both jobs sourced directly on Arc and jobs aggregated from other boards. No
authentication, no API key, **zero runtime dependencies** — it runs with just `bun`.

Arc's `robots.txt` is permissive (`Allow: /`, and `ClaudeBot` is named explicitly with only
a `Crawl-Delay: 10`, not disallowed) — no personal-use restriction applies here, unlike some
other portal skills in this repo. Still, keep request volume reasonable.

## When to use this skill

- Search for remote tech job openings worldwide (engineering, design, product, etc.)
- Get the full description of a specific job listing — for jobs aggregated from other
  boards, this also surfaces the original posting's direct application link

## Commands

### Search job listings

```bash
bun run .agents/skills/arc-dev-search/cli/src/cli.ts search --query "<text>" [flags]
```

Key flags:
- `--query <text>` / `-q <text>` — **required.** Keyword search (title, skill, role), e.g. `"backend developer"`, `"react"`.
- `--jobage <days>` — posted within N days. Applied client-side using the listing's exact `postedAt` timestamp (unlike some portals, this is exact, not a guess).
- `--source <arc|external|all>` — `arc` = jobs sourced directly on Arc (company hidden until matched), `external` = jobs aggregated from other boards (full company + apply link), `all` (default).
- `--limit <n>` / `-n <n>` — cap total results emitted (client-side).
- `--format json|table|plain` — default `json`.

**Not supported by Arc's search endpoint** (confirmed during generation — see `url-reference.md`): pagination beyond the first ~30+30 results per query, and location/country filtering. Arc is remote-first by design, so most listings are open worldwide anyway.

### Fetch full job detail

```bash
bun run .agents/skills/arc-dev-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```

`id` is the `details/<urlString>-<randomKey>` or `j/<urlString>-<randomKey>` path from a
`search` result's `id` field. You may also pass the full `arc.dev/remote-jobs/...` URL.
Returns the full Markdown description, employment type, salary range, required countries,
and (for jobs aggregated from other boards) the original posting's direct apply URL.

## Usage examples

```bash
# Backend developer roles, table view
bun run .agents/skills/arc-dev-search/cli/src/cli.ts search -q "backend developer" --format table

# React roles posted in the last 14 days
bun run .agents/skills/arc-dev-search/cli/src/cli.ts search -q "react" --jobage 14 --format table

# Only jobs aggregated from other boards (full company names visible)
bun run .agents/skills/arc-dev-search/cli/src/cli.ts search -q "product designer" --source external --format table

# Only jobs sourced directly on Arc
bun run .agents/skills/arc-dev-search/cli/src/cli.ts search -q "devops" --source arc --format table

# Full detail for a specific job
bun run .agents/skills/arc-dev-search/cli/src/cli.ts detail j/asana-backend-engineer-p6uesb1mf7 --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing `id`s to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Notes

- Jobs sourced directly on Arc always show `company: null` in search results and detail —
  Arc keeps the client confidential until you're matched through its own hiring flow. This
  is intentional, not a parsing failure.
- `location` in results is derived from `requiredCountries`: "Remote (Worldwide)" when
  empty, otherwise "Remote (<country codes>)".
- For jobs aggregated from other boards, `detail`'s `applyUrl` points to the **original**
  posting (e.g. a LinkedIn or ATS page), not back to Arc.

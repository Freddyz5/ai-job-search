---
name: getonbrd-search
version: 1.0.0
description: >
  Use this skill whenever the user wants to search for tech/startup jobs on GetOnBrd
  (getonbrd.com), a curated job board for Chile and Latin America (Peru, Colombia, Mexico,
  Argentina, remote-LatAm). Invoke for open positions, vacancies, and hiring across tech
  roles (software, data, design, product, marketing, ops, etc.) in Spanish or English.
  Trigger phrases: GetOnBrd, get on board, empleos tech, empleos remotos, bolsa de trabajo,
  trabajo remoto, vacantes, ofertas de trabajo, búsqueda de empleo, find a job in Chile/LatAm,
  tech jobs Latin America.
context: fork
enabled: true  # set to false to keep this portal installed but have /scrape skip it
allowed-tools: Bash(bun run .agents/skills/getonbrd-search/cli/src/cli.ts *)
---

# GetOnBrd Search Skill

Search live tech/startup job listings from GetOnBrd (getonbrd.com), covering Chile and
other Latin American markets. No authentication, no API key, **zero runtime dependencies**
— it runs with just `bun`.

## ⚠️ Personal use only — read before running

GetOnBrd's `robots.txt` **explicitly disallows `ClaudeBot`** (Anthropic's crawler), along
with most other AI crawlers (`GPTBot`, `CCBot`, `Google-Extended`, `Amazonbot`, `Bytespider`,
and more), sitewide — while allowing generic browser/search traffic. This skill was built
and is being used anyway, at the explicit direction of the person who generated it, strictly
for their own personal job search.

- **Keep volume low.** A handful of searches per session, not a crawl.
- **Do not use this commercially, for bulk data collection, or to redistribute GetOnBrd's
  listings.**
- **You are responsible for your own use of this tool.** If you did not knowingly choose to
  proceed past this warning, stop and do not run it.

## When to use this skill

- Search for tech job openings on GetOnBrd, in a given city/country or remotely
- Get the full description of a specific job listing (responsibilities, requirements, salary)

## Commands

### Search job listings

```bash
bun run .agents/skills/getonbrd-search/cli/src/cli.ts search --query "<text>" [flags]
```

Key flags:
- `--query <text>` / `-q <text>` — **required.** Keyword search (title, skill, role), e.g. `"data scientist"`, `"full stack developer"`.
- `--location <text>` / `-l <text>` — city or "remote"; appended to the search text (GetOnBrd has no separate location parameter — see `url-reference.md`).
- `--jobage <days>` — posted within N days. **Best-effort client-side filter**: GetOnBrd's listing cards omit the year, so the CLI infers it (see Notes). Omit for all postings.
- `--page <n>` — page number (1-indexed, ~100 results/page). Default 1.
- `--limit <n>` / `-n <n>` — cap total results emitted (client-side).
- `--format json|table|plain` — default `json`.

### Fetch full job detail

```bash
bun run .agents/skills/getonbrd-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```

`id` is the `<category>/<slug>` path from a `search` result's `id` field (e.g.
`programacion/senior-full-stack-software-developer-puente-talent-partners-remote`). You may
also pass the full `getonbrd.com/jobs/...` URL. Returns the full description, employment
type, location, salary range (when listed), and posting date.

## Usage examples

```bash
# Data scientist roles, table view
bun run .agents/skills/getonbrd-search/cli/src/cli.ts search -q "data scientist" --format table

# Full stack developer roles in Santiago
bun run .agents/skills/getonbrd-search/cli/src/cli.ts search -q "full stack developer" -l "santiago" --format table

# Remote product manager roles posted in the last 14 days
bun run .agents/skills/getonbrd-search/cli/src/cli.ts search -q "product manager" -l "remote" --jobage 14 --format table

# Second page, capped at 10 results
bun run .agents/skills/getonbrd-search/cli/src/cli.ts search -q "backend developer" --page 2 --limit 10

# Full detail for a specific job
bun run .agents/skills/getonbrd-search/cli/src/cli.ts detail programacion/senior-full-stack-software-developer-puente-talent-partners-remote --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing `id`s to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Notes

- Postings are bilingual (Spanish/English) — pass your query in either language.
- Listing pages omit the posting year (only "Mon DD" is shown); the CLI infers the year by
  assuming any month later than the current month belongs to last year. This is an estimate,
  not authoritative — the detail page's `date` field (from schema.org `datePosted`) is exact.
- GetOnBrd may rate-limit or block on excessive traffic; the CLI retries 429/5xx with
  exponential backoff. **Keep volume low** (see the warning above).
- Applications are submitted on GetOnBrd itself — `detail`'s `applyUrl` is just the job's own
  page, not an external link.

# Search Queries for Job Scraper

<!-- SETUP: Customize these queries based on your skills, target roles, and location -->

## Installed portal CLIs (primary for `/scrape`)

`/scrape` discovers every portal skill under `.agents/skills/*/SKILL.md` and runs its CLI first. Shipped country-agnostic CLIs include `linkedin-search` and `freehire-search`; Danish demos and any skill you add with `/add-portal` are included the same way. You do **not** need a matching `site:` line below for those CLIs to run.

The `site:` query templates in this file are the **WebSearch fallback** — for portals without a CLI, company career pages, or when a CLI fails.

## Search Sites

Primary (remote-first / global boards - candidate is not restricted to a local market):
- **getonbrd.com** - Latin America-focused tech job board; covered by `getonbrd-search` CLI
- **arc.dev** - remote-first software developer job board; covered by `arc-dev-search` CLI
- **linkedin.com/jobs** - LinkedIn job listings, remote-global filter; also covered by `linkedin-search` CLI

Secondary (company career pages via Google):
- Direct Google searches with `site:` filters for known target companies

## Query Categories

Queries are grouped by priority. Each query should be combined with your location terms (e.g. your city, region, or metro area) where the site supports it.

### Priority 1: Full Stack Developer (remote)

These match the strongest and most desired career direction.

```
site:getonbrd.com "Full Stack Developer" remote
site:arc.dev "Full Stack Engineer" remote
site:linkedin.com/jobs "Full Stack Developer" remote
site:linkedin.com/jobs "Full Stack Engineer" remote
```

### Priority 2: Backend-leaning roles (Node.js / TypeScript)

Backend depth is the active growth direction - candidate is deliberately pivoting more senior here.

```
site:getonbrd.com "Backend Developer" Node.js remote
site:arc.dev "Backend Developer" TypeScript remote
site:linkedin.com/jobs "Backend Developer" "Node.js" remote
site:linkedin.com/jobs "Software Engineer" GraphQL remote
```

### Priority 3: Adjacent roles

Roles the candidate is genuinely qualified for even if not the primary title.

```
site:getonbrd.com "JavaScript Developer" OR "TypeScript Developer" remote
site:arc.dev "Frontend Developer" React remote
site:linkedin.com/jobs "Frontend Developer" "Next.js" remote
```

### Priority 4: Broader technical net

Wider net for general remote technical roles matching the core stack.

```
site:linkedin.com/jobs "TypeScript developer" remote
site:getonbrd.com React OR Node.js developer remote
site:arc.dev GraphQL developer remote
```

## Location Filter

Candidate is based in Quito, Ecuador but is **not** filtering by commute distance:
- **Remote (any country)**: PASS - primary target
- **Relocation supported by employer**: PASS
- **Hybrid, any location**: not being pursued (see `04-job-evaluation.md` Location & Logistics gate)
- **On-site with no relocation support, outside Quito**: FAIL

## Date Filter

Only include jobs posted within the last 14 days, or with an application deadline that has not yet passed. If a posting date cannot be determined, include it but flag as "date unknown".

## Adapting Queries

If the user specifies a focus area, select queries from the matching category and also generate 2-3 custom queries for that focus. For example:
- "/scrape [focus_area]" -> relevant category queries + custom focus-specific queries

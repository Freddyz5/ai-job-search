# GetOnBrd URL Reference

Public, unauthenticated pages used by this skill. GetOnBrd (getonbrd.com) is a curated
tech/startup job board covering Chile and other Latin American markets (Peru, Colombia,
Mexico, Argentina, remote-LatAm). Postings are bilingual (Spanish and English).

> ⚠️ **robots.txt explicitly disallows `ClaudeBot`** (and most other AI crawlers) sitewide,
> while allowing generic browser/search traffic (`User-agent: * / Allow: /`). This skill was
> built anyway at the user's explicit direction, for **personal use only**. See the warning
> in `SKILL.md`.

## Site architecture

The site is a Rails app using Hotwire (Turbo + Stimulus) with React islands for a few
widgets. **Listing/search pages are server-rendered** (job cards are present in the raw
HTML). The bare `/jobs` category-browse page and `/jobs?q=...` are *not* useful directly —
`?q=` is ignored server-side; the real search path is built client-side by
`search_form_controller` (see below). Individual job detail pages at `/jobs/<category>/<slug>`
are also fully server-rendered (schema.org `JobPosting` microdata).

## Search

```
GET https://www.getonbrd.com/jobs-<slugified-query>[-<slugified-location>]?page=<n>
```

The search box's JS (`search_form_controller-*.js`) builds the URL as:
`domain + "/" + "jobs" + "-" + encodeURIComponent(query.split(" ").join("-"))`
(periods in the query are escaped to `%2E` first). There is **no `?q=` query-string
parameter** — the query is a hyphenated path segment appended directly to `jobs-`.
Example: query `"full stack developer"` → `/jobs-full-stack-developer`.

Location is not a separate parameter either; appending location words to the same
slug (e.g. `/jobs-full-stack-developer-santiago`) works because the whole slug is
treated as free-text search. This CLI does that automatically when `--location` is passed.

| Param | Meaning | Example |
|-------|---------|---------|
| *(path)* | `jobs-<query words joined with ->` | `/jobs-data-scientist` |
| `page` | 1-indexed page, ~100 results/page | `?page=2` |

No server-side "posted within N days" or remote/on-site filter parameter was found.
`--jobage` is applied **client-side** by this CLI using the best-effort date parsed off
each result card (see below — the source page omits the year, so this is an estimate).

Each result is an `<a class="results-item" ... href="https://www.getonbrd.com/jobs/<category>/<slug>">`
card containing:
- Title: `<h4 class="results-list-title"><strong>...</strong>`
- Company: first `<strong>` inside `.results-list-info .size0` (there may be a second
  "for `<client>`" name right after it for agency-recruited roles — captured separately)
- Location: `<span class="location">...</span>` (often "Remote", "Remote (Chile)", or a city)
- Posted date: `<div class="opacity-half size0">Mon DD</div>` — **month/day only, no year**,
  in mixed English/Spanish 3-letter abbreviations (`Jul 27`, `abr 08`, ...). This CLI infers
  the year: if the parsed month is after the current month, assume last year, else this year.
- Salary (optional): `<span>2000 - 3000 USD/mes</span>` next to a money icon — not currently
  exposed as a structured field, left for a future enhancement.

There is no numeric ID in the listing markup. This CLI uses the URL path after
`/jobs/` (`<category>/<slug>`) as the stable `id`.

## Detail

```
GET https://www.getonbrd.com/jobs/<category>/<slug>
```

Fully server-rendered with schema.org `JobPosting` microdata (`itemtype="http://schema.org/JobPosting"`):

| Field | Microdata anchor |
|-------|-------------------|
| Title | `<span itemprop="title">` |
| Company | `<span itemprop="hiringOrganization"><span itemprop="name">` (link to `/companies/<slug>`) |
| Location | `<span itemprop="jobLocation">` → `<span itemprop="address">` |
| Posted date | `<time itemprop="datePosted" datetime="2025-10-01T18:14:12+00:00">` — full ISO datetime, unlike the listing cards |
| Employment type | `<span itemprop="employmentType">FULL_TIME</span>` |
| Description | `<div id="job-body" itemprop="description">` — rich HTML (multiple `<h3>` subsections: responsibilities, requirements, nice-to-haves, benefits) |
| Salary | `itemprop="baseSalary"` → `minValue`/`maxValue`/`unitText`/`currency` |

No explicit application-deadline field was found on the detail page. Applications are
submitted on GetOnBrd itself (no external apply URL) — `applyUrl` is just the job's own URL.

## Notes / quirks

- `robots.txt` blocks `ClaudeBot`, `GPTBot`, `CCBot`, `Google-Extended`, `Amazonbot`,
  `Bytespider`, `Applebot-Extended`, `meta-externalagent` by name; `User-agent: *` is
  `Allow: /`. Content-Signal headers additionally declare `ai-train=no`.
- `/jobs` and `/jobs?q=...` render a generic category-browse page with **no job cards** in
  the initial HTML for the plain `/jobs` route without the `jobs-<slug>` prefix — don't use it
  for search.
- `/sitemap.xml.gz` (not `/sitemap.xml`, which 404s as HTML) lists ~7,200 individual job
  detail URLs; useful as a fallback discovery source but not used by this CLI's `search`
  command since it lacks company/location/date without fetching every detail page.
- Company/location text sometimes includes a second "for `<client>`" name (agency-recruited
  roles show both the agency and the end client).

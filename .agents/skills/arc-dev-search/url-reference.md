# Arc.dev URL Reference

Public, unauthenticated pages used by this skill. Arc (arc.dev) is a global remote-first
tech job board: it lists both jobs sourced directly on Arc ("arc-native", company hidden
until you're matched through Arc's own hiring flow) and jobs aggregated from other job
boards/ATSs ("external", full company + a direct apply link to the original posting).

`robots.txt` (`https://arc.dev/robots.txt`) is permissive: `User-agent: * / Allow: /`, and
even lists `ClaudeBot` explicitly with only a `Crawl-Delay: 10` (not disallowed). No
personal-use warning is needed for this skill — just keep the built-in backoff/retry
behavior, which already paces requests well above that floor.

## Site architecture

Next.js (SSR via `getServerSideProps`). Both the search-results page and job-detail pages
embed their full server-rendered props as JSON in `<script id="__NEXT_DATA__" type="application/json">`.
This skill parses that JSON directly — **no HTML/regex scraping of job cards is needed**,
which is more robust than the typical portal-skill pattern.

## Search

```
GET https://arc.dev/remote-jobs?keyword=<query>
```

| Param | Meaning | Notes |
|-------|---------|-------|
| `keyword` | Free-text query (matched against title/categories) | The only query param that actually filters — `query`, `search`, `q`, `title`, `jobTitle`, `country`, `countries`, `location`, `jobType`, and a `page`-style offset were all tried and had no effect (see below). |

The response HTML's `__NEXT_DATA__.props.pageProps` contains:

```jsonc
{
  "arcJobs": [ /* up to ~30 jobs sourced directly on Arc */ ],
  "externalJobs": [ /* up to ~30 jobs aggregated from other boards */ ],
  "totalExternalJobCount": 6599 // total external jobs matching, but only ~30 are returned — see Notes
}
```

Each `arcJobs` item: `randomKey`, `title`, `jobType` (`contract`|`permanent`), `jobRole`,
`experienceLevel`, `requiredCountries` (empty = worldwide), `minHourlyRate`/`maxHourlyRate`,
`minAnnualSalary`/`maxAnnualSalary`, `postedAt` (unix seconds), `urlString`, `company`
(**always** `{"randomKey": null}` — Arc hides the client company on its own listings until
a candidate is matched through Arc's hiring flow; this is a platform feature, not a parsing
gap), `categories` (skill tags).

Each `externalJobs` item: same shape plus `company: {randomKey, urlString, name, logo}`
(fully populated) and `positionType`/`experienceLevels` instead of `jobRole`/`experienceLevel`.

**Detail URL construction** (derived, not present as a field — see below):
- arc-native: `/remote-jobs/details/<urlString>-<randomKey>`
- external: `/remote-jobs/j/<urlString>-<randomKey>`

Confirmed by finding the rendered `<a class="job-title" href="...">` anchors in the same
page's HTML (`data-arc-job="true"` → `details/`, `data-arc-job="false"` → `j/`).

## Detail

```
GET https://arc.dev/remote-jobs/details/<urlString>-<randomKey>   (arc-native)
GET https://arc.dev/remote-jobs/j/<urlString>-<randomKey>          (external)
```

Both also embed `__NEXT_DATA__.props.pageProps.job`, richer than the search-result card:
- `description` — **already Markdown**, not HTML (no tag-stripping needed).
- arc-native adds: `availableHoursPerWeek`, `estimatedWeeks`, `numberOfOpenings`,
  `englishLevel`, `visaOrRelocationRequired`, `requiredLocations`, `interestCount`,
  `discipline`, `optionalCategories`, `aiCategorySuggestion`.
- external adds: `companyName` (plain string, unlike the nested `company` object on the
  search card), and critically **`url`** — the original posting's URL (e.g. a LinkedIn or
  ATS job page). This is the real apply link for external jobs.

## Notes / quirks

- **No working pagination.** `page`, `offset`, and several other guessed param names are
  silently dropped (Next.js redirects to the canonical URL without them) and the response is
  unchanged. Only the first ~30 arc-native and ~30 external results per `keyword` are
  reachable through this page. `totalExternalJobCount` tells you how many more exist but
  they are not accessible without discovering Arc's internal "load more" API (not found in
  static bundles during recon — likely an authenticated/XHR-only endpoint).
- **No working location/country filter.** `country`, `countries`, `location`,
  `requiredCountry`, and `jobType` were all tried against the search endpoint and had no
  effect on results. Arc is remote-first by design — most jobs have `requiredCountries: []`
  (worldwide) — so a location filter is less essential than on a city-based board, but this
  CLI cannot restrict by country server-side.
- **Arc-native company names are always hidden** in both search and detail JSON — this is
  intentional (Arc reveals the client only after a match), not missing data.
- `robots.txt` names `ClaudeBot` explicitly with `Crawl-Delay: 10` — permissive, no
  disallow. Still keep request volume reasonable.

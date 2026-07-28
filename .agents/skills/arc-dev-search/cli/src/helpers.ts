// Data source: Arc's (arc.dev) public, server-rendered Next.js pages. No authentication
// required. Both the search-results page and job-detail pages embed their full props as
// JSON in <script id="__NEXT_DATA__">, so we parse that JSON directly rather than
// regex-scraping HTML cards — see ../../url-reference.md for how this was confirmed.

export const BASE_URL = "https://arc.dev"

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

/** Fetch HTML with exponential backoff on 429/5xx. Returns "" on a 404. */
export async function htmlFetch(url: string): Promise<string> {
  const maxRetries = 6
  let delay = 500
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    })
    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`)
      }
      const jitter = Math.floor(Math.random() * 500)
      await new Promise((r) => setTimeout(r, delay + jitter))
      delay = Math.min(delay * 2, 8000)
      continue
    }
    if (response.status === 404) return ""
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`)
    }
    return response.text()
  }
  throw new Error("Request failed after max retries")
}

/** Extract and parse the Next.js __NEXT_DATA__ JSON island embedded in a server-rendered page. */
export function extractNextData(html: string): any | null {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!m) return null
  try {
    return JSON.parse(m[1])
  } catch {
    return null
  }
}

export type Source = "arc" | "external"

export interface JobCard {
  id: string
  title: string
  company: string | null
  location: string | null
  date: string | null
  url: string
  source: Source
  jobType: string | null
}

export interface Salary {
  minHourly: number | null
  maxHourly: number | null
  minAnnual: number | null
  maxAnnual: number | null
}

export interface JobDetail extends JobCard {
  description: string | null
  requiredCountries: string[]
  salary: Salary
  applyUrl: string | null
}

function unixToDate(seconds: number | null | undefined): string | null {
  if (!seconds) return null
  const d = new Date(seconds * 1000)
  if (isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

function locationFromCountries(countries: string[] | null | undefined): string {
  if (!countries || countries.length === 0) return "Remote (Worldwide)"
  return `Remote (${countries.join(", ")})`
}

/**
 * Descriptions are Markdown, but jobs aggregated from other boards occasionally carry
 * stray inline HTML left over from their source ATS (e.g. a bare <strong>). Strip just
 * those common inline/structural tags rather than the whole markup surface, so we don't
 * mangle legitimate Markdown like `<3 years` or code spans.
 */
function cleanDescription(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(strong|em|b|i|u|p|ul|ol|li|span|div)\s*[^>]*>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/** Build the two detail-path shapes Arc uses, derived from urlString + randomKey (see url-reference.md). */
function detailPath(source: Source, urlString: string, randomKey: string): string {
  return `${source === "arc" ? "details" : "j"}/${urlString}-${randomKey}`
}

/**
 * Parse the search-results page's __NEXT_DATA__ into a flat list of job cards. Each raw
 * item is parsed independently so one malformed entry cannot break the rest.
 */
export function parseSearchResults(nextData: any, source: "arc" | "external" | "all"): JobCard[] {
  const pp = nextData?.props?.pageProps
  if (!pp) return []

  const results: JobCard[] = []

  if (source === "arc" || source === "all") {
    for (const j of pp.arcJobs ?? []) {
      try {
        if (!j.urlString || !j.randomKey || !j.title) continue
        results.push({
          id: detailPath("arc", j.urlString, j.randomKey),
          title: j.title,
          company: null, // Arc hides the client company on its own listings until matched.
          location: locationFromCountries(j.requiredCountries),
          date: unixToDate(j.postedAt),
          url: `${BASE_URL}/remote-jobs/${detailPath("arc", j.urlString, j.randomKey)}`,
          source: "arc",
          jobType: j.jobType ?? null,
        })
      } catch {
        continue
      }
    }
  }

  if (source === "external" || source === "all") {
    for (const j of pp.externalJobs ?? []) {
      try {
        if (!j.urlString || !j.randomKey || !j.title) continue
        results.push({
          id: detailPath("external", j.urlString, j.randomKey),
          title: j.title,
          company: j.company?.name ?? null,
          location: locationFromCountries(j.requiredCountries),
          date: unixToDate(j.postedAt),
          url: `${BASE_URL}/remote-jobs/${detailPath("external", j.urlString, j.randomKey)}`,
          source: "external",
          jobType: j.jobType ?? null,
        })
      } catch {
        continue
      }
    }
  }

  return results
}

/** Filter cards to those posted within `days` days. Arc's postedAt is an exact timestamp,
 * so — unlike portals that only show "Mon DD" — this filter is exact, not a guess. */
export function filterByJobAge(cards: JobCard[], days: number, now: Date = new Date()): JobCard[] {
  if (!days || days <= 0) return cards
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - days)
  return cards.filter((c) => {
    if (!c.date) return true
    const d = new Date(c.date)
    return isNaN(d.getTime()) || d >= cutoff
  })
}

/** Parse a job-detail page's __NEXT_DATA__ (works for both `details/` and `j/` paths). */
export function parseJobDetail(nextData: any, id: string, source: Source): JobDetail {
  const pp = nextData?.props?.pageProps
  const job = pp?.job ?? {}
  const url = `${BASE_URL}/remote-jobs/${id}`

  const company: string | null = source === "arc" ? null : (job.companyName ?? pp?.company?.name ?? null)

  const date = unixToDate(job.postedAt ?? job.createdAt ?? job.startAt)

  return {
    id,
    title: job.title ?? "(untitled)",
    company,
    location: locationFromCountries(job.requiredCountries),
    date,
    url,
    source,
    jobType: job.jobType ?? job.contractType ?? null,
    description: job.description ? cleanDescription(job.description) : null,
    requiredCountries: job.requiredCountries ?? [],
    salary: {
      minHourly: job.minHourlyRate ?? null,
      maxHourly: job.maxHourlyRate ?? null,
      minAnnual: job.minAnnualSalary ?? null,
      maxAnnual: job.maxAnnualSalary ?? null,
    },
    // External jobs carry the original posting's URL — that's the real apply link.
    // Arc-native jobs are applied to on Arc itself, so the job's own page is the apply flow.
    applyUrl: source === "external" ? (job.url ?? url) : url,
  }
}

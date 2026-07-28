// Data source: GetOnBrd's public, server-rendered pages (getonbrd.com). No authentication
// required. Search results and job-detail pages are both plain HTML — we parse both with
// regex (shallow, stable markup; see ../../url-reference.md for the anchors used).
//
// Personal use only. GetOnBrd's robots.txt explicitly disallows ClaudeBot (and most other
// AI crawlers) sitewide. This CLI is used anyway at the explicit direction of the person who
// generated it, strictly for their own personal job search — see ../../SKILL.md. Keep volume
// low; do not use commercially or for bulk data collection.

export const BASE_URL = "https://www.getonbrd.com"

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
        "Accept-Language": "es-CL,es;q=0.9,en;q=0.8",
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

export interface JobCard {
  id: string
  title: string
  company: string | null
  location: string | null
  date: string | null
  url: string
}

export interface Salary {
  min: number | null
  max: number | null
  currency: string | null
  unit: string | null
}

export interface JobDetail extends JobCard {
  description: string | null
  employmentType: string | null
  salary: Salary | null
  applyUrl: string | null
}

/**
 * Extract the inner HTML of an element identified by an `id="..."` attribute,
 * correctly handling nested <div> elements by tracking tag depth.
 */
export function extractById(html: string, id: string): string | null {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const openRe = new RegExp(`<div[^>]*id="${escaped}"[^>]*>`, "i")
  const open = openRe.exec(html)
  if (!open) return null

  let i = open.index + open[0].length
  let depth = 1

  while (depth > 0 && i < html.length) {
    const nextOpen = html.indexOf("<div", i)
    const nextClose = html.indexOf("</div>", i)

    if (nextClose === -1) return null

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++
      i = nextOpen + 4
    } else {
      depth--
      i = nextClose + 6
    }
  }

  return html.slice(open.index + open[0].length, i - 6)
}

function numericEntity(cp: number): string {
  return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : ""
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => numericEntity(parseInt(dec, 10)))
    .replace(/&#[xX]([0-9a-fA-F]+);/g, (_, hex) => numericEntity(parseInt(hex, 16)))
    .replace(/&nbsp;/g, " ")
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function clean(html: string): string {
  return decodeHtmlEntities(stripTags(html))
}

/** Build the `/jobs-<slug>` search URL GetOnBrd's own search box constructs client-side. */
export function buildSearchUrl(query: string, location: string | undefined, page: number): string {
  const combined = location ? `${query} ${location}` : query
  const slug = encodeURIComponent(combined.trim().replace(/\s+/g, " ").split(" ").join("-"))
  const params = new URLSearchParams()
  if (page > 1) params.set("page", String(page))
  const qs = params.toString()
  return `${BASE_URL}/jobs-${slug}${qs ? `?${qs}` : ""}`
}

const MONTHS: Record<string, number> = {
  jan: 1, ene: 1,
  feb: 2,
  mar: 3,
  apr: 4, abr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8, ago: 8,
  sep: 9, set: 9,
  oct: 10,
  nov: 11,
  dec: 12, dic: 12,
}

/**
 * GetOnBrd's search-result cards show only "Mon DD" (no year). Infer the year by
 * assuming a month later than the current one belongs to last year. Best-effort —
 * the detail page's schema.org `datePosted` is the authoritative source.
 */
export function guessListingDate(monthDay: string, now: Date = new Date()): string | null {
  const m = monthDay.trim().match(/^([A-Za-zé]{3})\.?\s+(\d{1,2})$/)
  if (!m) return null
  const month = MONTHS[m[1].toLowerCase()]
  if (!month) return null
  const day = parseInt(m[2], 10)
  const currentMonth = now.getMonth() + 1
  const year = month > currentMonth ? now.getFullYear() - 1 : now.getFullYear()
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

/** Job ID: the URL path after `/jobs/`, e.g. `programacion/senior-full-stack-dev-acme`. */
function idFromUrl(url: string): string | null {
  const m = url.match(/\/jobs\/([^/?#]+\/[^/?#]+)/)
  return m ? m[1] : null
}

/**
 * Parse a `/jobs-<query>` search-results page: a flat list of `.results-item` cards.
 * We split on the card's opening tag and parse each chunk independently so one
 * malformed card cannot break the rest.
 */
export function parseJobCards(html: string): JobCard[] {
  const results: JobCard[] = []
  const chunks = html.split('<a class="results-item').slice(1)

  for (const chunk of chunks) {
    const hrefMatch = chunk.match(/href="(https:\/\/www\.getonbrd\.com\/jobs\/[^"]+)"/)
    if (!hrefMatch) continue
    const url = hrefMatch[1]
    const id = idFromUrl(url)
    if (!id) continue

    const titleMatch = chunk.match(/<h4 class="results-list-title">\s*<strong[^>]*>([\s\S]*?)<\/strong>/)
    const title = titleMatch ? clean(titleMatch[1]) : null
    if (!title) continue

    const infoMatch = chunk.match(/<div class="size0 flex gap-1 items-center">([\s\S]*?)<\/div>\s*<\/div>/)
    let company: string | null = null
    let location: string | null = null
    if (infoMatch) {
      const companyMatch = infoMatch[1].match(/<strong>([\s\S]*?)<\/strong>/)
      company = companyMatch ? clean(companyMatch[1]) || null : null
      const locMatch = infoMatch[1].match(/<span class="location">([\s\S]*?)<\/span>/)
      location = locMatch ? clean(locMatch[1]) || null : null
    }

    const dateMatch = chunk.match(/<div class="opacity-half size0">\s*([^<]+?)\s*<\/div>/)
    const date = dateMatch ? guessListingDate(dateMatch[1]) : null

    results.push({ id, title, company, location, date, url })
  }

  return results
}

/** Filter cards to those posted within `days` days, using the best-effort guessed date.
 * Cards whose date could not be parsed are kept (we'd rather over- than under-include). */
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

/** Parse a `/jobs/<category>/<slug>` job-detail page (schema.org JobPosting microdata). */
export function parseJobDetail(html: string, id: string): JobDetail {
  const titleMatch = html.match(/<span itemprop="title">([\s\S]*?)<\/span>/)
  const title = titleMatch ? clean(titleMatch[1]) : "(untitled)"

  const companyMatch = html.match(/<strong itemprop="name">([\s\S]*?)<\/strong>/)
  const company = companyMatch ? clean(companyMatch[1]) || null : null

  const locMatch = html.match(/itemprop="jobLocation"[\s\S]{0,400}?<span class="location">([\s\S]*?)<\/span>/)
  const location = locMatch ? clean(locMatch[1]) || null : null

  const dateMatch = html.match(/datetime="([^"]+)"[^>]*itemprop="datePosted"/)
  const date = dateMatch ? dateMatch[1].slice(0, 10) : null

  const employmentMatch = html.match(/itemprop="employmentType">([\s\S]*?)<\/span>/)
  const employmentType = employmentMatch ? clean(employmentMatch[1]) || null : null

  let salary: Salary | null = null
  if (html.includes('itemprop="baseSalary"')) {
    const min = html.match(/content="([^"]*)"\s*itemprop="minValue"/)
    const max = html.match(/content="([^"]*)"\s*itemprop="maxValue"/)
    const unit = html.match(/content="([^"]*)"\s*itemprop="unitText"/)
    const currency = html.match(/content="([^"]*)"\s*itemprop="currency"/)
    salary = {
      min: min ? parseFloat(min[1]) : null,
      max: max ? parseFloat(max[1]) : null,
      unit: unit ? unit[1] : null,
      currency: currency ? currency[1] : null,
    }
  }

  let description: string | null = null
  const descHtml = extractById(html, "job-body")
  if (descHtml) {
    const withBreaks = descHtml
      .replace(/<\s*br\s*\/?>/gi, "\n")
      .replace(/<\/(p|li|ul|ol|div|h\d)>/gi, "\n")
    description = decodeHtmlEntities(stripTags(withBreaks)).replace(/\n{3,}/g, "\n\n").trim() || null
  }

  const url = `${BASE_URL}/jobs/${id}`

  return {
    id,
    title,
    company,
    location,
    date,
    url,
    description,
    employmentType,
    salary,
    applyUrl: url,
  }
}

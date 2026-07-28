import {
  BASE_URL,
  htmlFetch,
  extractNextData,
  parseSearchResults,
  filterByJobAge,
  writeError,
  type JobCard,
} from "../helpers.js"

export interface SearchOpts {
  query: string
  jobage: number
  source: "arc" | "external" | "all"
  limit?: number
  format: "json" | "table" | "plain"
}

function buildSearchUrl(query: string): string {
  const params = new URLSearchParams({ keyword: query })
  return `${BASE_URL}/remote-jobs?${params.toString()}`
}

function renderTable(cards: JobCard[]): string {
  if (cards.length === 0) return "No results."
  const rows = cards.map((c) => {
    const id = c.id.slice(0, 50).padEnd(50)
    const title = (c.title || "").slice(0, 38).padEnd(38)
    const company = (c.company || "—").slice(0, 20).padEnd(20)
    const loc = (c.location || "—").slice(0, 22).padEnd(22)
    const date = c.date || "—"
    return `${id} ${title} ${company} ${loc} ${date}`
  })
  const header =
    "ID".padEnd(50) + " " + "TITLE".padEnd(38) + " " + "COMPANY".padEnd(20) + " " + "LOCATION".padEnd(22) + " DATE"
  return [header, "-".repeat(header.length), ...rows].join("\n")
}

export async function runSearch(opts: SearchOpts): Promise<number> {
  try {
    const html = await htmlFetch(buildSearchUrl(opts.query))
    const nextData = extractNextData(html)
    if (!nextData) {
      writeError("Could not find job data on the search-results page", "PARSE_FAILED")
      return 1
    }
    let cards = parseSearchResults(nextData, opts.source)
    cards = filterByJobAge(cards, opts.jobage)
    if (opts.limit !== undefined && opts.limit >= 0) cards = cards.slice(0, opts.limit)

    if (opts.format === "table") {
      process.stdout.write(renderTable(cards) + "\n")
    } else if (opts.format === "plain") {
      process.stdout.write(
        cards
          .map(
            (c) =>
              `${c.title}\n  ${c.company || "—"} · ${c.location || "—"} · ${c.date || "—"}\n  id: ${c.id}\n  ${c.url}`,
          )
          .join("\n\n") + "\n",
      )
    } else {
      process.stdout.write(
        JSON.stringify({ meta: { count: cards.length, page: 1 }, results: cards }, null, 2) + "\n",
      )
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "SEARCH_FAILED")
    return 1
  }
}

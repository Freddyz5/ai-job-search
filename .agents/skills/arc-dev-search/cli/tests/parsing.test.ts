import { describe, test, expect } from "bun:test"
import { extractNextData, parseSearchResults, parseJobDetail, filterByJobAge, type JobCard } from "../src/helpers"

function nextDataHtml(pageProps: unknown): string {
  return `<html><body><script id="__NEXT_DATA__" type="application/json">${JSON.stringify({
    props: { pageProps },
  })}</script></body></html>`
}

function arcJob(overrides: Record<string, unknown> = {}) {
  return {
    randomKey: "abc123",
    title: "Senior Backend Developer",
    jobType: "contract",
    requiredCountries: [],
    postedAt: 1785179306,
    urlString: "senior-backend-developer",
    company: { randomKey: null },
    ...overrides,
  }
}

function externalJob(overrides: Record<string, unknown> = {}) {
  return {
    randomKey: "xyz789",
    title: "Backend Engineer",
    jobType: "permanent",
    requiredCountries: ["IS"],
    postedAt: 1785179306,
    urlString: "asana-backend-engineer",
    company: { randomKey: "co1", name: "Asana" },
    ...overrides,
  }
}

describe("extractNextData", () => {
  test("parses the __NEXT_DATA__ JSON island", () => {
    const html = nextDataHtml({ arcJobs: [], externalJobs: [] })
    const data = extractNextData(html)
    expect(data.props.pageProps.arcJobs).toEqual([])
  })

  test("returns null when the script tag is absent", () => {
    expect(extractNextData("<html><body>no data here</body></html>")).toBeNull()
  })

  test("returns null on malformed JSON", () => {
    const html = `<script id="__NEXT_DATA__" type="application/json">{not valid json</script>`
    expect(extractNextData(html)).toBeNull()
  })
})

describe("parseSearchResults", () => {
  test("builds arc-native cards with hidden company and details/ path", () => {
    const data = { props: { pageProps: { arcJobs: [arcJob()], externalJobs: [] } } }
    const [card] = parseSearchResults(data, "all")
    expect(card.id).toBe("details/senior-backend-developer-abc123")
    expect(card.title).toBe("Senior Backend Developer")
    expect(card.company).toBeNull()
    expect(card.source).toBe("arc")
    expect(card.url).toBe("https://arc.dev/remote-jobs/details/senior-backend-developer-abc123")
    expect(card.location).toBe("Remote (Worldwide)")
  })

  test("builds external cards with company name and j/ path", () => {
    const data = { props: { pageProps: { arcJobs: [], externalJobs: [externalJob()] } } }
    const [card] = parseSearchResults(data, "all")
    expect(card.id).toBe("j/asana-backend-engineer-xyz789")
    expect(card.company).toBe("Asana")
    expect(card.source).toBe("external")
    expect(card.location).toBe("Remote (IS)")
  })

  test("--source arc excludes external jobs", () => {
    const data = { props: { pageProps: { arcJobs: [arcJob()], externalJobs: [externalJob()] } } }
    const cards = parseSearchResults(data, "arc")
    expect(cards).toHaveLength(1)
    expect(cards[0].source).toBe("arc")
  })

  test("--source external excludes arc jobs", () => {
    const data = { props: { pageProps: { arcJobs: [arcJob()], externalJobs: [externalJob()] } } }
    const cards = parseSearchResults(data, "external")
    expect(cards).toHaveLength(1)
    expect(cards[0].source).toBe("external")
  })

  test("one malformed entry does not break the rest", () => {
    const good = arcJob({ randomKey: "good1", urlString: "good-job" })
    const malformed = { title: "missing fields" } // no randomKey/urlString
    const data = { props: { pageProps: { arcJobs: [malformed, good], externalJobs: [] } } }
    const cards = parseSearchResults(data, "all")
    expect(cards).toHaveLength(1)
    expect(cards[0].id).toBe("details/good-job-good1")
  })

  test("returns [] when pageProps is missing", () => {
    expect(parseSearchResults({ props: {} }, "all")).toEqual([])
  })
})

describe("filterByJobAge", () => {
  const now = new Date("2026-07-27T00:00:00Z")
  const cards: JobCard[] = [
    { id: "1", title: "Recent", company: null, location: null, date: "2026-07-20", url: "u1", source: "arc", jobType: null },
    { id: "2", title: "Old", company: null, location: null, date: "2026-05-01", url: "u2", source: "arc", jobType: null },
    { id: "3", title: "Undated", company: null, location: null, date: null, url: "u3", source: "arc", jobType: null },
  ]

  test("keeps only cards within the window", () => {
    const result = filterByJobAge(cards, 14, now)
    expect(result.map((c) => c.id)).toEqual(["1", "3"]) // undated cards are kept, not dropped
  })

  test("days=0 returns all cards unfiltered", () => {
    expect(filterByJobAge(cards, 0, now)).toEqual(cards)
  })
})

describe("parseJobDetail", () => {
  test("parses an arc-native detail page (hidden company, salary, description)", () => {
    const data = {
      props: {
        pageProps: {
          job: {
            title: "Senior Backend Developer",
            description: "### Role\n\nBuild things.",
            jobType: "contract",
            requiredCountries: [],
            minHourlyRate: 20,
            maxHourlyRate: 40,
            postedAt: 1785179306,
            urlString: "senior-backend-developer",
          },
          company: null,
        },
      },
    }
    const job = parseJobDetail(data, "details/senior-backend-developer-abc123", "arc")
    expect(job.title).toBe("Senior Backend Developer")
    expect(job.company).toBeNull()
    expect(job.description).toBe("### Role\n\nBuild things.")
    expect(job.salary).toEqual({ minHourly: 20, maxHourly: 40, minAnnual: null, maxAnnual: null })
    expect(job.applyUrl).toBe(job.url)
  })

  test("parses an external detail page (visible company, apply link to original posting)", () => {
    const data = {
      props: {
        pageProps: {
          job: {
            title: "Backend Engineer",
            companyName: "Asana",
            description: "We are hiring.",
            requiredCountries: ["IS"],
            postedAt: 1785179306,
            url: "https://is.linkedin.com/jobs/view/backend-engineer-at-asana-123",
          },
          company: { name: "Asana" },
        },
      },
    }
    const job = parseJobDetail(data, "j/asana-backend-engineer-xyz789", "external")
    expect(job.company).toBe("Asana")
    expect(job.applyUrl).toBe("https://is.linkedin.com/jobs/view/backend-engineer-at-asana-123")
    expect(job.applyUrl).not.toBe(job.url)
  })

  test("falls back to the job's own URL for external jobs with no external url field", () => {
    const data = { props: { pageProps: { job: { title: "X", urlString: "x" }, company: null } } }
    const job = parseJobDetail(data, "j/x-key1", "external")
    expect(job.applyUrl).toBe(job.url)
  })

  test("strips stray inline HTML tags left over from an aggregated posting's source ATS", () => {
    const data = {
      props: {
        pageProps: {
          job: { title: "X", description: "What you'll do<strong>\n\n</strong>\n\n*   Ship code<br>*   Review PRs" },
          company: null,
        },
      },
    }
    const job = parseJobDetail(data, "j/x-key1", "external")
    expect(job.description).not.toMatch(/<[a-z]+>/i)
    expect(job.description).toContain("Ship code")
    expect(job.description).toContain("Review PRs")
  })
})

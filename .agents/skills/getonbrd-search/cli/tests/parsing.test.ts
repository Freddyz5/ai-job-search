import { describe, test, expect } from "bun:test"
import { parseJobCards, parseJobDetail, extractById, buildSearchUrl, guessListingDate } from "../src/helpers"

function resultsCard(opts: {
  category?: string
  slug?: string
  title: string
  company?: string
  location?: string
  date?: string
}): string {
  const category = opts.category ?? "programacion"
  const slug = opts.slug ?? "senior-dev-acme"
  return `<a class="results-item color-hierarchy1" data-turbo="false" href="https://www.getonbrd.com/jobs/${category}/${slug}"><div class="flex flex-grow2 items-center">
<div class="results-list-avatar"><img alt="${opts.company ?? "Acme"}" /></div>
<div class="results-list-info">
<h4 class="results-list-title"><strong class="pr-3">${opts.title}</strong> <span class="opacity-half">Full time</span></h4>
<div class="size0 flex gap-1 items-center">
<strong>${opts.company ?? "Acme"}</strong>
<span class="opacity-half">·</span>
<span><span class="location">
<span class="tooltipster" title="Remote">
<i class="icon icon-wifi"></i>
${opts.location ?? "Remote"}
</span>
</span></span>
</div>
</div>
</div>
<div class="results-secondary hide-on-mobile">
<div class="gb-results-list__badges"><span class="badge">New</span></div>
<div class="opacity-half size0">
${opts.date ?? "Jul 27"}
</div>
</div>
</a>`
}

describe("parseJobCards", () => {
  test("extracts id, title, company, location, date, url from a card", () => {
    const html = resultsCard({ title: "Senior Backend Developer", company: "Acme", location: "Remote (Chile)" })
    const [card] = parseJobCards(html)
    expect(card.id).toBe("programacion/senior-dev-acme")
    expect(card.title).toBe("Senior Backend Developer")
    expect(card.company).toBe("Acme")
    expect(card.location).toBe("Remote (Chile)")
    expect(card.url).toBe("https://www.getonbrd.com/jobs/programacion/senior-dev-acme")
  })

  test("parses multiple cards independently — one malformed card does not break the rest", () => {
    const good1 = resultsCard({ slug: "job-one", title: "Job One" })
    const malformed = `<a class="results-item" href="https://www.getonbrd.com/jobs/programacion/broken">no title here</a>`
    const good2 = resultsCard({ slug: "job-two", title: "Job Two" })
    const cards = parseJobCards(good1 + malformed + good2)
    expect(cards.map((c) => c.title)).toEqual(["Job One", "Job Two"])
  })

  test("decodes HTML entities in the title", () => {
    const html = resultsCard({ title: "Ingeniero de Datos &amp; ML" })
    const [card] = parseJobCards(html)
    expect(card.title).toBe("Ingeniero de Datos & ML")
  })

  test("strips the 'Featured job' icon markup from the title", () => {
    const html = `<a class="results-item" href="https://www.getonbrd.com/jobs/programacion/x"><h4 class="results-list-title"><strong class="pr-3"><i class="icon icon-pin" title="Featured job"></i>Senior Engineer</strong></h4><div class="size0 flex gap-1 items-center"><strong>Acme</strong></div></a>`
    const [card] = parseJobCards(html)
    expect(card.title).toBe("Senior Engineer")
  })

  test("skips cards with no resolvable id", () => {
    const html = `<a class="results-item" href="https://www.getonbrd.com/companies/acme"><h4 class="results-list-title"><strong>Not a job</strong></h4></a>`
    expect(parseJobCards(html)).toEqual([])
  })
})

describe("guessListingDate", () => {
  const now = new Date("2026-07-27T00:00:00Z")

  test("same-month date uses the current year", () => {
    expect(guessListingDate("Jul 27", now)).toBe("2026-07-27")
  })

  test("month after the current month rolls back to last year", () => {
    expect(guessListingDate("Nov 24", now)).toBe("2025-11-24")
  })

  test("handles lowercase Spanish abbreviations", () => {
    expect(guessListingDate("abr 08", now)).toBe("2026-04-08")
  })

  test("returns null for unparseable input", () => {
    expect(guessListingDate("not a date", now)).toBeNull()
  })
})

describe("buildSearchUrl", () => {
  test("joins query words with hyphens under the jobs- prefix", () => {
    expect(buildSearchUrl("full stack developer", undefined, 1)).toBe(
      "https://www.getonbrd.com/jobs-full-stack-developer",
    )
  })

  test("appends location to the query text", () => {
    expect(buildSearchUrl("data scientist", "santiago", 1)).toBe(
      "https://www.getonbrd.com/jobs-data-scientist-santiago",
    )
  })

  test("adds a page query param for page > 1", () => {
    expect(buildSearchUrl("data scientist", undefined, 2)).toBe(
      "https://www.getonbrd.com/jobs-data-scientist?page=2",
    )
  })
})

describe("extractById", () => {
  test("extracts content from a simple div", () => {
    expect(extractById('<div id="job-body">Simple text</div>', "job-body")).toBe("Simple text")
  })

  test("handles nested divs by tracking depth", () => {
    const html = `<div id="job-body">
      <div>Requirements:</div>
      <ul><li>5 years Python</li></ul>
    </div>`
    expect(extractById(html, "job-body")).toBe('\n      <div>Requirements:</div>\n      <ul><li>5 years Python</li></ul>\n    ')
  })

  test("returns null when id not found", () => {
    expect(extractById("<div>no id</div>", "job-body")).toBeNull()
  })
})

describe("parseJobDetail", () => {
  function detailHtml(opts: { title?: string; company?: string; location?: string; description?: string }) {
    return `
<h1><span itemprop="title">${opts.title ?? "Data Scientist"}</span></h1>
<span class="hide" itemprop="employmentType">FULL_TIME</span>
<span itemprop="jobLocation" itemscope><span itemprop="address"><span class="location"><span class="tooltipster" title="x"><i class="icon icon-wifi"></i>${opts.location ?? "Remote"}</span></span></span></span>
<time datetime="2025-10-01T18:14:12+00:00" itemprop="datePosted"></time>
<div itemprop="hiringOrganization"><strong itemprop="name">${opts.company ?? "Artefact"}</strong></div>
<div id="job-body" itemprop="description"><p>${opts.description ?? "We are hiring."}</p></div>
`
  }

  test("extracts title, company, location, date, employmentType, description", () => {
    const job = parseJobDetail(detailHtml({}), "data-science-analytics/data-scientist-artefact")
    expect(job.title).toBe("Data Scientist")
    expect(job.company).toBe("Artefact")
    expect(job.location).toBe("Remote")
    expect(job.date).toBe("2025-10-01")
    expect(job.employmentType).toBe("FULL_TIME")
    expect(job.description).toContain("We are hiring.")
    expect(job.url).toBe("https://www.getonbrd.com/jobs/data-science-analytics/data-scientist-artefact")
    expect(job.applyUrl).toBe(job.url)
  })

  test("parses baseSalary microdata when present", () => {
    const html = detailHtml({}).replace(
      "</time>",
      `</time><span itemprop="baseSalary"><span itemprop="value"><span content="1500" itemprop="minValue"></span><span content="2000" itemprop="maxValue"></span><span content="MONTH" itemprop="unitText"></span></span><span content="USD" itemprop="currency"></span></span>`,
    )
    const job = parseJobDetail(html, "x/y")
    expect(job.salary).toEqual({ min: 1500, max: 2000, unit: "MONTH", currency: "USD" })
  })

  test("salary is null when baseSalary microdata is absent", () => {
    const job = parseJobDetail(detailHtml({}), "x/y")
    expect(job.salary).toBeNull()
  })

  test("decodes HTML entities in the title", () => {
    const job = parseJobDetail(detailHtml({ title: "Ingeniero de Datos &amp; ML" }), "x/y")
    expect(job.title).toBe("Ingeniero de Datos & ML")
  })
})

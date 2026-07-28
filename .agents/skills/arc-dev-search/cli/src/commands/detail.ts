import { BASE_URL, htmlFetch, extractNextData, parseJobDetail, writeError, type Source } from "../helpers.js"

export interface DetailOpts {
  id: string
  format: "json" | "plain"
}

/** Accept a raw `details/<slug>-<key>` / `j/<slug>-<key>` id, or a full arc.dev URL. */
function normalizeId(input: string): { id: string; source: Source } | null {
  const url = input.match(/arc\.dev\/remote-jobs\/(details|j)\/([^/?#]+)/)
  if (url) return { id: `${url[1]}/${url[2]}`, source: url[1] === "details" ? "arc" : "external" }
  const bare = input.match(/^(details|j)\/([a-z0-9-]+)$/i)
  if (bare) return { id: `${bare[1]}/${bare[2]}`, source: bare[1] === "details" ? "arc" : "external" }
  return null
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  const normalized = normalizeId(opts.id)
  if (!normalized) {
    writeError(
      `Could not parse a job id from "${opts.id}" (expected "details/<slug>-<key>", "j/<slug>-<key>", or an arc.dev/remote-jobs/... URL)`,
      "BAD_ID",
    )
    return 1
  }
  const { id, source } = normalized
  try {
    const html = await htmlFetch(`${BASE_URL}/remote-jobs/${id}`)
    if (!html) {
      writeError("Job not found", "NOT_FOUND")
      return 1
    }
    const nextData = extractNextData(html)
    if (!nextData) {
      writeError("Could not find job data on the detail page", "PARSE_FAILED")
      return 1
    }
    const job = parseJobDetail(nextData, id, source)

    if (opts.format === "plain") {
      const lines = [
        job.title,
        `${job.company || "—"} · ${job.location || "—"}`,
        "",
        job.jobType ? `Type: ${job.jobType}` : "",
        job.salary.minHourly || job.salary.maxHourly
          ? `Rate: ${job.salary.minHourly ?? "?"}-${job.salary.maxHourly ?? "?"} USD/hr`
          : "",
        job.salary.minAnnual || job.salary.maxAnnual
          ? `Salary: ${job.salary.minAnnual ?? "?"}-${job.salary.maxAnnual ?? "?"} USD/yr`
          : "",
        job.date ? `Posted: ${job.date}` : "",
        "",
        job.description || "(no description)",
        "",
        `URL: ${job.url}`,
        job.applyUrl && job.applyUrl !== job.url ? `Apply: ${job.applyUrl}` : "",
      ].filter((l) => l !== "")
      process.stdout.write(lines.join("\n") + "\n")
    } else {
      process.stdout.write(JSON.stringify(job, null, 2) + "\n")
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "DETAIL_FAILED")
    return 1
  }
}

import { BASE_URL, htmlFetch, parseJobDetail, writeError } from "../helpers.js"

export interface DetailOpts {
  id: string
  format: "json" | "plain"
}

/** Accept a raw `<category>/<slug>` id or a full getonbrd.com job URL. */
function normalizeId(input: string): string | null {
  const url = input.match(/getonbrd\.com\/jobs\/([^?#]+)/)
  if (url) return url[1].replace(/\/$/, "")
  const bare = input.match(/^[a-z0-9-]+\/[a-z0-9-]+$/i)
  if (bare) return input.replace(/^\//, "").replace(/\/$/, "")
  return null
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  const id = normalizeId(opts.id)
  if (!id) {
    writeError(`Could not parse a job id from "${opts.id}" (expected "<category>/<slug>" or a getonbrd.com/jobs/... URL)`, "BAD_ID")
    return 1
  }
  try {
    const html = await htmlFetch(`${BASE_URL}/jobs/${id}`)
    if (!html) {
      writeError("Job not found", "NOT_FOUND")
      return 1
    }
    const job = parseJobDetail(html, id)

    if (opts.format === "plain") {
      const lines = [
        job.title,
        `${job.company || "—"} · ${job.location || "—"}`,
        "",
        job.employmentType ? `Employment: ${job.employmentType}` : "",
        job.salary && (job.salary.min || job.salary.max)
          ? `Salary: ${job.salary.min ?? "?"}-${job.salary.max ?? "?"} ${job.salary.currency || ""}/${(job.salary.unit || "").toLowerCase()}`
          : "",
        job.date ? `Posted: ${job.date}` : "",
        "",
        job.description || "(no description)",
        "",
        `URL: ${job.url}`,
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

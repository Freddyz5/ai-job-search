import { describe, test, expect } from "bun:test"
import { runCLI, parseJSON } from "./helpers"

// Live smoke test against the real Arc.dev site. Arc's robots.txt is permissive
// (ClaudeBot gets only a Crawl-Delay, not a disallow) — see ../../SKILL.md — but
// this still keeps request volume low (a handful of calls).

describe("Arc.dev CLI live smoke test", () => {
  test("search returns real results for a realistic query", async () => {
    const result = await runCLI(["search", "-q", "backend developer", "--limit", "5"])
    expect(result.exitCode).toBe(0)
    const data = parseJSON<{ meta: { count: number }; results: Array<Record<string, unknown>> }>(result)
    expect(data.results.length).toBeGreaterThan(0)
    for (const job of data.results) {
      expect(job.id).toBeTruthy()
      expect(job.title).toBeTruthy()
      expect(job.url).toBeTruthy()
    }
  }, 30000)

  test("detail returns a readable description for an external result (visible company + apply link)", async () => {
    const search = await runCLI(["search", "-q", "backend developer", "--source", "external", "--limit", "1"])
    const { results } = parseJSON<{ results: Array<{ id: string }> }>(search)
    expect(results.length).toBeGreaterThan(0)

    const detail = await runCLI(["detail", results[0].id])
    expect(detail.exitCode).toBe(0)
    const job = parseJSON<{ title: string; description: string | null; company: string | null; applyUrl: string | null }>(
      detail,
    )
    expect(job.title).toBeTruthy()
    expect(job.description).toBeTruthy()
    expect(job.company).toBeTruthy()
    expect(job.applyUrl).toBeTruthy()
  }, 30000)

  test("detail returns a readable description for an arc-native result (hidden company)", async () => {
    const search = await runCLI(["search", "-q", "backend developer", "--source", "arc", "--limit", "1"])
    const { results } = parseJSON<{ results: Array<{ id: string }> }>(search)
    expect(results.length).toBeGreaterThan(0)

    const detail = await runCLI(["detail", results[0].id])
    expect(detail.exitCode).toBe(0)
    const job = parseJSON<{ title: string; description: string | null; company: string | null }>(detail)
    expect(job.title).toBeTruthy()
    expect(job.description).toBeTruthy()
    expect(job.company).toBeNull()
  }, 30000)
})

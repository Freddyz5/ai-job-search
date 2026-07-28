import { describe, test, expect } from "bun:test"
import { runCLI, parseJSON } from "./helpers"

// Live smoke test against the real GetOnBrd site. Personal use only, low volume
// (two requests) — see ../../SKILL.md for the ClaudeBot robots.txt warning this
// skill was built under.

describe("GetOnBrd CLI live smoke test", () => {
  test("search returns real results for a realistic query", async () => {
    const result = await runCLI(["search", "-q", "full stack developer", "--limit", "5"])
    expect(result.exitCode).toBe(0)
    const data = parseJSON<{ meta: { count: number }; results: Array<Record<string, unknown>> }>(result)
    expect(data.results.length).toBeGreaterThan(0)
    for (const job of data.results) {
      expect(job.id).toBeTruthy()
      expect(job.title).toBeTruthy()
      expect(job.url).toBeTruthy()
    }
  }, 30000)

  test("detail returns a readable description for a result from search", async () => {
    const search = await runCLI(["search", "-q", "full stack developer", "--limit", "1"])
    const { results } = parseJSON<{ results: Array<{ id: string }> }>(search)
    expect(results.length).toBeGreaterThan(0)

    const detail = await runCLI(["detail", results[0].id])
    expect(detail.exitCode).toBe(0)
    const job = parseJSON<{ title: string; description: string | null }>(detail)
    expect(job.title).toBeTruthy()
    expect(job.description).toBeTruthy()
    expect(job.description).not.toMatch(/<[a-z]+>/i)
  }, 30000)
})

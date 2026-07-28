import { describe, test, expect } from "bun:test"
import { runCLI } from "./helpers"

function parsedStderr(stderr: string): { error?: string; code?: string } {
  try {
    return JSON.parse(stderr)
  } catch {
    return {}
  }
}

describe("Arc.dev CLI flag validation", () => {
  test("missing --query exits 1 with NO_QUERY", async () => {
    const result = await runCLI(["search"])
    expect(result.exitCode).not.toBe(0)
    expect(result.stdout).toBe("")
    const err = parsedStderr(result.stderr)
    expect(err.code).toBe("NO_QUERY")
  })

  test("detail without an id exits 1 with NO_ID", async () => {
    const result = await runCLI(["detail"])
    expect(result.exitCode).not.toBe(0)
    expect(result.stdout).toBe("")
    const err = parsedStderr(result.stderr)
    expect(err.code).toBe("NO_ID")
  })

  test("detail with an unparseable id exits 1 with BAD_ID before any request", async () => {
    const result = await runCLI(["detail", "not a valid id or url"])
    expect(result.exitCode).not.toBe(0)
    const err = parsedStderr(result.stderr)
    expect(err.code).toBe("BAD_ID")
  })

  test("--source with an invalid value exits 1 with BAD_ARG", async () => {
    const result = await runCLI(["search", "-q", "test", "--source", "bogus"])
    expect(result.exitCode).not.toBe(0)
    const err = parsedStderr(result.stderr)
    expect(err.code).toBe("BAD_ARG")
    expect(err.error).toMatch(/source/)
  })

  describe("--jobage validation", () => {
    test("non-numeric string exits 1 with BAD_ARG", async () => {
      const result = await runCLI(["search", "-q", "test", "--jobage", "foo"])
      expect(result.exitCode).not.toBe(0)
      const err = parsedStderr(result.stderr)
      expect(err.code).toBe("BAD_ARG")
      expect(err.error).toMatch(/jobage/)
    })

    test("zero is accepted (falsy int should not be treated as missing)", async () => {
      const result = await runCLI(["search", "-q", "test", "--jobage", "0", "--limit", "1"])
      const err = parsedStderr(result.stderr)
      expect(err.code).not.toBe("BAD_ARG")
    })
  })

  describe("--limit validation", () => {
    test("non-numeric string exits 1 with BAD_ARG", async () => {
      const result = await runCLI(["search", "-q", "test", "--limit", "xyz"])
      expect(result.exitCode).not.toBe(0)
      const err = parsedStderr(result.stderr)
      expect(err.code).toBe("BAD_ARG")
      expect(err.error).toMatch(/limit/)
    })
  })

  test("unknown command exits 1 with BAD_CMD", async () => {
    const result = await runCLI(["bogus"])
    expect(result.exitCode).not.toBe(0)
    const err = parsedStderr(result.stderr)
    expect(err.code).toBe("BAD_CMD")
  })
})

# /notion-sync - Push Ranked Jobs and Applications to a Notion Database

You are publishing a **read-only view** of the job search into the user's Notion workspace: one database row per job, with a detailed page per shortlisted match. The repo files stay the system of record - `job_scraper/seen_jobs.json` owns scraped/ranked jobs and `job_search_tracker.csv` owns applications. Notion is a disposable presentation layer on top of them; nothing ever syncs back.

This command requires the **Notion MCP server** (OAuth). It reads state, upserts pages, and stops - it never ranks, applies, or edits repo files. Notion is the in-tree reference binding; the sync contract itself is tool-agnostic (see "Adapting to Another Tool" at the end - only the two sections marked *(Notion binding)* are tool-specific).

## Lane: `/html-report` vs `/notion-sync`

Both present the same tracker data; they own different moments. `/html-report` is the **deep-review lane**: a self-contained offline dashboard with charts and a filterable table, regenerated at your desk. `/notion-sync` is the **glanceable lane**: the current state of the pipeline, reachable anywhere Notion runs (desktop, web, phone). They compose rather than compete - after `/outcome` records a result, re-run either or both to refresh the views.

Follow these steps **in order**.

---

## Step 0: Parse Input

`$ARGUMENTS` may contain:

- Nothing → sync ranked jobs with score ≥ 60 (Good Fit and above) plus every tracked application
- `--min-score <N>` → override the score threshold
- `--all` → sync every ranked job regardless of score
- `--rebuild` → re-fetch and rewrite page bodies too (see Step 5 - normally bodies are write-once)

---

## Step 1: Preflight the Connection *(Notion binding)*

The command is **silently optional**: when the destination is not reachable, the outcome is one clear message and a clean exit - nothing else in the framework notices this command exists.

1. Check that Notion MCP tools are available in this session (tool names starting with `mcp__notion__` or similar). Determine this from the session's own tool list **only** - never by running shell commands like `claude mcp list`, which would interrupt the user with a permission prompt before the graceful exit. If the tools are not available, stop and tell the user how to connect:
   > Notion MCP isn't connected. Run `claude mcp add --transport http notion https://mcp.notion.com/mcp`, then start a **new session** (servers added mid-session are only picked up on restart), run `/mcp` there to complete the OAuth login, and re-run `/notion-sync`.
2. Verify the connection with one cheap call (e.g. a workspace search). An auth error → tell the user to re-authenticate via `/mcp` and stop. Never retry in a loop.
3. The Notion MCP server is interactively authenticated, so "connected but not authenticable right now" (expired OAuth, headless/CI context where the login flow cannot run) gets the same graceful exit as "not configured": state the reason in one line and stop. This includes the configured-but-unauthenticated state where the server exposes only its auth handshake and no data tools - **never initiate the OAuth flow from this command and never ask whether to authenticate now**; the one line points at `/mcp` and the command ends there. Authenticating is the user's move, made outside this command.

---

## Step 2: Build the Sync Set (local data only - no external calls yet)

Validate the cheap, local precondition before creating anything external. A run with nothing to sync must exit with **zero side effects** - no database created, no state file written.

1. Read `job_scraper/seen_jobs.json` and `job_search_tracker.csv` (either may be missing).
2. Select `seen_jobs.json` entries with status `ranked` whose `rank_score` meets the threshold from Step 0. `--all` lifts the threshold entirely.
3. Every tracker row joins the sync set (an applied-to job always syncs, ranked or not), matched to `seen_jobs.json` entries case-insensitively on company + role where possible. Tracker rows with no `seen_jobs.json` entry sync too - build their Key as `<company>_<role>` lowercased with underscores.
4. **Status precedence:** the tracker wins. A job that is `ranked` in `seen_jobs.json` but `interview` in the tracker syncs as `interview`. Jobs only in `seen_jobs.json` keep their stored status.
5. **If the sync set is empty** (no ranked entries meet the threshold and there are no tracker rows), say "Nothing to sync - run `/scrape` and `/rank` first" (or, when jobs exist but all score below the threshold, say so and suggest `--min-score`/`--all`) and **stop**.
6. State the counts before touching the destination: how many rows will be created or checked, and the threshold in effect.

---

## Step 3: Locate the Database *(Freddy binding — existing Job Tracker, not a new database)*

This fork points at Freddy's existing **📋 Job Tracker** database. It never searches the
workspace for a "Job Search Pipeline" database and never creates a new one.

1. Data source: `collection://28a47e44-eb30-48ad-a544-a8d8600b7cd1` ("📋 Job Tracker").
2. Verify the database id still resolves in Notion. If it does not (deleted or renamed), stop
   and tell the user plainly — do not fall back to searching or creating a database.
3. Property mapping (framework concept → Job Tracker property):

   | Framework concept | Job Tracker property | Notes |
   |---|---|---|
   | Name (title) | `Empresa / Rol` | `<Empresa> – <Rol>` |
   | Score (0-100) | `Fit` | reuse the existing number field — do **not** create a separate "Score" |
   | Status | `Estado` | value map in Step 3.4 — write-once, see Step 4.3 |
   | Channel | `Plataforma` | values already match: LinkedIn / Arc.dev / GetOnBrd / Turing / Wellfound / Upwork / Otro |
   | URL | `Link oferta` | |
   | Applied on | `Fecha aplicacion` | |
   | Key (dedup anchor) | `Key` | **new property — add if missing (rich text), never shown to the user, never edited by hand** |

   Framework concepts with **no home in Job Tracker — never write these, never add properties
   for them**: Company (redundant with the title), Verdict, Deadline, First seen, Ranked,
   CV file, Cover letter. `CV usado` and `Notas` are Freddy's own manually-managed fields;
   this command never writes to them either.

4. Status value map (framework status → `Estado` option), used **only when creating a new
   page** (see Step 4.2):

   | Framework status | `Estado` option |
   |---|---|
   | ranked | Por aplicar |
   | applied | Aplicado |
   | interview | Entrevista |
   | offer | Oferta |
   | hired | Oferta |
   | rejected | Rechazado |
   | no response / withdrawn / expired | Descartado |

   `Estado` also has `En revision` and `Technical test`, which the framework has no equivalent
   for — these are Freddy's own manually-managed pipeline stages, set by hand in Notion as he
   progresses. Never write them, and never overwrite them (Step 4.3).

5. Add the `Key` property to the database if it does not already exist (type: rich text). Do
   not add, remove, or retype any other property.
6. Write `job_scraper/notion_sync.json` with `{ "database_id": "28a47e44-eb30-48ad-a544-a8d8600b7cd1", "last_sync": "YYYY-MM-DD" }`. This file is personal state and is gitignored — never commit it.

---

## Step 4: Upsert Database Rows

For each job in the sync set:

1. Query the database for a page whose `Key` equals the job's key.
2. **No match** → create the page with `Empresa / Rol`, `Fit` (Score), `Estado` (from the
   Step 3.4 value map), `Plataforma` (Channel), `Link oferta` (URL), `Fecha aplicacion`
   (Applied on, if present in the tracker), and `Key`. Then write its body (Step 5).
3. **Match** → update **only** `Fit` (Score) and `Fecha aplicacion` (Applied on, if it newly
   appears in the tracker). **Never touch `Estado` on an existing page** — Freddy manages that
   field by hand in Notion, including stages the framework doesn't track (`En revision`,
   `Technical test`), and overwriting it would clobber real pipeline state he entered himself.
   Do not touch the page body either - the user may have added their own notes there, and
   clobbering them breaks trust in the whole view. (`--rebuild` is the sole exception, and even
   `--rebuild` must not touch `Estado`.)
4. Never delete or archive pages, and never change `Estado` to reflect `expired` or similar -
   that judgment belongs to Freddy, not this command. Rows the user added to the database by
   hand (no `Key` value) are invisible to this command.

Batch politely: if the MCP server rate-limits, back off and continue; report any page that failed rather than retrying indefinitely.

---

## Step 5: Write the Detail Page (new pages only)

The page body is what makes a row worth clicking. Build it **only from stored data and actually fetched content**:

1. **Fit summary** - a short section from `seen_jobs.json` fields: score, verdict, quick-fit level, first-seen and ranked dates. If the job is in the tracker, add the application timeline (date applied, channel, current status, dated notes from the `notes` column) and name the submitted documents from `cv_file`/`cover_letter_file` (filenames only - the documents themselves never sync).
2. **The posting** - WebFetch the job URL and write a readable digest: what the role is, key requirements, practical details (location, deadline, salary if stated). If the fetch fails or redirects to a listing page, write "Posting no longer available (checked YYYY-MM-DD)" - **never reconstruct a posting from memory**.
3. **Links** - the posting URL; if `documents/applications/<company>_<role>/` exists locally, name it as the local archive path (plain text - the destination cannot link into the filesystem).

Keep the page under ~40 blocks; this is a briefing, not a mirror of the posting.

---

## Step 6: Report

```
## Pipeline Sync - YYYY-MM-DD

Database: <database_url>
Synced <N> jobs (threshold: score ≥ <T>): <C> created, <U> updated, <S> unchanged, <F> failed.

| | Title | Company | Status | Score |
|---|-------|---------|--------|-------|
| ✚ | ... | ... | ranked | 78 |
| ↻ | ... | ... | interview | 71 |
```

List failures with their error and the suggestion to re-run - the upsert is idempotent, so a re-run only touches what failed. Update `last_sync` in the sync-state file.

Remind the user once (first run only): the repo files remain the source of truth - edits made in the destination never flow back, and `/outcome` is still how application results get recorded.

---

## Important Rules

1. **One-way, always.** Destination content never flows back into `seen_jobs.json`, the tracker, or any repo file. This command reads repo state and writes the destination - both repo files are read-only to it, and the gitignored sync-state file is its **only** local write.
2. **Idempotent upsert on `Key`.** Re-running creates nothing twice; matching is on the stored key, never on fuzzy title comparison.
3. **Page bodies are write-once.** Property updates keep rows current; bodies belong to the user after creation. Only `--rebuild` may rewrite them, and it says so before doing it.
4. **Never fabricate.** A dead posting URL gets an explicit "unavailable" note, not a reconstruction. Every page claim traces to stored state or fetched content.
5. **Job data only.** The candidate profile, behavioral notes, and evaluation framework never sync - this is a pipeline view, not a profile export.
6. **Documents never leave the machine.** CVs and cover letters sync as **filenames only** - never upload, attach, or embed the documents themselves, nor HTML/text renditions of their content, into the destination. The local repo and `documents/applications/` archive are the only home for application documents; the row's page names them so the user knows what to open locally.

---

## Adapting to Another Tool (forks)

The sync contract is tool-agnostic; only the two sections marked *(Notion binding)* are tool-specific. A fork targeting a different destination (Airtable, Google Sheets, Linear, ...) keeps Steps 0, 2, 4, 5, and 6 and every Important Rule unchanged - build the same sync set, upsert on the same `Key`, keep bodies write-once and documents local - and swaps only:

- **Step 1** (connection preflight) for the target tool's MCP server or access check, keeping the silently-optional bar: not configured or not authenticable both end in one message and a clean exit
- **Step 3** (locate/create the database) for the equivalent container in the target tool, using the same property table and a renamed sync-state file

Like the portal skills, tool bindings beyond this Notion reference live in forks, where their maintainers can test them against a live workspace.
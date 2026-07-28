---
framework_version: 1.0.0
---

# Interview Preparation Guide

<!-- SETUP: STAR examples are personalized by running /setup based on your actual experience -->

## STAR Format

Structure answers as: **Situation** (context), **Task** (your responsibility), **Action** (what you did), **Result** (outcome).

Keep answers to 1-2 minutes. Be specific. End with what you learned or would do differently.

## Ready-Made STAR Examples

<!-- These are populated by /setup from your actual experience. Below are templates showing the format. -->

### 1. TCI Warehouse Factory-Pattern Redesign (Architecture / adapting to change)
**S:** TCI's air-cargo platform had one direct, hardcoded integration with an external warehouse over SOAP for guide synchronization.
**T:** When the team needed to integrate a second warehouse, I needed a design that would not require rewriting the existing integration.
**A:** I proposed and implemented a Factory-pattern abstraction with per-provider repositories and normalization in a base class, so each new warehouse plugs in as an adapter.
**R:** The second warehouse integrated cleanly without touching the first provider's logic, and the pattern became the template for any future warehouse.
**Use for:** "Tell me about a time you improved an existing design", "How do you approach extensibility?", "Describe a technical decision you made independently"

### 2. Media Value Terms-and-Conditions Feature (End-to-end ownership)
**S:** Media Value needed an auditable record of terms-and-conditions acceptance for already-registered pharmacy users.
**T:** I was asked to design (with senior approval) and build the feature end to end.
**A:** I built the domain entity, application services with criteria-based search, GraphQL API, database migration, and frontend hooks, following hexagonal architecture.
**R:** The feature shipped as a fully auditable acceptance record used across the platform, delivered independently after senior sign-off on the design.
**Use for:** "Describe a project you owned end to end", "Tell me about designing something from scratch"

### 3. MTC Mobile E2E Test Takeover (Stepping up / adaptability)
**S:** Two developers left the MTC cold-chain project, leaving its mobile end-to-end test suite unmaintained and incomplete.
**T:** I took over completing the automation.
**A:** I wrote Maestro flows for quarantine, spill test, cleaning, returns, and conditioning in both QR and manual variants, with data-preparation scripts, and standardized the existing flows.
**R:** The mobile app regained reliable end-to-end coverage across its critical operational flows.
**Use for:** "Tell me about picking up someone else's unfinished work", "How do you handle sudden gaps in a team?"

### 4. Expense Control Platform Backend Takeover (Initiative / learning under pressure)
**S:** A personal side project began as a collaboration - a teammate owned the Java backend, I owned the frontend.
**T:** When he left the project due to lack of time, I had to decide whether to find a replacement or take the backend on myself.
**A:** I took over the entire backend and rewrote it in TypeScript on hexagonal architecture/DDD, deliberately using it as practice for patterns I wanted to strengthen: aggregate roots, domain events, a custom Criteria pattern, and separate read/write repositories.
**R:** 480+ commits later, it is a deployed, evolving full-stack platform (web, mobile, GraphQL API) that also became my proof point for backend architecture skills.
**Use for:** "Tell me about a time you had to learn something fast", "Why do you want to move toward backend work?", "Tell me about a personal project you're proud of"

<!-- Add more STAR examples as needed. Aim for 4-6 covering different competencies. -->

## Common Tough Questions

### "Why are you looking to leave Init Grammers?" (still currently employed there)
> Rotating across four products at Init Grammers gave me full-stack range across frontend, backend, mobile, and infrastructure, and I'm proud of what I built there. I'm looking for a role where I can go deeper on backend and architecture specifically, rather than rotating broadly, and where I own that scope with less repeated re-review before decisions can move forward. No negativity about the employer - frame as pursuing depth, not escaping something.

### "You don't have [formal backend title / years of experience with X]."
> I haven't held a formal backend-only title, but backend work - domain modeling, GraphQL API design, PostgreSQL schema design - is already the majority of what I do day to day across three concurrent production products, and it's the direction I'm actively deepening (see the Expense Control Platform: I took over and rebuilt an entire backend solo). Acknowledge any genuinely new tool/language gap directly, bridge to the closest adjacent experience, and state willingness to ramp up.

### "Where do you see yourself in 5 years?"
> Owning backend/architecture decisions for a product at a level closer to tech lead scope - I've already built reusable abstractions (the TCI Factory pattern, the Expense Control Platform's domain package) that other engineers built on top of; I want more of that scope and more formal ownership of it.

### "What's your biggest weakness?"
> I want decisions grounded in verified signal, which means I can be slower than a teammate who's comfortable deciding on a hunch. Mitigation: I break work into sequential, self-contained steps and get each one reviewed before moving to the next, so the extra verification doesn't turn into an overall delivery delay. I'm also more energized by fast, decisive environments than ones that require many rounds of stakeholder sign-off on the same decision - I manage that by front-loading context into proposals so they need fewer review cycles.

### "Why this company specifically?"
> Customize per company. Must reference: specific projects, company values, market position, or team structure. Never give a generic answer.

## Questions You Should Ask Interviewers

### About the Role
- "What does a typical week look like in this role?"
- "What would success look like in the first 6 months?"
- "What's the biggest challenge the team is facing right now?"

### About the Team
- "How big is the team, and how do you divide work?"
- "What does the development/project lifecycle look like, from idea to production?"
- "How do you onboard new team members?"

### About Tech & Growth
- "What's your current tech stack for [relevant area]?"
- "Is there room to grow into more architectural or strategic decisions?"
- "How does the team stay current with new tools and methods?"

### About Culture (use these to prevent disappointment)
- "How would you describe the team culture?"
- "What does professional development look like here?"
- "Is there flexibility for remote/hybrid work?"
- "What's the balance between development/new projects and maintenance work?"
- "How would you describe the leadership style in this team?"
- "What do people who thrive here have in common?"

## Phone/Video Interview Tips
- Have STAR examples written out (use this file)
- Keep a glass of water nearby
- Smile when speaking (it changes your tone)
- Ask for clarification if a question is vague
- It's OK to take 5 seconds to think before answering
- End with: "Is there anything else you'd like to know about my background?"

## After the Application (Best Practice)

### Follow-Up Etiquette
- **Don't call to "stand out"** or to learn more about the role post-submission - this risks a negative impression
- If the employer specified a timeline, respect it and wait
- If no timeline was given and significant time has passed (2+ weeks), a brief call to ask about status is acceptable
- If you have genuinely new, relevant information to share, a short follow-up is fine

### Thank-You Notes
- When you receive any update (interview invitation, rejection, or status update), send a brief thank-you message
- Express appreciation for their time and the process
- Keep it short (2-3 sentences)

## Roleplay Guidelines
When the user asks for interview practice:
1. Ask which role/company to simulate
2. Start with easy warm-up questions ("Tell me about yourself")
3. Progress to role-specific technical questions
4. Include 1-2 behavioral questions using the competencies from the job posting
5. End with a tough question or curveball
6. After each answer, give brief feedback: what worked, what to sharpen
7. Suggest which STAR example would work best for each question

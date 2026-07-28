---
framework_version: 1.0.0
---

# Candidate Profile

<!-- SETUP: This file is populated by running /setup -->
<!-- After running /setup, all sections will be filled with your actual information -->

## Identity
- **Name:** Freddy Tacuri
- **Location:** Quito, Ecuador
- **Phone:** +593 99 578 1302
- **Email:** freddyltacuri@gmail.com
- **LinkedIn:** https://www.linkedin.com/in/freddy-tacuri/
- **GitHub:** https://github.com/Freddyz5
- **Languages:** Spanish (native), English (B1 - Intermediate)
- **Status:** Employed - Full Stack Developer at Init Grammers, open to new opportunities
- **Constraints:** Remote-only or willing to relocate; open to hybrid only if the role is based in Ecuador (hybrid elsewhere would require relocating just to be hybrid, which isn't worth it)

## Education

| Degree | Period | Institution | Key Topics |
|--------|--------|-------------|------------|
| Electronics Engineering | 2010-2016 | Universidad Politécnica Salesiana | Electronics |
| Technical High School Diploma in Electronics | 2008-2010 | Colegio Técnico Guillermo Mensi | Consumer electronics |

## Professional Experience

### Full Stack Developer - Init Grammers (Oct 2023 - Present)
Software consultancy building products for international clients (remote / Quito, Ecuador)
- Joined as a junior developer in October 2023; promoted to semi-senior in April 2025
- Rotated across four concurrent client products, covering frontend, backend, mobile, and infrastructure

**Media Value** (pharmacy management ecosystem for Spain - Oct 2023-Feb 2026, frontend then full stack)
- Designed - with senior approval - and implemented end to end the terms-and-conditions acceptance record for registered users: domain entity, application services with criteria-based search, GraphQL API, database migration, and frontend hooks, under hexagonal architecture
- Supported delivery of automatic shift closing during a period of heavy team load, consolidating two cron jobs into one with time-zone-boundary handling, notification deduplication, and comment-backed closure, covered by robustness and edge-case tests
- Built the training platform's interfaces (series/chapters, drag-and-drop content upload, search, favorites, view tracking) and led the mobile-responsive adaptation ahead of production launch
- Implemented time zone support end to end (domain entity, DB migration, profile form) to operate correctly across Spanish pharmacies

**TCI** (air-cargo export logistics platform - Dec 2024-Dec 2025, full stack)
- Completed the first guide-synchronization integration with an external warehouse over SOAP; when a second warehouse needed integrating, proposed and implemented a Factory-pattern abstraction with per-provider repositories and base-class normalization, so new warehouses plug in as adapters without touching existing logic
- Built guide loading from an XLSM template with per-row validation and automatic mapping to consignee, product, waybill, airline, and route entities
- Implemented partial-guides support and the cargo reception module end to end: SQL views/migration, domain models, criteria-based search, Prisma repository, GraphQL resolvers, interface
- Automated user provisioning via domain events (default client user on agency creation/removal, bulk password generation) and implemented per-agency multi-tenant data isolation, propagated through search, counts, and the no-token case

**MTC** (cold-chain logistics platform, web + mobile - Aug 2024-Present, full stack)
- Built the documents module end to end: Prisma schema, domain models/repository interface, use cases, GraphQL schema/queries, and a detail view with preview and PDF export, including reservation/consumption workflow and org-based auto-generation
- Defined the technical approach for barcode-gun batch scanning (replacing item-by-item camera scanning) and is rolling it out across seven operational flows, in both domain/API and mobile/web UI
- Took over and completed end-to-end Maestro test automation for the mobile app after two developers left the project, writing quarantine, spill-test, cleaning, returns, and conditioning flows plus data-prep scripts
- Built the inventory creation/modification interface on top of existing scripts (CSV upload, template, validation), removing a prior dependency on a developer running the endpoint manually

**Marca Patito** (waste-collection subscription platform - Dec 2024-Mar 2025, frontend-led)
- Implemented role-based access control (super admin, admin, manager, individual client, business), centralizing an access check that had been duplicated page by page
- Built the plan purchase/activation flow: external payment gateway, receipt upload, admin review and status change, email notification on activation
- Integrated Drizzle ORM and the data access layer; found and fixed a hardcoded database connection string, moving it to environment variables

## Independent Projects
<!-- Projects outside of employment: freelance, open source, personal -->
- **Expense Control Platform** (Apr 2025-present, solo, 480+ commits): full stack expense-tracking platform (Next.js web, Expo mobile, GraphQL Yoga API). Took over the entire backend from a departed collaborator and rewrote it in TypeScript on hexagonal architecture/DDD - aggregate roots, value objects, domain events, a custom Criteria pattern, separated read/write repositories. Deployed with CI/CD on GitHub Actions and Vercel.
- **Vision Craft** (Apr 2026-present): Astro/React vision-board editor with a print engine that works internally in millimeters and tiles large boards across multiple sheets for real physical-scale printing. Multi-provider image search (Unsplash, Pexels) via a server-side API proxy, Konva-based canvas editor.
- **Jardín Zen** (Mar-Apr 2026, completed): React Native/Expo ambient-sounds app for relaxation and sleep, with a looping audio player, waveform scrubbing, background sleep timer, and native Android/iOS builds via EAS.

## Technical Skills

### Programming & ML
- **TypeScript / JavaScript** (daily use, ~3 years production): React, Next.js, Node.js, GraphQL, PostgreSQL
- Frontend: Astro, Tailwind CSS, Material UI, Zustand, Redux Toolkit, TanStack Query, SWR
- Backend: Apollo Server/Client, GraphQL Yoga, Hono, Express, REST APIs
- Data: Prisma, Drizzle ORM, Neon
- Mobile: React Native, Expo

### Domain Expertise
- Hexagonal architecture and domain-driven design (aggregate roots, value objects, domain events)
- Multi-tenant systems and criteria-based search/filtering patterns
- Monorepo tooling (Turborepo, Yarn workspaces)

### Software & Tools
- Git, GitHub, GitHub Actions, Vercel, Maestro (E2E testing), Agile/Scrum

## Publications
<!-- List peer-reviewed publications, if any -->
None.

## Awards
None yet.

## References
None on file yet - available upon request.

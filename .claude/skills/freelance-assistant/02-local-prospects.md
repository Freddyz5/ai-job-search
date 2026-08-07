# Local Client Prospecting Rules (Quito)

Sourcing, scoring and the three-layer pricing model live in `03-prospect-evaluation.md`. This
file covers what happens *after* a business is qualified: pricing, sector taxonomy, the spoken
approach script, and demo scope.

Source of truth for these values: the **🏢 Clientes Freelance** Notion database
(`collection://4238a325-d988-41c9-ac56-5c39810d3a2f`). If you ever suspect these have drifted
from what's live in Notion, re-check the database schema before trusting this file - it's a
copy, not the original.

## Sectors (`Sector`)

Restaurante · Clinica / Salud · Academia · Inmobiliaria · Comercio · Servicios · SaaS / Tech ·
Otro

## Detected needs (`Necesidad detectada`)

Sin web · Web desactualizada · Sin agendamiento · Sin tienda online · Automatizacion ·
Dashboard · Otro

## Reference rates (USD)

| Tipo de proyecto | Rango |
|---|---|
| Landing page básica | $250–450 |
| Web de 5 páginas | $500–900 |
| Web con agendamiento | $700–1,200 |
| Bot de WhatsApp básico | $300–600 |
| **Panel interno (inventario / pedidos / cotizaciones)** | **$2,000–3,500** ⚠️ |
| Mantenimiento mensual | $50–150/mes |

⚠️ **The panel range is a placeholder, not a defined offer.** Before quoting it, the scope has
to be closed: what's included, what's explicitly excluded, delivery window, and the monthly
retainer. Until that exists, don't put a panel number in front of a client — tell Freddy the
offer is still undefined and stop there. Everything in the grande layer depends on this being
fixed, and quoting a range for a scope nobody has bounded is how a 4-week project becomes a
6-month one at the same price.

**Delivery capacity is a separate budget from prospecting capacity.** The 3-5 h/week in
`03-prospect-evaluation.md` buys leads, not code. Before recommending Freddy pursue a grande
project alongside existing small clients, check that he's stated his weekly *delivery* hours;
if he hasn't, ask. Selling more than can be built is the one failure this market doesn't
forgive.

**Anti-underquoting rule:** calculate real hours × minimum acceptable rate before quoting.
If the number that comes out is below the range above, the range wins - don't quote under it
just because the client pushes back. Always add a 20% buffer for scope creep; local
in-person projects almost always grow past the first conversation.

## Approach script (`/prospect`'s main output)

This gets **said out loud**, standing in the business, not read from a card. Write it that way:

- Short. A business owner mid-shift has 60-90 seconds of attention, not more.
- Opens with the specific thing you noticed (no website / outdated site / no online booking) -
  never a generic "hi, do you have a website?"
- Adapts to the sector: a clinic cares about no-shows and scheduling; a restaurant cares about
  being findable and showing the menu/hours; a shop cares about being found on Google Maps at
  all. Don't reuse the same pitch across sectors.
- Ends with a low-friction ask: showing the demo, not closing the sale in that first visit.

## Demo scope (`/prospect-demo`)

Structure and content per section, ready for a developer to implement in Next.js or Astro.
**Not full code** - section names, what goes in each, and enough copy direction to build from.
2-3 hours of actual build time is the target scope for the eventual real demo, per the
Notion database's own workflow notes - keep the suggested structure realistic to that budget,
not a 10-section dream site.

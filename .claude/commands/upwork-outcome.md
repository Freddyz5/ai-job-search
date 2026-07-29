# /upwork-outcome - Record a Real Upwork Result

`$ARGUMENTS`: a project identifier (title or enough of it to match uniquely) and the new state.

---

1. Find the matching row in `freelance/tracker.csv` (`Canal=Upwork`). If more than one match,
   ask which one rather than guessing.
2. Map the reported result to `Estado` (same shared vocabulary as the rest of the database -
   don't invent new values):
   - En conversación → `En negociacion`
   - Contratado → `Cliente activo`
   - Completado, no ongoing retainer → `Cliente activo` (leave `Precio cerrado` as the closing
     note - there's no separate "Completado" state, `Cliente activo` covers it)
   - Completado + ongoing monthly work → `Mantenimiento`
   - Sin respuesta after ~1 week, or rejected → `Descartado`
3. If a review was left, set `Review obtenida` to checked (this property is Upwork-only - never
   set it on a `Canal=Local Quito` row).
4. If a price was agreed, record it in `Precio cerrado` (this is what actually closed, not the
   original ask).
5. This command only writes to `freelance/tracker.csv` - it's the source of truth. Nothing
   syncs to Notion here; run `/upwork-sync` separately when ready.

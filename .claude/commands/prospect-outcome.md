# /prospect-outcome - Record a Real Local Prospect Result

`$ARGUMENTS`: business name and new state (`Contactado` / `En negociacion` / `Cliente activo` /
`Mantenimiento` / `Descartado`), optionally a price.

---

1. Find the matching row in `freelance/tracker.csv` (`Canal=Local Quito`). If more than one
   match, ask which one.
2. Update `Estado` to the reported value - use the existing vocabulary exactly
   (`Prospecto` / `Demo listo` / `Contactado` / `En negociacion` / `Cliente activo` /
   `Mantenimiento` / `Descartado`). Don't invent a new state even if the reported result
   doesn't map cleanly - ask which existing one fits best.
3. If a price closed, record it in `Precio cerrado`. If it's now a maintenance retainer,
   record the monthly amount in `Mantenimiento mensual`.
4. Update `Fecha contacto` or `Fecha seguimiento` if the user gives a date for either.
5. This command only writes to `freelance/tracker.csv` - it's the source of truth. Nothing
   syncs to Notion here; run `/prospect-sync` separately when ready.

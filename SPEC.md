# HabiTrack — SPEC (resumen)

**Objetivo:** app web minimalista para seguimiento diario de hábitos,
enfocada en facilidad de uso y motivación por rachas.

**Usuario:** personas ocupadas, no necesariamente técnicas. Uso < 1 min/día.

**Funcionalidades:** lista de hábitos del día, CRUD de hábitos, check-in diario,
contador de racha (fuego + número).

**Restricciones:**
- Mobile First.
- Sin registro ni login.
- Datos en `localStorage` (sin backend).
- Estado local, sin Redux. Manejar error básico: no permitir hábito en blanco.

**Datos por hábito:**
`id`, `title`, `category`, `doneToday` (bool), `lastDone` (`YYYY-MM-DD` o `null`),
`createdAt` (ISO), `streak` (int).

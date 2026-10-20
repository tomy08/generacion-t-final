# HabiTrack — AGENTS.md

## Proyecto
HabiTrack (Registro de Hábitos Diarios). App web minimalista, Mobile First,
sin login, con persistencia en `localStorage`.

## Stack
- Vanilla JavaScript modular (sin Redux), Tailwind CSS (CDN), Lucide icons.
- Lógica pura en `src/habits.js`. UI en `index.html` + `src/app.js`.
- Tests con runner nativo de Node (`node:test` + `node:assert`). Sin dependencias.

## Reglas para la IA
1. Leer SPEC (`SPEC.md`) antes de tocar código.
2. Analizar **una sola funcionalidad** por vez. No escribir código sin aprobación.
3. Todo refactoring debe mantener el comportamiento observable.
4. Toda lógica nueva o refactorizada debe tener tests en `tests/`:
   - al menos 1 caso correcto, 1 con datos inválidos, 1 caso límite.
5. No agregar dependencias ni gestión de estado compleja.
6. Nombres de variables en inglés, funciones pequeñas, Mobile First.

## Comandos
- Ejecutar tests: `npm test` (o `node --test tests/`)
- Abrir app: abrir `index.html` en el navegador (o `npx serve .`).

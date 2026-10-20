# Mini actividad — Refactoring + Tests Unitarios (HabiTrack)

**Funcionalidad elegida:** check-in diario + cálculo de racha (`toggle`), más
validación al crear (`addHabit`). Es el núcleo de la app y es lógica pura,
testeable sin DOM.

## 1. Análisis del código ANTES (`src/habits.before.js`)

| # | Smell | Dónde |
|---|-------|-------|
| 1 | Duplicación: armado de `YYYY-MM-DD` repetido en `toggle` y `resetIfNewDay` | `habits.before.js:20-25`, `~95-101` |
| 2 | Función demasiado larga: `toggle` (~35 líneas) mezcla buscar, comparar fechas, calcular racha y mutar | `habits.before.js:18-55` |
| 3 | Nombres poco claros: `t, c, x, h, tmp, d, d2, diff` | todo el archivo |
| 4 | Responsabilidades mezcladas: `toggle` hace fecha + racha + toggle en un solo bloque | `toggle` |
| 5 | Oportunidad de simplificación: validación `t == null \|\| t == "" \|\| t.trim() == ""` repetida en `addHabit` y `editHabit`; comparación con `==`; mutación directa del array | `addHabit`, `editHabit` |

## 2. Mejora aplicada (una sola)

**Separar responsabilidades de `toggle` y eliminar la duplicación de fecha/racha:**
se extrajeron helpers puros `toDateKey()`, `diffDays()`, `calcNewStreak()`,
`calcUncheckStreak()`, `normalizeText()` / `isValidTitle()`.
`toggle` quedó en ~15 líneas: decide si es "desmarcar" o "marcar" y delega el
cálculo. Además se agregó el parámetro opcional `now = new Date()` (mismo
comportamiento por defecto) para poder testear fechas límite, y se devuelven
arrays nuevos en vez de mutar (el contenido devuelto es idéntico).

Ver: `src/habits.js` (después) vs `src/habits.before.js` (antes).

Extracto del ANTES (toggle largo, todo mezclado):
```js
export function toggle(list, id) {
  let now = new Date();
  let tmp = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2,"0") + "-" + String(now.getDate()).padStart(2,"0");
  for (let i = 0; i < list.length; i++) {
    let h = list[i];
    if (h.id == id) {
      if (h.doneToday && h.lastDone == tmp) { h.doneToday = false; h.streak = h.streak - 1; ... }
      else {
        if (h.lastDone == null) { h.streak = 1; }
        else {
          let d = new Date(h.lastDone + "T00:00:00");
          let d2 = new Date(tmp + "T00:00:00");
          let diff = Math.round((d2 - d) / 86400000);
          if (diff == 0) { ... } else if (diff == 1) { h.streak = h.streak + 1; } else { h.streak = 1; }
        }
        h.doneToday = true; h.lastDone = tmp;
      }
    }
  }
  return list;
}
```

Extracto del DESPUÉS (misma regla, delegada):
```js
export function toggle(list, id, now = new Date()) {
  const todayKey = toDateKey(now);
  return list.map((habit) => {
    if (habit.id !== id) return habit;
    const isUndo = habit.doneToday && habit.lastDone === todayKey;
    if (isUndo) return { ...habit, doneToday: false, streak: calcUncheckStreak(habit.streak) };
    return { ...habit, doneToday: true, lastDone: todayKey,
      streak: calcNewStreak(habit.streak, habit.lastDone, todayKey) };
  });
}
```

## 3. Tests unitarios (`tests/habits.test.js`, runner nativo `node:test`)

Qué valida cada test:

**Correctos:**
1. `agrega un hábito válido...` — trim de título/categoría y valores iniciales (`streak 0`, `doneToday false`).
2. `primer check-in...` — marcar hoy deja `streak 1` y `lastDone` de hoy.
3. `día consecutivo incrementa...` — `resetIfNewDay` no toca la racha y el check-in del día siguiente hace `1 → 2`.
4. `edita título y categoría` — edición válida actualiza ambos campos.
5. `elimina por id` — solo sale el hábito pedido.

**Inválidos:**
6. `rechaza título vacío/en blanco/null` — `addHabit` no agrega nada.
7. `ignora edición con título en blanco` — conserva el título anterior.
8. `toggle con id inexistente` — la lista queda igual.
9. `categoría vacía cae a 'General'` — mismo default que el código ANTES.

**Límite:**
10. `doble toggle el mismo día` — marcar y desmarcar deja `streak 0`, no duplica.
11. `salto de 3 días reinicia a 1` — no continúa racha vieja de 5.
12. `cambio de año 31-dic → 01-ene` — cuenta como día consecutivo (`4 → 5`).
13. `desmarcar con racha 0` — no deja racha negativa.
14. `resetIfNewDay no resetea si es hoy` — conserva `doneToday true` y racha.

## 4. Resultado de ejecución (`npm test`)

```
> habitrack@1.0.0 test
> node --test tests/habits.test.js

▶ casos correctos
  ✔ agrega un hábito válido con trim y valores iniciales
  ✔ primer check-in deja streak en 1 y marca hoy
  ✔ día consecutivo incrementa la racha (1 -> 2)
  ✔ edita título y categoría válidos
  ✔ elimina por id
▶ datos inválidos
  ✔ rechaza título vacío, en blanco o null (no agrega nada)
  ✔ ignora edición con título en blanco (conserva el anterior)
  ✔ toggle con id inexistente no cambia la lista
  ✔ categoría vacía cae a 'General' (igual que el código ANTES)
▶ casos límite
  ✔ doble toggle el mismo día no duplica la racha (1 -> 0 al desmarcar)
  ✔ salto de 3 días reinicia la racha a 1 (no la continúa)
  ✔ cambio de año 31-dic -> 01-ene cuenta como día consecutivo
  ✔ desmarcar con racha 0 no deja racha negativa
  ✔ resetIfNewDay no resetea si lastDone es hoy
ℹ tests 14 | pass 14 | fail 0
```

Los 14 tests pasan después del refactoring; el comportamiento se mantuvo.

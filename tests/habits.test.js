import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  addHabit,
  toggle,
  editHabit,
  removeHabit,
  resetIfNewDay,
  toDateKey,
  calcNewStreak,
} from "../src/habits.js";

// Fechas fijas para que los tests no dependan del día real.
const day1 = new Date(2026, 8, 7, 10, 0, 0); // 2026-09-07
const day2 = new Date(2026, 8, 8, 10, 0, 0); // día consecutivo
const day5 = new Date(2026, 8, 11, 10, 0, 0); // salto de 3 días
const newYear = new Date(2026, 0, 1, 10, 0, 0); // 2026-01-01 (límite: cambio de año)
const newYearEve = new Date(2025, 11, 31, 10, 0, 0); // 2025-12-31

function seedHabit(overrides = {}) {
  return {
    id: "h1",
    title: "Leer 10 páginas",
    category: "Estudio",
    doneToday: false,
    lastDone: null,
    createdAt: new Date(2026, 8, 1).toISOString(),
    streak: 0,
    ...overrides,
  };
}

// ---------- CASOS CORRECTOS ----------

describe("casos correctos", () => {
  it("agrega un hábito válido con trim y valores iniciales", () => {
    const out = addHabit([], "  Leer 10 páginas  ", " Estudio ", {
      id: "a1",
      now: day1,
    });
    assert.equal(out.length, 1);
    assert.equal(out[0].title, "Leer 10 páginas");
    assert.equal(out[0].category, "Estudio");
    assert.equal(out[0].doneToday, false);
    assert.equal(out[0].lastDone, null);
    assert.equal(out[0].streak, 0);
  });

  it("primer check-in deja streak en 1 y marca hoy", () => {
    const out = toggle([seedHabit()], "h1", day1);
    assert.equal(out[0].doneToday, true);
    assert.equal(out[0].lastDone, "2026-09-07");
    assert.equal(out[0].streak, 1);
  });

  it("día consecutivo incrementa la racha (1 -> 2)", () => {
    const yesterday = [seedHabit({ doneToday: true, lastDone: "2026-09-07", streak: 1 })];
    // Simula que amaneció: reset del flag sin tocar racha...
    const fresh = resetIfNewDay(yesterday, day2);
    assert.equal(fresh[0].doneToday, false);
    // ...y nuevo check-in al día siguiente.
    const out = toggle(fresh, "h1", day2);
    assert.equal(out[0].streak, 2);
  });

  it("edita título y categoría válidos", () => {
    const out = editHabit([seedHabit()], "h1", "Tomar agua", "Salud");
    assert.equal(out[0].title, "Tomar agua");
    assert.equal(out[0].category, "Salud");
  });

  it("elimina por id", () => {
    const out = removeHabit([seedHabit(), seedHabit({ id: "h2" })], "h1");
    assert.equal(out.length, 1);
    assert.equal(out[0].id, "h2");
  });
});

// ---------- DATOS INVÁLIDOS ----------

describe("datos inválidos", () => {
  it("rechaza título vacío, en blanco o null (no agrega nada)", () => {
    assert.equal(addHabit([], "", "Salud").length, 0);
    assert.equal(addHabit([], "    ", "Salud").length, 0);
    assert.equal(addHabit([], null, "Salud").length, 0);
  });

  it("ignora edición con título en blanco (conserva el anterior)", () => {
    const out = editHabit([seedHabit()], "h1", "   ", "Salud");
    assert.equal(out[0].title, "Leer 10 páginas");
  });

  it("toggle con id inexistente no cambia la lista", () => {
    const before = [seedHabit()];
    const out = toggle(before, "no-existe", day1);
    assert.deepEqual(out, before);
  });

  it("categoría vacía cae a 'General' (igual que el código ANTES)", () => {
    const out = addHabit([], "Correr", "   ", { id: "b1", now: day1 });
    assert.equal(out[0].category, "General");
  });
});

// ---------- CASOS LÍMITE ----------

describe("casos límite", () => {
  it("doble toggle el mismo día no duplica la racha (1 -> 0 al desmarcar)", () => {
    const checked = toggle([seedHabit()], "h1", day1);
    assert.equal(checked[0].streak, 1);
    const unchecked = toggle(checked, "h1", day1);
    assert.equal(unchecked[0].doneToday, false);
    assert.equal(unchecked[0].streak, 0);
  });

  it("salto de 3 días reinicia la racha a 1 (no la continúa)", () => {
    const old = [seedHabit({ doneToday: false, lastDone: "2026-09-07", streak: 5 })];
    const out = toggle(old, "h1", day5);
    assert.equal(out[0].streak, 1);
  });

  it("cambio de año 31-dic -> 01-ene cuenta como día consecutivo", () => {
    assert.equal(toDateKey(newYearEve), "2025-12-31");
    assert.equal(toDateKey(newYear), "2026-01-01");
    assert.equal(calcNewStreak(4, "2025-12-31", "2026-01-01"), 5);
  });

  it("desmarcar con racha 0 no deja racha negativa", () => {
    const stuck = [seedHabit({ doneToday: true, lastDone: "2026-09-07", streak: 0 })];
    const out = toggle(stuck, "h1", day1);
    assert.equal(out[0].streak, 0);
  });

  it("resetIfNewDay no resetea si lastDone es hoy", () => {
    const today = [seedHabit({ doneToday: true, lastDone: "2026-09-07", streak: 2 })];
    const out = resetIfNewDay(today, day1);
    assert.equal(out[0].doneToday, true);
    assert.equal(out[0].streak, 2);
  });
});

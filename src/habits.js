// ============================================================
// HabiTrack — CÓDIGO DESPUÉS (refactorizado)
// Mejora aplicada (una sola): separar responsabilidades de `toggle`
// y eliminar duplicación del cálculo de fecha/racha.
// Comportamiento observable idéntico al archivo habits.before.js.
// ============================================================

export const DEFAULT_CATEGORY = "General";
export const MS_PER_DAY = 86_400_000;

// ---------- Helpers puros (extraídos, testeables) ----------

/** Normaliza texto: null -> "", si no trim. */
export function normalizeText(value) {
  return value == null ? "" : String(value).trim();
}

/** true si el título es usable (no vacío / no solo espacios). */
export function isValidTitle(title) {
  return normalizeText(title).length > 0;
}

/** "YYYY-MM-DD" en hora local. Inyectable para tests. */
export function toDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Diferencia en días calendario entre dos claves "YYYY-MM-DD". */
export function diffDays(fromKey, toKey) {
  const from = new Date(fromKey + "T00:00:00");
  const to = new Date(toKey + "T00:00:00");
  return Math.round((to - from) / MS_PER_DAY);
}

/**
 * Calcula la racha al marcar como hecho hoy.
 * Misma regla que el código ANTES:
 * - sin historial -> 1
 * - mismo día y racha 0 -> 1 (si no, se conserva)
 * - día consecutivo -> +1
 * - salto >= 2 días -> 1
 */
export function calcNewStreak(previousStreak, lastDoneKey, todayKey) {
  if (lastDoneKey == null) return 1;
  const diff = diffDays(lastDoneKey, todayKey);
  if (diff === 0) return previousStreak === 0 ? 1 : previousStreak;
  if (diff === 1) return previousStreak + 1;
  return 1;
}

/** Racha al desmarcar el mismo día: -1 con piso en 0 (igual que antes). */
export function calcUncheckStreak(previousStreak) {
  return Math.max(0, previousStreak - 1);
}

function buildHabit(title, category, deps = {}) {
  const cleanTitle = normalizeText(title);
  let cleanCategory = normalizeText(category) || DEFAULT_CATEGORY;
  const now = deps.now ?? new Date();
  const id =
    deps.id ?? Date.now().toString() + Math.floor(Math.random() * 1000).toString();
  return {
    id,
    title: cleanTitle,
    category: cleanCategory,
    doneToday: false,
    lastDone: null,
    createdAt: now.toISOString(),
    streak: 0,
  };
}

// ---------- API (misma firma que habits.before.js) ----------

export function addHabit(list, title, category, deps = {}) {
  if (!isValidTitle(title)) return list;
  return [...list, buildHabit(title, category, deps)];
}

/**
 * Marca/desmarca el hábito hoy. `now` es opcional (por defecto hoy);
 * existe solo para hacer la función testeable (mismo comportamiento).
 */
export function toggle(list, id, now = new Date()) {
  const todayKey = toDateKey(now);
  return list.map((habit) => {
    if (habit.id !== id) return habit;
    const isUndo = habit.doneToday && habit.lastDone === todayKey;
    if (isUndo) {
      return {
        ...habit,
        doneToday: false,
        streak: calcUncheckStreak(habit.streak),
      };
    }
    return {
      ...habit,
      doneToday: true,
      lastDone: todayKey,
      streak: calcNewStreak(habit.streak, habit.lastDone, todayKey),
    };
  });
}

export function editHabit(list, id, title, category) {
  return list.map((habit) => {
    if (habit.id !== id) return habit;
    const next = { ...habit };
    if (isValidTitle(title)) next.title = normalizeText(title);
    if (normalizeText(category).length > 0) {
      next.category = normalizeText(category);
    }
    return next;
  });
}

export function removeHabit(list, id) {
  return list.filter((habit) => habit.id !== id);
}

/** Si cambió el día, doneToday vuelve a false (la racha no se toca). */
export function resetIfNewDay(list, now = new Date()) {
  const todayKey = toDateKey(now);
  return list.map((habit) =>
    habit.lastDone !== todayKey ? { ...habit, doneToday: false } : habit,
  );
}

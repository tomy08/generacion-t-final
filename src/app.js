// HabiTrack UI mínima (Mobile First) — usa la lógica refactorizada.
import { addHabit, toggle, removeHabit, editHabit, resetIfNewDay } from "./habits.js";

const KEY = "habitrack:habits:v1";
const listEl = document.getElementById("habit-list");
const formEl = document.getElementById("habit-form");
const inputEl = document.getElementById("habit-input");
const errorEl = document.getElementById("form-error");
const emptyEl = document.getElementById("empty");

/** Lee hábitos de localStorage (persistencia sin backend). */
function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

/** Guarda hábitos en localStorage. */
function save(habits) {
  localStorage.setItem(KEY, JSON.stringify(habits));
}

let habits = resetIfNewDay(load());
save(habits);

function render() {
  listEl.innerHTML = "";
  emptyEl.style.display = habits.length ? "none" : "block";
  for (const h of habits) {
    const li = document.createElement("li");
    li.className = "flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm";
    li.innerHTML = `
      <button data-act="toggle" class="min-w-[48px] min-h-[48px] text-2xl rounded-xl border"
        aria-label="marcar">${h.doneToday ? "✅" : "⬜"}</button>
      <div class="flex-1 min-w-0">
        <p class="font-medium truncate">${escapeHtml(h.title)}</p>
        <p class="text-xs text-slate-500">🔥 ${h.streak} · ${escapeHtml(h.category)}</p>
      </div>
      <button data-act="edit" class="min-w-[44px] min-h-[44px] rounded-xl border" aria-label="editar">✏️</button>
      <button data-act="del" class="min-w-[44px] min-h-[44px] rounded-xl border" aria-label="eliminar">🗑️</button>`;
    li.querySelector('[data-act="toggle"]').onclick = () => {
      habits = toggle(habits, h.id);
      save(habits);
      render();
    };
    li.querySelector('[data-act="del"]').onclick = () => {
      habits = removeHabit(habits, h.id);
      save(habits);
      render();
    };
    li.querySelector('[data-act="edit"]').onclick = () => {
      const next = prompt("Editar hábito:", h.title);
      if (next == null) return;
      habits = editHabit(habits, h.id, next, h.category);
      save(habits);
      render();
    };
    listEl.appendChild(li);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

formEl.onsubmit = (e) => {
  e.preventDefault();
  const before = habits.length;
  habits = addHabit(habits, inputEl.value, "General");
  if (habits.length === before) {
    errorEl.classList.remove("hidden"); // caso error: hábito en blanco
    return;
  }
  errorEl.classList.add("hidden");
  inputEl.value = "";
  save(habits);
  render();
};

render();

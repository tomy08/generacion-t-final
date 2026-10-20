// ============================================================
// HabiTrack — CÓDIGO ANTES (proyecto de vacaciones, funcional)
// Funcionalidad: crear + check-in diario con racha + editar + eliminar.
// Se conserva tal cual para el entregable. Tiene code smells a propósito.
// ============================================================

export function addHabit(list, t, c) {
  if (t == null || t == "" || t.trim() == "") return list;
  let x = {
    id: Date.now().toString() + Math.floor(Math.random() * 1000).toString(),
    title: t.trim(),
    category: c ? c.trim() : "General",
    doneToday: false,
    lastDone: null,
    createdAt: new Date().toISOString(),
    streak: 0,
  };
  if (x.category == "") x.category = "General";
  list.push(x);
  return list;
}

export function toggle(list, id) {
  let now = new Date();
  let tmp =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");
  for (let i = 0; i < list.length; i++) {
    let h = list[i];
    if (h.id == id) {
      if (h.doneToday && h.lastDone == tmp) {
        h.doneToday = false;
        // al desmarcar el mismo día la racha baja en 1 (no puede ser negativa)
        h.streak = h.streak - 1;
        if (h.streak < 0) h.streak = 0;
      } else {
        if (h.lastDone == null) {
          h.streak = 1;
        } else {
          let d = new Date(h.lastDone + "T00:00:00");
          let d2 = new Date(tmp + "T00:00:00");
          let diff = Math.round((d2 - d) / 86400000);
          if (diff == 0) {
            if (h.streak == 0) h.streak = 1;
          } else if (diff == 1) {
            h.streak = h.streak + 1;
          } else {
            h.streak = 1;
          }
        }
        h.doneToday = true;
        h.lastDone = tmp;
      }
    }
  }
  return list;
}

export function editHabit(list, id, t, c) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id == id) {
      if (t != null && t != "" && t.trim() != "") {
        list[i].title = t.trim();
      }
      if (c != null && c.trim() != "") {
        list[i].category = c.trim();
      }
    }
  }
  return list;
}

export function removeHabit(list, id) {
  let out = [];
  for (let i = 0; i < list.length; i++) {
    if (list[i].id != id) out.push(list[i]);
  }
  return out;
}

// NOTA: reset diario (cuando cambia el día, doneToday vuelve a false)
// también estaba mezclado en app.js original, duplicando el cálculo de fecha:
export function resetIfNewDay(list) {
  let now = new Date();
  let tmp =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");
  for (let h of list) {
    if (h.lastDone != tmp) h.doneToday = false;
  }
  return list;
}

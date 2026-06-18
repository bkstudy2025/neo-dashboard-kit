// Neo Dashboard Kit — Reorder-Liste für Editoren (▲ ▼ 🗑)
// Rendert eine sortierbare Liste in `container`. labelFn(item,i) liefert den
// Text; onChange(newItems) wird mit der neuen Reihenfolge / nach Löschen
// aufgerufen. Erneut aufrufbar (re-rendert). Up/Down statt Drag = robust,
// auch auf Touch / im HA-Dialog.

export function neoRenderReorder(container, items, labelFn, onChange) {
  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const move = (from, to) => {
    if (to < 0 || to >= items.length) return;
    const a = items.slice(); const [m] = a.splice(from, 1); a.splice(to, 0, m); onChange(a);
  };
  const del = (i) => { const a = items.slice(); a.splice(i, 1); onChange(a); };
  if (!items.length) { container.innerHTML = ""; return; }
  container.innerHTML = `
    <style>
      .nre { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
      .nre-row { display:flex; align-items:center; gap:8px; padding:7px 10px; border-radius:10px;
        background:var(--neo-fill1,rgba(255,255,255,.04)); border:1px solid var(--neo-line2,rgba(255,255,255,.08)); }
      .nre-h { color:var(--secondary-text-color); font-size:14px; cursor:default; }
      .nre-l { flex:1; min-width:0; font-size:13px; color:var(--primary-text-color);
        overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .nre-b { width:28px; height:28px; flex-shrink:0; border-radius:8px; cursor:pointer;
        display:flex; align-items:center; justify-content:center; font-size:13px;
        background:var(--neo-fill2,rgba(255,255,255,.06)); color:var(--primary-text-color);
        border:1px solid var(--neo-line2,rgba(255,255,255,.1)); }
      .nre-b[disabled] { opacity:.3; cursor:default; }
      .nre-b.del { color:var(--error-color,#F87171); }
    </style>
    <div class="nre">
      ${items.map((it, i) => `
        <div class="nre-row">
          <span class="nre-h">⠿</span>
          <span class="nre-l">${i + 1}. ${esc(labelFn(it, i))}</span>
          <button class="nre-b" data-up="${i}" ${i === 0 ? "disabled" : ""} title="Nach oben">▲</button>
          <button class="nre-b" data-dn="${i}" ${i === items.length - 1 ? "disabled" : ""} title="Nach unten">▼</button>
          <button class="nre-b del" data-del="${i}" title="Entfernen">🗑</button>
        </div>`).join("")}
    </div>`;
  container.querySelectorAll("[data-up]").forEach((b) => b.addEventListener("click", () => move(+b.dataset.up, +b.dataset.up - 1)));
  container.querySelectorAll("[data-dn]").forEach((b) => b.addEventListener("click", () => move(+b.dataset.dn, +b.dataset.dn + 1)));
  container.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => del(+b.dataset.del)));
}

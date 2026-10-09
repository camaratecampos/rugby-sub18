/* Página de resultados por jornada */
(function () {
  "use strict";
  const { esc, fmtDate, badge, sideResult, winner, TEAMS, PHASES, boot } = window.Rugby;

  let rounds = [], sel = null;

  function buildRounds(matches) {
    const map = new Map();
    matches.forEach((m) => {
      if (!map.has(m.round.key)) map.set(m.round.key, { ...m.round, fase: m.fase, matches: [] });
      map.get(m.round.key).matches.push(m);
    });
    return [...map.values()].map((r) => {
      const played = r.matches.filter((m) => m.played).length;
      const dates = r.matches.map((m) => m.data).filter(Boolean).sort((a, b) => a - b);
      return { ...r, played, total: r.matches.length, from: dates[0], to: dates[dates.length - 1],
        status: played === 0 ? "upcoming" : played === r.matches.length ? "done" : "partial" };
    });
  }

  function defaultRound() {
    const fromHash = rounds.find((r) => "#" + r.key === location.hash);
    if (fromHash) return fromHash;
    const withResults = rounds.filter((r) => r.played > 0);
    return withResults[withResults.length - 1] || rounds[0] || null;
  }

  function teamSide(m, side) {
    const t = side === "c" ? m.casa : m.fora;
    const pts = side === "c" ? m.pc : m.pf;
    const tries = side === "c" ? m.ec : m.ef;
    let cls = "", tags = "";
    if (m.played) {
      const r = sideResult(m, side);
      const w = winner(m);
      cls = w ? (w === t ? "is-win" : "is-loss") : "is-draw";
      if (m.fase !== 3) {
        if (r.bo) tags += `<span class="tag" title="Bónus ofensivo">BO</span>`;
        if (r.bd) tags += `<span class="tag" title="Bónus defensivo">BD</span>`;
      }
    }
    return `<div class="side ${cls}">
      ${badge(t)}
      <span class="side-name"><span class="long">${esc(t.nome.length > 20 ? t.curto : t.nome)}</span><span class="short">${esc(t.curto)}</span></span>
      <span class="side-tags">${tags}</span>
      ${m.played && tries != null ? `<span class="side-tries" title="Ensaios">${tries} ens.</span>` : ""}
      <span class="side-score">${m.played ? pts : ""}</span>
    </div>`;
  }

  function matchCard(m) {
    const meta = [fmtDate(m.data, true), m.hora].filter(Boolean).join(" · ");
    return `<article class="match ${m.played ? "is-played" : "is-upcoming"}">
      <header class="match-meta">
        <span>${esc(meta) || "Data por definir"}</span>
        <span class="match-local">${esc(m.local)}</span>
      </header>
      ${teamSide(m, "c")}
      ${teamSide(m, "f")}
      ${!m.played ? `<div class="match-pending">${m.hora ? "Pontapé de saída " + esc(m.hora) : "Por jogar"}</div>` : ""}
      ${m.obs ? `<p class="match-obs">${esc(m.obs)}</p>` : ""}
    </article>`;
  }

  function renderTabs() {
    const el = document.getElementById("phase-tabs");
    el.innerHTML = PHASES.map((p) => {
      const first = rounds.find((r) => r.fase === p.n);
      const on = sel && sel.fase === p.n;
      return `<button class="ptab" role="tab" aria-selected="${on}" ${first ? `data-key="${first.key}"` : "disabled"}>
        <span class="ptab-n">0${p.n}</span>${p.nome}</button>`;
    }).join("");
  }

  function renderStrip() {
    const el = document.getElementById("rounds");
    const list = rounds.filter((r) => r.fase === sel.fase);
    el.innerHTML = list.map((r) =>
      `<button class="rchip rchip--${r.status}" data-key="${r.key}" ${r === sel ? 'aria-current="true"' : ""}
        title="${esc(r.label)}"><span class="rchip-n">${esc(r.short)}</span><span class="rchip-d">${fmtDate(r.from)}</span></button>`).join("");
    const cur = el.querySelector('[aria-current="true"]');
    if (cur) el.scrollTo({ left: cur.offsetLeft - el.clientWidth / 2 + cur.clientWidth / 2, behavior: "smooth" });
    const i = rounds.indexOf(sel);
    document.getElementById("prev").disabled = i <= 0;
    document.getElementById("next").disabled = i >= rounds.length - 1;
  }

  function renderRound() {
    const head = document.getElementById("round-head");
    const body = document.getElementById("matches");
    const r = sel;
    const phase = PHASES.find((p) => p.n === r.fase);
    const pl = r.matches.filter((m) => m.played);
    const pts = pl.reduce((s, m) => s + m.pc + m.pf, 0);
    const hasTries = pl.some((m) => m.ec != null);
    const tries = pl.reduce((s, m) => s + (m.ec || 0) + (m.ef || 0), 0);
    const dates = r.from ? (r.to && r.to - r.from > 0 ? `${fmtDate(r.from)} – ${fmtDate(r.to)}` : fmtDate(r.from, true)) : "";

    head.innerHTML = `
      <div class="round-title">
        <p class="eyebrow">${phase.nome}${dates ? " · " + dates : ""}</p>
        <h1>${esc(r.label)}</h1>
      </div>
      <dl class="round-stats">
        <div><dt>Jogos</dt><dd>${r.played}<small>/${r.total}</small></dd></div>
        <div><dt>Pontos</dt><dd>${pl.length ? pts : "—"}</dd></div>
        ${hasTries ? `<div><dt>Ensaios</dt><dd>${tries}</dd></div>` : ""}
      </dl>`;

    let html = "";
    const groups = [...new Set(r.matches.map((m) => m.grupo))];
    if (r.fase === 2 && groups.some(Boolean)) {
      groups.sort().forEach((g) => {
        html += `<h2 class="group-label">Grupo ${esc(g || "?")}</h2><div class="match-grid">${
          r.matches.filter((m) => m.grupo === g).map(matchCard).join("")}</div>`;
      });
    } else {
      html = `<div class="match-grid">${r.matches.map(matchCard).join("")}</div>`;
    }
    if (r.fase === 1) {
      const playing = new Set(r.matches.flatMap((m) => [m.casa.id, m.fora.id]));
      const off = TEAMS.filter((t) => !playing.has(t.id));
      if (off.length) html += `<aside class="bye"><span class="bye-label">Folga</span>${
        off.map((t) => `<span class="bye-team">${badge(t)}${esc(t.nome)}</span>`).join("")}</aside>`;
    }
    body.innerHTML = html;
  }

  function select(key, push) {
    const r = rounds.find((x) => x.key === key);
    if (!r) return;
    sel = r;
    if (push) history.replaceState(null, "", "#" + r.key);
    renderTabs(); renderStrip(); renderRound();
  }

  boot((matches) => {
    rounds = buildRounds(matches);
    if (!rounds.length) {
      document.querySelector(".round-nav").hidden = true;
      document.getElementById("round-head").hidden = true;
      document.getElementById("matches").innerHTML =
        `<p class="empty">Ainda não há jogos lançados. O calendário aparece aqui assim que for preenchido na folha.</p>`;
      return;
    }
    sel = defaultRound();
    renderTabs(); renderStrip(); renderRound();

    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-key]");
      if (b) select(b.dataset.key, true);
    });
    document.getElementById("prev").onclick = () => select(rounds[rounds.indexOf(sel) - 1]?.key, true);
    document.getElementById("next").onclick = () => select(rounds[rounds.indexOf(sel) + 1]?.key, true);
    window.addEventListener("hashchange", () => select(location.hash.slice(1)));
  });
})();

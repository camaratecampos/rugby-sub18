/* Página de classificação */
(function () {
  "use strict";
  const { C, TEAMS, esc, badge, standings, currentPhase, PHASES, boot } = window.Rugby;

  let data = null, phase = 1;

  /* ---------- tabela ---------- */
  function table(rows, { cut, cutLabel, projection } = {}) {
    const body = rows.map((r) => {
      const form = r.form.slice(-5).map((f) =>
        `<i class="f f--${f}" title="${f === "V" ? "Vitória" : f === "E" ? "Empate" : "Derrota"}">${f}</i>`).join("");
      const zone = cut && r.pos <= cut ? "in-zone" : "";
      const line = cut && r.pos === cut ? "cut" : "";
      return `<tr class="${zone} ${line}">
        <td class="c-pos">${r.pos}</td>
        <td class="c-team"><span class="team-cell">${badge(r.team)}<span class="long">${esc(r.team.nome)}</span><span class="short">${esc(r.team.curto)}</span></span></td>
        <td>${r.j}</td><td>${r.v}</td><td>${r.e}</td><td>${r.d}</td>
        <td class="hide-s">${r.pm}</td><td class="hide-s">${r.ps}</td>
        <td class="c-dif">${r.dif > 0 ? "+" : ""}${r.dif}</td>
        <td class="hide-s">${r.bo}</td><td class="hide-s">${r.bd}</td>
        <td class="c-pts">${r.pts}</td>
        <td class="c-form hide-m">${form}</td>
      </tr>`;
    }).join("");
    return `<div class="table-wrap ${projection ? "is-projection" : ""}">
      <table class="standings">
        <thead><tr>
          <th class="c-pos" scope="col">#</th><th class="c-team" scope="col">Equipa</th>
          <th scope="col" title="Jogos">J</th><th scope="col" title="Vitórias">V</th>
          <th scope="col" title="Empates">E</th><th scope="col" title="Derrotas">D</th>
          <th class="hide-s" scope="col" title="Pontos marcados">PM</th><th class="hide-s" scope="col" title="Pontos sofridos">PS</th>
          <th scope="col" title="Diferença">Dif</th>
          <th class="hide-s" scope="col" title="Bónus ofensivo">BO</th><th class="hide-s" scope="col" title="Bónus defensivo">BD</th>
          <th class="c-pts" scope="col" title="Pontos">Pts</th><th class="c-form hide-m" scope="col">Forma</th>
        </tr></thead>
        <tbody>${body}</tbody>
      </table>
      ${cut ? `<p class="zone-note"><span class="zone-swatch"></span>${esc(cutLabel)}</p>` : ""}
    </div>`;
  }

  /* ---------- dados por fase ---------- */
  function compute(matches) {
    const f1 = standings(matches.filter((m) => m.fase === 1), TEAMS);

    const f2m = matches.filter((m) => m.fase === 2);
    const base = C.fase2ComecaDoZero ? null : new Map(f1.map((r) => [r.team.id, r.pts]));
    let teams = [...new Map(f2m.flatMap((m) => [m.casa, m.fora]).map((t) => [t.id, t])).values()];
    const projected = !teams.length;
    if (projected) teams = f1.slice(0, C.fase1Apurados).map((r) => r.team);
    const f2 = standings(f2m, teams, base);

    const total = teams.length * (teams.length - 1);
    const done = !projected && f2m.filter((m) => m.played).length >= total;
    const started = f2m.some((m) => m.played);
    return { f1, f2, projected, started, champion: done ? f2[0].team : null };
  }

  /* ---------- render ---------- */
  function render() {
    document.querySelectorAll(".ptab").forEach((b) => b.setAttribute("aria-selected", String(+b.dataset.phase === phase)));
    const el = document.getElementById("panel");
    const d = data;
    if (phase === 1) {
      el.innerHTML = `<div class="panel-head"><h1>Fase regular</h1>
        <p>Todos contra todos, uma volta. Os ${C.fase1Apurados} primeiros seguem para a Final 6.</p></div>
        ${table(d.f1, { cut: C.fase1Apurados, cutLabel: `Apuramento para a Final 6 (top ${C.fase1Apurados})` })}`;
    } else {
      const leader = d.started ? d.f2[0].team : null;
      el.innerHTML = `<div class="panel-head"><h1>Final 6</h1>
        <p>Os ${C.fase1Apurados} primeiros da fase regular jogam entre si a duas voltas, em casa e fora. O primeiro é Campeão Nacional.</p></div>
        ${d.projected ? `<div class="notice notice--soft"><strong>Projeção.</strong> As equipas seguem a classificação atual da fase regular e só ficam definidas quando os jogos da Final 6 forem lançados na folha.</div>` : ""}
        <div class="champ ${d.champion ? "is-set" : leader ? "is-lead" : ""}">
          <span class="champ-label">${d.champion ? "Campeão Nacional Sub-18" : leader ? "Líder da Final 6" : "Campeão Nacional Sub-18"}</span>
          <span class="champ-team">${d.champion ? badge(d.champion) + esc(d.champion.nome) : leader ? badge(leader) + esc(leader.nome) : "Por decidir"}</span>
        </div>
        ${table(d.f2, { cut: 1, cutLabel: d.champion ? "Campeão Nacional" : "Lugar de campeão", projection: d.projected })}`;
    }
  }

  boot((matches) => {
    data = compute(matches);
    const fromHash = /^#fase([12])$/.exec(location.hash);
    phase = fromHash ? +fromHash[1] : currentPhase(matches);
    document.getElementById("phase-tabs").innerHTML = PHASES.map((p) =>
      `<button class="ptab" role="tab" data-phase="${p.n}"><span class="ptab-n">0${p.n}</span>${p.nome}</button>`).join("");
    document.getElementById("phase-tabs").addEventListener("click", (e) => {
      const b = e.target.closest(".ptab");
      if (!b) return;
      phase = +b.dataset.phase;
      history.replaceState(null, "", "#fase" + phase);
      render();
    });
    render();
  });
})();

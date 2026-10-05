/* Página de classificação */
(function () {
  "use strict";
  const { C, TEAMS, esc, badge, standings, winner, currentPhase, PHASES, boot } = window.Rugby;

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
    let groups = {}, projected = false;
    const letters = [...new Set(f2m.map((m) => m.grupo).filter(Boolean))].sort();
    let base = null;
    if (!C.fase2ComecaDoZero) base = new Map(f1.map((r) => [r.team.id, r.pts]));
    if (letters.length) {
      letters.forEach((g) => {
        const gm = f2m.filter((m) => m.grupo === g);
        const teams = [...new Map(gm.flatMap((m) => [m.casa, m.fora]).map((t) => [t.id, t])).values()];
        groups[g] = standings(gm, teams, base);
      });
    } else {
      projected = true;
      for (const [g, positions] of Object.entries(C.gruposProjecao)) {
        const teams = positions.map((p) => f1[p - 1]?.team).filter(Boolean);
        groups[g] = standings([], teams, base);
      }
    }

    const f3m = matches.filter((m) => m.fase === 3);
    const semis = f3m.filter((m) => m.round.key === "3-mf");
    const final = f3m.find((m) => m.round.key === "3-f") || null;
    return { f1, groups, projected, semis, final, f2played: f2m.some((m) => m.played) };
  }

  /* ---------- play-off ---------- */
  function bracketTeam(t, placeholder, score, win, decided) {
    return `<div class="bt ${win ? "is-win" : decided ? "is-loss" : ""} ${t ? "" : "is-tbd"}">
      ${badge(t)}<span class="bt-name">${t ? esc(t.nome) : esc(placeholder)}</span>
      <span class="bt-score">${score ?? ""}</span></div>`;
  }

  function bracketMatch(label, m, phA, phB, tA, tB) {
    const a = m ? m.casa : tA, b = m ? m.fora : tB;
    const w = winner(m);
    const meta = m && m.data ? `${window.Rugby.fmtDate(m.data, true)}${m.hora ? " · " + esc(m.hora) : ""}` : "Por definir";
    return `<div class="bm">
      <p class="bm-label"><span>${label}</span><span>${meta}</span></p>
      ${bracketTeam(a, phA, m?.played ? m.pc : null, w && w === a, !!w)}
      ${bracketTeam(b, phB, m?.played ? m.pf : null, w && w === b, !!w)}
    </div>`;
  }

  function playoff(d) {
    const gA = d.groups.A || [], gB = d.groups.B || [];
    const known = d.f2played && !d.projected;
    const pick = (g, i) => (known ? g[i]?.team : null);
    const s1 = d.semis[0], s2 = d.semis[1];
    const w1 = winner(s1), w2 = winner(s2);
    const champ = winner(d.final);

    return `<div class="bracket">
      <div class="br-col">
        ${bracketMatch("Meia-final 1", s1, "1º Grupo A", "2º Grupo B", pick(gA, 0), pick(gB, 1))}
        ${bracketMatch("Meia-final 2", s2, "1º Grupo B", "2º Grupo A", pick(gB, 0), pick(gA, 1))}
      </div>
      <div class="br-col br-col--final">
        ${bracketMatch("Final", d.final, "Vencedor MF1", "Vencedor MF2", w1, w2)}
      </div>
      <div class="br-col">
        <div class="champ ${champ ? "is-set" : ""}">
          <span class="champ-label">Campeão Nacional Sub-18</span>
          <span class="champ-team">${champ ? badge(champ) + esc(champ.nome) : "Por decidir"}</span>
        </div>
      </div>
    </div>
    ${!d.semis.length && known ? `<p class="hint">Cruzamentos provisórios com base na classificação atual da 2ª fase.</p>` : ""}`;
  }

  /* ---------- render ---------- */
  function render() {
    document.querySelectorAll(".ptab").forEach((b) => b.setAttribute("aria-selected", String(+b.dataset.phase === phase)));
    const el = document.getElementById("panel");
    const d = data;
    if (phase === 1) {
      el.innerHTML = `<div class="panel-head"><h1>Fase regular</h1>
        <p>Todos contra todos, uma volta. Os ${C.fase1Apurados} primeiros seguem para a fase de grupos.</p></div>
        ${table(d.f1, { cut: C.fase1Apurados, cutLabel: `Apuramento para a 2ª fase (top ${C.fase1Apurados})` })}`;
    } else if (phase === 2) {
      el.innerHTML = `<div class="panel-head"><h1>Fase de grupos</h1>
        <p>Dois grupos de quatro, duas voltas. Os ${C.fase2Apurados} primeiros de cada grupo seguem para o play-off.</p></div>
        ${d.projected ? `<div class="notice notice--soft"><strong>Projeção.</strong> A composição dos grupos segue a classificação atual da 1ª fase e só fica definida quando os jogos da 2ª fase forem lançados na folha.</div>` : ""}
        <div class="groups">${Object.entries(d.groups).map(([g, rows]) =>
          `<section><h2 class="group-label">Grupo ${esc(g)}</h2>${table(rows, { cut: C.fase2Apurados, cutLabel: "Apuramento para o play-off", projection: d.projected })}</section>`).join("")}</div>`;
    } else {
      el.innerHTML = `<div class="panel-head"><h1>Play-off</h1>
        <p>Meias-finais cruzadas entre grupos. Os vencedores disputam o título.</p></div>${playoff(d)}`;
    }
  }

  boot((matches) => {
    data = compute(matches);
    const fromHash = /^#fase([123])$/.exec(location.hash);
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

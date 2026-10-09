/* ==========================================================================
   Núcleo: leitura da folha, cálculo das classificações e elementos comuns.
   ========================================================================== */
(function () {
  "use strict";
  /* Escalão da página (<body data-escalao="sub16" data-root="../">) */
  const ESC_ID = document.body.dataset.escalao || "sub18";
  const ROOT = document.body.dataset.root || "";
  const { escaloes, ...base } = window.CONFIG;
  const ESC = escaloes[ESC_ID];
  const C = { ...base, ...ESC, escalao: ESC_ID };
  const asset = (p) => (/^(https?:)?\/\//.test(p) || p.startsWith("/") ? p : ROOT + p);

  /* ---------- utilitários ---------- */
  const slug = (s) =>
    String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase().replace(/[^a-z0-9]/g, "");
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (v) => {
    const s = String(v ?? "").trim();
    if (s === "") return null;
    const n = parseInt(s, 10);
    return Number.isNaN(n) ? null : n;
  };

  const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  function parseDate(v) {
    const s = String(v ?? "").trim();
    let m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
    if (m) return new Date(+(m[3].length === 2 ? "20" + m[3] : m[3]), +m[2] - 1, +m[1], 12);
    m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3], 12);
    return null;
  }
  const fmtDate = (d, long) =>
    d ? (long ? `${DIAS[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]}` : `${d.getDate()} ${MESES[d.getMonth()]}`) : "";

  /* ---------- equipas ---------- */
  const ALL = base.equipas.map((t) => ({ ...t }));
  const TEAMS = ESC.equipas.map((id) => ALL.find((t) => t.id === id)).filter(Boolean);
  const bySlug = new Map();
  ALL.forEach((t) => [t.id, t.nome, t.curto, t.sigla, ...(t.aliases || [])]
    .forEach((n) => bySlug.set(slug(n), t)));

  function findTeam(name) {
    const s = slug(name);
    if (!s) return null;
    if (bySlug.has(s)) return bySlug.get(s);
    const nome = String(name).trim();
    const t = { id: s, nome, curto: nome, sigla: nome.slice(0, 3).toUpperCase(), cores: ["#8A8578"], desconhecida: true };
    bySlug.set(s, t);
    console.warn(`Equipa não reconhecida na folha: "${nome}". Adicione-a (ou um alias) em assets/config.js.`);
    return t;
  }

  function badge(t, cls = "") {
    if (!t) return `<span class="badge badge--empty ${cls}" aria-hidden="true"></span>`;
    if (t.emblema) return `<span class="crest ${cls}" style="background:${t.emblemaFundo || "#fff"}" aria-hidden="true"><img src="${esc(asset(t.emblema))}" alt="" loading="lazy"></span>`;
    const c = t.cores;
    let bg = c[0];
    if (c.length > 1) {
      const n = 6, stops = [];
      for (let i = 0; i < n; i++) stops.push(`${c[i % c.length]} ${(i * 100) / n}% ${((i + 1) * 100) / n}%`);
      bg = `linear-gradient(180deg, ${stops.join(", ")})`;
    }
    return `<span class="badge ${cls}" style="background:${bg}" aria-hidden="true"></span>`;
  }

  /* ---------- CSV ---------- */
  function parseCSV(text) {
    text = text.replace(/^﻿/, "");
    const first = text.split(/\r?\n/, 1)[0];
    const d = first.split(";").length > first.split(",").length ? ";" : ",";
    const rows = [];
    let row = [], f = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; }
        else f += ch;
      } else if (ch === '"') q = true;
      else if (ch === d) { row.push(f); f = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(f); rows.push(row); row = []; f = "";
      } else f += ch;
    }
    if (f !== "" || row.length) { row.push(f); rows.push(row); }
    return rows.filter((r) => r.some((c) => c.trim() !== ""));
  }

  const FIELDS = {
    fase: ["fase"], jornada: ["jornada", "ronda"], grupo: ["grupo"],
    data: ["data", "dia"], hora: ["hora"], local: ["local", "campo", "estadio"],
    casa: ["casa", "equipacasa", "visitado"], fora: ["fora", "equipafora", "visitante"],
    pc: ["ptscasa", "pontoscasa", "resultadocasa"], pf: ["ptsfora", "pontosfora", "resultadofora"],
    ec: ["enscasa", "ensaioscasa"], ef: ["ensfora", "ensaiosfora"],
    vencedor: ["vencedor"], obs: ["obs", "observacoes", "notas"],
  };

  function toMatches(rows) {
    const head = rows[0].map(slug);
    const col = {};
    for (const [k, names] of Object.entries(FIELDS)) col[k] = head.findIndex((h) => names.includes(h));
    const get = (r, k) => (col[k] >= 0 ? (r[col[k]] ?? "").trim() : "");
    return rows.slice(1).map((r, idx) => {
      const casa = findTeam(get(r, "casa")), fora = findTeam(get(r, "fora"));
      if (!casa || !fora) return null;
      const m = {
        idx, fase: num(get(r, "fase")) || 1, jornada: get(r, "jornada"),
        grupo: get(r, "grupo").toUpperCase(), data: parseDate(get(r, "data")),
        hora: get(r, "hora").slice(0, 5), local: get(r, "local"), casa, fora,
        pc: num(get(r, "pc")), pf: num(get(r, "pf")), ec: num(get(r, "ec")), ef: num(get(r, "ef")),
        vencedor: findTeam(get(r, "vencedor")), obs: get(r, "obs"),
      };
      m.jnum = num(m.jornada);
      m.played = m.pc != null && m.pf != null;
      m.round = roundInfo(m);
      return m;
    }).filter(Boolean).sort((a, b) =>
      a.fase - b.fase || a.round.order - b.round.order ||
      (a.data?.getTime() || 0) - (b.data?.getTime() || 0) || a.idx - b.idx);
  }

  function roundInfo(m) {
    if (m.fase === 3) {
      const s = slug(m.jornada);
      if (s.includes("meia") || s.includes("semi")) return { key: "3-mf", label: "Meias-finais", short: "MF", order: 1 };
      if (s.includes("final")) return { key: "3-f", label: "Final", short: "F", order: 2 };
      return { key: "3-" + s, label: m.jornada || "Play-off", short: (m.jornada || "PO").slice(0, 3), order: 3 };
    }
    const n = m.jnum;
    return { key: `${m.fase}-${n ?? slug(m.jornada)}`, label: `Jornada ${n ?? m.jornada}`, short: String(n ?? m.jornada).padStart(2, "0"), order: n ?? 99 };
  }

  let cache;
  function loadMatches() {
    if (cache) return cache;
    const url = C.csvUrl || asset(C.csvLocal);
    cache = fetch(url, { cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
      .then((t) => {
        if (/^\s*</.test(t)) throw new Error("a ligação não devolveu um CSV (confirme que a folha está publicada como CSV)");
        const rows = parseCSV(t);
        return rows.length ? toMatches(rows) : [];
      });
    return cache;
  }

  /* ---------- pontuação ---------- */
  function sideResult(m, side) {
    const P = C.pontos, B = C.bonus;
    const [my, op, myT, opT] = side === "c" ? [m.pc, m.pf, m.ec, m.ef] : [m.pf, m.pc, m.ef, m.ec];
    const res = my > op ? "V" : my < op ? "D" : "E";
    let bo = 0, bd = 0;
    if (myT != null) {
      const okMin = B.ofensivoEnsaios == null || myT >= B.ofensivoEnsaios;
      const okDif = B.ofensivoDiferenca == null || (opT != null && myT - opT >= B.ofensivoDiferenca);
      if (okMin && okDif) bo = 1;
    }
    if (res === "D" && op - my <= B.defensivoMargem) bd = 1;
    const base = res === "V" ? P.vitoria : res === "E" ? P.empate : P.derrota;
    return { res, bo, bd, pts: base + bo + bd };
  }

  function winner(m) {
    if (!m || !m.played) return null;
    if (m.pc !== m.pf) return m.pc > m.pf ? m.casa : m.fora;
    if (m.vencedor) return m.vencedor;
    if (m.ec != null && m.ef != null && m.ec !== m.ef) return m.ec > m.ef ? m.casa : m.fora;
    return null;
  }

  function standings(matches, teams, basePts) {
    const rows = new Map();
    const ensure = (t) => {
      if (!rows.has(t.id)) rows.set(t.id, { team: t, j: 0, v: 0, e: 0, d: 0, pm: 0, ps: 0, em: 0, es: 0, bo: 0, bd: 0, pts: basePts?.get(t.id) || 0, form: [] });
      return rows.get(t.id);
    };
    teams.forEach(ensure);
    matches.filter((m) => m.played).forEach((m) => {
      [["c", m.casa, m.pc, m.pf, m.ec, m.ef], ["f", m.fora, m.pf, m.pc, m.ef, m.ec]].forEach(([side, t, f, a, tf, ta]) => {
        const r = ensure(t), p = sideResult(m, side);
        r.j++; r[p.res === "V" ? "v" : p.res === "E" ? "e" : "d"]++;
        r.pm += f; r.ps += a; r.em += tf || 0; r.es += ta || 0;
        r.bo += p.bo; r.bd += p.bd; r.pts += p.pts; r.form.push(p.res);
      });
    });
    return [...rows.values()]
      .map((r) => ({ ...r, dif: r.pm - r.ps }))
      .sort((a, b) => b.pts - a.pts || b.dif - a.dif || b.pm - a.pm || b.em - a.em || a.team.nome.localeCompare(b.team.nome, "pt"))
      .map((r, i) => ({ ...r, pos: i + 1 }));
  }

  /* ---------- fases ---------- */
  const PHASES = [
    { n: 1, nome: "Fase regular", desc: `${TEAMS.length} equipas · uma volta` },
    { n: 2, nome: "Final 6", desc: `Top ${C.fase1Apurados} · duas voltas` },
  ];
  const currentPhase = (matches) =>
    Math.max(1, ...matches.filter((m) => m.played).map((m) => m.fase));

  function renderPhaseTrack(matches) {
    const el = document.getElementById("phase-track");
    if (!el) return;
    const cur = currentPhase(matches);
    el.innerHTML = PHASES.map((p) => {
      const st = p.n < cur ? "done" : p.n === cur ? "now" : "next";
      const tag = st === "done" ? "Concluída" : st === "now" ? "Em curso" : "A seguir";
      return `<li class="phase phase--${st}">
        <span class="phase-n">0${p.n}</span>
        <span class="phase-body"><span class="phase-name">${p.nome}</span><span class="phase-desc">${p.desc}</span></span>
        <span class="phase-tag">${tag}</span></li>`;
    }).join("");
  }

  function renderStatus(error) {
    const el = document.getElementById("status");
    if (!el) return;
    if (error) {
      el.innerHTML = `<div class="notice notice--error"><strong>Não foi possível carregar os jogos.</strong> ${esc(error.message || error)}.
        ${location.protocol === "file:" ? " Abra o site através de um servidor (ver README)." : ""}</div>`;
    } else if (!C.csvUrl) {
      el.innerHTML = `<div class="notice"><strong>Dados de demonstração.</strong> Os resultados mostrados são fictícios. Ligue a sua folha do Google Sheets em <code>assets/config.js</code>.</div>`;
    }
  }

  function boot(render) {
    document.querySelectorAll("[data-epoca]").forEach((e) => (e.textContent = C.epoca));
    loadMatches()
      .then((matches) => { renderStatus(); renderPhaseTrack(matches); render(matches); })
      .catch((err) => { console.error(err); renderStatus(err); renderPhaseTrack([]); render([]); });
  }

  window.Rugby = { C, TEAMS, asset, slug, esc, fmtDate, badge, standings, sideResult, winner, currentPhase, PHASES, boot };
})();

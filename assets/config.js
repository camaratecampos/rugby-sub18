/* ==========================================================================
   CONFIGURAÇÃO DO SITE
   É o único ficheiro que precisa de editar no dia a dia.
   ========================================================================== */
window.CONFIG = {
  epoca: "2026/27",

  /* URL do Google Sheets publicado como CSV
     (Ficheiro › Partilhar › Publicar na Web › folha "jogos" › CSV).
     Enquanto estiver vazio, o site mostra os dados de demonstração. */
  csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vS4ArFu4wVGnyfXBiLJSWfUmVL65yMzbDXM_5TKTn9VhGldZuxwXyzqRITrhT5rxq82qaJGjpeMBdNd/pub?output=csv",

  /* Ficheiro usado enquanto csvUrl estiver vazio. */
  csvLocal: "data/exemplo.csv",

  /* Pontuação */
  pontos: { vitoria: 4, empate: 2, derrota: 0 },
  bonus: {
    /* Bónus ofensivo: é preciso cumprir AS DUAS condições.
       Para desligar uma delas, ponha-a a null. */
    ofensivoEnsaios: 4,    // marcar pelo menos 4 ensaios
    ofensivoDiferenca: 3,  // e pelo menos 3 ensaios a mais do que o adversário
    /* Bónus defensivo: perder por esta margem ou menos. */
    defensivoMargem: 7,
  },

  /* Formato do campeonato */
  fase1Apurados: 8,       // os 8 primeiros da 1ª fase seguem para a 2ª
  fase2Apurados: 2,       // os 2 primeiros de cada grupo vão ao play-off
  fase2ComecaDoZero: true, // false = a 2ª fase herda os pontos da 1ª

  /* Só serve para mostrar uma PROJEÇÃO dos grupos antes de existirem
     jogos da 2ª fase na folha (posições na tabela da 1ª fase). */
  gruposProjecao: { A: [1, 4, 5, 8], B: [2, 3, 6, 7] },

  /* Equipas: "cores" desenha as riscas (hoops) do emblema.
     "aliases" são outros nomes aceites na folha. */
  equipas: [
    { id: "direito",    nome: "Grupo Desportivo Direito", curto: "Direito",    sigla: "GDD",  cores: ["#C8102E", "#141414"], aliases: ["GD Direito", "GDD"] },
    { id: "cdul",       nome: "CDUL",                     curto: "CDUL",       sigla: "CDUL", cores: ["#0B2A5B"],             aliases: ["C.D.U.L."] },
    { id: "agronomia",  nome: "Agronomia",                curto: "Agronomia",  sigla: "AGR",  cores: ["#1E8A3C", "#FFFFFF"], aliases: ["AEIS Agronomia"] },
    { id: "belenenses", nome: "Belenenses",               curto: "Belenenses", sigla: "BEL",  cores: ["#5DB6E8"],             aliases: ["CF Belenenses", "Belém"] },
    { id: "cascais",    nome: "Cascais",                  curto: "Cascais",    sigla: "CAS",  cores: ["#0F4D2C"],             aliases: ["GD Cascais", "Dramático de Cascais"] },
    { id: "academica",  nome: "Académica",                curto: "Académica",  sigla: "AAC",  cores: ["#141414"],             aliases: ["AAC", "Académica de Coimbra"] },
    { id: "cdup",       nome: "CDUP",                     curto: "CDUP",       sigla: "CDUP", cores: ["#2BA84A"],             aliases: ["C.D.U.P."] },
    { id: "sport",      nome: "Sport Rugby",              curto: "Sport",      sigla: "SPT",  cores: ["#13294B", "#FFFFFF"], aliases: ["Sport Clube do Porto", "SC Porto"] },
    { id: "santarem",   nome: "Santarém",                 curto: "Santarém",   sigla: "SAN",  cores: ["#13294B", "#D2232A"], aliases: ["Rugby Clube de Santarém"] },
    { id: "tecnico",    nome: "Técnico",                  curto: "Técnico",    sigla: "TEC",  cores: ["#FFFFFF", "#6EC1E4"], aliases: ["IST", "Instituto Superior Técnico"] },
    { id: "saomiguel",  nome: "São Miguel",               curto: "São Miguel", sigla: "SMI",  cores: ["#14285A", "#141414"], aliases: ["S. Miguel", "CRSM"] },
  ],
};

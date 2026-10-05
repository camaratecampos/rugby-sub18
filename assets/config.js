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
  fase1Apurados: 6,        // os 6 primeiros da 1ª fase seguem para a Final 6
  fase2ComecaDoZero: true, // false = a Final 6 herda os pontos da 1ª fase

  /* Equipas
     "emblema": imagem do clube (assets/emblemas/). Sem emblema, desenha
                uma camisola com as riscas de "cores".
     "emblemaFundo": cor do quadrado por trás do emblema (por defeito branco;
                use uma cor escura para emblemas brancos).
     "aliases": outros nomes aceites na folha. */
  equipas: [
    { id: "direito",    nome: "Grupo Desportivo Direito", curto: "Direito",    sigla: "GDD",  cores: ["#C8102E", "#141414"], aliases: ["GD Direito", "GDD"], emblema: "assets/emblemas/direito.png" },
    { id: "cdul",       nome: "CDUL",                     curto: "CDUL",       sigla: "CDUL", cores: ["#0B2A5B"],             aliases: ["C.D.U.L."], emblema: "assets/emblemas/cdul.png", emblemaFundo: "#0B2A5B" },
    { id: "agronomia",  nome: "Agronomia",                curto: "Agronomia",  sigla: "AGR",  cores: ["#1E8A3C", "#FFFFFF"], aliases: ["AEIS Agronomia"], emblema: "assets/emblemas/agronomia.png" },
    { id: "belenenses", nome: "Belenenses",               curto: "Belenenses", sigla: "BEL",  cores: ["#5DB6E8"],             aliases: ["CF Belenenses", "Belém"], emblema: "assets/emblemas/belenenses.png" },
    { id: "cascais",    nome: "Cascais",                  curto: "Cascais",    sigla: "CAS",  cores: ["#0F4D2C"],             aliases: ["GD Cascais", "Dramático de Cascais"], emblema: "assets/emblemas/cascais.png" },
    { id: "academica",  nome: "Académica",                curto: "Académica",  sigla: "AAC",  cores: ["#141414"],             aliases: ["AAC", "Académica de Coimbra"], emblema: "assets/emblemas/academica.png", emblemaFundo: "#141414" },
    { id: "cdup",       nome: "CDUP",                     curto: "CDUP",       sigla: "CDUP", cores: ["#2BA84A"],             aliases: ["C.D.U.P."], emblema: "assets/emblemas/cdup.png", emblemaFundo: "#2BA84A" },
    { id: "sport",      nome: "Sport Rugby",              curto: "Sport",      sigla: "SPT",  cores: ["#13294B", "#FFFFFF"], aliases: ["Sport Clube do Porto", "SC Porto"], emblema: "assets/emblemas/sport.png" },
    { id: "santarem",   nome: "Santarém",                 curto: "Santarém",   sigla: "SAN",  cores: ["#13294B", "#D2232A"], aliases: ["Rugby Clube de Santarém"], emblema: "assets/emblemas/santarem.png" },
    { id: "tecnico",    nome: "Técnico",                  curto: "Técnico",    sigla: "TEC",  cores: ["#FFFFFF", "#6EC1E4"], aliases: ["IST", "Instituto Superior Técnico"], emblema: "assets/emblemas/tecnico.png" },
    { id: "saomiguel",  nome: "São Miguel",               curto: "São Miguel", sigla: "SMI",  cores: ["#14285A", "#141414"], aliases: ["S. Miguel", "CRSM"], emblema: "assets/emblemas/saomiguel.png" },
  ],
};

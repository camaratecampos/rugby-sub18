# Rugby Sub‑18 · Campeonato Nacional

Site estático com duas páginas:

- **Jornadas** (`index.html`): resultados jornada a jornada, com bónus, ensaios e a equipa de folga.
- **Classificação** (`tabela.html`): tabela da fase regular e da Final 6.

Os jogos vêm de uma **folha do Google Sheets**. Basta escrever o resultado na folha e o site atualiza sozinho, sem tocar no código.

## 1. Criar a folha de jogos (uma única vez)

1. No Google Sheets, crie uma folha nova.
2. **Ficheiro › Importar › Carregar** e escolha `data/modelo-google-sheets.csv`. A folha fica com os cabeçalhos certos e um calendário da 1ª fase já preenchido. **Corrija os jogos e as datas para o calendário oficial.**
3. **Ficheiro › Partilhar › Publicar na Web**: escolha a folha dos jogos, o formato **Valores separados por vírgulas (.csv)** e carregue em *Publicar*. Copie a ligação.
4. Cole essa ligação em `assets/config.js`, no campo `csvUrl`, e faça commit.

As alterações à folha aparecem no site em poucos minutos (o Google demora até cerca de 5 minutos a atualizar a versão publicada).

### Colunas da folha

| Coluna | Exemplo | Notas |
|---|---|---|
| `fase` | `1` ou `2` | `1` = fase regular, `2` = Final 6 |
| `jornada` | `4` | A numeração recomeça em 1 na Final 6 |
| `data` | `10/10/2026` | |
| `hora` | `15:00` | |
| `local` | `Tapada da Ajuda` | Opcional |
| `casa`, `fora` | `Agronomia` | Nome, nome curto, sigla ou alias definido em `config.js` (maiúsculas e acentos não contam) |
| `pts_casa`, `pts_fora` | `24`, `17` | Deixe em branco enquanto o jogo não se realizar |
| `ens_casa`, `ens_fora` | `4`, `2` | Ensaios, para calcular o bónus ofensivo. Opcional |
| `obs` | `Decidido por pontapés` | Aparece por baixo do jogo |

Sugestão: em **Dados › Validação de dados**, crie uma lista com os nomes das equipas nas colunas `casa`, `fora` e `vencedor` para evitar erros de escrita.

### Como avança o campeonato

- **1ª fase:** a equipa de folga em cada jornada é calculada automaticamente.
- **Final 6:** quando acabar a 1ª fase, acrescente os 30 jogos da Final 6 (6 equipas, duas voltas, 10 jornadas) com `fase = 2`. Até lá, a página mostra uma *projeção* com os 6 primeiros da fase regular.
- **Campeão:** quando todos os jogos da Final 6 tiverem resultado, o 1º classificado aparece como Campeão Nacional.

## 2. Regras (em `assets/config.js`)

- Vitória 4, empate 2, derrota 0.
- Bónus ofensivo +1 ao marcar pelo menos 4 ensaios **e** pelo menos 3 ensaios a mais do que o adversário (`ofensivoEnsaios` e `ofensivoDiferenca`).
- Bónus defensivo +1 ao perder por 7 pontos ou menos.
- Desempate: diferença de pontos, pontos marcados, ensaios marcados.
- `fase2ComecaDoZero`: se for `false`, a Final 6 herda os pontos da fase regular.

Se mudar alguma regra, atualize também o texto "Critérios de pontuação" em `tabela.html`.

As cores das equipas (as riscas dos emblemas) também se mudam em `config.js`.

## 3. Publicar (GitHub Pages)

No repositório: **Settings › Pages › Deploy from a branch**, escolha o ramo e a pasta `/ (root)`. O site fica em `https://<utilizador>.github.io/rugby-sub18/`.

Para ver o site no computador, é preciso um servidor (abrir o `index.html` diretamente não funciona):

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Estrutura

```
index.html            Jornadas
tabela.html           Classificação
assets/config.js      Configuração: ligação à folha, regras, equipas
assets/app.js         Leitura da folha e cálculo das classificações
assets/jornadas.js    Página de jornadas
assets/tabela.js      Página de classificação
assets/style.css      Estilo
data/exemplo.csv      Dados de demonstração (fictícios)
data/modelo-google-sheets.csv   Modelo para importar no Google Sheets
```

# MedPulso.ia — Status do projeto

> Documento de continuidade. Se você é uma sessão nova do Claude Code sem
> memória do que aconteceu, leia isto inteiro antes de tocar em qualquer
> coisa. Escrito do zero em 2026-08-17, atualizado em 2026-08-18 depois de
> uma sessão longa que foi do MVP simples até filtros avançados + modo
> SIMULADO com indexação de PDF por IA. Atualizado em 2026-08-27 depois do
> rebrand visual petrol/teal, consolidação da IA de explicação em
> provedor único, e limite de 5 perguntas pra visitante anônimo na
> landing.

## O que é

SaaS de preparação para residência médica no Brasil (ENARE, ENAMED, provas
estaduais, Revalida). Banco de questões comentadas com explicação por
alternativa baseada em diretrizes do Ministério da Saúde, dashboard de
desempenho, modo SIMULADO com provas completas indexadas de PDF, e
(planejado) trilha de estudo com IA baseada em déficit por área. Nome:
**MedPulso.ia**.

Dono do projeto: Josue Castro (josuelcastro02@gmail.com, GitHub `Pweg0`).
Comunicação preferida: **direto ao ponto, sem explicação longa, executar e
perguntar só quando necessário.**

## Onde as coisas estão

- **Código**: `C:\Users\josue\MEdpUlso\medpulso` (Next.js 16, App Router,
  TypeScript, Tailwind v4)
- **GitHub**: https://github.com/Pweg0/MedPulsoV2 (branch `main`, privado)
- **Deploy**: Vercel, projeto `pweg0s-projects/medpulso`,
  produção em **https://medpulso.vercel.app**. Deploy automático a cada
  push no `main` (GitHub↔Vercel conectado e confirmado funcionando).
- **Banco de dados**: Supabase (Postgres), projeto ref `tmropprliktcgipkitle`,
  URL `https://tmropprliktcgipkitle.supabase.co`. Credenciais em
  `.env.local` (gitignored) e nas env vars do Vercel (production/preview/
  development, todas configuradas).
- **launch.json** do preview local: `C:\Users\josue\MEdpUlso\.claude\launch.json`,
  roda `npm run dev --prefix medpulso` na porta 3000.
- **Provas do REVALIDA (PDF) do usuário**: `C:\Users\josue\Downloads\Documents\Revaldia\`
  — 8 cadernos de prova (`{ano}_{edicao}_PV_objetiva[_regular].pdf`, 2022 a
  2026/1) mas **sem gabarito embutido** (INEP sempre publica gabarito à
  parte). Gabaritos oficiais em
  `https://download.inep.gov.br/revalida/provas_e_gabaritos/{ano}_{edicao}_GB_objetiva.pdf`
  — só o de 2022/2 foi baixado até agora (mesma pasta). Os outros 6-7
  ainda faltam baixar antes de indexar o resto.

## Stack

Next.js 16 (App Router, **atenção**: `middleware.ts` foi renomeado pra
`proxy.ts` nessa versão — ver `src/proxy.ts` +
`src/lib/supabase/proxy.ts`) · TypeScript · Tailwind v4 · Supabase
(Postgres + Auth) · Framer Motion · next-themes (claro/escuro) · lucide-react
(versão instalada **não tem ícones de marca** tipo Instagram/Youtube — ver
`src/components/icons/social-icons.tsx` pra ícones customizados) · Gemini
API (só indexação de PDF do simulado, chamada via `fetch` direto, sem SDK)
· provedor de IA único e configurável pra explicação de questões
(`AI_ENDPOINT`/`AI_API_KEY`/`AI_MODEL`, formato OpenAI chat.completions —
ver seção "Explicação por IA" abaixo).

`AGENTS.md` no repo avisa que essa versão do Next.js tem breaking changes
vs. treino do modelo — sempre checar `node_modules/next/dist/docs/` antes
de usar uma API que "deveria" funcionar de um jeito.

## O que já está pronto e funcionando

### Site de marketing (`src/app/(marketing)/`)
Landing page, `/precos`, `/login`, `/cadastro`. Tema claro/escuro.

**Rebrand desta sessão (2026-08-27)**: design system trocado de
coral/vital-sobre-azul-tinta (Fraunces + Plus Jakarta Sans + IBM Plex
Mono) pra uma paleta **petrol/teal** (`--teal-*`/`--ink-*`/`--paper-*` em
`src/app/globals.css`), fontes **Plus Jakarta Sans + Inter** (`--font-mono`
deliberadamente aliased pra Inter, não uma mono real, pra não precisar
editar todo uso de `font-mono` no código). Baseado num arquivo de
referência de OUTRO produto (`index.html` na Área de Trabalho do usuário,
não faz parte deste repo) — só cor/fonte/estilo, **estrutura e conteúdo
mantidos intactos** por instrução explícita (inclusive o padrão do card
de questão no topo-direito do hero). Feito editando só 2 arquivos
(`layout.tsx` fontes, `globals.css` tokens) porque o codebase já usava
100% classes Tailwind com variáveis CSS semânticas, zero hex hardcoded.
`--coral-*` foi **repurposed**: antes era o destaque de marca, agora é
só "erro/resposta errada/área fraca" — qualquer uso de coral que era só
destaque visual (não erro) foi migrado pra `accent`
(`performance-card.tsx`, `auth-layout.tsx`, `final-cta.tsx`). Todos os
demais usos de `coral-*` no código foram auditados e são legitimamente
estados de erro (formulários de erro, resposta errada em questões,
"Sair" no sidebar).

Landing tem card de questão interativo no hero
(`components/landing/question-card.tsx`) puxando de
`src/lib/questions.ts` (exemplos estáticos, não do banco real).
**Novo nesta sessão**: visitante anônimo é limitado a **5 perguntas
respondidas** (contador em `localStorage`, chave
`mp_anon_perguntas_respondidas`); ao atingir o limite, o botão "Tentar
outra questão" some e um CTA fixo empurra pra `/cadastro`. Sem
verificação de servidor — é só um freio de UX pro visitante anônimo,
contornável limpando localStorage/aba anônima (aceitável, não é controle
de acesso real).

### Autenticação (Supabase Auth)
Email/senha real + botão Google OAuth (schema pronto, **não testado se o
provider Google está configurado no Supabase** — confirmar antes de
assumir que funciona). Confirmação de e-mail por padrão gerava
"rate limit exceeded" no mailer compartilhado do Supabase — foi
**desativada** manualmente em Authentication → Providers → Email (confirmar
se ainda está assim, ou se já configuraram SMTP próprio tipo Resend).

`AuthProvider` (`components/auth/auth-provider.tsx`) mantém sessão em
contexto React, alimentado por `getCurrentUser()` no server. Rotas
protegidas fazem `redirect("/login")` se não logado — ver `AppShell`
(`src/components/dashboard/app-shell.tsx`), reusado como layout de
`/dashboard`, `/estudar` e `/simulados` (sidebar + guard de auth num
lugar só).

### Banco de questões avulsas (tabela `questoes`)
Schema em `supabase/migrations/0001_questions.sql`: `id uuid`, `ano`,
`instituicao`, `disciplina`, `enunciado`, `alternativas jsonb` (array de
`{letra, texto, correta, explicacao}`), `comentario_geral`, `fonte_url`,
`fingerprint` (coluna gerada, hash de instituicao+ano+enunciado, com
`unique` — torna o import idempotente).

**125.628 questões reais** (extração própria do usuário — ver seção
"Decisões de escopo" abaixo pra história completa de proveniência).
`disciplina` vem com **hierarquia usando `" > "`** (ex: `"Clínica Médica >
Infectologia > COVID 19"`), 7 baldes de nível principal (Clínica Médica,
Cirurgia, Medicina Preventiva, Pediatria, Ginecologia, Obstetrícia,
Outros). `ano`: 24 valores (2001-2026). `instituicao`/banca: 318 valores
(4 linhas de lixo confirmadas e filtradas nas funções SQL).

Script de import: `scripts/import-questions.mjs` (`node --env-file=.env.local
scripts/import-questions.mjs arquivo.json`), usa `upsert` com
`onConflict: fingerprint`.

### Filtro avançado de questões (`/estudar` → `/estudar/praticar`)
`/estudar` agora é uma tela de **seleção de filtro**, não a lista direto:
- `FiltroAvancado` (`components/practice/filtro-avancado.tsx`): árvore de
  especialidade colapsável e pesquisável (`EspecialidadePicker`,
  `lib/supabase/especialidade-tree.ts` — constrói a árvore a partir de
  `disciplina` splitado por `" > "`), checkboxes de ano e banca (com
  busca), status da questão pro usuário logado (todas/não vistas/
  resolvidas/acertadas/erradas/ainda não acertadas). Contador de "questões
  encontradas" em tempo real via `/api/questoes/contar` (debounce 350ms).
- Ao clicar "Iniciar estudos", vira query string
  (`?esp=&ano=&banca=&status=`) e navega pra `/estudar/praticar`.
- `/estudar/praticar/page.tsx` chama a RPC `buscar_questoes` (SQL,
  `supabase/migrations/0005_filtro_avancado.sql`) com todos os filtros
  combinados + `p_user_id` pro status, limit 200, renderiza
  `PracticeSession` com `key` derivada dos filtros (remonta do zero quando
  o filtro muda).
- Funções SQL de apoio: `disciplina_counts()`, `ano_counts()`,
  `instituicao_counts()`, `contar_questoes(...)`, `buscar_questoes(...)`
  (todas em `0005_filtro_avancado.sql`; `0004_filtros_estudar.sql` tem
  versões mais simples anteriores, `distinct_anos()`/
  `distinct_instituicoes()`, ainda existem mas meio redundantes agora).
- `fetchAllRpc()` (`lib/supabase/fetch-all-rpc.ts`): Supabase limita RPC a
  1000 linhas por página — pagina via `.range()` quando precisa (ex:
  `disciplina_counts` retorna milhares de combinações distintas).

### `/estudar/praticar` — resolver questões avulsas (`practice-session.tsx`, 649 linhas)
- **Navegação livre**: setas laterais trocam de questão sem precisar
  responder a atual (não é mais "responde e trava"). Estado por questão
  num map `answers: Record<questaoId, letra>`.
- **Painel de explicação estruturado por IA** (quando `explicacao_ia`
  existe): por-alternativa mostra a explicação específica da IA embaixo de
  cada opção com a categoria do erro (`tipo_erro`); painel consolidado
  abaixo com dado-chave da vinheta, palavras-chave da prova, como cai na
  prova, quadro associado, pegadinha, dica pra não errar, revisão do tema,
  avisos (protocolo desatualizado / discorda do gabarito / leitura de
  figura) e meta (tema/base normativa/fonte). Botão "Buscar Explicação e
  resolução da questão" quando ainda não tem `explicacao_ia`.
- **Estatísticas reais**: % de quem acertou/errou cada alternativa e % de
  acerto geral, calculado on-the-fly de `tentativas` (refetch a cada
  resposta, sem cache — aceitável na escala atual).
- **Categoria colapsável**: breadcrumb hierárquico. Fonte primária é
  `disciplina` (split por `" > "`); fallback é `ai.categoria` (gerado pela
  IA) quando `disciplina` só tem 1 nível.

### Explicação por IA (provedor único configurável) — `src/app/api/explicar/route.ts`
Portada de um projeto anterior do usuário
(`C:\Users\josue\OneDrive\Área de Trabalho\files\app.py`, que usava Claude
via Anthropic API). Prompt (`SYSTEM` em `src/lib/gemini.ts`) mantém a
hierarquia de fontes do original (`protocolo_ms` > `legislacao_sus` >
`sociedade_especialidade` > `fisiopatologia`), `discordo_do_gabarito`,
`confianca_leitura`, mais adições de sessões anteriores: `categoria` (array
hierárquico 2-4 níveis), `palavras_chave_prova`, `como_cobra_na_prova`,
`quadro_associado`, `dica_prova` (todos opcionais), `revisao_do_tema`
(sempre preenchido — resumo de aula do tema). **Limite rígido de 3 frases
por campo de texto livre** no prompt (depois de um teste real gerar um
campo degenerando numa frase gigante repetitiva).

Generalizada pra servir tanto `questoes` quanto `simulado_questoes` via
parâmetro `fonte: "questoes" | "simulado"` no corpo do POST (default
`"questoes"` se omitido).

**Mudança desta sessão (2026-08-27)**: por pedido explícito do usuário
("setar somente um endpoint e uma key, não quero várias"), o pipeline
dual Gemini→Groq foi **removido** e substituído por um único provedor
genérico compatível com o formato OpenAI chat.completions —
`explicarQuestaoIA()` em `src/lib/ai-explicar.ts` (novo arquivo).
`src/lib/groq.ts` foi **deletado**. `src/lib/gemini.ts` perdeu
`RESPONSE_SCHEMA` e `explicarQuestao()`, mas manteve `SYSTEM`,
`buildPrompt()` e todo o código de indexação de PDF
(`indexarProvaComGemini`) intacto — **Gemini agora serve só pra indexação
de provas em PDF no /simulado**, não mais pra explicação de questões.

Configuração: `AI_ENDPOINT`, `AI_API_KEY`, `AI_MODEL` (o usuário seta os
valores reais manualmente, tanto em `.env.local` quanto — separadamente —
nas env vars do Vercel; local não sincroniza automático com lá).
`GEMINI_API_KEY`/`GEMINI_MODEL` continuam existindo só pra indexação de
PDF. `GROQ_API_KEY` foi removida do `.env.local` (não referenciada em
código nenhum mais).

Fluxo: cache-check na tabela certa → se vazio, chama `AI_ENDPOINT` com
`response_format: json_object` → grava de volta via `service_role`
(`src/lib/supabase/admin.ts`) → nunca regenera a mesma questão duas vezes
(cache compartilhado entre usuários). Sem retry/fallback — se o endpoint
único falhar, a rota retorna erro 502 direto.

**Status: confirmado funcionando end-to-end.** O usuário configurou
`AI_ENDPOINT=https://api.xah.io/v1/chat/completions` (o path inicial
`.../v1` sem `/chat/completions` dava 308 redirect → 503 "upstream gateway
unavailable" no provedor; corrigido testando com `curl` direto). Confirmar
que a mesma correção de `AI_ENDPOINT` foi aplicada nas env vars do Vercel
(local e produção não sincronizam sozinhos) e que um redeploy foi feito.

### Mapa de Raciocínio + Caderno de Revisão + Flashcards automáticos (novo, 2026-08-27)
Inspirado numa dinâmica de plataforma concorrente que o usuário mostrou por
print (só a mecânica de estudo, nenhum conteúdo copiado). Plano completo em
`C:\Users\josue\.claude\plans\velvet-gathering-octopus.md`.

**Schema** (`supabase/migrations/0008_pontos_flashcards.sql` — **usuário
ainda precisa rodar no SQL Editor do Supabase**):
- `tentativas` ganha `avaliacao_pontos jsonb` (`{tema, pontos: [{ponto,
  verbo, nivel}]}`) e `proxima_revisao_em timestamptz`, mais uma policy de
  `update` pra própria linha (não existia antes, só insert/select).
- Tabela nova `tema_dominio` (user_id, tema, score, questoes_avaliadas) —
  média móvel (`novo = antigo*0.7 + score*0.3`) do desempenho autoavaliado
  por tema. **Só grava o dado — não existe ainda nenhum motor que consome
  isso pra recomendar questões.** É a base de dados pra uma feature futura
  ("Estudos Randomizados"/"Trilha de Aperfeiçoamento" adaptativa) que o
  usuário descreveu mas pediu explicitamente pra não construir agora.
- Tabela nova `flashcards` (user_id, questao_id, tentativa_id, area_grande,
  frente, verso, revisado_em), `unique(user_id, questao_id)` — nunca gera
  (nem cobra IA) duas vezes pro mesmo par usuário+questão.

**Mapa de raciocínio** — `ExplicacaoIA.pontos_raciocinio` (novo campo, 2 a 4
itens, `{ponto, verbo}` onde verbo é identificar/correlacionar/diferenciar/
associar/recordar) é gerado pela mesma chamada de IA que já gera a
explicação (`src/lib/gemini.ts` SYSTEM prompt + `src/lib/ai-explicar.ts`
JSON_SHAPE_HINT). Em `practice-session.tsx`, depois de responder e a
explicação estar carregada, aparece uma seção "Mapa de raciocínio" com 4
pills por ponto (Dominei/Dúvida/Vacilei/Não sabia — cores vital/amber-400/
amber-600/coral-500, precisou completar a escala amber no `globals.css`
que só tinha o 500 exposto pro Tailwind). **É opcional, não bloqueia
avançar** (decisão explícita do usuário). Salvar via
`src/lib/supabase/pontos.ts` → `salvarAvaliacaoPonto()`, direto do client
(sem rota de API, mesma RLS que já protege `tentativas`).

**Caderno de Revisão** (`/revisao`) — pega a tentativa mais recente por
questão do usuário (dedupe em JS, mesmo padrão de
`src/lib/supabase/dashboard-data.ts`, sem RPC nova), filtra: errada→sempre
entra; certa mas com "dúvida"/"não sabia" em algum ponto→entra
(autodiagnóstico); certa só com "dominei"/"vacilei"→não entra. Ordena pelas
mais atrasadas primeiro (`proxima_revisao_em`). Renderiza
`<PracticeSession>` de novo — zero duplicação de UI de questão.

**Flashcards** (`/flashcards`) — toda resposta errada dispara (fire-and-
forget, não bloqueia a prática se falhar) `POST /api/flashcards/gerar`
(`src/app/api/flashcards/gerar/route.ts`), que chama
`gerarFlashcardIA()` (novo, em `src/lib/ai-explicar.ts`, mesmo provedor
único `AI_ENDPOINT`) pra condensar a questão numa frente/verso e classificar
numa das 5 grandes áreas clássicas de residência (Clínica Médica, Cirurgia,
Pediatria, GO, Medicina Preventiva e Saúde Coletiva — fixas no prompt, não
usam a taxonomia de 18 áreas do banco principal). UI em
`src/components/flashcards/flashcard-browser.tsx`: agrupado por área, flip
card, toggle Pendentes/Todos, botão "Revisei" marca `revisado_em`.

**Escopo explícito, decidido com o usuário nesta sessão**: só vale no banco
de questões (`/estudar`), **não** nos simulados cronometrados (`/simulados`)
— não mexi em `simulado-session.tsx`.

**Status**: lint + build passando. **Não testado end-to-end contra dados
reais** — depende da migration 0008 rodar no Supabase, de um login real, e
de uma questão errada de verdade pra confirmar que o flashcard é gerado e
que o item aparece em `/revisao` e `/flashcards` (auth guard confirmado
funcionando: redireciona pra `/login` sem sessão).

### `/dashboard` — hub do aluno
Shell com sidebar (`components/dashboard/sidebar.tsx` — itens: Dashboard,
Questões, **Simulados**, **Flashcards** (novo), **Caderno de Revisão**
(novo); Material de Apoio/Cronograma/Progresso ainda "em breve"). Conteúdo
(`app/dashboard/page.tsx`):
- Card de plano (teste grátis por `created_at + 7 dias`, contagem real de
  questões respondidas vs. tamanho do banco; Flashcards/IA "em breve" —
  **não fabricamos limite falso**, não existe enforcement de
  plano/pagamento ainda)
- Card de ofensiva: semana, saudação por horário + nome, relógio ao vivo
  de Brasília, streak atual/recorde — real, de `tentativas`
  (`src/lib/supabase/dashboard-data.ts`)
- Sessão de hoje, grid de ferramentas, 3 seções recolhíveis (Mais
  ferramentas, Seu progresso [placeholder], Histórico de sessões [real])

`/conta` descontinuada — só `redirect("/dashboard")`.

### Tabela `tentativas` (`0002_tentativas.sql`)
`user_id`, `questao_id`, `resposta_letra`, `acertou`, `created_at`. RLS por
usuário. Aplicada e em uso real.

### NOVO — Modo SIMULADO/TREINO (provas completas, separadas do banco avulso)

Pedido do usuário: indexar provas do REVALIDA inteiras (ele tem os PDFs em
`Downloads\Documents\Revaldia\`) numa sessão separada, **sem misturar com
o banco `questoes`** — cada PDF indexado vira um simulado próprio com
todas as questões originais (1 a 100).

**Schema** (`supabase/migrations/0006_simulados.sql`, tabelas totalmente
separadas de `questoes`):
- `simulados`: nome, instituicao, ano, numero_questoes.
- `simulado_questoes`: numero (posição original), enunciado, alternativas
  jsonb (mesmo shape de `questoes`), anulada, tem_figura, disciplina,
  explicacao_ia/explicacao_gerada_em (mesmo mecanismo de cache de IA).
- `simulado_tentativas`: user_id, simulado_id, simulado_questao_id,
  resposta_letra, acertou. `unique(user_id, simulado_questao_id)` —
  refazer o simulado sobrescreve a tentativa anterior via upsert.
- RLS: `simulados`/`simulado_questoes` leitura pública; `simulado_tentativas`
  só o próprio usuário (select/insert/update).

**Indexação — decisão importante**: a ideia original era reusar
`indexador_revalida.py` (bbox/pdfplumber, do projeto antigo), mas esse
script só localiza os marcadores de alternativa — não separa
enunciado/alternativas em texto limpo nem cruza com o gabarito (isso era
feito por outra etapa do pipeline antigo que não está nos arquivos
disponíveis). Escrevi `scripts/indexar_prova_completo.py` estendendo a
lógica validada de detecção de coluna/marcador do original pra fazer o
corte completo — **mas essa versão Python não foi testada ainda**.

Em vez disso, o usuário sugeriu deixar a IA fazer o trabalho todo, e é
isso que está em produção agora: **`indexarProvaComGemini()`
(`src/lib/gemini.ts`)** manda os dois PDFs (prova + gabarito) direto pro
Gemini como `inlineData` (`mimeType: application/pdf` — o modelo lê o PDF
nativamente, sem OCR/heurística de layout) num único `generateContent`,
com `responseSchema` estruturado pedindo todas as questões já com
enunciado limpo, alternativas separadas, gabarito cruzado e `tem_figura`.

**Testado de ponta a ponta com um PDF real** (Revalida 2022/2, 100
questões + gabarito oficial do INEP): **100/100 questões extraídas, 0 sem
gabarito reconhecido, 14 anuladas identificadas corretamente, 5 questões
com figura corretamente flagadas, texto limpo (sem entidade HTML crua)**.
Levou **135 segundos** — por isso `maxDuration = 300` na rota (ver nota de
risco abaixo).

**Rota**: `POST /api/simulados/indexar` (`src/app/api/simulados/indexar/route.ts`)
— recebe `FormData` (`nome`, `prova` File, `gabarito` File), autenticado,
converte pra base64, chama `indexarProvaComGemini`, cria/atualiza
`simulados` + `simulado_questoes` via `service_role`. **Só testei a lógica
core (chamada Gemini) direto — não testei essa rota completa via HTTP nem
o formulário no navegador** (upload de arquivo real não dá pra automatizar
no browser tool que eu uso; ficou testado só até onde o Node consegue
chegar sem sessão de cookie).

**UI**:
- `/simulados` — lista de provas indexadas (cards), botão "Indexar prova".
- `/simulados/indexar` — formulário (nome + 2 arquivos PDF), mostra
  progresso e resultado (`components/simulados/indexar-form.tsx`).
- `/simulados/[id]` — `SimuladoSession`
  (`components/simulados/simulado-session.tsx`): navegação livre + palette
  numerada (todas as questões, colorida por respondida/não), cronômetro
  (contagem crescente), **não revela gabarito até finalizar** (diferente
  do `/estudar`, que revela na hora) — isso é intencional, simulado
  simula prova real. "Finalizar simulado" grava tudo em `simulado_tentativas`
  de uma vez (upsert em lote) e libera modo revisão: gabarito, explicação
  por alternativa, botão de gerar explicação por IA (reusa `/api/explicar`
  com `fonte: "simulado"`), aviso de gabarito contestado pela IA.
  Questões anuladas contam como acerto automático pra todo mundo (exclusas
  do denominador do score, como a regra real do INEP) e não pedem
  explicação.

**Riscos/limitações conhecidas, não resolvidas ainda**:
- `maxDuration = 300` no route.ts — **Vercel Hobby pode limitar bem menos
  que isso** (historicamente 10-60s; Fluid Compute pode mudar isso, não
  confirmei o limite atual do plano). Se a indexação der timeout em
  produção, ou vira Vercel Pro ou quebra a indexação em lotes de páginas.
- PDFs maiores que uma prova de 100 questões (~1.8MB) podem estourar
  `maxOutputTokens` (65536) e o JSON vir truncado — a função já detecta
  JSON inválido e lança erro claro, mas não tem fallback automático de
  chunking ainda.
- A rota completa (`/api/simulados/indexar`) e o formulário no navegador
  **não foram testados** (só a chamada Gemini isolada). Testar antes de
  confiar 100%.

## Bugs reais encontrados e corrigidos

1. **Toggle de tema não atualizava visualmente** — `transition:
   background-color` no `body` combinado com var CSS indireta travava o
   Chromium no valor antigo. Fix: `background-color` direto, sem
   transition. (`globals.css`)

2. **`useEffect` + `setState` síncrono** dispara
   `react-hooks/set-state-in-effect`. Padrão usado em vários lugares pra
   evitar mismatch de hidratação: hook `useMounted()`
   (`src/lib/use-mounted.ts`, via `useSyncExternalStore`) + **setState
   condicional durante o render** (`if (mounted && !algumaCoisa) {
   setAlgumaCoisa(...) }`), nunca dentro de `useEffect`. Reusar sempre que
   precisar de "só no client, depois do mount". Efeitos que fazem
   *subscribe* de verdade (ex: `setInterval` pro relógio/cronômetro) são
   diferentes e OK dentro de `useEffect` — o lint só reclama de setState
   síncrono direto no corpo do efeito.

3. **Hidratação quebrada por `Math.random()` no `useState` inicial** —
   server e client embaralham diferente. Corrigido: só é seguro embaralhar
   com `useState(() => shuffle(...))` se o componente **não renderiza
   conteúdo real até `mounted === true`** (retorna skeleton antes disso).

4. **`AnimatePresence mode="wait"` com troca de `key` logo após o mount**
   trava mostrando conteúdo antigo. Causa raiz: o fix do item 3 (não
   renderizar o card real antes de `mounted`) resolve isso de graça,
   porque só existe uma montagem do card real.

5. **HMR do Turbopack corrompe depois de um crash transitório** (ex:
   variável removida no meio de uma edição). Sintoma: erro de módulo
   antigo, WebSocket de HMR falhando, estado dessincronizado. **Fix
   sempre**: `rm -rf .next` + reiniciar o dev server do zero.

6. **`read_console_messages` acumula histórico desde que a aba abriu** —
   não reflete só o estado atual. Pra checar estado real: aba nova, ou
   `preview_logs` do servidor (por processo, reseta ao reiniciar).

7. **Entidades HTML cruas** (`&gt;`, `&#34;`) no texto de questões
   importadas. Fix: `decodeEntities()` em
   `components/practice/formatted-text.tsx`.

8. **Markdown cru** (`**negrito**`, `\n` sem quebra) em textos de IA e de
   import. Fix: `FormattedText` (mesmo arquivo) faz parse leve.

9. **Deploy do Vercel travando com exit 137** via Bash tool (não é RAM do
   Windows — testado com >3GB livres, mesmo erro; é limite do sandbox da
   ferramenta). PowerShell trava em vez de matar. **Solução**: pedir pro
   usuário rodar `npx vercel --prod --yes` no terminal dele, fora do
   Claude Code. PowerShell dele deu erro de execution policy bloqueando
   `npx.ps1` — contornado com `cmd` ou `npx.cmd`.

10. **Deploy automático (push → Vercel) não disparava** — autor do commit
    era `seu-email@exemplo.com` (placeholder nunca trocado), que batia com
    e-mail verificado de outro usuário do GitHub (`gugastork`). Vercel
    Hobby/repo privado bloqueia deploy automático de autor não-colaborador.
    Fix: `git config user.name "Josue"` + `git config user.email
    josuelcastro02@gmail.com`.

11. **`/estudar` e `/conta` ficaram sem layout** (sem `<main>`, sem
    sidebar) depois da reestruturação em `(marketing)` vs. shell do
    dashboard — não pertenciam a nenhum grupo. Fix: `AppShell` extraído
    (`components/dashboard/app-shell.tsx`), reusado via `layout.tsx`
    próprio em cada rota (`/estudar`, `/dashboard`, `/simulados`).

## Decisões de escopo / coisas que recusei fazer

- **Recusei escrever scraper** pra extrair banco de questões de
  plataformas pagas concorrentes (Medevo, Estratégia MED) — violação de
  direitos autorais e ToS. Quando o usuário trouxe um JSON com evidências
  claras de origem de plataforma (IDs internos tipo `"4000000064"`, campos
  como `user_solution`/`answer_percentage`/`forum_id` que só existem numa
  API com usuários reais respondendo), recusei processar e expliquei por
  quê. Ele reformatou os campos pra português alegando extração própria —
  a mesma prova (IDs, textos) contradisse isso; apontei a inconsistência.
  Ele disse que ia pular essa parte. **Não sei com certeza a origem exata
  das 125k questões que ele importou depois** — não vi o arquivo final
  antes do import. Se isso for relevante de novo (auditoria, dúvida sobre
  conteúdo), essa é a história completa.
- Em contraste, o modo **SIMULADO usa fonte inequivocamente legítima**:
  PDFs oficiais do INEP baixados pelo próprio usuário + gabarito do site
  oficial `download.inep.gov.br` (baixei eu mesmo, com autorização
  explícita do usuário antes de baixar).
- Não fabricamos números de limite de plano (ex: "9/10 questões hoje")
  porque não existe enforcement de assinatura ainda.

## A fazer / pendente

**Bloqueado em você (usuário) — próximos passos imediatos**:
- [ ] Rodar `supabase/migrations/0008_pontos_flashcards.sql` no SQL Editor
      (mapa de raciocínio + caderno de revisão + flashcards não funcionam
      sem isso — tabelas `tema_dominio`/`flashcards` e colunas novas em
      `tentativas` ainda não existem no banco)
- [ ] Testar de ponta a ponta: errar uma questão em `/estudar/praticar`,
      confirmar flashcard em `/flashcards`; acertar uma questão marcando
      "Dúvida" num ponto do mapa de raciocínio, confirmar que ela aparece
      em `/revisao`
- [ ] Confirmar que `AI_ENDPOINT` no Vercel já está com o path corrigido
      (`.../v1/chat/completions`, não só `.../v1`) e que houve redeploy —
      local (`.env.local`) já está certo e testado (200 OK), Vercel foi
      corrigido pelo usuário mas o redeploy não foi confirmado de volta
- [ ] Rodar `supabase/migrations/0006_simulados.sql` no SQL Editor (as
      migrations 0001-0005 já estão aplicadas)
- [ ] Testar `/simulados/indexar` de verdade no navegador (upload manual
      do PDF de 2022/2 que já está pronto em
      `Downloads\Documents\Revaldia\2022-2_PV_objetiva.pdf` +
      `2022-2_GB_objetiva.pdf`) — a lógica core já foi validada via script,
      mas a rota HTTP completa + formulário nunca rodou de ponta a ponta
- [ ] Baixar os gabaritos que faltam (2022/1, 2023/1, 2023/2, 2024/1,
      2024/2, 2025/1 — e verificar se 2026/1 já tem gabarito publicado) de
      `download.inep.gov.br/revalida/provas_e_gabaritos/{ano}_{ed}_GB_objetiva.pdf`
      e indexar as 7 provas restantes
- [ ] Confirmar se e-mail de confirmação continua desativado no Supabase
- [ ] Decidir sobre SMTP próprio (Resend ou similar) antes de lançar

**Funcionalidades da visão original ainda não construídas**:
- [ ] Dashboard "Seu progresso" com gráfico real por área
- [ ] Motor de recomendação de estudo por IA (déficit por área)
- [ ] Flashcards, Cronograma, Material de Apoio, Caderno de Revisão
- [ ] Assinatura/pagamento real (Stripe ou similar)
- [ ] Confirmar/testar login com Google de ponta a ponta
- [ ] Painel admin (inclusive: hoje **qualquer usuário logado** pode
      indexar simulados via `/simulados/indexar` — não tem gate de admin
      porque não existe sistema de papéis ainda; considerar restringir
      quando o painel admin existir)

**Menor prioridade / polish**:
- [ ] Verificar se `maxDuration=300` da rota de indexação realmente
      funciona no plano Vercel atual (risco documentado acima)
- [ ] Considerar chunking por lote de páginas se PDFs maiores que ~100
      questões começarem a truncar o JSON de resposta do Gemini
- [ ] `indexar_prova_completo.py` (fallback Python/pdfplumber) escrito mas
      nunca testado — só usar se o caminho Gemini falhar de forma
      persistente
- [ ] Banca "BOLSA MEC+Bonificação" no filtro parece suspeita mas não
      claramente lixo — confirmar antes de excluir
- [ ] Analytics de uso de IA (quantas explicações geradas, custo
      acumulado Gemini/Groq)

## Convenções que valem a pena manter

- Sempre `npm run lint` + `npm run build` antes de considerar algo pronto.
- Commits em inglês, mensagens explicando o "porquê", não o "o quê".
- Nunca colocar secret em código — tudo via `.env.local` (gitignored,
  exceto `.env.local.example`) e env vars do Vercel.
- Usuário prefere respostas curtas, sem explicação didática — só agir e
  perguntar quando genuinamente bloqueado.
- Testar lógica core isolada (script Node direto) quando o caminho normal
  (browser automation) não consegue cobrir algo — ex: upload de arquivo
  real não dá pra simular no browser tool, mas dá pra testar a função que
  importa diretamente.

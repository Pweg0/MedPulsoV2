# MedPulso.ia — Status do projeto

> Documento de continuidade. Se você é uma sessão nova do Claude Code sem
> memória do que aconteceu, leia isto inteiro antes de tocar em qualquer
> coisa. Escrito em 2026-08-17/18 depois de uma sessão longa que foi do zero
> até um MVP funcional no ar.

## O que é

SaaS de preparação para residência médica no Brasil (ENARE, ENAMED, provas
estaduais, Revalida). Banco de questões comentadas com explicação por
alternativa baseada em diretrizes do Ministério da Saúde, dashboard de
desempenho, e (planejado) trilha de estudo com IA baseada em déficit por
área. Nome: **MedPulso.ia**.

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

## Stack

Next.js 16 (App Router, **atenção**: `middleware.ts` foi renomeado pra
`proxy.ts` nessa versão — ver `src/proxy.ts` +
`src/lib/supabase/proxy.ts`) · TypeScript · Tailwind v4 · Supabase
(Postgres + Auth) · Framer Motion · next-themes (claro/escuro) · lucide-react
(versão instalada **não tem ícones de marca** tipo Instagram/Youtube — ver
`src/components/icons/social-icons.tsx` pra ícones customizados) · Gemini
API (explicações por IA, chamada via `fetch` direto, sem SDK).

`AGENTS.md` no repo avisa que essa versão do Next.js tem breaking changes
vs. treino do modelo — sempre checar `node_modules/next/dist/docs/` antes
de usar uma API que "deveria" funcionar de um jeito.

## O que já está pronto e funcionando

### Site de marketing (`src/app/(marketing)/`)
Landing page, `/precos`, `/login`, `/cadastro`. Tema claro/escuro. Design
system próprio (paleta coral/vital sobre azul-tinta, Fraunces + Plus
Jakarta Sans + IBM Plex Mono). Landing tem card de questão interativo no
hero (`components/landing/question-card.tsx`) puxando de
`src/lib/questions.ts` (exemplos estáticos, não do banco real).

### Autenticação (Supabase Auth)
Email/senha real + botão Google OAuth (schema pronto, **não testado se o
provider Google está configurado no Supabase** — confirmar antes de
assumir que funciona). Confirmação de e-mail por padrão gerava
"rate limit exceeded" no mailer compartilhado do Supabase — foi
**desativada** manualmente em Authentication → Providers → Email pelo
usuário (confirmar se ainda está desativada, ou se já configuraram SMTP
próprio tipo Resend).

`AuthProvider` (`components/auth/auth-provider.tsx`) mantém sessão em
contexto React, alimentado por `getCurrentUser()` no server. Rotas
protegidas fazem `redirect("/login")` se não logado.

### Banco de questões (tabela `questoes`)
Schema em `supabase/migrations/0001_questions.sql`: `id uuid`, `ano`,
`instituicao`, `disciplina`, `enunciado`, `alternativas jsonb` (array de
`{letra, texto, correta, explicacao}`), `comentario_geral`, `fonte_url`,
`fingerprint` (coluna gerada, hash de instituicao+ano+enunciado, com
`unique` — isso é o que torna o import idempotente: reimportar o mesmo
arquivo não duplica).

**~8.971 questões reais importadas** pelo usuário (extração própria dele,
não feita por mim — eu recusei escrever parser pra dados que identifiquei
como vindos de scraping de plataforma paga; ele reformatou/reextraiu e
trouxe o resultado final, que aceitei importar). Script de import:
`scripts/import-questions.mjs` (`node --env-file=.env.local
scripts/import-questions.mjs arquivo.json`), usa `upsert` com
`onConflict: fingerprint` pra ignorar duplicatas.

**Fonte legítima adicional identificada mas ainda não importada**: em
`C:\Users\josue\OneDrive\Área de Trabalho\files\dados.json` tem **1130
questões reais do REVALIDA/INEP** (12 provas, PDFs oficiais públicos),
extraídas por um indexador Python próprio do usuário
(`indexador_revalida.py`, usa `pdfplumber`). Formato diferente do nosso
schema — precisaria de um script de conversão pra
`scripts/import-questions.mjs`. Ver seção "A fazer" abaixo.

### Explicação por IA (Gemini) — `src/app/api/explicar/route.ts`
Feature nova, portada de um projeto anterior do usuário
(`C:\Users\josue\OneDrive\Área de Trabalho\files\app.py`, que usava Claude
via Anthropic API). Reescrita pra usar **Gemini** via REST direto
(`src/lib/gemini.ts`, sem SDK — só `fetch`).

O prompt (`SYSTEM` em `gemini.ts`) é adaptado do
`system_prompt_revalida.md` original: hierarquia de fontes
(`protocolo_ms` > `legislacao_sus` > `sociedade_especialidade` >
`fisiopatologia`), proibição de inventar número de portaria, sinalizador
`discordo_do_gabarito` (a IA pode discordar do gabarito oficial e explicar
por quê), `confianca_leitura` (baixa quando a questão depende de figura
que não temos). Isso é bom trabalho de prompt engineering do usuário — não
simplificar sem necessidade.

Fluxo: usuário responde questão sem explicação → botão "Gerar explicação
com IA" → rota faz cache-check (`questoes.explicacao_ia`) → se vazio,
chama Gemini → grava de volta na tabela via `service_role`
(`src/lib/supabase/admin.ts`) → nunca regenera a mesma questão duas vezes
(cache compartilhado entre todos os usuários, não por usuário).

**Status: funcionando de ponta a ponta**, testado em dev em 2026-08-17
(gerar → grava em `questoes.explicacao_ia` via service_role → reexibe do
cache sem chamar a API de novo). Migration `0003_explicacao_ia.sql`
aplicada, `GEMINI_API_KEY` configurada em `.env.local` + Vercel
(production/preview/development).

**Nota**: o model default original (`gemini-2.5-flash`) parou de
responder pra essa API key (`404 — no longer available to new users`).
Trocado pro default pra `gemini-3.6-flash` em `src/lib/gemini.ts`
(confirmado que aceita `responseSchema` estruturado igual o anterior).
Se isso voltar a quebrar no futuro, rodar
`GET https://generativelanguage.googleapis.com/v1beta/models?key=...`
pra ver quais models "flash" com `generateContent` a key atual tem
acesso.

### `/estudar` — resolver questões (`src/components/practice/practice-session.tsx`)
Página protegida, embaralha as questões client-side, responde, revela
gabarito com explicação por alternativa, grava tentativa em `tentativas`
(se logado), botão "Próxima questão", botão "Gerar explicação com IA"
quando a questão não tem `explicacao` ainda.

### `/dashboard` — hub do aluno
Shell com sidebar (`components/dashboard/sidebar.tsx`,
`app-shell.tsx` — reusado também em `/estudar`, ambos fora do grupo
`(marketing)`). Conteúdo (`app/dashboard/page.tsx`):
- Card de plano (teste grátis calculado por `created_at + 7 dias`,
  contagem real de questões respondidas vs. tamanho do banco; Flashcards e
  IA marcados "em breve" — **não fabricamos limite falso**, já que não
  existe enforcement de plano/pagamento ainda)
- Card de ofensiva: semana (dots), saudação por horário + nome, relógio
  ao vivo de Brasília, streak atual/recorde — tudo calculado de verdade a
  partir de `tentativas` (`src/lib/supabase/dashboard-data.ts`)
- Sessão de hoje (não "sessão atual" ao vivo entre páginas — interpretei
  como "hoje" já que não existe conceito de sessão agrupada no banco)
  Grid de ferramentas (Questões real, resto "em breve")
- 3 seções recolhíveis: Mais ferramentas, Seu progresso (placeholder),
  Histórico de sessões (real, últimos 14 dias com atividade)

`/conta` foi descontinuada — agora só faz `redirect("/dashboard")`.

### Tabela `tentativas` (`supabase/migrations/0002_tentativas.sql`)
`user_id`, `questao_id`, `resposta_letra`, `acertou`, `created_at`. RLS:
cada usuário só lê/escreve as próprias linhas. **Confirmada aplicada** (o
dashboard já mostra dados reais vindos dela).

## Bugs reais encontrados e corrigidos nesta sessão

Vale ler antes de mexer nesses arquivos de novo — todos pareciam
"impossíveis" até eu isolar a causa:

1. **Toggle de tema não atualizava visualmente** — `transition:
   background-color` no `body` combinado com var CSS indireta
   (`--color-bg` → `--bg`) travava o Chromium no valor antigo. Corrigido
   trocando `background` (shorthand) por `background-color` e removendo a
   transition problemática. (`globals.css`)

2. **`useEffect` + `setState` síncrono** dispara
   `react-hooks/set-state-in-effect` no ESLint novo. Padrão usado em vários
   lugares pra evitar mismatch de hidratação (tema, pergunta aleatória):
   hook `useMounted()` (`src/lib/use-mounted.ts`, via
   `useSyncExternalStore`) + **setState condicional durante o render**
   (`if (mounted && !algumaCoisa) { setAlgumaCoisa(...) }`), não dentro de
   `useEffect`. Reusar esse padrão sempre que precisar de "só no client,
   depois do mount".

3. **Hidratação quebrada por `Math.random()` no `useState` inicial**
   (`practice-session.tsx`) — server e client embaralham diferente.
   Corrigido: embaralhar com `useState(() => shuffle(...))` só é seguro
   se o componente **não renderiza conteúdo real até `mounted === true`**
   (retorna skeleton antes disso). Sem esse gate, o valor "vaza" pro HTML
   do server e dá mismatch.

4. **`AnimatePresence mode="wait"` com troca de `key` logo após o mount**
   trava mostrando o conteúdo antigo (a transição de saída nunca parecia
   terminar do jeito que eu testei). Causa raiz real: o `key` mudava
   *durante* a re-renderização pós-mount, não só em cliques de usuário — o
   fix do item 3 (não renderizar o card real antes de `mounted`) resolveu
   isso também, porque aí só existe **uma** montagem do card real, nunca
   uma troca de key no mesmo instante do mount.

5. **HMR do Turbopack corrompe depois de um crash transitório** (ex:
   referenciar uma variável que acabei de remover no meio de uma edição).
   Sintoma: erros de módulo antigo, WebSocket de HMR falhando, componentes
   se comportando com estado dessincronizado. **Fix sempre**: `rm -rf
   .next` + reiniciar o dev server do zero. Aconteceu um punhado de vezes
   nesta sessão, sempre resolvido assim.

6. **`read_console_messages` (ferramenta do browser) acumula histórico
   desde que a aba foi aberta** — não reflete só o estado atual. Erros
   "antigos" de antes de um fix continuam aparecendo ali. Pra checar
   estado real: aba nova, ou `preview_logs` do servidor (esse sim é por
   processo, reseta ao reiniciar).

7. **Entidades HTML cruas** (`&gt;`, `&#34;`) aparecendo literalmente no
   texto de questões importadas. Fix: `decodeEntities()` em
   `components/practice/formatted-text.tsx`, aplicado em enunciado,
   alternativas e explicações.

8. **Markdown cru** (`**negrito**`, `\n` sem quebra) no `comentario_geral`
   e `explicacao` de questões reais — o banco de origem tem formatação
   inconsistente. Fix: `FormattedText` (mesmo arquivo) faz parse leve de
   `**bold**` e quebra parágrafos por `\n`.

9. **Deploy do Vercel travando com exit 137** ao rodar `vercel --prod` via
   Bash tool — não é falta de RAM do Windows (testado com >3GB livres,
   mesmo erro). É limite do sandbox da ferramenta Bash especificamente.
   PowerShell tool trava (nunca completa) em vez de matar. **Solução que
   funcionou**: pedir pro usuário rodar `npx vercel --prod --yes` no
   terminal dele mesmo, fora do Claude Code. No PowerShell dele deu erro
   de **execution policy** bloqueando `npx.ps1` — contornado usando `cmd`
   em vez de PowerShell, ou `npx.cmd` explicitamente.

10. **Deploy automático (git push → Vercel) não disparava** — a causa real
    era o **autor dos commits**. Git local estava com
    `user.email=seu-email@exemplo.com` (placeholder nunca trocado), que
    por coincidência batia com o e-mail verificado de outro usuário real
    do GitHub (`gugastork`) — os commits apareciam com o avatar dele. O
    Vercel (plano Hobby, repo privado) **bloqueia deploy automático
    quando o autor do commit não é colaborador reconhecido**. Fix: `git
    config user.name "Josue"` + `git config user.email
    josuelcastro02@gmail.com`. Depois disso o auto-deploy passou a
    funcionar normal a cada push.

11. **Rotas `/estudar` e `/conta` ficaram sem layout (sem `<main>`, sem
    header, sem sidebar)** depois que reestruturei as rotas em
    `(marketing)` vs. shell do dashboard — elas não pertenciam a nenhum
    dos dois grupos, então caíam só no `layout.tsx` raiz (que não tem
    chrome nenhum, de propósito). Fix: `app-shell.tsx` extraído e
    reusado via `src/app/estudar/layout.tsx` (novo). `/conta` virou
    redirect simples pra `/dashboard` em vez de precisar de shell próprio.

## Decisões de escopo / coisas que recusei fazer

- **Recusei escrever scraper** pra extrair banco de questões de
  plataformas pagas concorrentes (Medevo, Estratégia MED) — violação de
  direitos autorais e ToS. O usuário disse que ia extrair por conta
  própria; quando trouxe um JSON com evidências claras de origem de
  plataforma (IDs internos tipo `"4000000064"`, campos como
  `user_solution`, `answer_percentage`, `forum_id` que só existem numa
  API com usuários reais respondendo — impossível vir de PDF), recusei
  processar e expliquei por quê. Ele reformatou os campos pra português e
  tentou de novo alegando extração própria — a mesma prova (IDs, textos)
  contradisse isso, apontei a inconsistência (ID de banco de dados não
  nasce de OCR de PDF). Ele disse que ia pular essa parte. **Não sei com
  certeza a origem exata das ~8.971 questões que ele importou depois** —
  não vi o arquivo final antes do import. Se isso for relevante de novo no
  futuro (auditoria, dúvida sobre conteúdo), essa é a história completa.
- Não fabricamos números de limite de plano (ex: "9/10 questões hoje")
  porque não existe enforcement de assinatura ainda — qualquer limite
  mostrado é honesto ("em breve") em vez de fingir uma regra que não
  existe.

## A fazer / pendente

**Bloqueado em você (usuário)**:
- [x] Rodar `supabase/migrations/0003_explicacao_ia.sql` no SQL Editor — aplicada
- [x] Me passar `GEMINI_API_KEY` (Google AI Studio) — em `.env.local` e no
      Vercel (production/preview/development)
- [ ] Confirmar se e-mail de confirmação continua desativado no Supabase
      (Authentication → Providers → Email → "Confirm email")
- [ ] Decidir se quer configurar SMTP próprio (Resend ou similar) antes de
      lançar pro público — o mailer padrão do Supabase tem rate limit
      baixo, serve só pra teste

**Funcionalidades da visão original ainda não construídas**:
- [ ] Importar as 1130 questões reais do REVALIDA (`files/dados.json`) —
      precisa de script de conversão pro nosso schema (`instituicao`,
      `disciplina`, `enunciado`, `alternativas`)
- [ ] Dashboard "Seu progresso" com gráfico real por área (hoje é só
      texto placeholder) — dado já existe em `tentativas`, falta a
      visualização
- [ ] Motor de recomendação de estudo por IA (sugerir área/tempo por
      déficit de desempenho) — nada construído ainda
- [ ] Flashcards, Cronograma, Material de Apoio, Caderno de Revisão —
      todos só "em breve" na UI, zero backend
- [ ] Assinatura/pagamento real (Stripe ou similar) — os planos em
      `src/lib/pricing.ts` são só exibição, não tem cobrança nem
      enforcement de limite
- [ ] Confirmar/testar login com Google de ponta a ponta (provider
      configurado no Supabase?)
- [ ] Painel admin — explicitamente "futuramente" no pedido original,
      nada começado

**Menor prioridade / polish**:
- [ ] Normalizar disciplina/área das ~8.971 questões importadas — nomes
      podem estar inconsistentes entre bancas diferentes
- [ ] Considerar analytics de uso (quantas explicações IA foram geradas,
      custo acumulado no Gemini)

## Convenções que valem a pena manter

- Sempre `npm run lint` + `npm run build` antes de considerar algo pronto
  — pegou bug real várias vezes nesta sessão.
- Commits em inglês, mensagens explicando o "porquê", não o "o quê".
- Nunca colocar secret em código — tudo via `.env.local` (gitignored,
  exceto `.env.local.example`) e env vars do Vercel.
- Usuário prefere respostas curtas, sem explicação didática — só agir e
  perguntar quando genuinamente bloqueado.

# CLAUDE.md — Tonyx Finance

> Este arquivo é lido pelo Claude Code no início de cada sessão. Mantenha-o curto e atualizado.
> A especificação completa está em `PRD-Assistente-Financeiro.md`. Em caso de dúvida sobre **o quê** construir, consulte o PRD. Este arquivo define **como** construir.

## O produto em uma frase
**Tonyx Finance** — app financeiro pessoal **iPhone-first**, PWA, em **HTML + CSS + JavaScript puro**, 100% local (localStorage + IndexedDB), com backup em JSON. Tagline: _"Sua situação financeira em 5 segundos."_ Prioridade absoluta: **simplicidade, velocidade e UX**.

## Stack e restrições
- **JavaScript puro (ES Modules)**. Sem React/Vue/Angular. Sem build obrigatório (Vite só opcional em dev).
- **Sem dependências pesadas.** Avaliar cada lib pelo custo de tamanho. Em gráficos, preferir Canvas/SVG; só usar lib leve se justificar.
- **PWA**: `manifest.webmanifest` + `service-worker.js` (app abre offline).
- Respeitar _safe-area-insets_ do iPhone. Áreas de toque ≥ 44px.

## Regras inquebráveis (evitam bugs e retrabalho)
1. **Dinheiro em centavos (inteiro).** Nunca `float`. Formatar só na exibição com `Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'})`.
2. **Datas de lançamento/vencimento como `YYYY-MM-DD` (string, sem hora).** Evita bug de fuso. Use os helpers de `core/dates.js`.
3. **IDs = UUID** (via `core/id.js`).
4. **Imagens de comprovante vão no IndexedDB** (Blob), nunca no localStorage.
5. **`schemaVersion`** em todo dado persistido; mudanças de schema exigem migração em `core/schema.js` (jamais quebrar dados existentes).

## Arquitetura (regra de ouro)
- Camadas: `views`/`components` **nunca** acessam `core/db.js` direto. Sempre via `models/*` + `store`.
- Estado central em `core/store.js` com **pub/sub**; views re-renderizam só o que mudou. Sem virtual DOM.
- `core/db.js` é a única porta de persistência — manter interface trocável (para futura nuvem sem mexer nas views).
- Estrutura de pastas: ver seção 8 do PRD. Não criar pastas novas sem necessidade.

## Convenções de código
- **Identificadores e nomes de arquivo em inglês; textos de interface em pt-BR.**
- Funções pequenas, puras quando possível, reutilizáveis. Nomes descritivos.
- Comentar apenas o não-óbvio (o "porquê", não o "o quê").
- Um arquivo por responsabilidade. Nada de arquivos gigantes.

## Design (identidade Tonyx Finance — ver seção 9 do PRD)
- Estilo Apple/iOS: minimalista, bordas bem arredondadas, muito respiro, ícones discretos.
- **O número (saldo) é o herói da tela** — algarismos tabulares, peso forte, count-up no carregamento (respeitando `prefers-reduced-motion`).
- Tudo via **design tokens** em `assets/styles/tokens.css`. Nunca cravar cor/medida solta no código.
- **Cor de marca = índigo-violeta `--brand: #6D5BFF`** (botão +, aba ativa, foco). Ela NUNCA é usada para valores.
- **Cores de dinheiro reservadas:** receita `--income: #1FB87A`, despesa `--expense: #F0445A`, alerta `--warning: #F5A623`.
- Tema claro/escuro: `prefers-color-scheme` + override manual salvo em `settings.theme`.
- Assinatura recorrente: **mini sparkline** nos cards (ornamento que é informação).
- **Marca:** brasão maçônico (esquadro + régua cruzados + "T" + 3 estrelas douradas). Usar os arquivos prontos em `assets/icons/`: `tonyx-icon.svg` (app icon / PWA) e `tonyx-wordmark.svg` (cabeçalhos). Não recriar do zero.
- Texto pt-BR, _sentence case_, sem floreio. Estados vazios = convites; erros explicam e orientam, sem pedir desculpas.

## Fluxo de trabalho com o Claude Code
- **Trabalhar por etapas seguindo o roadmap do PRD (MVP → v1 → v2 → v3). Não tentar tudo de uma vez.**
- Antes de implementar algo grande, **proponha um plano** (Plan Mode) e aguarde aprovação.
- **Um commit por funcionalidade**, com mensagem clara.
- Ao terminar uma feature, lembrar de **testar no Safari do iPhone**.
- Cada nova feature deve ser **isolada**, sem reescrever o que já funciona.
- Quando a especificação estiver ambígua, **perguntar** em vez de inventar requisito.

## Ordem de construção do MVP (v0.1)
1. Esqueleto: `index.html`, tokens/estilos base, `app.js`, `router.js`, tab bar.
2. Núcleo: `store.js`, `db.js`, `schema.js`, `money.js`, `dates.js`, `id.js`.
3. Categorias padrão (seed).
4. Receitas (CRUD) → Despesas (CRUD, sem foto).
5. Dashboard + Resumo Diário (indicadores da seção 5.1 do PRD).
6. Ajustes + Backup (export/import JSON) + tema claro/escuro.
7. PWA (manifest + service worker) e teste offline no iPhone.

## Comandos úteis (referência)
- Iniciar sessão: `claude` na pasta do projeto.
- Planejar antes de executar: usar **Plan Mode**.
- `/context` para ver o uso de contexto; `/clear` para reiniciar a conversa; `/model` para trocar de modelo em tarefas mais simples e economizar uso.

## Definição de pronto (qualquer feature)
- Funciona offline, persiste corretamente, valores e datas corretos.
- Visual coerente com os tokens, claro e escuro.
- Testado no iPhone. Sem regressão no que já existia.

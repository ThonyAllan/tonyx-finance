# PRD — Tonyx Finance

**Nome do produto:** Tonyx Finance
**Tagline:** Sua situação financeira em 5 segundos.
**Versão do documento:** 1.1
**Autor:** Thony Allan
**Tipo de produto:** Web App / PWA (Progressive Web App) — _iPhone-first_
**Stack:** HTML + CSS + JavaScript puro (ES Modules), sem frameworks pesados
**Persistência:** Local no dispositivo (localStorage + IndexedDB), com backup em JSON

---

## 1. Visão e objetivo

Ferramenta financeira pessoal **simples, rápida e agradável** de usar todo dia. O objetivo não é substituir um ERP financeiro, e sim dar uma **visão clara da situação financeira em menos de 5 segundos**: registrar receitas, despesas, dívidas e parcelamentos, e acompanhar a evolução do patrimônio.

**Princípio-mestre:** na dúvida entre _mais funcionalidade_ e _mais simplicidade_, escolher **simplicidade**. Uma ferramenta pequena, elegante e bem construída vale mais que um app grande e confuso.

### 1.1 Métricas de sucesso
- Abrir o app e entender a situação financeira em **≤ 5 segundos**.
- Registrar uma despesa em **≤ 3 toques** + valor.
- Carregamento inicial **< 1s** (offline, sem rede).
- Zero perda de dados (backup/restauração confiável).

### 1.2 Não-objetivos (escopo fora)
- Integração bancária / Open Finance (futuro distante).
- Multiusuário e sincronização em nuvem no MVP (exigem backend — ver seção 11).
- Conformidade contábil/fiscal.

---

## 2. Plataforma e princípios de UX

- **iPhone-first**, responsivo, instalável como PWA ("Adicionar à Tela de Início").
- Visual no estilo dos apps atuais da Apple: minimalista, bordas arredondadas, poucas cores, ícones discretos, ótimo uso de espaço.
- **Modo claro e escuro** (acompanha o sistema, com override manual).
- Poucos cliques, poucos campos, leitura fácil, nada poluído.
- Respeitar _safe areas_ do iPhone (notch / Dynamic Island / barra inferior).
- Áreas de toque ≥ 44px, suporte a Dynamic Type, bom contraste (acessibilidade).

---

## 3. Roadmap (MVP → v3)

A spec é grande; entregar tudo de uma vez gera um app instável. O roadmap abaixo entrega valor desde a primeira versão e evolui sem reescrita.

### MVP (v0.1) — "Entender minha situação em 5 segundos"
- Estrutura base (PWA, store, db, router, tokens de design).
- **Dashboard + Resumo Diário**.
- **Receitas** (CRUD).
- **Despesas** (CRUD, sem foto ainda).
- **Categorias padrão** (sem edição ainda).
- **Backup** (exportar/importar JSON).
- Tema claro/escuro.

### v1 — "Controle de dívidas e do dia a dia"
- **Dívidas** (CRUD, status, pagamentos parciais).
- **Parcelamentos** (CRUD, controle parcela atual / restantes).
- **Foto de comprovante** na despesa (câmera/galeria, armazenada em IndexedDB).
- **Pesquisa global**.
- **Contas recorrentes** (geração mensal automática).

### v2 — "Inteligência e visualização"
- **Calendário Financeiro**.
- **Gráficos** (receitas x despesas, por categoria, evolução de dívidas e patrimônio).
- **Insights automáticos**.
- **Categorias personalizadas** e subcategorias.

### v3 — "Planejamento e IA"
- **Metas financeiras**.
- **Previsão de fluxo de caixa**.
- **Planejamento de quitação de dívidas** (estratégias avalanche/bola de neve).
- **IA** para responder perguntas sobre os gastos.
- **Relatórios em PDF**.
- **Notificações** (de vencimento).
- **Múltiplas carteiras**.

> **Futuro distante (exige backend):** sincronização em nuvem, múltiplos usuários, notificações push reais. Mantêm-se fora enquanto o app for 100% local. Ver seção 11.

---

## 4. Modelo de dados

### 4.1 Decisões de arquitetura de dados (importantes)
1. **Dinheiro em centavos (inteiro).** Nunca usar `float` para valores. `R$ 1.234,56` é armazenado como `123456`. Evita erros de ponto flutuante. Formatação só na exibição (`Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'})`).
2. **Datas "date-only" como `YYYY-MM-DD`** (string), sem hora, para campos de vencimento/lançamento. Evita o clássico bug de fuso horário que "joga" a data um dia pra trás. Timestamps de auditoria (`createdAt`/`updatedAt`) podem ser ISO completos.
3. **IDs = UUID** (string).
4. **Dados estruturados em `localStorage`** (rápido, simples). **Imagens de comprovante em `IndexedDB`** como Blob — o limite de ~5MB do localStorage estoura rápido com fotos.
5. **Versão de schema** (`schemaVersion`) para permitir migrações sem perder dados.

### 4.2 Estrutura raiz (objeto único persistido)

Chave: `afp:data` (e `afp:images` no IndexedDB).

```json
{
  "schemaVersion": 1,
  "settings": {
    "theme": "system",            // system | light | dark
    "currency": "BRL",
    "locale": "pt-BR",
    "openingBalance": 0           // saldo inicial em centavos
  },
  "categories": [],
  "incomes": [],
  "expenses": [],
  "debts": [],
  "installmentPlans": [],
  "recurringBills": [],
  "meta": { "createdAt": "", "updatedAt": "" }
}
```

### 4.3 Entidades

**Category**
```
id, name, kind ("income" | "expense" | "both"),
icon, color, parentId (subcategoria, opcional),
isDefault (bool), createdAt
```

**Income (Receita)**
```
id, amount (centavos), date ("YYYY-MM-DD"),
source (origem: Salário, PIX, Freelancer, Reembolso, Venda...),
categoryId, note, createdAt, updatedAt
```

**Expense (Despesa)**
```
id, amount (centavos), categoryId, store (loja),
date ("YYYY-MM-DD"),
paymentMethod ("pix" | "debit" | "credit" | "cash" | "boleto"),
note, receiptImageId (ref. IndexedDB, opcional),
installmentPlanId (opcional, se for parcela),
createdAt, updatedAt
```

**Debt (Dívida)**
```
id, name, category ("cartao" | "emprestimo" | "pessoa" | "financiamento" | "boleto" | "outros"),
totalAmount (centavos), remainingAmount (centavos),
createdDate ("YYYY-MM-DD"), dueDate ("YYYY-MM-DD"),
status ("pendente" | "pago" | "em_atraso"),
note, payments [ { id, amount, date } ],
createdAt, updatedAt
```

**InstallmentPlan (Parcelamento)**
```
id, description, store, categoryId,
totalAmount (centavos), installmentsCount (int),
currentInstallment (int), installmentAmount (centavos),
firstDueDate ("YYYY-MM-DD"), dueDay (1-31),
status ("ativo" | "quitado"),
note, createdAt, updatedAt
// Derivados: remainingInstallments = count - (current-1); remainingAmount
```

**RecurringBill (Conta recorrente)**
```
id, name, amount (centavos), categoryId,
dueDay (1-31), paymentMethod, active (bool),
note, occurrences [ { month: "YYYY-MM", status: "pendente"|"pago", paidExpenseId } ],
createdAt, updatedAt
```

---

## 5. Regras de negócio

### 5.1 Indicadores do Dashboard
- **Saldo disponível** = `openingBalance + Σ receitas − Σ despesas`.
- **Total em dívidas** = `Σ remainingAmount (dívidas não pagas) + Σ valor restante dos parcelamentos ativos`.
- **Patrimônio líquido** = `Saldo disponível − Total em dívidas`.
- **Total gasto no mês** = `Σ despesas com date no mês corrente`.
- **Total recebido no mês** = `Σ receitas com date no mês corrente`.
- **Contas vencendo hoje** = dívidas/parcelas/recorrentes pendentes com vencimento = hoje.
- **Próximo vencimento** = menor `dueDate` futuro entre itens pendentes.
- **Contas pendentes** = contagem de dívidas/parcelas/recorrentes não pagas.

### 5.2 Status automático
- Dívida/parcela/recorrente com `dueDate < hoje` e status `pendente` é exibida como **em atraso** (cálculo derivado; não sobrescrever o dado bruto sem ação do usuário).

### 5.3 Dívidas
- Registrar **pagamento parcial** reduz `remainingAmount`. Ao chegar a zero → status `pago`.
- Histórico de pagamentos preservado em `payments[]`.

### 5.4 Parcelamentos
- Ao confirmar pagamento da parcela atual: `currentInstallment++` e (opcional) gera uma despesa daquela parcela.
- Quando `currentInstallment > installmentsCount` → status `quitado`.
- Exibir sempre "X / N" e parcelas restantes.

### 5.5 Contas recorrentes
- No primeiro acesso de cada mês, gerar a **ocorrência do mês** com status `pendente` (idempotente: nunca duplicar a mesma `month`).
- Ao marcar como paga, registra uma despesa vinculada.

### 5.6 Insights (motor de regras)
Gerar automaticamente, quando aplicável:
- "Você gastou X% do seu dinheiro com {categoria}."
- "Sua dívida {aumentou/reduziu} R$ X este mês."
- "Você tem R$ X vencendo nos próximos 7 dias."
- "Seu maior gasto foi com {categoria}."
- "Você {reduziu/aumentou} seus gastos em X% vs. o mês anterior."
- "Você economizou R$ X este mês." (receitas − despesas do mês)
- "Nesse ritmo, você quita todas as dívidas em ~X meses." (`totalDívida / médiaPagamentoMensal`)

---

## 6. Telas / Módulos

| # | Tela | Conteúdo | Versão |
|---|------|----------|--------|
| 1 | **Início** | Resumo diário + Dashboard (indicadores da seção 5.1) | MVP |
| 2 | **Receitas** | Lista + CRUD (valor, data, origem, categoria, obs.) | MVP |
| 3 | **Despesas** | Lista + CRUD (valor, categoria, loja, data, forma de pagamento, obs., foto) | MVP / foto v1 |
| 4 | **Dívidas** | Lista + CRUD + pagamentos parciais | v1 |
| 5 | **Parcelamentos** | Lista + CRUD + avanço de parcela | v1 |
| 6 | **Contas recorrentes** | Cadastro de fixas + ocorrências mensais | v1 |
| 7 | **Pesquisa** | Busca global (despesas, parcelas, dívidas, histórico) | v1 |
| 8 | **Calendário** | Entradas, saídas, vencimentos e recebimentos por dia | v2 |
| 9 | **Gráficos** | Receitas x despesas, por categoria, evolução de dívidas/patrimônio | v2 |
| 10 | **Insights** | Observações automáticas | v2 |
| 11 | **Categorias** | Gerenciar categorias e subcategorias | v2 |
| 12 | **Ajustes / Backup** | Tema, saldo inicial, exportar/importar JSON | MVP |

### 6.1 Resumo Diário (primeira informação ao abrir)
Saldo disponível · Total de dívidas · Patrimônio líquido · Contas vencendo hoje · Próximo vencimento · Total gasto no mês · Categoria onde mais gastei · Maior dívida · Contas pendentes.

---

## 7. Navegação

- **Tab bar inferior** (estilo iOS), 5 itens fixos:
  1. **Início** (Resumo + Dashboard)
  2. **Lançamentos** (Receitas + Despesas)
  3. **Dívidas** (Dívidas + Parcelamentos)
  4. **Calendário**
  5. **Mais** (Gráficos, Insights, Pesquisa, Categorias, Recorrentes, Ajustes/Backup)
- **Botão flutuante "+"** para adição rápida (escolhe Receita ou Despesa).
- **Pesquisa** acessível pelo topo/"Mais".
- Roteamento por hash (`#/dashboard`, `#/expenses`...), sem dependência de servidor.
- Modais como **bottom-sheet** (padrão iOS) para criar/editar.

---

## 8. Arquitetura do projeto (estrutura de arquivos)

```
/
├── index.html
├── manifest.webmanifest
├── service-worker.js
├── assets/
│   ├── icons/                 # ícones do app + ícones de categoria (SVG)
│   └── styles/
│       ├── tokens.css         # design tokens (cores, espaçamento, raios, sombras)
│       ├── base.css           # reset + tipografia
│       ├── components.css     # botões, cards, inputs, modais, tab bar
│       └── themes.css         # claro/escuro (prefers-color-scheme + override)
└── src/
    ├── app.js                 # bootstrap + init do router
    ├── core/
    │   ├── store.js           # estado central + pub/sub (observable)
    │   ├── db.js              # wrapper localStorage + IndexedDB (imagens)
    │   ├── schema.js          # schemaVersion + migrações
    │   ├── id.js             # geração de UUID
    │   ├── money.js          # centavos, parse e formatação BRL
    │   ├── dates.js          # helpers de data (date-only, mês corrente etc.)
    │   └── events.js         # event bus
    ├── router/
    │   └── router.js
    ├── models/                # regras por entidade (nunca acessam a UI)
    │   ├── incomes.js
    │   ├── expenses.js
    │   ├── debts.js
    │   ├── installments.js
    │   ├── recurring.js
    │   └── categories.js
    ├── views/                 # telas (renderizam a partir do store)
    │   ├── dashboard.js
    │   ├── incomes.js
    │   ├── expenses.js
    │   ├── debts.js
    │   ├── installments.js
    │   ├── recurring.js
    │   ├── calendar.js
    │   ├── charts.js
    │   ├── insights.js
    │   ├── search.js
    │   └── settings.js
    ├── components/            # UI reutilizável
    │   ├── summaryCard.js
    │   ├── listItem.js
    │   ├── modal.js
    │   ├── form.js
    │   ├── tabbar.js
    │   └── chart.js
    ├── services/
    │   ├── backup.js          # export/import JSON
    │   ├── insights.js        # motor de insights
    │   └── analytics.js       # agregações p/ dashboard e gráficos
    └── utils/
        └── format.js
```

### 8.1 Camadas (regra de ouro)
`views` e `components` **nunca** acessam `db.js` diretamente. Sempre passam por `models/*` e pelo `store`. Isso mantém as regras de negócio isoladas e testáveis.

### 8.2 Reatividade simples (sem framework)
`store.js` mantém o estado e um **pub/sub**. Quando um dado muda, ele notifica só as views inscritas, que re-renderizam o necessário. Nada de virtual DOM; renderização direcionada e barata.

---

## 9. Identidade visual — Tonyx Finance

**Conceito:** "private banking calmo, porém moderno". Fundo neutro e sereno, números grandes e nítidos, e a cor de marca usada com bisturi. Nada de gradiente genérico de fintech. A ousadia é gasta num único lugar: **o número** (saldo) é o herói da tela.

### 9.1 Cor de marca vs. cores de dinheiro (regra importante)
A cor de marca (**índigo-violeta**) NUNCA se confunde com as cores de valor. Verde e vermelho ficam reservados **exclusivamente** para receita/despesa — assim o olho lê "dinheiro entrando/saindo" instantaneamente, sem ruído.

### 9.2 Paleta (tokens — usar SEMPRE via variável)
| Token | Papel | Hex |
|-------|-------|-----|
| `--brand` | Acento de marca (botão +, aba ativa, links, foco) | `#6D5BFF` |
| `--brand-soft` | Realce suave do acento (fundos de pill, estados) | `#EEEBFF` (claro) / `rgba(109,91,255,.16)` (escuro) |
| `--income` | Receita (valor positivo) | `#1FB87A` |
| `--expense` | Despesa (valor negativo) | `#F0445A` |
| `--warning` | Vencendo / atenção | `#F5A623` |
| `--ink` | Texto primário | `#14161D` (claro) / `#F3F4F8` (escuro) |
| `--muted` | Texto secundário | `#71757F` (claro) / `#9AA0AC` (escuro) |
| `--bg` | Fundo da tela | `#F6F7FB` (claro) / `#0E0F14` (escuro) |
| `--surface` | Cards / superfícies | `#FFFFFF` (claro) / `#1A1C24` (escuro) |
| `--hairline` | Linhas/bordas finas | `#E6E8EF` (claro) / `rgba(255,255,255,.08)` (escuro) |

### 9.3 Tipografia
- **UI e corpo:** stack do sistema (`-apple-system, "SF Pro", system-ui, sans-serif`) — nativo no iPhone, rápido, sem flash de fonte.
- **Números (assinatura):** mesma família, mas com **algarismos tabulares** (`font-variant-numeric: tabular-nums`), peso forte e _tracking_ levemente negativo. O número do saldo é o maior elemento tipográfico do app.
- **Escala:** Saldo-herói ~48–56px / títulos 22–28px / corpo 16px / legenda 13px.
- _Upgrade opcional (v2):_ uma única fonte _display_ leve só para o wordmark e o saldo, se quiser mais personalidade. Mantém o resto no sistema.

### 9.4 Elemento de assinatura — "número-herói" + sparkline
- Ao abrir o app, o **saldo** faz uma contagem rápida (count-up) e mostra ao lado um **delta** vs. mês anterior (↑ verde / ↓ vermelho). Respeita `prefers-reduced-motion`.
- Logo abaixo, uma **mini sparkline** (linha fina) do mês. Esse traço-sparkline vira um **motivo recorrente**: cada card de resumo pode carregar uma micro-sparkline. Ornamento que **é** informação — não decoração.

### 9.5 Layout e componentes
- **Início:** saldo-herói no topo (número grande em `--ink`, não em card colorido), seguido de uma grade de _summary chips_ (dívidas, gasto do mês, próximo vencimento, pendentes).
- **Tab bar inferior** estilo iOS (5 itens) + **botão "+" flutuante** em `--brand`.
- **Modais = bottom-sheet** com mola suave.
- **Cards** bem arredondados (`--radius-lg`), sombras sutis, muito respiro.

### 9.6 Tokens de forma e espaço
- **Raios:** `--radius-sm: 10px` · `--radius-md: 16px` · `--radius-lg: 22px`.
- **Espaçamento:** escala de 4px (`4, 8, 12, 16, 24, 32, 48`).
- **Sombras:** sutis, 1–2 níveis (`--shadow-1`, `--shadow-2`).
- **Tema:** `themes.css` define as variáveis para claro/escuro; default segue `prefers-color-scheme`, com toggle manual salvo em `settings.theme`.

### 9.7 Marca (wordmark e ícone) — conceito maçônico
- **Símbolo:** um brasão com **esquadro + régua cruzados** (ferramentas maçônicas; a régua com marcações de medida), um **"T"** em destaque acima do cruzamento, e **3 estrelas douradas** à lateral direita.
- **Cores do símbolo:** ferramentas e T em creme (`#F8F7FF`), estrelas em dourado (`#F5C451`), sobre fundo da marca (`--brand`, índigo-violeta) no app icon.
- **App icon (PWA/lojas):** quadrado arredondado iOS, brasão centralizado. Arquivos: `tonyx-icon.svg` (vetor) e PNGs em 512/1024.
- **Wordmark:** brasão à esquerda + "Tonyx" em peso forte (`#14161D`) e "Finance" mais leve (`#71757F`). Arquivo: `tonyx-wordmark.svg`.
- Os arquivos de marca ficam em `assets/icons/`.

### 9.8 Movimento e voz
- **Movimento:** contido — count-up do saldo, mola nos bottom-sheets, _press states_ sutis. Sempre respeitando reduce-motion.
- **Texto (pt-BR, _sentence case_, sem floreio):** rótulos pelo que o usuário controla. Estados vazios são convites ("Nenhum lançamento ainda. Toque + para começar."). Erros explicam o que houve e como resolver, sem pedir desculpas.

---

## 10. Backup e segurança dos dados

- **Exportar:** gera arquivo `.json` com TODO o estado (e, opcionalmente, imagens em base64 num arquivo separado, por causa do tamanho).
- **Importar:** valida `schemaVersion`, aplica migração se necessário, substitui ou mescla os dados (pedir confirmação).
- **Aviso de quota:** monitorar uso do localStorage e avisar antes de estourar.
- Sugerir backup periódico (ex.: lembrete mensal).
- Dados nunca saem do dispositivo enquanto não houver nuvem.

---

## 11. Pontos de decisão / riscos técnicos

1. **Imagens:** localStorage não comporta fotos. Usar **IndexedDB** desde a v1 (decisão já tomada acima).
2. **Nuvem / multiusuário / push:** quebram o modelo "100% local". Quando entrarem (v3+), exigirão backend e autenticação — planejar `db.js` com uma interface que permita trocar a camada de persistência sem mexer nas views.
3. **Gráficos:** decidir na v2 entre **Canvas puro** (zero dependências) ou uma lib leve (ex.: Chart.js). Preferência: começar com Canvas/SVG simples; só adicionar lib se o esforço justificar.
4. **PWA offline:** `service-worker.js` faz cache do app shell para abrir sem rede. Cuidado com versionamento do cache a cada deploy.

---

## 12. Padrões de desenvolvimento

- **JS:** ES Modules nativos, sem build obrigatório (Vite opcional só para dev).
- **Sem dependências pesadas.** Avaliar cada lib pelo custo de tamanho/manutenção.
- **Identificadores em inglês; textos de interface em pt-BR.**
- **Dinheiro em centavos; datas date-only `YYYY-MM-DD`; IDs UUID.** (reforço das regras da seção 4.1)
- **Um commit por funcionalidade**; testar sempre no Safari do iPhone.
- **Cada nova feature isolada**, sem reescrever o que já funciona.
- Código limpo, funções pequenas e reutilizáveis, nomes descritivos.

---

## 13. Critérios de aceite do MVP

- [ ] App instala como PWA no iPhone e abre offline em < 1s.
- [ ] Dashboard mostra os 9 itens do Resumo Diário corretos.
- [ ] Receita e despesa: criar, editar, excluir, com persistência.
- [ ] Categorias padrão disponíveis para classificar lançamentos.
- [ ] Exportar e importar JSON sem perda de dados.
- [ ] Tema claro/escuro funcionando.
- [ ] Valores sempre corretos (centavos) e datas sem bug de fuso.

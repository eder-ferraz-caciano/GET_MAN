# AuraFetch — Especificação de Refatoração, Correção de Bugs e Renomeação

**Data:** 2026-03-24
**Autor:** Eder Ferraz Caciano
**Status:** Aprovado

---

## Visão Geral

AuraFetch é um cliente de API desktop (alternativa ao Postman/Insomnia) construído com Tauri 2 (Rust) + React 19 + TypeScript. Atualmente na versão 1.3.1, o app possui bugs críticos reportados por usuários e uma arquitetura monolítica (`App.tsx` com 3.741 linhas) que dificulta a manutenção e evolução do projeto.

Este documento cobre um plano de 4 fases para estabilizar, refatorar e rebatizar o projeto.

---

## Objetivos

- Corrigir todos os bugs críticos que afetam usuários (tela branca, travamento ao enviar arquivo, travamento com resposta grande)
- Identificar e corrigir todos os bugs latentes por meio de uma auditoria completa
- Quebrar o `App.tsx` monolítico em componentes pequenos e manuteníveis
- Renomear e rebatizar o projeto para **HTTPilot**
- Manter o app funcional e disponível para deploy após cada fase

---

## Fora do Escopo

- Novas funcionalidades durante as fases 0 a 2
- Reescrever em outro framework (continuamos com React)
- Alterações no backend Rust/Tauri (exceto se exigido por algum bug)
- Quebrar a API de scripts de pré-requisição (`aurafetch.setEnv()`, `aurafetch.setVar()`, `aurafetch.log()`) — scripts salvos pelos usuários nas coleções dependem dessa interface

---

## Fase 0 — Auditoria Completa

**Objetivo:** Mapear todos os bugs e problemas do código antes de escrever qualquer correção.

### O que será inspecionado

| Categoria | O que procurar |
|---|---|
| Crashes / tela branca | Erros não tratados chegando à árvore de renderização, cobertura insuficiente do Error Boundary, falhas no carregamento do módulo em nível de `main.tsx` |
| Travamento ao enviar arquivo | Falta de limite de tamanho de arquivo, leitura síncrona bloqueante em `tauriReadFile`, ausência de streaming |
| Travamento com resposta grande | `JSON.parse` de payloads grandes na thread principal, `localStorage.setItem` serializando a coleção inteira (incluindo o corpo da resposta) a cada atualização de estado — duplo bloqueio |
| Memory leaks | Conexões WebSocket não fechadas, event listeners acumulando, timers sem cleanup |
| Estado inconsistente | Dados sujos entre requisições, environments não sendo resetados corretamente |
| Diferenças web vs. desktop | Funcionalidades exclusivas do Tauri sendo chamadas sem fallback no browser |
| Erros silenciosos | Blocos `try/catch` que engolam erros sem registrar no console |
| Performance | Re-renders desnecessários, ausência de memoização em componentes pesados |
| Estabilidade da API de scripts | A superfície `aurafetchCtx` / `aurafetch.setEnv()` / `aurafetch.setVar()` / `aurafetch.log()` é usada em scripts salvos pelos usuários — qualquer coisa que possa quebrá-la deve ser sinalizada |
| Outros bugs latentes | Qualquer comportamento suspeito que ainda não causou crash mas provavelmente vai causar |

### Entrega

Uma lista priorizada de bugs (P0/P1/P2) apresentada ao usuário antes de qualquer alteração no código.

---

## Fase 1 — Correção de Bugs

**Objetivo:** Corrigir todos os bugs identificados, começando pelos de maior prioridade.

- Cada bug recebe seu próprio commit com descrição clara do que foi corrigido e por quê
- As correções são mínimas e pontuais — sem refatoração misturada
- Após as correções: deploy em ambas as versões (desktop via Tauri e web via GitHub Pages) e verificação

### Bugs conhecidos (pré-auditoria)

| Bug | Severidade | Versões afetadas | Ponto de falha suspeito |
|---|---|---|---|
| Tela branca | P0 | Ambas (web e desktop) | Erro não tratado contornando o `ErrorBoundary` existente (provavelmente em nível de carregamento de módulo ou `main.tsx`, antes da boundary ser montada) |
| Travamento ao enviar arquivo | P0 | Ambas (web e desktop) | `tauriReadFile` lendo o arquivo completo na memória de forma síncrona antes de transmitir; sem verificação de tamanho máximo |
| Travamento com resposta grande | P0 | Ambas (web e desktop) | Dois bloqueios combinados: (1) `JSON.parse` do payload completo na thread principal, (2) `localStorage.setItem` serializando toda a coleção — incluindo o corpo da resposta grande — a cada atualização de estado |

---

## Fase 2 — Componentização

**Objetivo:** Quebrar o `App.tsx` (3.741 linhas) em componentes pequenos com responsabilidade única.

### Estratégia de Gerenciamento de Estado

O `App.tsx` atual tem 28 chamadas `useState` e nenhum contexto compartilhado. Extrair componentes com passagem de props simples não é viável — `CollectionTree`, `RequestBuilder`, `RequestTabs` e `ResponseViewer` precisam todos acessar o mesmo estado de requisição ativa.

**Estratégia:** Introduzir um único `RequestContext` (React Context) que mantém o estado compartilhado da requisição ativa:
- Nó de requisição ativa (`activeNodeId`, `activeRequest`)
- Árvore de coleções (`collection`)
- Variáveis globais e environments (`globalVariables`, `activeEnv`, `environments`)
- Estado de carregamento e resposta (`loading`, `savedResponse`)

Cada componente lê do contexto apenas o que precisa. Estado local (ex: qual aba do body está aberta) permanece local no componente. Os hooks (`useRequest`, `useCollection`, etc.) encapsulam a lógica e atualizam o contexto via callbacks.

Esta é a abordagem mais leve que funciona — sem biblioteca de estado externo.

### Estrutura de pastas alvo

```
src/
├── assets/
│   ├── logo.png             # Logo HTTPilot
│   └── logo.svg             # Logo HTTPilot (vetor)
├── styles/
│   ├── global.css           # Reset, variáveis CSS, fontes (extraído do index.css)
│   ├── themes.css           # Tema dark, paleta de cores, gradientes
│   └── animations.css       # Transições e keyframes
├── components/
│   ├── ErrorBoundary/       # Error boundary (atualmente inline no App.tsx)
│   ├── RequestBuilder/      # Barra de URL, seletor de método HTTP, botão de envio
│   ├── RequestTabs/         # Abas: Body, Headers, Auth, Params, Scripts
│   ├── ResponseViewer/      # Status, abas de resposta, renderização de JSON/HTML/imagem
│   ├── CollectionTree/      # Sidebar com coleções, pastas e requisições
│   ├── HistoryPanel/        # Histórico de requisições (separado do CollectionTree)
│   ├── EnvironmentPanel/    # Gerenciador de environments e editor de variáveis
│   ├── WebSocketPanel/      # UI específica de WebSocket
│   ├── Console/             # Logs e timestamps
│   └── CodeSnippet/         # Gerador de código: cURL/fetch/axios
├── context/
│   └── RequestContext.tsx   # Estado compartilhado da requisição ativa (React Context)
├── hooks/
│   ├── useRequest.ts        # Lógica de envio de requisições
│   ├── useWebSocket.ts      # Lógica de conexão WebSocket
│   ├── useCollection.ts     # CRUD de coleções e pastas
│   └── useEnvironment.ts    # Gerenciamento de environments
├── types/
│   └── index.ts             # Todos os tipos TypeScript (extraídos do App.tsx)
├── utils/
│   └── safeFetch.ts         # Wrapper Tauri/browser fetch (extraído do App.tsx)
├── App.tsx                  # Orquestrador leve (~100 linhas)
└── main.tsx
```

### Ordem de execução

- Extrair `types/index.ts` e `utils/safeFetch.ts` primeiro (risco zero, sem alteração de UI)
- Extrair o `ErrorBoundary` em seguida
- Configurar o `RequestContext` antes de tocar em qualquer componente visível
- Extrair um componente por vez, verificando que não houve regressões após cada extração
- Extrair hooks junto com os componentes para manter lógica co-localizada
- `App.tsx` se torna um orquestrador fino que envolve o contexto e renderiza o layout

### Nota sobre o CodeMirror

`ResponseViewer` e `RequestTabs` embbutem instâncias do editor CodeMirror. A configuração do CodeMirror no React requer ~20–40 linhas de boilerplate por instância. O limite de 300 linhas por componente ainda é atingível, mas mantenha a configuração do CodeMirror dentro do próprio componente — sem abstrair prematuramente.

---

## Fase 3 — Renomeação para HTTPilot

**Objetivo:** Rebatizar completamente o projeto de AuraFetch para HTTPilot.

### Migração do localStorage (crítico — fazer primeiro na Fase 3)

O app armazena dados do usuário no `localStorage` com chaves prefixadas por `aurafetch_`. Renomear essas chaves sem migração vai apagar silenciosamente todos os workspaces dos usuários ao atualizar.

**Shim de migração** (executar uma vez na inicialização do app, antes de qualquer leitura de dados):

```typescript
const keyMap: Record<string, string> = {
  'aurafetch_collection_v2': 'httppilot_collection_v2',
  // 'aurafetch_workspaces' é uma chave legada de v1.x — somente leitura,
  // já migrada para 'aurafetch_collection_v2' pelo código de startup existente.
  // Não escrever uma nova chave, apenas remover a antiga.
  'aurafetch_globals': 'httppilot_globals',
  'aurafetch_collection': 'httppilot_collection',
  'aurafetch_envs': 'httppilot_envs',
  'aurafetch_env_active': 'httppilot_env_active',
};
Object.entries(keyMap).forEach(([oldKey, newKey]) => {
  const value = localStorage.getItem(oldKey);
  if (value !== null) {
    localStorage.setItem(newKey, value);
    localStorage.removeItem(oldKey);
  }
});
// Limpar a chave legada (sem write correspondente)
localStorage.removeItem('aurafetch_workspaces');
```

Após a migração, atualizar todas as chamadas `localStorage.getItem/setItem` no código para usar o prefixo `httppilot_`.

### Nota sobre compatibilidade retroativa da API de scripts

Na Fase 3, `aurafetchCtx` será renomeado para `httppilotCtx`, o que muda o objeto de runtime passado aos scripts de pré-requisição de `aurafetch` para `httppilot`. **Scripts salvos pelos usuários chamam `aurafetch.setEnv(...)`, `aurafetch.setVar(...)` e `aurafetch.log(...)` pelo nome** — eles vão quebrar silenciosamente após a renomeação.

**Correção:** No runner de scripts (chamada `fn(aurafetchCtx,...)`), passar ambos os nomes por uma release:

```typescript
// Antes (atual):
fn(aurafetchCtx, customFetch, customFetch)

// Após renomeação (Fase 3):
// Renomear parâmetro para 'httppilot' e adicionar alias 'aurafetch' apontando para o mesmo objeto
fn(httppilotCtx, httppilotCtx, customFetch, customFetch)
// onde a assinatura da função é: new AsyncFunction('httppilot', 'aurafetch', 'fetch', 'tauriFetch', scriptBody)
```

Isso garante que scripts escritos para `aurafetch.*` continuem funcionando. O alias `aurafetch` pode ser removido em uma release futura, após os usuários terem tido tempo de migrar seus scripts.

### Arquivos a atualizar

| Arquivo | O que alterar |
|---|---|
| `package.json` | `name: "httppilot"`, `description`, `homepage`, `repository.url`, `keywords` (remover `aurafetch`, adicionar `httppilot`) |
| `src-tauri/tauri.conf.json` | `productName: "HTTPilot"`, `identifier: "com.httppilot.desktop"`, `app.windows[0].title: "HTTPilot"` |
| `src-tauri/Cargo.toml` | `name = "app"` → `name = "httppilot"` e `name = "app_lib"` → `name = "httppilot_lib"` (os valores atuais são `"app"` / `"app_lib"`, não `"aurafetch"`) |
| `vite.config.ts` | `base: '/AuraFetch/'` (PascalCase) → `base: '/httppilot/'` |
| `index.html` | `<title>HTTPilot</title>`, definir favicon para o novo logo (`public/httppilot_logo.png`). Nota: o favicon atual é `vite.svg` (asset padrão do Vite, nunca foi trocado) — `public/aurafetch_logo.png` existe mas não está referenciado no `index.html` |
| `src/App.tsx` | Chaves do localStorage (ver migração acima), `aurafetchCtx` → `httppilotCtx`, renomear API de scripts: `aurafetch.setEnv()` / `aurafetch.setVar()` / `aurafetch.log()` → `httppilot.*` (manter `aurafetch` como alias retrocompatível por uma release — ver nota acima), filtro do diálogo de salvar arquivo `'AuraFetch Workspace'` → `'HTTPilot Workspace'`, nome padrão do arquivo `'aurafetch_workspace.json'` → `'httppilot_workspace.json'` |
| `cypress/e2e/*.cy.ts` (5 arquivos) | Nomes dos suites `describe('AuraFetch - ...')` → `describe('HTTPilot - ...')` |
| `README.md` | Rebrand completo do conteúdo |
| `CHANGELOG.md` | Adicionar nota de rebrand |
| `public/` | Substituir `aurafetch_logo.png` por `httppilot_logo.png` |
| `src/assets/` | Adicionar `logo.png` e `logo.svg` do HTTPilot |
| Repositório GitHub | Renomear o repositório (ação do usuário — fazer por último, após todos os arquivos atualizados) |

---

## Stack Tecnológica (sem alterações)

- **Desktop:** Tauri 2 (Rust)
- **Frontend:** React 19 + TypeScript
- **Bundler:** Vite 7
- **Editor:** CodeMirror 6
- **Ícones:** Lucide React
- **Testes:** Cypress 15 (E2E)

---

## Critérios de Sucesso

- [ ] Zero crashes/travamentos em: carregamento da página, envio de arquivo, respostas grandes
- [ ] Todos os testes Cypress E2E passando após cada fase
- [ ] `App.tsx` reduzido a ~100 linhas
- [ ] Nenhum arquivo de componente excede 300 linhas (incluindo boilerplate do CodeMirror)
- [ ] Projeto corretamente nomeado como HTTPilot em todos os arquivos de configuração
- [ ] Dados do localStorage dos usuários migrados sem perda na atualização
- [ ] GitHub Pages fazendo deploy com sucesso com o novo nome

---

## Fora do Escopo (roadmap futuro)

- Colaboração em equipe
- Sistema de plugins
- Builds para macOS / Linux
- Testes unitários (além dos Cypress E2E existentes)

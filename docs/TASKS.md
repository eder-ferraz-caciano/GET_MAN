# AuraFetch — Tasks

> **Este documento é lido no início de cada sessão de desenvolvimento com IA.**
> Última atualização: 2026-03-30 | Versão: 1.3.2

---

## Legenda

- [x] Concluído
- [ ] Pendente
- [~] Em andamento

---

## Fase 0 — Auditoria Completa

- [x] Inspeção de crashes / tela branca
- [x] Inspeção de travamento ao enviar arquivo
- [x] Inspeção de travamento com resposta grande
- [x] Inspeção de memory leaks (WebSocket)
- [x] Inspeção de estado inconsistente
- [x] Inspeção de diferenças web vs. desktop
- [x] Inspeção de erros silenciosos
- [x] Lista priorizada de bugs (P0/P1/P2) entregue

**Resultado:** 14 bugs identificados (6 P0, 4 P1, 4 P2)

---

## Fase 1 — Correção de Bugs

### P0 — Críticos
- [x] B1: Tela branca no carregamento (JSON.parse sem try/catch nos useState)
- [x] B2: ErrorBoundary não envolve árvore completa (mover para main.tsx)
- [x] B3: Travamento ao enviar arquivo binário (guard de 50MB + readFileWithSizeGuard)
- [x] B4: Travamento ao enviar form-data com arquivo (mesmo guard)
- [x] B5: Travamento com resposta grande (limitar persistência no localStorage)
- [x] B6: Imagem/PDF corrompem localStorage (excluir binários da persistência)

### P1 — Altos
- [x] B7: Memory leak — listener WebSocket acumula (cleanup function)
- [x] B8: Performance — cada log grava localStorage (debounce/memoização)
- [x] B9: Stale closure no listener WS (usar ref)
- [x] B10: Funções Tauri sem guard no browser (isTauri() + web fallback)

### P2 — Médios
- [x] B11: console.warn/error em produção (removidos)
- [x] B12: prompt() para criar workspace (substituído por inline input)
- [x] B13: Estado WS não resetado ao trocar nó (reset no useEffect)
- [x] B14: import CSS no meio do arquivo (movido para topo)

**Resultado:** 14/14 bugs corrigidos. Release v1.3.2.

---

## Testes Cypress (TDD)

- [x] Infraestrutura: tasks, fixtures, cypress.config
- [x] Web fallback de file picker em App.tsx (hidden input para testes no browser)
- [x] bug_fixes_phase1.cy.ts — 10 testes de regressão
- [x] file_upload.cy.ts — form-data, binary, size guard
- [x] response_rendering.cy.ts — JSON, HTML, imagem, binário, metadados
- [x] import_export.cy.ts — import/export coleção, download response
- [x] auth.cy.ts — Bearer, Basic, API Key, OAuth2, herança
- [x] workspace_tree.cy.ts expandido — rename, duplicar, envs
- [x] core_stability.cy.ts expandido — histórico, busca, env persistence
- [x] professional_features.cy.ts expandido — code snippets
- [x] Ajuste de seletores (PT-BR, placeholders exatos, overflow:hidden)

**Resultado:** 121 testes passando, 0 falhas.

---

## Hotfix — Bugs pós-release

- [x] Tela branca no .exe após instalar (vite `base: '/AuraFetch/'` gerava paths absolutos incorretos no Tauri build — corrigido com `base` condicional via `TAURI_ENV_PLATFORM`)

---

## Fase 2 — Componentização (COMPLETA)

> **Spec:** `docs/superpowers/specs/2026-03-30-devloid-evolution-design.md`
> **Plan:** `docs/superpowers/plans/2026-03-30-fase2-componentizacao.md`

### Extração
- [x] Extrair `types/index.ts`
- [x] Extrair `utils/safeFetch.ts`
- [x] Extrair `components/ErrorBoundary/index.tsx`
- [x] Criar `context/RequestContext.tsx`
- [x] Criar `hooks/useCollection.ts`
- [x] Criar `hooks/useEnvironment.ts`
- [x] Criar `hooks/useRequest.ts`
- [x] Criar `hooks/useWebSocket.ts`
- [x] Extrair `components/http/CollectionTree.tsx`
- [x] Extrair `components/http/RequestBuilder.tsx`
- [x] Extrair `components/http/RequestTabs.tsx`
- [x] Extrair `components/http/ResponseViewer.tsx`
- [x] Extrair `components/http/Console.tsx`
- [x] Extrair `components/http/WebSocketPanel.tsx`
- [x] Extrair `components/http/EnvironmentPanel.tsx`
- [x] Extrair `components/http/HistoryPanel.tsx`
- [x] Extrair `components/http/CodeSnippet.tsx`
- [x] Criar `components/layout/Sidebar.tsx` + `SidebarModeSwitch.tsx`
- [x] Migrar estilos para `styles/global.css`, `themes.css`, `animations.css`
- [x] Reduzir App.tsx a ~100 linhas (orquestrador)

### Validação
- [x] 121 testes Cypress passando após cada extração
- [x] Nenhum arquivo > 300 linhas
- [x] App funcional no browser e no Tauri

**Resultado:** 17 componentes extraídos, 121 testes passando, App.tsx reduzido de 3.940 para ~100 linhas.

---

## Fase 3a — Dev Tools Offline (COMPLETA)

> **Spec:** `docs/superpowers/specs/2026-03-30-devloid-evolution-design.md`

### Implementação
- [x] Criar `components/devtools/DevToolsPanel.tsx` (grid de 9 cards)
- [x] Adicionar seletor `[ HTTP Client ] [ Dev Tools ]` na sidebar
- [x] `QRCodeGenerator.tsx` — QR Code com download PNG
- [x] `BarcodeGenerator.tsx` — Barcode (CODE128, EAN13, CODE39, EAN8, UPCA)
- [x] `UUIDGenerator.tsx` — UUID v4 (gerar 1/10/100)
- [x] `Base64Tool.tsx` — encode/decode
- [x] `JWTDecoder.tsx` — decoder com header/payload/signature
- [x] `CronHelper.tsx` — descrição PT-BR + 5 exemplos
- [x] `RegexTester.tsx` — tester em tempo real + 5 presets
- [x] `CPFCNPJValidator.tsx` — validação com algoritmos oficiais
- [x] `HashCalculator.tsx` — MD5 (spark-md5)
- [x] CSS styling em `App.css` (24 classes + responsivo)

### Validação
- [x] 121 testes existentes passando
- [x] Todas 9 ferramentas funcionais offline

**Resultado:** 9 ferramentas de dev implementadas, todas com suporte offline, UI em português.

---

## Fase 3b — Dev Tools de Rede (EM DESENVOLVIMENTO)

> **Spec:** `docs/superpowers/specs/2026-03-30-devloid-evolution-design.md`
> **Plan:** A ser criado com `superpowers:writing-plans`

- [ ] `IpInfoTool.tsx` — via ip-api.com (detecta IP público, localização, ISP)
- [ ] `DnsLookupTool.tsx` — via Cloudflare DNS-over-HTTPS (resolução de DNS)
- [ ] `PingTool.tsx` — Tauri only (ICMP), fallback gracioso no browser

---

## Fase 4 — Renomeação para DevLoid (CANCELADA)

> Cancelado por decisão do usuário em 2026-04-01

---

## Backlog futuro (fora do escopo atual)

- [ ] Builds para macOS / Linux
- [ ] Colaboração em equipe
- [ ] Sistema de plugins
- [ ] Testes unitários complementares (Vitest)
- [ ] Novo logo/branding DevLoid

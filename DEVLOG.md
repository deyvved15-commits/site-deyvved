# DEVLOG — Kadima Academy

> Histórico de tudo que foi desenvolvido neste projeto.
> Última atualização: 2026-08-28

**Repositório:** `D:\programas\Git\Site-Kadima-academy\site-deyvved`
**Stack:** Next.js 15 App Router · Prisma · Supabase (PostgreSQL) · NextAuth · Vercel
**Deploy:** push na branch `main` → Vercel auto-deploy

---

## Área do Aluno (`/`)

- [x] Dashboard com cursos em andamento e progresso
- [x] Player de aulas com embed de vídeo (YouTube)
- [x] Progresso por aula — marcar como concluída
- [x] Comentários nas aulas
- [x] Bookmarks / favoritos de aulas
- [x] Busca global de aulas e cursos (`/busca`)
- [x] Certificado de conclusão (`/certificado/[courseId]`)
- [x] Página de todos os certificados (`/certificados`)
- [x] Carteira de saldo (`/carteira`)
- [x] Programa de afiliados (`/afiliado`) — código de indicação + comissões
- [x] Suporte — criar ticket, ver histórico, chat com admin (`/suporte`)
- [x] Ao Vivo — assistir live com chat em tempo real (`/ao-vivo`)
- [x] Aula da Semana — conteúdo especial semanal (`/aula-da-semana`)
- [x] Loja de produtos (`/loja`) — ebooks, áudios, apostilas, físicos
- [x] Perfil do aluno (`/perfil`) — avatar (upload ou URL), bio, endereço de entrega, senha

---

## Área do Admin (`/admin`)

- [x] Dashboard geral — métricas, acessos, receita
- [x] Gestão de alunos — lista com busca, criar, deletar
- [x] **Perfil completo do aluno** (`/admin/alunos/[studentId]`) — implementado 2026-08-28:
  - Foto real (avatar) ou iniciais em dourado
  - Bio + role badge (Aluno/Professor/Admin) + badge "Inativo"
  - Cards de resumo: telefone, igreja, data de cadastro, último acesso, cursos ativos, total investido, certificados, saldo na carteira
  - Endereço de entrega completo
  - Certificados emitidos com link para visualizar
  - Progresso nos cursos com módulos e aulas (grid 2 colunas)
  - Histórico de pagamentos com status e valores
  - Chamados de suporte com status e link direto
  - Histórico de atividade (login, aulas assistidas, compras etc.)
  - Editor de percentual de afiliado
- [x] Matrícula / desmatrícula de alunos em cursos
- [x] Renovação de matrícula (define nova data de expiração)
- [x] Reset de senha do aluno
- [x] Promoção de role (aluno → professor → admin)
- [x] Gestão de cursos — criar, editar módulos e aulas, reordenar
- [x] Gestão de professores — perfil, comissões
- [x] Relatórios financeiros (`/admin/relatorios`)
- [x] Cupons de desconto (`/admin/cupons`)
- [x] Produtos da loja (`/admin/produtos`) — EBOOK, AUDIO, VIDEO, PRINTED
- [x] Entregas de produtos físicos + etiquetas de envio (`/admin/entregas`)
- [x] Configurações gerais da plataforma (`/admin/configuracoes`)
- [x] Envio de e-mail em massa (`/admin/email`)
- [x] Notificações push (`/admin/notificacoes`)
- [x] Alunos formados — 100% de progresso (`/admin/formados`)
- [x] Churn — matrículas expiradas (`/admin/churn`)
- [x] Suporte admin — responder tickets (`/admin/suporte`)
- [x] Ao Vivo — configurar URL (YouTube/Zoom), moderar chat, mutar usuários (`/admin/ao-vivo`)
- [x] Afiliados — relatório de cliques e comissões (`/admin/afiliados`)

---

## Área do Professor (`/professor`)

- [x] Dashboard do professor com métricas
- [x] Ver seus cursos e aulas
- [x] Ver comentários dos alunos
- [x] Alunos formados nos seus cursos
- [x] Suporte (ver tickets relacionados aos cursos)
- [x] Financeiro — ganhos e comissões

---

## Componente HtmlContent

**Arquivo:** `components/student/html-content.tsx`

Renderiza o campo "Material da Aula" da lição. Suporta 3 modos:

| Conteúdo | Comportamento |
|---|---|
| HTML simples (fragmento) | Injetado via `innerHTML` no DOM |
| `<!DOCTYPE html>` completo | Renderizado via `srcDoc` em iframe |
| `<iframe src="...">` | Iframe com `src` real, sem sandbox |

### Fixes implementados

- **2026-08-28 — `allow-same-origin`:** Adicionado ao sandbox do iframe `srcDoc`. Sem isso, `localStorage` lançava `SecurityError` e derrubava todo o JavaScript da apostila antes de qualquer função rodar.
- **2026-08-28 — `lastIndexOf("</body>")`:** Substituído `.replace("</body>", ...)` por `lastIndexOf` para injetar o script de resize antes do `</body>` real. O `.replace()` encontrava o primeiro match e podia quebrar JS com template literals que contivessem `</body>` em strings.

---

## Apostila de Bibliologia

**Fonte (editar aqui):** `G:\Meu Drive\Escola\Kadima Academy\Teologia\Meu curso\Word\01 - Apostila - Bibliologia.html`
**Arquivo público (plataforma):** `public\apostila-bibliologia-01.html`
**Como usar na aula:** colocar no campo de conteúdo: `<iframe src="/apostila-bibliologia-01.html"></iframe>`

### Funcionalidades

- [x] Navegação SPA por seções — clicar no menu lateral abre só aquela seção
- [x] Botões **Anterior** / **Próximo** entre seções com contador (ex: `3 / 11`)
- [x] Cover/hero exibido **apenas** na primeira seção
- [x] Grid "66 livros em 5 palavras" — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (era 5 colunas, transbordava)
- [x] Dark mode persistido com `_store()` (wrapper seguro para localStorage)
- [x] Busca funcional mesmo em seções ocultas (usa `textContent`, não `innerText`)
- [x] Resultados de busca navegam para a seção correta via `showSection()`
- [x] Cópia de versículos com `navigator.clipboard` + fallback `execCommand`
- [x] Auto-resize para plataforma via `postMessage` (MutationObserver)
- [x] `DOMContentLoaded` com try-catch individual por função — erro em uma não derruba as outras

### Ordem das seções (SECTION_ORDER)
```
intro → campo → necessidade → como-estudar → tema-central →
referencias-siglas → biblia-livro → terminologia →
organizacao → capitulos-versiculos → autores
```

---

## APIs

| Rota | Método | Descrição |
|---|---|---|
| `/api/auth/register` | POST | Cadastro de aluno |
| `/api/profile` | GET/PUT | Ver e atualizar perfil |
| `/api/upload/avatar` | POST | Upload de foto (Supabase Storage) |
| `/api/enrollments` | GET | Matrículas do aluno logado |
| `/api/progress` | POST | Marcar aula como concluída |
| `/api/tickets` | GET/POST | Chamados de suporte |
| `/api/live/chat` | GET/POST | Mensagens da live |
| `/api/checkout` | POST | Criar preferência MercadoPago |
| `/api/webhooks/mercadopago` | POST | Webhook de pagamento |
| `/api/pdf-proxy` | GET | Proxy de PDFs do Google Drive |
| `/api/search` | GET | Busca global |
| `/api/admin/reports` | GET | Relatórios financeiros (admin) |
| `/api/students/[id]` | PATCH/DELETE | Atualizar/deletar aluno |
| `/api/students/[id]/enroll` | POST | Matricular aluno |

---

## Schema — modelos principais

```
User
  ├── Enrollment → Course → Module → Lesson → LessonProgress
  ├── Certificate
  ├── Payment
  ├── Ticket → TicketMessage
  ├── ActivityLog
  ├── WalletTransaction
  ├── Referral / AffiliateClick
  ├── ProductPurchase
  ├── LessonBookmark
  └── LessonRating
```

**Campos do User relevantes:**
`name · email · phone · church · bio · avatar · role · active · walletBalance · affiliateCode · affiliatePercentage · shippingCep · shippingAddress · shippingNumber · shippingCity · shippingState · lastLoginAt · createdAt`

---

## Design System

```css
/* Paleta */
--navy-darkest: #040A18
--navy-mid:     #060D1F → #0F1A3D
--gold:         #C9A97A
--gold-light:   #E8D5A8
--gold-bright:  #F0DEB4
--green:        #10B981

/* Fontes */
Cinzel (Google Fonts)  — títulos, badges, labels
Poppins (Google Fonts) — corpo de texto, inputs

/* Classes utilitárias */
.ka-page-header    — cabeçalho de página com eyebrow + título
.ka-page-eyebrow   — texto pequeno acima do título
.ka-page-title     — título principal da página
.ka-section        — padding padrão de conteúdo
.ka-back-link      — link "← Voltar" com seta
.ka-progress-fill  — barra de progresso dourada
.ka-btn-gold       — botão com gradiente dourado
.ka-card           — card de curso/produto
```

---

## Sistema de Apostila em Texto — 2026-09-07

**Nova funcionalidade:** Apostalas podem ser inseridas diretamente como texto/HTML na plataforma, sem precisar de arquivo externo.

**Como funciona:**
1. **Admin:** `app/(admin)/admin/cursos/[courseId]/editor` → campo "Título da Apostila" + "Apostila (Texto para Leitura)"
2. **Banco de dados:** Campos `apostilaTitulo` e `apostilaTexto` adicionados à tabela `Lesson`
3. **Aluno:** Na página da aula, aparece seção destacada "Apostila" com botão "📖 Ler Apostila"
4. **Leitor:** Abre componente com: fonte ajustável, tema claro/escuro, marca d'água Kadima Academy, paginação

**Arquivos envolvidos:**
- `components/student/formatted-apostila-button.tsx` — botão e leitor de apostila
- `components/student/course-editor.tsx` — painel admin para editar apostila
- `app/(student)/cursos/[slug]/aula/[lessonId]/page.tsx` — exibição no aluno

**Status:** ✅ Compilando sem erros, pronto para uso

---

## Pendente

- [ ] Testar leitor de apostila em múltiplas páginas (paginação)
- [ ] Criar apostilas das próximas aulas do curso de Teologia
- [ ] Decidir se remove sistema antigo de PDF (attachments) ou mantém em paralelo

---

*Atualizar sempre que algo novo for implementado. Manter checkboxes: `- [x]` = feito, `- [ ]` = pendente.*

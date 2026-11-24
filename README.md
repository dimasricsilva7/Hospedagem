# Hospedagem

Plataforma multi-hotel e multi-campanha para criar landing pages promocionais de alta conversão
para hotéis e resorts, com painel administrativo, captura de leads e tracking.

- **Landing pública:** `/{hotel}/{campanha}` — ex.: `/resort-exemplo/black-friday`
- **Painel:** `/admin`

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · lucide-react ·
Prisma 6 + PostgreSQL (Neon) · autenticação própria (scrypt + sessão httpOnly). Deploy na Vercel.

> O spec pedia Supabase; optou-se por **Neon + Prisma** para alinhar com os demais projetos. As
> políticas RLS do spec são implementadas como **autorização no servidor**: visitantes só acessam
> campanhas publicadas e enviam cadastros; a listagem/exportação de leads exige sessão de admin.

## O que está implementado (funcional)

- **Landing editorial premium** com 12 seções renderizadas do banco: barra promo, hero (imagem/vídeo,
  overlay, alinhamento, altura), countdown que não reinicia ao recarregar, formulário VIP, benefícios,
  apresentação, galeria (carrossel + swipe + lightbox), acomodações, destino, depoimentos, FAQ (accordion),
  CTA final e rodapé. Animações com Framer Motion, `prefers-reduced-motion` respeitado, responsivo (≥390px).
- **Captura de leads** via `POST /api/leads`: validação Zod, honeypot, rate limit por IP, consentimento
  LGPD (necessário) separado do consentimento de marketing (opcional, não pré-marcado), UTMs/fbclid/gclid.
- **Tracking** por campanha (Meta Pixel, GA4, GTM) com banner de consentimento — pixels só carregam após
  aceite; o evento **Lead** dispara somente após o backend confirmar o cadastro.
- **Painel admin**: login com provisionamento do admin via env, troca de senha obrigatória no 1º acesso,
  sessão protegida no servidor, logout. Dashboard com contagens reais. CRUD de hotéis. CRUD de campanhas
  com editor de conteúdo sem código (todas as seções, ordem/visibilidade, formulário, tracking), publicar/
  despublicar, duplicar, preview. CRM de leads: busca, filtros (hotel/campanha/status/período), status,
  observações, paginação e **exportação CSV** (restrita a admin).
- **SEO**: metadata dinâmica, Open Graph/Twitter, canonical, `noindex` no painel, headers de segurança.
- **Campanha demonstrativa** semeada (`/resort-exemplo/black-friday`) com conteúdo fictício identificado.

## Roadmap (próximas fatias — não entregues ainda)

Deixadas de fora de propósito para esta primeira entrega funcionar e ser deployável. Nenhum botão falso:
tudo que aparece funciona. Pendentes:

1. **Biblioteca de mídia + upload** (Vercel Blob com thumbnails). Hoje imagens entram por **URL** — já cobre
   a demo e produção. `MediaAsset` já existe no schema.
2. **Editor visual drag-and-drop com preview ao vivo embutido.** Hoje a edição é por formulário + reordenar
   seções por setas + preview em nova aba (`?preview=1`) — já atende "editar sem código".
3. **Agendamento de publicação** (cron) — o enum `SCHEDULED` já existe; publicar hoje é imediato.
4. **Notificações** de novo lead por e-mail/webhook por campanha/hotel.
5. **2FA de admin, testes A/B, gráficos no dashboard.**

## Credencial inicial

Definida por variáveis de ambiente — **nunca** fica no código. No primeiro acesso a `/admin/login`,
o usuário é provisionado a partir de `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD` (hash scrypt no banco) e o
sistema **exige a troca da senha** antes de liberar o painel.

- Senha inicial solicitada no projeto: `@Senha2026!` (defina em `ADMIN_INITIAL_PASSWORD`).
- Após o primeiro login você será levado a `/admin/trocar-senha`.

## Começar

Veja **SETUP.md** (local) e **DEPLOY.md** (Vercel + Neon). Variáveis em **.env.example**.

```bash
pnpm install
cp .env.example .env            # preencha DATABASE_URL(_UNPOOLED), AUTH_SECRET, ADMIN_*
pnpm db:migrate:dev             # cria as tabelas
pnpm db:seed                    # cria a campanha demonstrativa
pnpm dev
```

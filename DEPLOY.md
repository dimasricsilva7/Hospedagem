# DEPLOY — Vercel + Neon

## 1. Banco Neon
Crie um projeto no Neon e copie as connection strings **Pooled** e **Direct**.

## 2. Projeto na Vercel
Importe o repositório `dimasricsilva7/Hospedagem` na conta `wendeelmessias-3189`.
Framework: **Next.js** (detectado automaticamente). Build já roda `prisma generate` via `pnpm build`.

## 3. Variáveis de ambiente (Production + Preview)
| Variável | Valor |
|---|---|
| `DATABASE_URL` | connection string **Pooled** da Neon |
| `DATABASE_URL_UNPOOLED` | connection string **Direct** da Neon |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `ADMIN_EMAIL` | e-mail do administrador |
| `ADMIN_INITIAL_PASSWORD` | `@Senha2026!` (trocada no 1º login) |
| `APP_URL` | (opcional) domínio final, ex.: `https://hotel.com.br` |

## 4. Migrations
As migrations **não** rodam no build (para o build funcionar sem banco). Aplique-as uma vez contra o
banco de produção, a partir da sua máquina com o `.env` de produção:
```bash
pnpm db:migrate     # prisma migrate deploy
pnpm db:seed        # opcional: cria a campanha demonstrativa
```
> Alternativa: adicionar `prisma migrate deploy` ao build script depois que `DATABASE_URL_UNPOOLED`
> estiver configurada na Vercel.

## 5. Verificar
- `/` (home da plataforma)
- `/resort-exemplo/black-friday` (landing demo)
- `/admin/login` → provisiona admin → troca de senha → dashboard
- Enviar um lead na landing e conferir em `/admin/leads`
- Exportar CSV em `/admin/leads`

## Checklist de segurança
- `service_role`/segredos nunca vão para o repositório (`.env` está no `.gitignore`).
- Autorização sempre no servidor (`requireAdmin` / `getSession`); export de leads exige admin.
- Headers de segurança e `noindex` no `/admin` via `next.config.ts`.

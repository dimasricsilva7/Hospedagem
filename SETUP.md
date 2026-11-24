# SETUP — ambiente local

Pré-requisitos: Node ≥ 20 e pnpm 11 (`corepack enable`).

1. **Instalar dependências**
   ```bash
   pnpm install
   ```

2. **Banco (Neon)** — crie um projeto em https://neon.tech e copie as duas connection strings
   (Pooled e Direct). Coloque em `.env`:
   ```bash
   cp .env.example .env
   ```
   Preencha `DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED` (direct), `AUTH_SECRET`
   (`openssl rand -base64 32`), `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD`.

3. **Migrations + seed**
   ```bash
   pnpm db:migrate:dev     # aplica o schema e cria a migration inicial
   pnpm db:seed            # campanha demonstrativa /resort-exemplo/black-friday
   ```

4. **Rodar**
   ```bash
   pnpm dev
   ```
   - Landing demo: http://localhost:3000/resort-exemplo/black-friday
   - Painel: http://localhost:3000/admin (primeiro acesso provisiona o admin e pede troca de senha)

## Qualidade

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test        # testes das funções puras (máscaras, csv, rate limit, normalização)
```

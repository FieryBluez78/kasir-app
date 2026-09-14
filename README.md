# Toko Kasir — Sistem Kasir & Administrasi Toko

A modern POS + inventory + store administration dashboard built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, and Zod. Bilingual (Indonesian/English), light/dark mode, fully responsive.

## What's included

- **Dashboard** — live stats, 7-day revenue chart, top products, recent transactions, quick actions
- **Products** — grid/table views, search, filter (category/stock status), sort, add/edit/soft-delete, photo upload with preview
- **Inventory** — stock table + full stock movement history (audit log), add/reduce stock with a required reason
- **POS (Kasir)** — product picker with category filter, cart with quantity controls capped at available stock, percentage/fixed discounts, checkout with payment/change calculation, printable/downloadable receipt
- **Transactions** — searchable history with date range filter, itemized detail view
- **Revenue** — today/week/month totals, gross profit, revenue chart
- **Reports** — sales/stock/revenue summaries, low-stock table, CSV export
- **Settings** — store info, categories management, currency, language, dark mode; visible to Admin accounts only
- **i18n** — structured `id.json` / `en.json` dictionaries, switch language without a page reload
- **Business logic as pure, testable services** (`lib/services/`): discount calculation, stock movements, atomic checkout, revenue/profit aggregation
- **Data integrity**: unique SKU, non-negative prices/stock, discounts can't push totals negative, checkout is a single atomic DB transaction (stock and revenue can never drift apart), soft-deleted products keep historical transactions intact, every stock change is audit-logged

## Tech stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Prisma + SQLite (swappable to PostgreSQL) · Zod · React Hook Form · Recharts · Radix UI · lucide-react · sonner

## Getting started

### 1. Install dependencies

```bash
npm install
```

This also runs `prisma generate` automatically via `postinstall`.

### 2. Configure environment variables

```bash
cp .env.example .env
```

The default `.env.example` uses SQLite (`file:./dev.db`) so you can run the app with zero external setup. It also includes `AUTH_SECRET`, used to sign the login session cookie — the placeholder value works for local dev, but generate a real random one for anything beyond your own machine:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**If you already have an `.env` file from before authentication was added**, just add the `AUTH_SECRET` line from `.env.example` into it — the app will throw a clear error on login if it's missing.

To use PostgreSQL instead of SQLite, uncomment the PostgreSQL line, set your connection string, and change the `provider` in `prisma/schema.prisma` from `"sqlite"` to `"postgresql"`.

### 3. Set up the database

```bash
npm run db:push      # creates the SQLite file / applies schema (or use db:migrate for versioned migrations)
npm run db:seed      # seeds demo categories, products, transactions, and two login accounts
```

The seed script creates two accounts you can log in with immediately:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@tokoberkah.id` | `admin123` |
| Cashier | `kasir@tokoberkah.id` | `kasir123` |

Change or remove these before deploying anywhere real — see "Extending this further" below.

### 4. Run the dev server

```bash
npm run dev
```

Visit http://localhost:3000 — it redirects to `/dashboard`.

### 5. Build for production

```bash
npm run build
npm run start
```

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run db:push` | Push the Prisma schema to the database (quick, no migration history) |
| `npm run db:migrate` | Create/apply a versioned migration |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio to browse data |

## Project structure

```
app/
  login/                 # public login page (redirects to /dashboard if already signed in)
  (dashboard)/          # sidebar+topbar shell and all admin pages — server-guarded, redirects to /login
    dashboard/ pos/ products/ inventory/ transactions/ revenue/ reports/ settings/
  api/                   # route handlers (auth, products, categories, stock, checkout, transactions, revenue, reports, settings)
    auth/                # login, logout, me
components/
  ui/                    # base primitives (button, input, dialog, select, table, ...)
  layout/                # sidebar, topbar, mobile nav, dashboard shell
  auth/                  # login form
  dashboard/ products/ pos/ inventory/ transactions/ settings/ common/
lib/
  db/                    # Prisma client singleton
  i18n/                  # id.json / en.json + language provider
  validations/           # Zod schemas
  services/              # pure business logic: discount, stock, checkout, revenue
  auth/                  # password hashing, session cookie signing, permission map, API route guard
  hooks/                 # small client-side fetch/cart hooks
prisma/
  schema.prisma
  seed.ts
types/
  index.ts               # shared frontend types
```

## Notable design decisions

- **Checkout is one atomic DB transaction.** `lib/services/checkout.ts` re-reads live prices/stock from the database (never trusts client input), validates everything, then creates the transaction, transaction items, and stock movements together. If any step fails, the whole thing rolls back — stock and revenue can never go out of sync.
- **Every stock change flows through one function** (`lib/services/stock.ts`), so `Product.stock` and the `StockMovement` audit trail can never drift apart. This is what section on "audit focus" in the original spec is built around.
- **Soft deletes** on products (`deletedAt`) keep old transactions and their line-item snapshots (`productName`, `sku`, `unitPrice`, `unitCost` captured at sale time) fully intact even if a product is later renamed, repriced, or removed.
- **Real authentication with separate Admin/Cashier accounts.** Login lives at `/login`; sessions are a signed HMAC cookie (`lib/auth/session.ts`) verified with Node's built-in `crypto` — no external auth library needed. Passwords are hashed with `scrypt` (`lib/auth/password.ts`), also built into Node. `app/(dashboard)/layout.tsx` is a Server Component that redirects to `/login` if there's no valid session, so routes are genuinely protected, not just hidden from the sidebar. Every mutating API route also re-checks the role server-side via `lib/auth/guard.ts` + `lib/auth/permissions.ts`, so a Cashier account can't call e.g. `DELETE /api/products/:id` directly even by bypassing the UI.
- **Product photos** are stored as base64 data URLs for a zero-config demo experience — no cloud storage account needed to try the app. For production, swap `ImageUploadField`'s `handleFile` to upload to S3/Cloudinary/Vercel Blob and store the returned URL instead; nothing else needs to change since the rest of the app just treats `imageUrl` as a string.
- **Currency formatting is centralized** in `lib/utils/currency.ts` (`formatCurrency`) and keyed off `StoreSettings.currency`, so adding another currency later is a one-place change.

## A note on this environment

This project was generated in a sandboxed environment whose network egress doesn't allow downloading Prisma's query-engine binary (`binaries.prisma.sh` is blocked here), so `prisma generate` could not be run to completion in this sandbox — meaning the Prisma Client's generated types weren't available while writing/type-checking this code, and the schema itself couldn't be validated by the Prisma CLI before shipping. Running `npm install` (or `npx prisma generate`) on your own machine with normal internet access will generate the client immediately. One issue was already caught and fixed this way: the schema originally used Prisma `enum` blocks, which SQLite doesn't support natively — they've been converted to plain `String` columns (see the comment at the top of `prisma/schema.prisma`) with matching TypeScript union types in `types/index.ts` providing the same compile-time safety. If you hit another schema error after generating, it's most likely a similar small drift and should be quick to resolve — the schema is the source of truth.

## Extending this further

A few things intentionally left as follow-ups rather than baked in, since they depend on choices only you can make (hosting, storage, how you manage staff accounts):

- **Change or remove the two seeded demo accounts** before deploying anywhere real — they're for trying the app locally, not production credentials. There's no self-serve signup or admin "create user" UI yet; add users directly via `npm run db:studio` or a small script for now.
- The session cookie is a simple signed token good enough for a single-store deployment. For multi-device session revocation, password reset flows, or SSO, consider swapping `lib/auth/session.ts` for NextAuth.js/Clerk/Lucia — `lib/auth/permissions.ts` (the role → permission map) stays the same either way.
- Move product photos to real object storage (S3 / Cloudinary / Vercel Blob)
- Add PDF export for reports/receipts (CSV export is already implemented)
- Add transaction void/refund flow (schema already has `TransactionStatus` "VOIDED" and `StockMovementType` "RETURN" ready for it)
- Add pagination to the products/transactions/stock-history tables once your catalog or transaction volume grows past a page or two

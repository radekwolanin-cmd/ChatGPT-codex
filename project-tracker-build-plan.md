# Project Tracker — Step‑by‑Step Build Plan (Local Dev Only, No Deployment)

> This plan turns the Product Description into an executable build sequence using Next.js App Router + Route Handlers, MySQL, Redis, Vercel Blob, and Auth.js — strictly for local development. Commands assume **pnpm**; swap for npm/yarn as needed.

## Phase 0 — Prereqs & Workspace
1. **Install tooling**: Node LTS, pnpm, MySQL 8.x (local Docker or remote dev DB), Redis (Docker), Git.
2. **Create repo**: `git init project-tracker` → create GitHub repo.
3. **Decide ORM**: Use **Prisma** (recommended) for speed and type‑safety. Alternative: mysql2 + Drizzle.
4. **Create `.env.local`** (no secrets committed):
   ```
   DATABASE_URL="mysql://user:pass@localhost:3306/project_tracker"
   REDIS_URL="redis://localhost:6379"
   BLOB_READ_WRITE_TOKEN="dev-local-token"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="dev-secret"
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   AZURE_AD_CLIENT_ID="..."
   AZURE_AD_CLIENT_SECRET="..."
   EMAIL_SERVER="smtp://user:pass@localhost:1025"  # use MailHog/SMTP dev
   EMAIL_FROM="Project Tracker <no-reply@local.test>"
   ```

## Phase 1 — App Skeleton
1. **Bootstrap Next.js (App Router)**
   ```
   pnpm create next-app project-tracker --ts --eslint --tailwind --app --src-dir --import-alias "@/ *"
   cd project-tracker
   ```
2. **Project structure**
   ```
   /src
     /app
       /(public)
       /api
       /projects
     /components
     /lib
     /styles
     /types
     /server
   ```
3. **Base UI**: Tailwind config, default layout, theme tokens, container, typography.

## Phase 2 — Auth (Auth.js / NextAuth)
1. **Install**: `pnpm add next-auth @types/node` (plus providers you’ll use).
2. **Route handler**: `/src/app/api/auth/[...nextauth]/route.ts` with Email + Google + Azure providers. Use **PrismaAdapter** if storing sessions.
3. **Session helpers**: server‑side `getCurrentUser()` in `/src/lib/auth.ts` and `<SessionProvider>` client wrapper.
4. **Protected layout**: guard `/projects` with server `redirect` if unauthenticated.
5. **Dev email**: run MailHog/SMTP and verify magic‑link flow.

## Phase 3 — Database Layer (MySQL)
1. **Install Prisma**:
   ```
   pnpm add -D prisma && pnpm add @prisma/client
   npx prisma init
   ```
2. **Model schema** — translate the DDL into Prisma models in `prisma/schema.prisma` (Users, Projects, Attachments, Comments, EstimatesVendor, EstimatesCustomer, Orders, Customers, Activity). Include enums for status/priority.
3. **Migrate**:
   ```
   npx prisma migrate dev --name init
   ```
4. **Seed script**: add `prisma/seed.ts` to create: owner user, 10 customers, 25 projects with mixed statuses, a few attachments/comments/estimates. Wire in `package.json` → `"db:seed": "ts-node prisma/seed.ts"`.
5. **Indexes**: add Prisma `@@index` on `(status, deadline)`, text fields as needed.

## Phase 4 — Server Utilities
1. **DB client**: `/src/server/db.ts` (singleton Prisma client).
2. **Validation**: `pnpm add zod` → define schemas for create/update operations (project, comment, estimate, order).
3. **Error handling**: unify API error responses (`JSONResponse<T>` helper) and a typed `AppError`.
4. **Authz**: role checks (`Owner | Member | Guest`) in `/src/lib/rbac.ts`.

## Phase 5 — Storage (Vercel Blob API compatible)
1. **SDK**: `pnpm add @vercel/blob`.
2. **Abstraction**: `/src/server/blob.ts` to create signed upload URLs and verify callbacks (for local, mock the token check).
3. **Upload API**: `POST /api/projects/[id]/attachments` returns signed URL & persists Attachment row after client completes upload.
4. **Local file preview**: implement client uploader with drag‑and‑drop + camera input on mobile.

## Phase 6 — Cache (Redis)
1. **Client**: `pnpm add ioredis` → `/src/server/redis.ts` singleton.
2. **Keys**: `proj:list:{filtersHash}`, `proj:detail:{id}`. TTL 60–300s. 
3. **Invalidation**: after mutations, delete list + detail keys.

## Phase 7 — API Route Handlers (CRUD + Relations)
Create typed handlers under `/src/app/api/*` using Zod schemas and RBAC checks.
- `GET /api/projects` (filters: status, q, tags, sort, page/cursor). Cacheable.
- `POST /api/projects` (create project, optional customer create/connect).
- `GET /api/projects/:id` (includes counts: files, comments, estimates).
- `PATCH /api/projects/:id` (partial updates: status/priority/deadline/tags/description/customerId).
- `DELETE /api/projects/:id` (soft delete flag for now).
- **Comments**: list/create.
- **Estimates**: vendor/customer CRUD.
- **Orders**: CRUD.
- **Attachments**: create (signed URL), delete.
- **Customers**: list/create.
- **Activity**: append entries on each mutation.

## Phase 8 — UI Foundations
1. **Design system**: buttons, inputs, select, badge/chips, table, card, modal/drawer, toast; dark mode tokens.
2. **Layout**: app shell with left nav (Projects, Customers, Settings) and top bar (search, user menu, theme toggle).
3. **Empty states** and **skeletons** for lists and detail.

## Phase 9 — Projects List View (Grouped Tables)
1. **Server component** pulls `GET /api/projects` grouped by status.
2. **Sections**: To Do / In Progress / Done (collapsible). Each renders a data table component.
3. **Columns**: Project, Priority chip, Deadline (overdue badge), Tags, $Summary, Files (#), Actions.
4. **Inline edits**: status/priority/tags via optimistic updates to `PATCH /api/projects/:id`.
5. **Filters/search**: client search box (debounced); server reads URL params. Persist in URL.
6. **Pagination**: cursor‑based per section.

## Phase 10 — Board View (Kanban with DnD)
1. **DnD lib**: `pnpm add @dnd-kit/core @dnd-kit/sortable`.
2. **Columns** = statuses. Cards show title, priority, deadline, tag pills, files.
3. **Drag‑drop** triggers optimistic UI → `PATCH` to update status → on success, revalidate list cache.
4. **A11y**: keyboard DnD shortcuts and ARIA live region updates.

## Phase 11 — Project Detail Page
1. **Header**: title + status dropdown + priority + deadline + tags + actions.
2. **Tabs**: Overview, Attachments (grid + lightbox), Comments (threaded), Estimates (vendor/customer), Orders, Financials (computed), Activity.
3. **Drawers/Modals** for add/edit forms using Zod + react‑hook‑form.
4. **Computed financials**: totals and margin derived from estimates/orders; memoized selectors.

## Phase 12 — Customers & Directory
1. **Customers list** with search and quick create.
2. **Customer card** on project right rail.

## Phase 13 — Notifications & Reminders (Local Sim)
1. Implement cron endpoints (e.g., `/api/cron/daily`, `/api/cron/hourly`).
2. Local simulation: add `pnpm cron:daily` and `pnpm cron:hourly` to call those endpoints via Node script.
3. Daily job: mark overdue, email reminders (dev SMTP), append Activity.

## Phase 14 — Security & Hardening
1. **Rate limiting**: simple token bucket in Redis middleware for `/api/*`.
2. **Input sanitization** and content‑security headers in `middleware.ts`.
3. **Audit**: ensure each mutation writes to Activity with actorId and diff snapshot.

## Phase 15 — Testing
1. **Unit**: Vitest for utilities (RBAC, validators, selectors).
2. **API**: integration tests hitting route handlers with a test DB.
3. **E2E**: Playwright flows: auth → create project → upload → comment → move to Done.
4. **Accessibility**: Axe checks on key pages.

## Phase 16 — DX & Quality Gates
1. ESLint + Prettier + TypeScript strict.
2. Git hooks with lint‑staged (format, type‑check, unit tests).
3. CI (local GitHub Actions workflow file prepared for later deployment).

## Phase 17 — Data Migration & Seed Iteration
1. Add migration for soft‑delete fields and additional indexes based on profiling.
2. Expand seed data to cover edge cases (many tags, long descriptions, large attachments, mixed currencies).

## Phase 18 — Performance Pass
1. Profile slow queries; add Prisma `select`/`include` minimal fields.
2. Cache hot lists; revalidate on writes.
3. Use React Server Components where possible; defer client components to interactions only.

## Phase 19 — Acceptance Checklist (Tie to MVP)
- [ ] Create/edit/delete projects with required fields.
- [ ] List + Board views stay in sync and support drag‑drop.
- [ ] Upload attachments (≥25MB) and preview.
- [ ] Add vendor & customer estimates and orders; totals correct.
- [ ] Comments threaded; timestamps and authors visible.
- [ ] Email + Google auth flows proven locally.
- [ ] Overdue badge + daily reminder job works via local cron sim.

## Phase 20 — Ready for Deployment Prep (But do not deploy)
1. Create `README.md` with local run/test instructions and env variable table.
2. Create `/docs/ops.md` describing environment variables and services.
3. Tag a release candidate (v0.1.0) after tests pass — hold for deployment step later.

---

### Command Cheat‑Sheet
```
pnpm i
pnpm dev
pnpm test
pnpm db:migrate   # prisma migrate dev
pnpm db:seed      # seed script
pnpm lint
pnpm typecheck
pnpm e2e          # playwright
pnpm cron:daily   # local cron simulation
```
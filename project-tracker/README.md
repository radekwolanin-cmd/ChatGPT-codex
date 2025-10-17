# Project Tracker

Project Tracker is a full-stack Next.js application for managing projects, attachments, estimates, orders, and activity with MySQL, Redis caching, Auth.js authentication, and Vercel Blob uploads.

## Prerequisites

- Node.js 20+
- pnpm 9+
- MySQL 8+
- Redis 7+
- MailHog (or any SMTP server for local email testing)

## Quickstart

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

The application runs at `http://localhost:3000`.

### Environment Variables

Copy `.env.example` to `.env.local` and fill in credentials.

- `DATABASE_URL` — MySQL connection string
- `REDIS_URL` — Redis connection
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob dev token
- `NEXTAUTH_URL` — Base URL for Auth.js
- `NEXTAUTH_SECRET` — Session signing secret
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth credentials
- `AZURE_AD_CLIENT_ID` / `AZURE_AD_CLIENT_SECRET` / `AZURE_AD_TENANT_ID`
- `EMAIL_SERVER` / `EMAIL_FROM`

### Database

Generate Prisma client and apply migrations:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### Scripts

- `pnpm dev` — Start Next.js in development mode
- `pnpm build` — Build for production
- `pnpm lint` — Run ESLint
- `pnpm typecheck` — TypeScript type checking
- `pnpm test` — Run Vitest unit and integration tests
- `pnpm e2e` — Execute Playwright end-to-end tests
- `pnpm cron:daily` — Trigger the daily cron endpoint
- `pnpm cron:hourly` — Trigger the hourly cron endpoint

### Testing

Vitest and Playwright are preconfigured. To run all checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
```

### Cron Simulation

Use the cron scripts to simulate Vercel Cron locally:

```bash
pnpm cron:daily
pnpm cron:hourly
```

### File Uploads

Uploads are routed through Vercel Blob for secure attachment storage. Provide a development token via `BLOB_READ_WRITE_TOKEN`.

### Authentication

Auth.js with Email, Google, and Azure AD providers is configured. Email sign-in requires a running SMTP server such as MailHog.

## Development Notes

- Routes under `/projects*` are protected and require authentication.
- Redis caches project lists and details; mutations automatically invalidate caches.
- Attachments, estimates, orders, and comments append activity entries for audit trails.

## Testing Users

Seed data creates a default owner user: `owner@example.com` (email magic-link sign-in).

## License

MIT

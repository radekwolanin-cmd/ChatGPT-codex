# Project Tracker — Product Description

A modern, mobile‑friendly project management web app to help small businesses plan, execute, and track work. Built end‑to‑end on Next.js (App Router) and deployed on Vercel.

---

## 1) Executive Summary
**Problem**: Small businesses need a simple, reliable, and fast tool to manage projects, deadlines, files, vendors, estimates, and customer communications without enterprise complexity.

**Solution**: A focused web app offering two core project views—**List** (grouped tables by status) and **Board** (Kanban with drag‑and‑drop)—backed by MySQL, Redis caching, Vercel Blob for files, and secure Auth.js authentication.

**Primary Users**: business owners, project managers, field staff, and external collaborators (optional, guest or read‑only).

**Platforms**: Mobile‑first responsive web (PWA optional in phase 2).

---

## 2) Goals & Non‑Goals
**Goals**
- Create and track projects with rich metadata (name, description, attachments, pictures/drawings, notes/comments, orders, estimates from vendors, estimates to customers, deadlines, financials, customer info).
- Provide two views: **List** (tables grouped by status) and **Board** (Kanban with drag & drop).
- Fast onboarding via Email + Google/Azure login.
- Reliable file storage for attachments using Vercel Blob.
- Actionable notifications & reminders with Vercel Cron.

**Non‑Goals (Phase 1)**
- Complex multi‑tenant billing, Gantt charts, advanced resource leveling, native mobile apps, offline edit sync.

---

## 3) Personas
- **Owner/PM (Primary)**: Creates projects, assigns priorities, manages deadlines, approves estimates.
- **Field Tech**: Uploads site photos, marks tasks Done, adds notes.
- **Accountant**: Reviews financial entries, exports reports.
- **Vendor/Client (Optional guest)**: Uploads quotes/POs, adds comments, reviews status.

---

## 4) Core Features & Requirements
### 4.1 Project Record
Each Project contains:
- **Identity**: name (required), description, tags []
- **Lifecycle**: status (To Do | In Progress | Done), priority (Low | Medium | High | Urgent), deadline (date/time)
- **Relations**: customer info (contact/company), vendor estimates [], customer estimates [], orders [], comments/notes [], attachments [] (pictures, drawings, docs)
- **Financials**: internal cost, vendor cost(s), customer price/estimate(s), margin
- **Audit**: createdAt, updatedAt, createdBy, updatedBy, status history

### 4.2 Views
- **List View**: Table grouped by Status sections (To Do, In Progress, Done). Each section shows rows with key columns (Project, Priority, Deadline, Customer, $Summary, Tags). Sort, filter, search, quick inline edits for status/priority/tags.
- **Board View**: Kanban columns (To Do, In Progress, Done) with drag‑and‑drop to update status. Cards show title, priority chip, deadline, tag pills, customer, and attachment count.

### 4.3 Project Detail Page
- **Header**: title, status dropdown, priority selector, tags, deadline picker, actions (Edit, Share, Add Note, Upload, Add Estimate, Add Order).
- **Tabs/Sections**: Overview, Attachments, Comments/Notes, Estimates (Vendor/Customer), Orders, Financials, Activity.
- **Right Rail (optional)**: customer contact card, key dates, quick actions.

### 4.4 Attachments & Media
- Upload images (photos/drawings) and documents to **Vercel Blob**; preview common types; file metadata (name, size, type, uploadedBy, uploadedAt). Support drag‑and‑drop and mobile capture.

### 4.5 Estimates & Orders
- **Vendor Estimates**: vendor, amount, currency, validity date, attachment(s), status (Draft/Sent/Accepted/Rejected).
- **Customer Estimates**: amount, currency, terms, status (Draft/Sent/Accepted/Rejected), generated PDF (phase 2).
- **Orders/POs**: vendor/customer, items, subtotal, tax, total, files.

### 4.6 Comments/Notes
- Threaded comments with mentions (phase 2). Basic Markdown, image inline previews.

### 4.7 Search & Filters
- Global search (project name/tags/customers). Quick filters: status, priority, deadline (overdue/this week), tags, has files.

### 4.8 Notifications & Reminders
- Deadline reminders, status changes, mentions via email. Powered by **Vercel Cron** invoking server actions.

### 4.9 Roles & Permissions (MVP)
- **Owner**: full access to workspace.
- **Member**: create/edit projects, upload files, comment.
- **Guest**: read‑only; can comment if invited (toggle).

---

## 5) Technology Stack (Fixed)
- **Host/Runtime**: Vercel (Node runtime for APIs)
- **Frontend**: Next.js **App Router** + React Server Components; Tailwind CSS (recommended)
- **Backend**: Next.js **Route Handlers only** (no separate server)
- **Database**: **MySQL** (PlanetScale or Vercel MySQL recommended)
- **Jobs/Scheduling**: **Vercel Cron**
- **Cache**: **Redis** (Upstash recommended)
- **Auth**: **Auth.js (NextAuth)** with Email + Google/Azure providers
- **File Storage**: **Vercel Blob**

---

## 6) Information Architecture
```
/
  /login
  /projects                → list view (grouped by status)
  /projects?view=board     → board view (kanban)
  /projects/new
  /projects/[projectId]
    /overview
    /attachments
    /comments
    /estimates
      /vendor
      /customer
    /orders
    /financials
    /activity
  /customers
  /vendors (phase 2)
  /settings
```

---

## 7) Data Model (Relational)
### 7.1 Entities
- **User**(id, name, email, role, image, createdAt)
- **Project**(id, name, description, status, priority, deadline, tags JSON, customerId, financialSummary JSON, createdBy, updatedBy, createdAt, updatedAt)
- **Attachment**(id, projectId, url, mimeType, name, size, uploadedBy, uploadedAt)
- **Comment**(id, projectId, authorId, body, createdAt, parentId nullable)
- **EstimateVendor**(id, projectId, vendorName, amount, currency, validUntil, status, attachmentUrl, createdAt)
- **EstimateCustomer**(id, projectId, amount, currency, terms, status, attachmentUrl, createdAt)
- **Order**(id, projectId, partyType ENUM('Vendor','Customer'), partyName, items JSON, subtotal, tax, total, currency, status, attachmentUrl, createdAt)
- **Customer**(id, name, contactName, email, phone, address JSON)
- **Activity**(id, projectId, actorId, type, payload JSON, createdAt)

### 7.2 MySQL DDL (MVP)
```sql
CREATE TABLE users (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(120),
  email         VARCHAR(190) UNIQUE NOT NULL,
  role          ENUM('OWNER','MEMBER','GUEST') DEFAULT 'MEMBER',
  image         TEXT,
  createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(160) NOT NULL,
  contactName   VARCHAR(160),
  email         VARCHAR(190),
  phone         VARCHAR(60),
  address       JSON,
  createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(200) NOT NULL,
  description   MEDIUMTEXT,
  status        ENUM('TO_DO','IN_PROGRESS','DONE') DEFAULT 'TO_DO',
  priority      ENUM('LOW','MEDIUM','HIGH','URGENT') DEFAULT 'MEDIUM',
  deadline      DATETIME NULL,
  tags          JSON,
  customerId    BIGINT,
  financials    JSON,
  createdBy     BIGINT,
  updatedBy     BIGINT,
  createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES customers(id)
);

CREATE TABLE attachments (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  projectId     BIGINT NOT NULL,
  url           TEXT NOT NULL,
  mimeType      VARCHAR(150),
  name          VARCHAR(255),
  size          BIGINT,
  uploadedBy    BIGINT,
  uploadedAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id)
);

CREATE TABLE comments (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  projectId     BIGINT NOT NULL,
  authorId      BIGINT NOT NULL,
  body          MEDIUMTEXT NOT NULL,
  parentId      BIGINT NULL,
  createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id)
);

CREATE TABLE estimates_vendor (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  projectId     BIGINT NOT NULL,
  vendorName    VARCHAR(200) NOT NULL,
  amount        DECIMAL(12,2) NOT NULL,
  currency      CHAR(3) DEFAULT 'USD',
  validUntil    DATE,
  status        ENUM('DRAFT','SENT','ACCEPTED','REJECTED') DEFAULT 'DRAFT',
  attachmentUrl TEXT,
  createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id)
);

CREATE TABLE estimates_customer (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  projectId     BIGINT NOT NULL,
  amount        DECIMAL(12,2) NOT NULL,
  currency      CHAR(3) DEFAULT 'USD',
  terms         TEXT,
  status        ENUM('DRAFT','SENT','ACCEPTED','REJECTED') DEFAULT 'DRAFT',
  attachmentUrl TEXT,
  createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id)
);

CREATE TABLE orders (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  projectId     BIGINT NOT NULL,
  partyType     ENUM('VENDOR','CUSTOMER') NOT NULL,
  partyName     VARCHAR(200) NOT NULL,
  items         JSON,
  subtotal      DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax           DECIMAL(12,2) NOT NULL DEFAULT 0,
  total         DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency      CHAR(3) DEFAULT 'USD',
  status        ENUM('DRAFT','SENT','PAID','CANCELLED') DEFAULT 'DRAFT',
  attachmentUrl TEXT,
  createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id)
);

CREATE TABLE activity (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  projectId     BIGINT NOT NULL,
  actorId       BIGINT,
  type          VARCHAR(80) NOT NULL,
  payload       JSON,
  createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (projectId)
);
```

---

## 8) UX/UI Specification
### 8.1 List View (Grouped Tables by Status)
- **Sections**: To Do, In Progress, Done. Collapsible.
- **Columns**: Project (name + customer), Priority (chip), Deadline (date with overdue badge), Tags, $Summary (calculated), Files (#), Actions (⋯).
- **Row Interactions**: click → details; inline edit for status/priority/tags; drag between sections (optional).
- **Toolbar**: New Project, Filters, Search, View toggle (List/Board), Bulk actions (change status, add tag).

### 8.2 Board View (Kanban)
- Columns = statuses.
- Card: title, priority chip, deadline, tag pills, customer, file count. Drag card to change status. Keyboard accessible.

### 8.3 Project Detail
- Tabs with persistent header. Attachments show grid list, image lightbox preview. Estimates/Orders tables with add/edit drawers.

### 8.4 Mobile
- Bottom nav (Projects, Search, Add, Notifications, Settings). Sticky quick add button.

### 8.5 Accessibility
- WCAG 2.2 AA: focus states, color contrast, ARIA for drag and drop, keyboard shortcuts.

---

## 9) API (Next.js Route Handlers)
Base path: `/api/*`

**Projects**
- `GET /api/projects` — list + filters (status, tags, q, sort)
- `POST /api/projects` — create
- `GET /api/projects/:id` — detail
- `PATCH /api/projects/:id` — update fields
- `DELETE /api/projects/:id` — archive/delete (soft delete optional)

**Attachments**
- `POST /api/projects/:id/attachments` — create upload URL (Vercel Blob) & record
- `DELETE /api/attachments/:id`

**Comments**
- `GET /api/projects/:id/comments`
- `POST /api/projects/:id/comments`

**Estimates**
- `GET/POST /api/projects/:id/estimates/vendor`
- `GET/POST /api/projects/:id/estimates/customer`

**Orders**
- `GET/POST /api/projects/:id/orders`

**Lookup**
- `GET /api/customers` `POST /api/customers`

**Auth**
- Handled by **Auth.js (NextAuth)** with Email + Google/Azure providers.

---

## 10) Caching, Jobs, Files
**Redis**
- Cache lists (projects index) + feature flags. Invalidate on mutation (per‑project keys and list keys).

**Vercel Cron**
- Schedules: daily at 8am local → deadline reminders; hourly → recalc overdue badges; weekly → digest email.

**Vercel Blob**
- Direct‑to‑Blob uploads from client via signed URL from route handler. Store blob URL and metadata in `attachments`.

---

## 11) Security & Compliance
- Auth.js sessions (JWT or database sessions). Role‑based checks in route handlers.
- Input validation (Zod) on all APIs. Rate limiting via middleware (IP + user) backed by Redis.
- Signed upload URLs scoped per user/project; antivirus scan hook (phase 2).
- Audit trail in `activity` table.

---

## 12) Performance
- RSC where possible; client components only for interactions.
- Pagination + cursor‑based APIs for lists.
- Indexes on `projects(status, deadline)` and text search strategy (LIKE/FTS depending on provider).

---

## 13) Environment & Config
**.env (example)**
```
DATABASE_URL=mysql://user:pass@host:3306/app
REDIS_URL=...
BLOB_READ_WRITE_TOKEN=...
NEXTAUTH_URL=https://app.example.com
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
AZURE_AD_CLIENT_ID=...
AZURE_AD_CLIENT_SECRET=...
EMAIL_SERVER=...
EMAIL_FROM=...
```

---

## 14) Acceptance Criteria (MVP)
- Create, edit, delete projects with required fields.
- Two views work and stay in sync: List (grouped) and Board (drag‑drop updates status).
- Users can upload at least 25MB files/photos to Vercel Blob and see previews.
- Add vendor/customer estimates and orders to a project; totals compute correctly.
- Comments appear in chronological order with author and timestamp.
- Auth works with Email + Google; session persists; unauthorized users blocked.
- Deadline reminder email sent by Cron; overdue badge visible in UI.

---

## 15) Roadmap (Next)
- PWA install + push notifications; guest links with scoped access; vendor directory; quick invoice PDF; custom fields; multi‑workspace tenancy; webhooks; Zapier/Make integration.

---

## 16) Glossary
- **Kanban**: Visual board with columns by status.
- **RSC**: React Server Components in Next.js App Router.
- **Blob**: Object storage for files.

---

## 17) Open Questions (Track for v1.1)
- Soft delete versus archive?
- Currency & tax localization strategy?
- Per‑workspace settings (logos, colors)?

---

### Appendix A — Example Project JSON
```json
{
  "id": 1024,
  "name": "Storefront Renovation",
  "description": "Update facade, add signage, repaint interior.",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "deadline": "2025-11-10T23:59:59Z",
  "tags": ["retail", "paint"],
  "customer": { "id": 11, "name": "Bluebird Bakery" },
  "financials": { "estimates": {"vendor": 8200, "customer": 12500}, "actuals": {"vendor": 7900, "revenue": 12300} },
  "attachments": [{ "id": 1, "url": "blob://.../photo.jpg", "mimeType": "image/jpeg" }]
}
```

### Appendix B — Board Drag & Drop Events
- `dragstart` (cardId)
- `dragover` (column)
- `drop` (cardId, toStatus) → `PATCH /api/projects/:id { status }` + optimistic UI + toast.


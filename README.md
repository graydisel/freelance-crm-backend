# 🚀 Freelance CRM — Backend API

An enterprise-grade, secure RESTful API built with **NestJS 11**, **TypeORM**, and **PostgreSQL** powering the Freelance CRM & Project Management platform. Engineered for digital agencies, freelance collectives, and project teams to manage client relationships, track contract valuations, execute tasks across an interactive Kanban desk, and enforce granular Permission-Based Access Control (PBAC).

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Security & Access Control (PBAC & RBAC)](#-security--access-control-pbac--rbac)
- [Database Schema & Relational Design](#-database-schema--relational-design)
- [Core Modules & Features](#-core-modules--features)
- [API Endpoints & Permission Matrix](#-api-endpoints--permission-matrix)
- [Default Test Credentials & Seeding](#-default-test-credentials--seeding)
- [Prerequisites](#-prerequisites)
- [Installation & Getting Started](#-installation--getting-started)
- [Running with Docker](#-running-with-docker)
- [Database Migrations & Seeding](#-database-migrations--seeding)
- [Observability & Health Checks](#-observability--health-checks)
- [Available Scripts](#-available-scripts)
- [CI/CD & Deployment](#-cicd--deployment)

---

## 🌟 Overview

The **Freelance CRM Backend** serves as the central data and business logic engine for multi-tenant, multi-role project management workflows. It couples high-performance relational querying with strict data integrity, automated audit logging, granular permission validation, and transactional operations.

---

## 🛠 Architecture & Tech Stack

- **Framework:** [NestJS 11](https://nestjs.com/) (Modular TypeScript server-side architecture)
- **Database:** [PostgreSQL 15+](https://www.postgresql.org/) (Local Docker container, Neon.tech, or Render Cloud Postgres)
- **ORM:** [TypeORM 1.0](https://typeorm.io/) (Data Mapper pattern, automated migrations, declarative entities, relations)
- **Authentication & Security:**
  - [Passport.js](http://www.passportjs.org/) (`passport-jwt`, `passport-local`)
  - [Bcrypt](https://www.npmjs.com/package/bcrypt) for cryptographic password hashing
  - Dual-layer authorization: Role-Based Access Control (**RBAC**) + Granular Permission-Based Access Control (**PBAC**)
  - Strict input validation via `class-validator` & `class-transformer` (`ValidationPipe` with payload whitelist and forbidden unknown properties)
- **Observability & Health:**
  - Route execution timing interceptor (`RouteTimerInterceptor`)
  - Global application logger with contextual method traces
  - Public `/health` monitoring probe (`HealthController`)
- **Containerization & CI/CD:**
  - Multi-stage `Dockerfile` & `docker-compose.yml` (API + PostgreSQL + Adminer GUI)
  - GitHub Actions automated testing, linting, and continuous delivery via Render deployment webhooks

---

## 🔐 Security & Access Control (PBAC & RBAC)

The system implements an enterprise-grade security model combining macro **Roles** with granular **Permissions**:

### 1. Permission-Based Access Control (PBAC)
Permissions are modeled as first-class database entities (`PermissionEntity`) associated with roles via the `role_permissions` join table:

| Domain | Permission Enum Key | Description |
| :--- | :--- | :--- |
| **Projects** | `projects:read` | View project listings and detailed metadata |
| | `projects:create` | Create new projects and associate clients/managers |
| | `projects:update` | Edit project details, budget, and lifecycle status |
| | `projects:delete` | Delete projects (restricted by safety checks) |
| **Tasks** | `tasks:read` | View project deliverables and Kanban task boards |
| | `tasks:create` | Create and assign deliverables |
| | `tasks:update` | Modify task title, description, and priority |
| | `tasks:update_status` | Move tasks across Kanban status columns |
| | `tasks:complete` | Sign off and mark tasks as complete |
| | `tasks:manage_all` | Administrative bypass to manage any task |
| | `tasks:delete` | Permanently remove a task |
| **Clients** | `clients:read` | View B2B client company profiles |
| | `clients:create` | Onboard and create client records |
| | `clients:update` | Update company information, contacts, and status |
| | `clients:delete` | Remove client records from the catalog |
| **Analytics** | `analytics:read` | Access executive KPI summaries and revenue stats |

### 2. Declarative Decorators & Guards
- **`@RequirePermissions(...permissions)`**: Enforces specific granular permissions evaluated by `PermissionsGuard` from the JWT claims payload.
- **`@Roles(...roles)`**: Restricts administrative routes (e.g., user provisioning) via `RolesGuard`.
- **`@CurrentUser()`**: Custom parameter decorator extracting the authenticated user entity and permissions directly from the request context.
- **`@Public()`**: Bypasses global authentication for unauthenticated health probes or public documentation.

---

## 🛡 Database Schema & Relational Design

The relational schema ensures referential integrity, automated cascades, and strict foreign key constraints:

```text
  ┌──────────────────┐         1:1         ┌────────────────────────┐
  │   UserEntity     │ ─────────────────── │   UserProfileEntity    │
  │     (users)      │                     │    (user_profiles)     │
  └─────────┬────────┘                     └────────────────────────┘
            │ N:1
            ▼
  ┌──────────────────┐        N:M          ┌────────────────────────┐
  │    RoleEntity    │ ◄─────────────────► │    PermissionEntity    │
  │     (roles)      │  (role_permissions) │     (permissions)      │
  └──────────────────┘                     └────────────────────────┘
            ▲
            │ (Creator / Assignee)
            │
  ┌──────────────────┐         1:N         ┌────────────────────────┐
  │  ProjectEntity   │ ─────────────────── │       TaskEntity       │
  │    (projects)    │                     │        (tasks)         │
  └─────────▲────────┘                     └────────────────────────┘
            │ N:1
            │
  ┌──────────────────┐
  │ClientProfileEnt. │
  │ (client_profiles)│
  └──────────────────┘
```

- **PostgreSQL Tables:** Plural lowercase naming convention (`users`, `user_profiles`, `roles`, `permissions`, `role_permissions`, `client_profiles`, `projects`, `tasks`).
- **Foreign Keys:** Snake_case convention (`project_id`, `client_id`, `manager_id`, `creator_id`, `assignee_id`).

---

## ⚡ Core Modules & Features

### 1. 🏢 Client Profiles Module (`/client`, `/clients`)
- Full lifecycle management for B2B client profiles: company name, contact person, email, phone, and contract values.
- Client status transitions (`ACTIVE`, `INACTIVE`, `LEAD`, `ARCHIVED`).
- Dual routing support: accessible via both `/client` and `/clients`.
- Paginated search with case-insensitive name, contact, and email filtering.

### 2. 📁 Projects Module (`/projects`)
- Multi-project management with budget tracking, target delivery dates, client linkages, and dedicated project manager assignments.
- Lifecycle state transitions (`PLANNING`, `ACTIVE`, `REVIEW`, `COMPLETED`, `PAUSED`).
- **Deletion Safety Constraint:** Hard deletion (`DELETE /projects/:id`) is strictly prevented if the project has linked tasks (`BadRequestException`), protecting project history and audit records.

### 3. 📋 Tasks & Kanban Module (`/tasks`)
- Granular deliverable tracking with Kanban status columns: `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`, `BACKLOG`.
- Priority levels: `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
- High-efficiency status (`PATCH /tasks/:id/status`) and priority (`PATCH /tasks/:id/priority`) endpoints optimized for drag-and-drop operations.
- Dynamic filtering by project, priority, status, and assignee.

### 4. 📊 Analytics & Dashboard Module (`/dashboard`)
- High-performance SQL aggregation returning executive metrics:
  - Active and total project counts.
  - Total contracted budget valuations.
  - Task completion ratios and client portfolio breakdowns.

### 5. 👥 Users & Provisioning Module (`/users`, `/user-profiles`)
- Provisioning restricted to `ADMIN` and `MANAGER` roles.
- Automatic password hashing via `bcrypt` with validation checks against duplicate email registrations.
- Profile linkage storing first name, last name, and role associations.

---

## 📡 API Endpoints & Permission Matrix

| Method | Endpoint | Description | Required Permission / Guard |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Authenticate user & generate JWT token | Public |
| `GET` | `/auth/profile` | Retrieve active authenticated user session | JWT Required |
| `GET` | `/health` | Healthcheck and timestamp probe | Public (`@Public()`) |
| `GET` | `/dashboard/stats` | Aggregated CRM KPIs and financial statistics | `analytics:read` |
| `GET` | `/client` | Paginated and filtered client company catalog | `clients:read` |
| `POST` | `/client` | Create a new B2B client profile | `clients:create` |
| `GET` | `/client/:id` | Retrieve specific client profile details | `clients:read` |
| `PATCH` | `/client/:id` | Update client details and contract value | `clients:update` |
| `PATCH` | `/client/:id/status` | Update client lifecycle status | `clients:update` |
| `DELETE`| `/client/:id` | Remove a client profile | `clients:delete` |
| `GET` | `/projects` | Paginated and filtered project catalog | `projects:read` |
| `POST` | `/projects` | Create a new project | `projects:create` |
| `GET` | `/projects/:id` | Get detailed project view with client/manager | `projects:read` |
| `PATCH` | `/projects/:id` | Update project metadata and deadlines | `projects:update` |
| `PATCH` | `/projects/:id/status`| Transition project lifecycle status | `projects:update` |
| `DELETE`| `/projects/:id` | Delete project (only if 0 tasks linked) | `projects:delete` |
| `GET` | `/tasks` | Retrieve all deliverables | `tasks:read` |
| `GET` | `/tasks/project/:id` | Retrieve all deliverables for a project | `tasks:read` |
| `GET` | `/tasks/filter` | Query tasks with multi-attribute filters | `tasks:read` |
| `POST` | `/tasks` | Create a new project deliverable | `tasks:create` |
| `PATCH` | `/tasks/:id` | Update deliverable title/description | `tasks:update` |
| `PATCH` | `/tasks/:id/status` | Kanban drag-and-drop status update | `tasks:update` |
| `PATCH` | `/tasks/:id/priority`| Fast deliverable priority transition | `tasks:update` |
| `DELETE`| `/tasks/:id` | Permanently delete a deliverable | `tasks:delete` |
| `GET` | `/users` | List system users (filterable) | JWT Required |
| `POST` | `/users` | Provision a new system user | `ADMIN` or `MANAGER` role |

---

## 🔑 Default Test Credentials & Seeding

The database seeder (`npm run seed`) seeds default roles, permissions, realistic client portfolios, active projects, deliverables, and 4 role-specific test accounts (all passwords: `password123`):

| Role | Email | Password | Assigned Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@crm.com` | `password123` | Full access (`projects:*`, `tasks:*`, `clients:*`, `analytics:*`, User Provisioning) |
| **Manager** | `manager@crm.com` | `password123` | Project/Client management, Task creation & assignment, Dashboard analytics |
| **Developer** | `developer@crm.com` | `password123` | View assigned projects & tasks, update task status and details |
| **Client** | `client@crm.com` | `password123` | Read-only project deliverables view via Client Portal |

> The seeder also populates **18 realistic B2B client organizations** (e.g., *Helix Biotech*, *Dune Media Partners*, *Vertex Pharmaceuticals*) along with active projects, milestone deadlines, and tasks.

---

## 📋 Prerequisites

- **Node.js**: v20.x, v22.x, or v24.x
- **npm**: v10+ or v11+
- **PostgreSQL**: v15+ (local instance or Docker)

---

## 🚀 Installation & Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/graydisel/freelance-crm-backend.git
cd freelance-crm-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```bash
npm run env:init
```
Or configure your `.env` directly:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres_password
DB_DATABASE=crm_db
DB_SSL=false

# Optional: Cloud PostgreSQL URL (e.g., Neon, Render, Supabase)
# POSTGRES_BASE=postgresql://user:password@host/dbname?sslmode=require

# Application Settings
PORT=8080
JWT_SECRET=SUPER_SECRET_KEY
JWT_EXPIRES_IN=12h
ROLES_KEY=superRolesKey
PERMISSIONS_KEY=permissions
```

### 4. Start PostgreSQL (via Docker)
```bash
docker compose up -d postgres_db adminer
```
- **PostgreSQL Database:** `localhost:5432`
- **Adminer Web GUI:** `http://localhost:8081`

### 5. Seed the database
```bash
npm run seed
```

### 6. Run the application
```bash
# Development mode with hot-reload
npm run start:dev

# Production build and run
npm run build
npm run start:prod
```
The API will be available at: **`http://localhost:8080`**  
Verify health probe: **`http://localhost:8080/health`**

---

## 🐳 Running with Docker

Run the entire backend stack (NestJS API + PostgreSQL 15 + Adminer) via Docker Compose:

```bash
# Build and run all containers
docker compose up --build -d

# View live API logs
docker compose logs -f api

# Stop all containers
docker compose down
```

---

## 📦 Database Migrations & Seeding

TypeORM migrations are managed via npm scripts:

```bash
# Generate a new migration based on entity changes
npm run migration:generate -- -n MigrationName

# Apply pending migrations
npm run migration:run

# Revert the latest applied migration
npm run migration:revert

# Run complete database seeder
npm run seed
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run start:dev` | Launch NestJS application in watch mode |
| `npm run build` | Compile TypeScript source code into `dist/` |
| `npm run start:prod` | Execute compiled production bundle (`node dist/main`) |
| `npm run seed` | Seed database with roles, permissions, users, clients, and projects |
| `npm run lint` | Run ESLint with automatic fixes |
| `npm run format` | Format code with Prettier |
| `npm test` | Run Jest unit tests |
| `npm run test:cov` | Generate unit test coverage reports |
| `npm run test:e2e` | Run end-to-end API tests |
| `npm run env:init` | Initialize `.env` file from `.env.example` |

---

## 🌐 CI/CD & Deployment

- **GitHub Actions:** Automated test suite and build verification run on every commit and pull request.
- **Continuous Deployment:** Merges to `master` trigger an automated deployment webhook to **Render**, keeping the live backend updated.

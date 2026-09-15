# 🚀 Freelance CRM — Backend API

An enterprise-grade RESTful API built with **NestJS 11**, **TypeORM**, and **PostgreSQL** powering the Freelance CRM & Project Management platform. Designed for freelancers, agencies, and project managers to streamline client tracking, project workflows, interactive Kanban task management, and business analytics.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Core Features](#-core-features)
- [Database Schema & Roles](#-database-schema--roles)
- [Default Test Credentials](#-default-test-credentials)
- [API Endpoints Overview](#-api-endpoints-overview)
- [Prerequisites](#-prerequisites)
- [Installation & Getting Started](#-installation--getting-started)
- [Running with Docker](#-running-with-docker)
- [Database Migrations & Seeding](#-database-migrations--seeding)
- [Available Scripts](#-available-scripts)
- [CI/CD & Deployment](#-cicd--deployment)

---

## 🌟 Overview

The **Freelance CRM Backend** serves as the central data and business logic hub for managing end-to-end client relationships, contract valuations, multi-project workflows, and granular task assignments. It delivers secure role-based access control (RBAC), robust relational integrity, and fast response times with PostgreSQL.

---

## 🛠 Architecture & Tech Stack

- **Framework:** [NestJS 11](https://nestjs.com/) (Node.js TypeScript framework)
- **Database:** [PostgreSQL 15+](https://www.postgresql.org/) (Local Docker or Cloud PostgreSQL e.g., Neon / Render)
- **ORM:** [TypeORM 1.0](https://typeorm.io/) (Data Mapper pattern, migrations, transactions)
- **Authentication & Security:**
  - [Passport.js](http://www.passportjs.org/) (`passport-jwt`, `passport-local`)
  - [Bcrypt](https://www.npmjs.com/package/bcrypt) for secure password hashing
  - Role-Based Access Control (RBAC) via custom `@Roles()` decorator and `RolesGuard`
  - Strict input validation via `class-validator` & `class-transformer` (global `ValidationPipe` with whitelist and forbidden non-whitelisted properties)
- **Performance & Monitoring:**
  - Route execution timing interceptor (`RouteTimerInterceptor`)
  - Dedicated `/health` probe endpoint
- **DevOps & Containerization:**
  - Multi-stage `Dockerfile` & `docker-compose.yml` (API + PostgreSQL + Adminer)
  - GitHub Actions CI/CD pipeline with automated linting, testing, and production deploy webhook

---

## ⚡ Core Features

### 1. 🔐 Authentication & Authorization (RBAC)
- **JWT-Based Authentication:** Secure token generation and validation.
- **Role Hierarchy:** Differentiated access for `admin`, `manager`, `developer`, and `client`.
- **Protected Endpoints:** Declarative route protection combining `@UseGuards(AuthGuard('jwt'), RolesGuard)` and `@Roles(...)`.

### 2. 🏢 B2B Client Profiles (`/client`)
- Full CRUD for client portfolios: company name, contact person, email, phone, and contract value.
- Real-time client status management (`ACTIVE`, `INACTIVE`, `LEAD`, etc.).
- Paginated search and filtering capabilities.

### 3. 📁 Project Management (`/projects`)
- Comprehensive project lifecycle tracking: `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `ON_HOLD`.
- Association with B2B client profiles, budget allocation, and deadlines.
- Filtered pagination by search term, status, and client.

### 4. 📋 Task & Kanban Management (`/tasks`)
- Granular task tracking associated with projects:
  - **Statuses:** `BACKLOG`, `TO_DO`, `IN_PROGRESS`, `REVIEW`, `DONE`.
  - **Priorities:** `LOW`, `MEDIUM`, `HIGH`.
- Real-time status (`PATCH /tasks/:id/status`) and priority (`PATCH /tasks/:id/priority`) updates designed for fast Kanban drag-and-drop interactions.
- Creator and assignee user relations.

### 5. 📊 Analytics & Dashboard (`/dashboard`)
- High-level CRM metrics: active project counts, total contract values, and completion metrics aggregated directly from the database for executive views.

### 6. 👥 Users & Profiles (`/users`, `/user-profiles`)
- User management with assigned system roles and personalized profile information (`firstName`, `lastName`, etc.).

---

## 🛡 Database Schema & Roles

The system uses strong relational mappings and native PostgreSQL enums:

- **Users (`UserEntity`)** $\leftrightarrow$ **Profiles (`UserProfileEntity`)** (One-to-One)
- **Users (`UserEntity`)** $\rightarrow$ **Roles (`RoleEntity`)** (Many-to-One)
- **Clients (`ClientProfileEntity`)** $\rightarrow$ **Projects (`ProjectEntity`)** (One-to-Many)
- **Projects (`ProjectEntity`)** $\rightarrow$ **Tasks (`TaskEntity`)** (One-to-Many, cascade deletion)
- **Tasks (`TaskEntity`)** $\rightarrow$ **Users (`UserEntity`)** (Creator & Assignee relations)

---

## 🔑 Default Test Credentials

The database seeder (`npm run seed`) automatically creates 4 accounts covering each role (all use password: `password123`):

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@crm.com` | `password123` | Full system access, project/task creation, client management, user management |
| **Manager** | `manager@crm.com` | `password123` | Client management, project/task creation & status updates, dashboard analytics |
| **Developer** | `developer@crm.com` | `password123` | View assigned projects & tasks, update task status & details |
| **Client** | `client@crm.com` | `password123` | Read-only view of associated projects & high-level progress |

> In addition, the seeder populates **18 realistic B2B client companies** (e.g., *Helix Biotech*, *Dune Media Partners*, *Vertex Pharmaceuticals*) with populated contract values, projects, and task records.

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Authenticate user & receive JWT token | Public |
| `GET` | `/auth/profile` | Retrieve current authenticated user profile | JWT Required |
| `GET` | `/health` | Healthcheck endpoint (`{ status: 'ok' }`) | Public |
| `GET` | `/dashboard/stats` | Aggregated CRM financial & project metrics | `admin`, `manager` |
| `GET` | `/client` | Paginated & filtered list of clients | `admin`, `manager` |
| `POST` | `/client` | Create a new client profile | `admin`, `manager` |
| `GET` | `/client/:id` | Get client details by ID | `admin`, `manager` |
| `PATCH` | `/client/:id` | Update client details | `admin`, `manager` |
| `PATCH` | `/client/:id/status`| Update client status | `admin`, `manager` |
| `GET` | `/projects` | Paginated & filtered project list | `admin`, `manager`, `client` |
| `POST` | `/projects` | Create a new project | `admin`, `manager` |
| `GET` | `/projects/:id` | Get project details | `admin`, `manager`, `client` |
| `PATCH` | `/projects/:id` | Update project metadata | `admin`, `manager` |
| `PATCH` | `/projects/:id/status`| Update project lifecycle status | `admin`, `manager` |
| `DELETE`| `/projects/:id` | Delete a project and cascading tasks | `admin`, `manager` |
| `GET` | `/tasks` | Retrieve all tasks | Authenticated |
| `GET` | `/tasks/project/:id`| Retrieve tasks for a specific project | Authenticated |
| `GET` | `/tasks/filter` | Query tasks with filters | Authenticated |
| `POST` | `/tasks` | Create a new task | `admin`, `manager` |
| `PATCH` | `/tasks/:id` | Update task details | `admin`, `manager`, `developer` |
| `PATCH` | `/tasks/:id/status` | Quick status change (Kanban move) | Authenticated |
| `PATCH` | `/tasks/:id/priority`| Quick priority change | Authenticated |
| `DELETE`| `/tasks/:id` | Delete a task | `admin`, `manager` |
| `GET` | `/users` | List users (filterable by role/search) | Authenticated |
| `POST` | `/users` | Create user | Authenticated |

---

## 📋 Prerequisites

- **Node.js**: v20.x or v24.x recommended
- **npm**: v10+
- **PostgreSQL**: v15+ (or Docker / Docker Desktop)

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
Or manually copy `.env.example` to `.env`:
```env
# Database Configuration (Docker / Local)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres_password
DB_DATABASE=crm_db
DB_SSL=false

# Optional: Cloud PostgreSQL connection string (e.g. Neon.tech, Supabase, Render)
# POSTGRES_BASE=postgresql://user:password@host/dbname?sslmode=require

# Application
PORT=8080
JWT_SECRET=SUPER_SECRET_KEY
JWT_EXPIRES_IN=12h
ROLES_KEY=superRolesKey
```

### 4. Start PostgreSQL (Local or Docker)
If you don't have a local PostgreSQL instance installed, you can spin one up via Docker:
```bash
docker compose up -d postgres_db adminer
```
- **PostgreSQL** will be available at `localhost:5432`
- **Adminer** (database web GUI) will be available at `http://localhost:8081`

### 5. Seed initial data
Run the seeding script to create roles, users, clients, projects, and sample tasks:
```bash
npm run seed
```

### 6. Start the development server
```bash
npm run start:dev
```
The API will be available at: **`http://localhost:8080`**  
Verify with health check: **`http://localhost:8080/health`**

---

## 🐳 Running with Docker

You can run the entire backend stack (NestJS API + PostgreSQL 15 + Adminer) with a single command:

```bash
# Build and run containers
docker compose up --build -d

# View container logs
docker compose logs -f api

# Stop all containers
docker compose down
```

Ports:
- **NestJS API:** `http://localhost:8080`
- **Adminer GUI:** `http://localhost:8081`
- **Postgres Database:** `localhost:5432`

---

## 📦 Database Migrations & Seeding

TypeORM migrations are managed via npm scripts:

```bash
# Generate a new migration based on entity changes
npm run migration:generate -- -n MigrationName

# Run pending migrations
npm run migration:run

# Revert the last applied migration
npm run migration:revert

# Run database seed
npm run seed
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run start:dev` | Start NestJS in watch mode (hot-reload) |
| `npm run build` | Build production bundle into `dist/` |
| `npm run start:prod` | Run the compiled production build (`node dist/main`) |
| `npm run seed` | Seed database with roles, users, clients, and tasks |
| `npm run lint` | Run ESLint with automatic fixes |
| `npm run format` | Format source and test files with Prettier |
| `npm test` | Run Jest unit tests |
| `npm run test:cov` | Run tests with coverage reports |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run env:init` | Initialize `.env` file from `.env.example` |

---

## 🌐 CI/CD & Deployment

- **GitHub Actions:** Every push or pull request to `main`, `master`, or `develop` triggers automated linting, test execution, and production build checks.
- **Continuous Deployment:** Merges to `master` trigger an automated webhook deployment to **Render** hosting the live backend API.

# Project Description: CRM Kanban System for Project Management
Full-Stack Web Application designed for tracking projects and managing tasks on a real-time Kanban board. Built using a robust architecture featuring Angular 17+ 
(Frontend), NestJS (Backend), and PostgreSQL (Database).

## 1. Target Audience
The platform is engineered for small-to-medium businesses (SMBs), freelancers, digital agencies, and project managers who require a centralized, lightweight, and structured environment to streamline operations.

* Freelancers and Contractors: Allows them to organize incoming client requests, track financial budgets per contract, and monitor tasks without administrative overhead.

* Project Managers and Team Leads: Provides full visibility over team velocity, allowing them to allocate resources effectively, prevent task stagnation, and break down projects into actionable tasks.

* Executives and Business Owners: The future Dashboard view caters to strategic decision-makers by aggregating high-level financial health (total contract values) and team efficiency metrics across all operations at a single glance.

## 2. Core Functionality & Technical Features
 ### Frontend Architecture (Angular)
* **Dynamic Kanban Workspace:** Projects are represented as modular cards containing their own dedicated Kanban boards with classic workflow columns (To Do, In Progress, Done) for seamless task transition.

* **Modern State Management (Angular Signals):** Leverages fine-grained reactivity via Signals, eliminating heavy zone-based change detection cycles. This ensures immediate UI updates and ultra-fast rendering performance.

* **Smart Network Caching:** Optimized request handling that prevents redundant HTTP GET requests to the server when users navigate between views, preserving client-side application state.

* **Robust Dynamic Validation (Reactive Forms):** Fully enforces strict client-side data entry rules during task creation (e.g., minimum character length, required fields) preventing broken payloads from hitting the network layer.
  ### Backend & Database Architecture (NestJS & PostgreSQL) 
* Enterprise-Grade RESTful API: Provides declarative, highly structured REST endpoints handling full CRUD functionalities for project tracking and task workflows (GET, POST, PUT, PATCH).

* Relational Data Integrity: Features a true relational database schema mapping a One-to-Many relationship between projects and tasks. Configured with automated cascade deletion rules to maintain perfect relational sanitation.

* Database-Level Constraint Validation (SQL Enum): Task state is locked down utilizing an strict native PostgreSQL enum type. This completely safeguards the dataset against corrupted, invalid, or loose string injections from malicious API calls.

* Isolated Environment Configuration: Runtime variables, database ports, and private cloud connection strings are entirely decoupled from the source code using standard .env configuration via @nestjs/config.

## 3. Complete Tech Stack
* Frontend Ecosystem: Angular 17+, TypeScript, RxJS (HttpClient observables), Angular Signals, Reactive Forms, SCSS.

* Backend Ecosystem: NestJS, TypeORM (Object-Relational Mapping), TypeScript, Node.js, @nestjs/config.

* Database Infrastructure: PostgreSQL (hosted on Neon.tech cloud serverless platform).

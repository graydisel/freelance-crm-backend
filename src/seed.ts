import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './users/user.entity';
import { RoleEntity } from './roles/role.entity';
import { ClientProfileEntity } from './client-profiles/client-profile.entity';
import { ProjectEntity } from './projects/project.entity';
import { TaskEntity } from './tasks/task.entity';
import { ProjectStatus } from './projects/enums/project-status.enum';
import { TaskStatus } from './tasks/enums/task-status.enum';
import { TaskPriority } from './tasks/enums/task-priority.enum';
import * as dotenv from 'dotenv';
import { ClientStatus } from './client-profiles/enums/client-status.enum';

dotenv.config();

async function run() {
  console.log('🌱 Start database seed...');

  // Универсальное подключение: если есть POSTGRES_BASE — берем его, иначе собираем параметры из env/Docker
  const isRemote = !!process.env.POSTGRES_BASE;

  const dataSource = new DataSource(
    isRemote
      ? {
        type: 'postgres',
        url: process.env.POSTGRES_BASE,
        ssl:
          process.env.DB_SSL === 'false'
            ? false
            : { rejectUnauthorized: false },
        entities: [
          UserEntity,
          RoleEntity,
          ClientProfileEntity,
          ProjectEntity,
          TaskEntity,
        ],
        synchronize: false,
      }
      : {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres_password',
        database: process.env.DB_DATABASE || 'crm_db',
        ssl: false,
        entities: [
          UserEntity,
          RoleEntity,
          ClientProfileEntity,
          ProjectEntity,
          TaskEntity,
        ],
        synchronize: false,
      },
  );

  try {
    await dataSource.initialize();
    console.log('📡 Successfully connected to PostgreSQL.');

    const roleRepo = dataSource.getRepository(RoleEntity);
    const userRepo = dataSource.getRepository(UserEntity);
    const clientRepo = dataSource.getRepository(ClientProfileEntity);
    const projectRepo = dataSource.getRepository(ProjectEntity);
    const taskRepo = dataSource.getRepository(TaskEntity);

    console.log('🛡️ Checking system roles...');
    let adminRole = await roleRepo.findOne({ where: { name: 'admin' } });
    if (!adminRole)
      adminRole = await roleRepo.save(roleRepo.create({ name: 'admin' }));

    let managerRole = await roleRepo.findOne({ where: { name: 'manager' } });
    if (!managerRole)
      managerRole = await roleRepo.save(roleRepo.create({ name: 'manager' }));

    let developerRole = await roleRepo.findOne({
      where: { name: 'developer' },
    });
    if (!developerRole)
      developerRole = await roleRepo.save(
        roleRepo.create({ name: 'developer' }),
      );

    let clientRole = await roleRepo.findOne({ where: { name: 'client' } });
    if (!clientRole)
      clientRole = await roleRepo.save(roleRepo.create({ name: 'client' }));

    console.log('👤 Checking system users...');
    const passwordHash = await bcrypt.hash('password123', 10);

    let admin = await userRepo.findOne({ where: { email: 'admin@crm.com' } });
    if (!admin) {
      admin = await userRepo.save(
        userRepo.create({
          email: 'admin@crm.com',
          firstName: 'System',
          lastName: 'Administrator',
          passwordHash,
          role: adminRole,
        }),
      );
    }

    let manager = await userRepo.findOne({
      where: { email: 'manager@crm.com' },
    });
    if (!manager) {
      manager = await userRepo.save(
        userRepo.create({
          email: 'manager@crm.com',
          firstName: 'Elena',
          lastName: 'Smirnova',
          passwordHash,
          role: managerRole,
        }),
      );
    }

    let developer = await userRepo.findOne({
      where: { email: 'developer@crm.com' },
    });
    if (!developer) {
      developer = await userRepo.save(
        userRepo.create({
          email: 'developer@crm.com',
          firstName: 'Alex',
          lastName: 'Developer',
          passwordHash,
          role: developerRole,
        }),
      );
    }

    let client = await userRepo.findOne({ where: { email: 'client@crm.com' } });
    if (!client) {
      client = await userRepo.save(
        userRepo.create({
          email: 'client@crm.com',
          firstName: 'Elon',
          lastName: 'Musk',
          passwordHash,
          role: clientRole,
        }),
      );
    }

    console.log('🧹 Cleaning old transactional data...');
    await taskRepo.createQueryBuilder().delete().execute();
    await projectRepo.createQueryBuilder().delete().execute();
    await clientRepo.createQueryBuilder().delete().execute();

    console.log('🏢 Creating 18 Diversified B2B Client Profiles...');
    const clientsData = [
      {
        companyName: 'Helix Biotech',
        contactPerson: 'Yuki Matsumoto',
        contactEmail: 'y.matsumoto@helixbiotech.com',
        phone: '+1 (858) 432-8823',
        contractValue: 225000,
        status: ClientStatus.ACTIVE,
      },
      {
        companyName: 'Dune Media Partners',
        contactPerson: 'Lena Fischer',
        contactEmail: 'l.fischer@dunemedia.de',
        phone: '+49 (89) 5543-991',
        contractValue: 310000,
        status: ClientStatus.ACTIVE,
      },
      {
        companyName: 'Quantum Cybernetics',
        contactPerson: 'Marcus Vance',
        contactEmail: 'm.vance@quantumcyber.io',
        phone: '+1 (415) 889-2231',
        contractValue: 185000,
        status: ClientStatus.ACTIVE,
      },
      {
        companyName: 'Stellar Logistics',
        contactPerson: 'Amara Diop',
        contactEmail: 'a.diop@stellarlog.com',
        phone: '+221 (33) 821-4455',
        contractValue: 95000,
        status: ClientStatus.ACTIVE,
      },
      {
        companyName: 'Vertex Pharmaceuticals',
        contactPerson: 'James Hall',
        contactEmail: 'j.hall@vertexpharma.com',
        phone: '+1 (617) 332-9988',
        contractValue: 560000,
        status: ClientStatus.ACTIVE,
      },
      {
        companyName: 'Pioneer Agriculture',
        contactPerson: 'Ethan Hunt',
        contactEmail: 'e.hunt@pioneeragri.com',
        phone: '+1 (402) 556-7788',
        contractValue: 85000,
        status: ClientStatus.ACTIVE,
      },
      {
        companyName: 'Aether Design Studio',
        contactPerson: 'Chloe Laurent',
        contactEmail: 'c.laurent@aetherdesign.fr',
        phone: '+33 (1) 4221-8833',
        contractValue: 120000,
        status: ClientStatus.ACTIVE,
      },
      {
        companyName: 'Apex Heavy Industries',
        contactPerson: 'Robert Chen',
        contactEmail: 'r.chen@apexheavy.com',
        phone: '+1 (312) 443-1122',
        contractValue: 430000,
        status: ClientStatus.ACTIVE,
      },
      {
        companyName: 'Horizon Fintech',
        contactPerson: 'Sarah Jenkins',
        contactEmail: 's.jenkins@horizonfin.io',
        phone: '+44 (20) 7946-0192',
        contractValue: 275000,
        status: ClientStatus.ACTIVE,
      },

      {
        companyName: 'Cyberdyne Systems',
        contactPerson: 'Miles Dyson',
        contactEmail: 'm.dyson@cyberdyne.com',
        phone: '+1 (213) 555-0199',
        contractValue: 0,
        status: ClientStatus.LEAD,
      },
      {
        companyName: 'E-Corp Solutions',
        contactPerson: 'Tyrell Wellick',
        contactEmail: 't.wellick@ecorp.com',
        phone: '+1 (212) 555-0144',
        contractValue: 45000,
        status: ClientStatus.LEAD,
      },
      {
        companyName: 'Tyrell Bio-Robotics',
        contactPerson: 'Eldon Tyrell',
        contactEmail: 'e.tyrell@tyrellbio.io',
        phone: '+1 (310) 555-0200',
        contractValue: 0,
        status: ClientStatus.LEAD,
      },
      {
        companyName: 'Wayne Enterprises',
        contactPerson: 'Lucius Fox',
        contactEmail: 'l.fox@waynecorp.com',
        phone: '+1 (607) 555-0123',
        contractValue: 150000,
        status: ClientStatus.LEAD,
      },
      {
        companyName: 'Umbrella Corp',
        contactPerson: 'Albert Wesker',
        contactEmail: 'a.wesker@umbrella.com',
        phone: '+1 (800) 555-9988',
        contractValue: 0,
        status: ClientStatus.LEAD,
      },

      {
        companyName: 'Acme Rocketry',
        contactPerson: 'Wile E. Coyote',
        contactEmail: 'coyote@acmerockets.com',
        phone: '+1 (505) 555-4321',
        contractValue: 35000,
        status: ClientStatus.ARCHIVED,
      },
      {
        companyName: 'Initech Software',
        contactPerson: 'Peter Gibbons',
        contactEmail: 'pgibbons@initech.com',
        phone: '+1 (512) 555-7890',
        contractValue: 12000,
        status: ClientStatus.ARCHIVED,
      },
      {
        companyName: 'Hooli Network',
        contactPerson: 'Gavin Belson',
        contactEmail: 'gavin@hooli.xyz',
        phone: '+1 (650) 555-0100',
        contractValue: 850000,
        status: ClientStatus.ARCHIVED,
      },
      {
        companyName: 'Soylent Industries',
        contactPerson: 'Robert Thorn',
        contactEmail: 'r.thorn@soylent.com',
        phone: '+1 (212) 555-1122',
        contractValue: 0,
        status: ClientStatus.ARCHIVED,
      },
    ];

    const savedClients: ClientProfileEntity[] = [];
    for (const data of clientsData) {
      const client = clientRepo.create(data);
      savedClients.push(await clientRepo.save(client));
    }

    const helix = savedClients.find((c) => c.companyName === 'Helix Biotech')!;
    const dune = savedClients.find(
      (c) => c.companyName === 'Dune Media Partners',
    )!;
    const quantum = savedClients.find(
      (c) => c.companyName === 'Quantum Cybernetics',
    )!;
    const vertex = savedClients.find(
      (c) => c.companyName === 'Vertex Pharmaceuticals',
    )!;
    const stellar = savedClients.find(
      (c) => c.companyName === 'Stellar Logistics',
    )!;
    const horizon = savedClients.find(
      (c) => c.companyName === 'Horizon Fintech',
    )!;

    console.log('🚀 Creating Expanded Projects list...');
    const crmProject = await projectRepo.save(
      projectRepo.create({
        name: 'Cloud CRM Architecture',
        description:
          'Refactoring of core modules and modern database migrations',
        status: ProjectStatus.ACTIVE,
        client: helix,
        manager: manager,
      }),
    );

    const videoPlatform = await projectRepo.save(
      projectRepo.create({
        name: 'Next-Gen Video Platform',
        description: 'High-load video streaming platform development',
        status: ProjectStatus.ACTIVE,
        client: dune,
        manager: manager,
      }),
    );

    const aiAnalytics = await projectRepo.save(
      projectRepo.create({
        name: 'AI Analytics Engine',
        description:
          'Integrating Neural Networks for Business Intelligence analytics',
        status: ProjectStatus.PLANNING,
        client: quantum,
        manager: manager,
      }),
    );

    const pharmaAudit = await projectRepo.save(
      projectRepo.create({
        name: 'ERP Compliance System',
        description: 'Internal audit and strict security enterprise software',
        status: ProjectStatus.COMPLETED,
        client: vertex,
        manager: manager,
      }),
    );

    const fleetTracking = await projectRepo.save(
      projectRepo.create({
        name: 'IoT Fleet Tracking System',
        description: 'Real-time telemetry and GPS navigation route optimizer',
        status: ProjectStatus.ACTIVE,
        client: stellar,
        manager: manager,
      }),
    );

    const fintechGateway = await projectRepo.save(
      projectRepo.create({
        name: 'PCI-DSS Payment Gateway',
        description:
          'High-frequency transaction engine with fraud prevention layer',
        status: ProjectStatus.PLANNING,
        client: horizon,
        manager: manager,
      }),
    );

    console.log('📋 Distributing Tasks with 2026 Deadlines across Projects...');

    // Вспомогательная функция для генерации понятных дат ISO в 2026 году
    const createDueDate = (month: number, day: number): Date =>
      new Date(2026, month - 1, day, 18, 0, 0);

    await taskRepo.save([
      // --- Project 1: Cloud CRM Architecture ---
      {
        title: 'Configure JWT Auth Middleware',
        description:
          'Setup Passport JWT strategy and secure functional interceptors',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        deadline: createDueDate(8, 1), // 1 Aug 2026
        project: crmProject,
        creator: manager,
        assignee: developer,
      },
      {
        title: 'Server-Side Pagination Implementation',
        description:
          'Connect NestJS TypeORM query builder with Angular Signals',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        deadline: createDueDate(8, 20), // 20 Aug 2026
        project: crmProject,
        creator: manager,
        assignee: developer,
      },
      {
        title: 'E2E Validation Coverage',
        description: 'Write complete end-to-end unit tests via Jest',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        deadline: createDueDate(9, 5), // 5 Sep 2026
        project: crmProject,
        creator: admin,
        assignee: null,
      },

      // --- Project 2: Next-Gen Video Platform ---
      {
        title: 'FFmpeg Streaming Gateway',
        description: 'Setup transcoding pipeline for high-definition rendering',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        deadline: createDueDate(7, 15), // 15 Jul 2026
        project: videoPlatform,
        creator: manager,
        assignee: developer,
      },
      {
        title: 'UI Dashboard Mobile Refactoring',
        description:
          'Fix grid table squishing and layout breaking on iOS Safari',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        deadline: createDueDate(8, 25), // 25 Aug 2026
        project: videoPlatform,
        creator: manager,
        assignee: developer,
      },

      // --- Project 3: AI Analytics Engine ---
      {
        title: 'Data Ingestion Pipeline Architecture',
        description:
          'Design Kafka streaming pipelines for real-time model scoring',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        deadline: createDueDate(9, 10), // 10 Sep 2026
        project: aiAnalytics,
        creator: manager,
        assignee: developer,
      },
      {
        title: 'Model Inference API Endpoint',
        description: 'Build fast PyTorch prediction gateway using ONNX Runtime',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        deadline: createDueDate(10, 1), // 1 Oct 2026
        project: aiAnalytics,
        creator: manager,
        assignee: null,
      },

      // --- Project 4: ERP Compliance System ---
      {
        title: 'FDA Regulations Security Audit',
        description: 'Verify encryption algorithms for HIPAA and FDA standards',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        deadline: createDueDate(6, 30), // 30 Jun 2026
        project: pharmaAudit,
        creator: manager,
        assignee: developer,
      },

      // --- Project 5: IoT Fleet Tracking System ---
      {
        title: 'WebSocket Telemetry Ingestion Service',
        description:
          'Process 10,000 concurrent ping packets/sec from active vehicles',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        deadline: createDueDate(8, 30), // 30 Aug 2026
        project: fleetTracking,
        creator: manager,
        assignee: developer,
      },
      {
        title: 'Mapbox Navigation Overlay',
        description: 'Render driver routes and geofencing alert zones',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        deadline: createDueDate(9, 15), // 15 Sep 2026
        project: fleetTracking,
        creator: manager,
        assignee: null,
      },

      // --- Project 6: PCI-DSS Payment Gateway ---
      {
        title: 'HSM Cryptographic Key Management',
        description:
          'Implement Hardware Security Module hardware handshake for tokenization',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        deadline: createDueDate(10, 15), // 15 Oct 2026
        project: fintechGateway,
        creator: admin,
        assignee: developer,
      },
    ]);

    console.log(
      '🎉 Database successfully seeded with full production-test workload!',
    );
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Disconnected from PostgreSQL.');
  }
}

run();

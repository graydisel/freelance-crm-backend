import {DataSource, Not} from 'typeorm';
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
  console.log('🌱 Start data base seed...');

  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.POSTGRES_BASE,
    ssl: true,
    entities: [
      UserEntity,
      RoleEntity,
      ClientProfileEntity,
      ProjectEntity,
      TaskEntity,
    ],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('📡 Successfully connected to Neon.');

    const roleRepo = dataSource.getRepository(RoleEntity);
    const userRepo = dataSource.getRepository(UserEntity);
    const clientRepo = dataSource.getRepository(ClientProfileEntity);
    const projectRepo = dataSource.getRepository(ProjectEntity);
    const taskRepo = dataSource.getRepository(TaskEntity);

    console.log('🛡️ Checking system roles...');
    let adminRole = await roleRepo.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
      adminRole = await roleRepo.save(roleRepo.create({ name: 'admin' }));
    }

    let managerRole = await roleRepo.findOne({ where: { name: 'manager' } });
    if (!managerRole) {
      managerRole = await roleRepo.save(roleRepo.create({ name: 'manager' }));
    }

    let developerRole = await roleRepo.findOne({ where: { name: 'developer' } });
    if (!developerRole) {
      developerRole = await roleRepo.save(roleRepo.create({ name: 'developer' }));
    }

    let clientRole = await roleRepo.findOne({ where: { name: 'client' } });
    if (!clientRole) {
      clientRole = await roleRepo.save(roleRepo.create({ name: 'client' }));
    }

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

    let manager = await userRepo.findOne({ where: { email: 'manager@crm.com' } });
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

    let developer = await userRepo.findOne({ where: { email: 'developer@crm.com' } });
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
          lastName: 'Mask',
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
      { companyName: 'Helix Biotech', contactPerson: 'Yuki Matsumoto', contactEmail: 'y.matsumoto@helixbiotech.com', phone: '+1 (858) 432-8823', contractValue: 225000, status: ClientStatus.ACTIVE },
      { companyName: 'Dune Media Partners', contactPerson: 'Lena Fischer', contactEmail: 'l.fischer@dunemedia.de', phone: '+49 (89) 5543-991', contractValue: 310000, status: ClientStatus.ACTIVE },
      { companyName: 'Quantum Cybernetics', contactPerson: 'Marcus Vance', contactEmail: 'm.vance@quantumcyber.io', phone: '+1 (415) 889-2231', contractValue: 185000, status: ClientStatus.ACTIVE },
      { companyName: 'Stellar Logistics', contactPerson: 'Amara Diop', contactEmail: 'a.diop@stellarlog.com', phone: '+221 (33) 821-4455', contractValue: 95000, status: ClientStatus.ACTIVE },
      { companyName: 'Vertex Pharmaceuticals', contactPerson: 'James Hall', contactEmail: 'j.hall@vertexpharma.com', phone: '+1 (617) 332-9988', contractValue: 560000, status: ClientStatus.ACTIVE },
      { companyName: 'Pioneer Agriculture', contactPerson: 'Ethan Hunt', contactEmail: 'e.hunt@pioneeragri.com', phone: '+1 (402) 556-7788', contractValue: 85000, status: ClientStatus.ACTIVE },
      { companyName: 'Aether Design Studio', contactPerson: 'Chloe Laurent', contactEmail: 'c.laurent@aetherdesign.fr', phone: '+33 (1) 4221-8833', contractValue: 120000, status: ClientStatus.ACTIVE },
      { companyName: 'Apex Heavy Industries', contactPerson: 'Robert Chen', contactEmail: 'r.chen@apexheavy.com', phone: '+1 (312) 443-1122', contractValue: 430000, status: ClientStatus.ACTIVE },
      { companyName: 'Horizon Fintech', contactPerson: 'Sarah Jenkins', contactEmail: 's.jenkins@horizonfin.io', phone: '+44 (20) 7946-0192', contractValue: 275000, status: ClientStatus.ACTIVE },

      { companyName: 'Cyberdyne Systems', contactPerson: 'Miles Dyson', contactEmail: 'm.dyson@cyberdyne.com', phone: '+1 (213) 555-0199', contractValue: 0, status: ClientStatus.LEAD },
      { companyName: 'E-Corp Solutions', contactPerson: 'Tyrell Wellick', contactEmail: 't.wellick@ecorp.com', phone: '+1 (212) 555-0144', contractValue: 45000, status: ClientStatus.LEAD },
      { companyName: 'Tyrell Bio-Robotics', contactPerson: 'Eldon Tyrell', contactEmail: 'e.tyrell@tyrellbio.io', phone: '+1 (310) 555-0200', contractValue: 0, status: ClientStatus.LEAD },
      { companyName: 'Wayne Enterprises', contactPerson: 'Lucius Fox', contactEmail: 'l.fox@waynecorp.com', phone: '+1 (607) 555-0123', contractValue: 150000, status: ClientStatus.LEAD },
      { companyName: 'Umbrella Corp', contactPerson: 'Albert Wesker', contactEmail: 'a.wesker@umbrella.com', phone: '+1 (800) 555-9988', contractValue: 0, status: ClientStatus.LEAD },

      { companyName: 'Acme Rocketry', contactPerson: 'Wile E. Coyote', contactEmail: 'coyote@acmerockets.com', phone: '+1 (505) 555-4321', contractValue: 35000, status: ClientStatus.ARCHIVED },
      { companyName: 'Initech Software', contactPerson: 'Peter Gibbons', contactEmail: 'pgibbons@initech.com', phone: '+1 (512) 555-7890', contractValue: 12000, status: ClientStatus.ARCHIVED },
      { companyName: 'Hooli Network', contactPerson: 'Gavin Belson', contactEmail: 'gavin@hooli.xyz', phone: '+1 (650) 555-0100', contractValue: 850000, status: ClientStatus.ARCHIVED },
      { companyName: 'Soylent Industries', contactPerson: 'Robert Thorn', contactEmail: 'r.thorn@soylent.com', phone: '+1 (212) 555-1122', contractValue: 0, status: ClientStatus.ARCHIVED },
    ];

    const savedClients: ClientProfileEntity[] = [];
    for (const data of clientsData) {
      const client = clientRepo.create(data);
      savedClients.push(await clientRepo.save(client));
    }

    const helix = savedClients.find(c => c.companyName === 'Helix Biotech')!;
    const dune = savedClients.find(c => c.companyName === 'Dune Media Partners')!;
    const quantum = savedClients.find(c => c.companyName === 'Quantum Cybernetics')!;
    const vertex = savedClients.find(c => c.companyName === 'Vertex Pharmaceuticals')!;

    console.log('🚀 Creating Projects for Active Clients...');

    const crmProject = await projectRepo.save(
      projectRepo.create({
        name: 'Cloud CRM Architecture',
        description: 'Refactoring of core modules and modern database migrations',
        status: ProjectStatus.ACTIVE,
        client: helix,
        manager: manager,
      }),
    );

    const brandingProject = await projectRepo.save(
      projectRepo.create({
        name: 'Next-Gen Video Platform',
        description: 'High-load video streaming platform development',
        status: ProjectStatus.ACTIVE,
        client: dune,
        manager: manager,
      }),
    );

    const AIProject = await projectRepo.save(
      projectRepo.create({
        name: 'AI Analytics Engine',
        description: 'Integrating Neural Networks for Business Intelligence analytics',
        status: ProjectStatus.PLANNING,
        client: quantum,
        manager: manager,
      }),
    );

    const pharmaProject = await projectRepo.save(
      projectRepo.create({
        name: 'ERP Compliance System',
        description: 'Internal audit and strict security enterprise software',
        status: ProjectStatus.COMPLETED,
        client: vertex,
        manager: manager,
      }),
    );

    console.log('📋 Distributing Tasks across Projects...');
    await taskRepo.save([
      {
        title: 'Configure JWT Auth Middleware',
        description: 'Setup Passport JWT strategy and secure functional interceptors',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        project: crmProject,
        creator: manager!,
        assignee: developer!,
      },
      {
        title: 'Server-Side Pagination Implementation',
        description: 'Connect NestJS TypeORM query builder with Angular Signals',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        project: crmProject,
        creator: manager!,
        assignee: developer!,
      },
      {
        title: 'E2E Validation Coverage',
        description: 'Write complete end-to-end unit tests via Jest',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        project: crmProject,
        creator: admin!,
        assignee: null,
      },
      {
        title: 'FFmpeg Streaming Gateway',
        description: 'Setup transcoding pipeline for high-definition rendering',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        project: brandingProject,
        creator: manager!,
        assignee: developer!,
      },
      {
        title: 'UI Dashboard Mobile Refactoring',
        description: 'Fix grid table squishing and layout breaking on iOS Safari',
        status: TaskStatus.DONE,
        priority: TaskPriority.MEDIUM,
        project: brandingProject,
        creator: manager!,
        assignee: developer!,
      },
      {
        title: 'FDA Regulations Security Audit',
        description: 'Verify encryption algorithms for HIPAA and FDA standards',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        project: pharmaProject,
        creator: manager!,
        assignee: developer!,
      },
    ]);

    console.log('🎉 Database successfully seeded with full production-test workload!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Disconnected from Neon PostgreSQL.');
  }
}

run();

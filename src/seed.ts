import { DataSource, Not } from 'typeorm';
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

dotenv.config();

async function run() {
    console.log('🌱 Start data base seed...');

    const dataSource = new DataSource({
        type: 'postgres',
        url: process.env.POSTGRES_BASE,
        ssl: true,
        entities: [UserEntity, RoleEntity, ClientProfileEntity, ProjectEntity, TaskEntity],
        synchronize: false,
    });

    await dataSource.initialize();
    console.log('📡 Successfully connected to Neon.');

    const roleRepo = dataSource.getRepository(RoleEntity);
    const userRepo = dataSource.getRepository(UserEntity);
    const clientRepo = dataSource.getRepository(ClientProfileEntity);
    const projectRepo = dataSource.getRepository(ProjectEntity);
    const taskRepo = dataSource.getRepository(TaskEntity);

    try {
        console.log('🧹 Deleting test data...');
        const nilUuid = '00000000-0000-0000-0000-000000000000';

        await taskRepo.delete({ id: Not(nilUuid) });
        await projectRepo.delete({ id: Not(nilUuid) });
        await userRepo.delete({ id: Not(nilUuid) });
        await clientRepo.delete({ id: Not(nilUuid) });
        await roleRepo.delete({ id: Not(nilUuid) });

        console.log('👥 Creating roles...');
        const adminRole = await roleRepo.save(roleRepo.create({ name: 'admin' }));
        const managerRole = await roleRepo.save(roleRepo.create({ name: 'manager' }));
        const devRole = await roleRepo.save(roleRepo.create({ name: 'developer' }));
        const clientRole = await roleRepo.save(roleRepo.create({ name: 'client' }));

        const passwordHash = await bcrypt.hash('TestPassword123', 10);

        // 3. Создаем компании-клиенты
        console.log('🏢 Creating companies');
        const spaceX = await clientRepo.save(clientRepo.create({
            companyName: 'SpaceX',
            contractValue: 500000,
            phone: '+1-555-0199',
        }));
        const tesla = await clientRepo.save(clientRepo.create({
            companyName: 'Tesla Energy',
            contractValue: 250000,
            phone: '+1-555-0144',
        }));

        console.log('👤 Creating users...');
        const admin = await userRepo.save(userRepo.create({
            email: 'admin@crm.com',
            passwordHash,
            firstName: 'Aleksey',
            lastName: 'Petriv',
            role: adminRole,
        }));

        const manager = await userRepo.save(userRepo.create({
            email: 'manager@crm.com',
            passwordHash,
            firstName: 'Diana',
            lastName: 'Rose',
            role: managerRole,
        }));

        const developer = await userRepo.save(userRepo.create({
            email: 'dev@crm.com',
            passwordHash,
            firstName: 'Sam',
            lastName: 'Smith',
            role: devRole,
        }));

        const clientUser = await userRepo.save(userRepo.create({
            email: 'elon@spacex.com',
            passwordHash,
            firstName: 'Elon',
            lastName: 'Mask',
            role: clientRole,
            client: spaceX,
        }));

        console.log('📂 Creating projects...');
        const crmProject = await projectRepo.save(projectRepo.create({
            name: 'Mars Telemetry CRM',
            description: 'Internal CRM Start Control System',
            status: ProjectStatus.ACTIVE,
            client: spaceX,
            manager: manager,
        }));

        const autopilotProject = await projectRepo.save(projectRepo.create({
            name: 'Autopilot OS',
            description: 'Updating a Core of Operational System',
            status: ProjectStatus.PLANNING,
            client: tesla,
            manager: manager,
        }));

        console.log('📋 Creating Tasks...');
        await taskRepo.save([
            taskRepo.create({
                title: 'Make API Authorization',
                description: 'Configure Passport JWT и bcrypt encryption',
                status: TaskStatus.DONE,
                priority: TaskPriority.HIGH,
                project: crmProject,
                creator: manager,
                assignee: developer,
            }),
            taskRepo.create({
                title: 'Frontend Angular Integration',
                description: 'Connect endpoints with pages',
                status: TaskStatus.IN_PROGRESS,
                priority: TaskPriority.MEDIUM,
                project: crmProject,
                creator: manager,
                assignee: developer,
            }),
            taskRepo.create({
                title: 'Writing tests and app logics',
                description: 'Cover methods by unit-tests',
                status: TaskStatus.TODO,
                priority: TaskPriority.LOW,
                project: crmProject,
                creator: admin,
                assignee: null,
            }),
        ]);

        console.log('🎉 Data base successfully created');
    } catch (error) {
        console.error('❌ Seeding error:', error);
    } finally {
        await dataSource.destroy();
        console.log('🔌 Connection closed');
    }
}

run();
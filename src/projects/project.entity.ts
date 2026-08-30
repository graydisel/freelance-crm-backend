import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TaskEntity } from '../tasks/task.entity';
import { ClientProfileEntity } from '../client-profiles/client-profile.entity';
import { UserEntity } from '../users/user.entity';
import { ProjectStatus } from './enums/project-status.enum';
import { UserProfileEntity } from 'src/user-profiles/user-profiles.entity';

@Entity('projects')
export class ProjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
  })
  status!: ProjectStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
  @ManyToOne(() => ClientProfileEntity, (client) => client.projects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'client_id' })
  client!: ClientProfileEntity;
  @ManyToOne(() => UserProfileEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'manager_id' })
  manager!: UserProfileEntity;
  @OneToMany(() => TaskEntity, (task) => task.project, { cascade: true })
  tasks!: TaskEntity[];
}

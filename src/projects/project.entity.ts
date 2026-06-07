import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TaskEntity } from '../tasks/task.entity';

@Entity('projects')
export class ProjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'client_name' })
  clientName: string;
  @Column('int')
  budget: number;
  @OneToMany(() => TaskEntity, (task) => task.project, { cascade: true })
  tasks: TaskEntity[];
}

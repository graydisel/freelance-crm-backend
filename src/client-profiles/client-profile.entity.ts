import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { ProjectEntity } from '../projects/project.entity';
import { ClientStatus } from './enums/client-status.enum';

@Entity('client-profiles')
export class ClientProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ name: 'company_name', type: 'varchar', length: 255 })
  companyName: string;
  @Column({
    name: 'contract_value',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  contractValue: number;
  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;
  @Column({
    type: 'enum',
    enum: ClientStatus,
    default: ClientStatus.ACTIVE,
  })
  status: ClientStatus;
  @OneToMany(() => UserEntity, (user) => user.client)
  users: UserEntity[];
  @OneToMany(() => ProjectEntity, (project) => project.client)
  projects: ProjectEntity[];
}

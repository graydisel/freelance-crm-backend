import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClientProfileEntity } from '../client-profiles/client-profile.entity';
import { RoleEntity } from '../roles/role.entity';
import { UserProfileEntity } from '../user-profiles/user-profiles.entity';


@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;
  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;
  @OneToOne(() => UserProfileEntity, (profile) => profile.user, { cascade: true })
  profile: UserProfileEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @ManyToOne(() => RoleEntity, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;
  @ManyToOne(
    () => ClientProfileEntity,
    (clientProfile) => clientProfile.users,
    { nullable: true, onDelete: 'SET NULL' },
  )
  @JoinColumn({ name: 'client_id' })
  client: ClientProfileEntity;
}

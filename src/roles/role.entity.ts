import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {UserEntity} from "../users/user.entity";

@Entity('roles')
export class RoleEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ type: 'varchar', length: 50, unique: true })
    name: string;
    @OneToMany(() => UserEntity, user => user.role)
    users: UserEntity[];
}
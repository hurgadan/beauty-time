import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { TenantEntity } from '../../tenant/dao/tenant.entity';
import { StaffRole } from '../enums/staff-role.enum';

@Entity({ name: 'staff' })
@Index('uq_staff_tenant_email', ['tenantId', 'email'], { unique: true })
@Index('idx_staff_tenant', ['tenantId'])
export class StaffEntity {
  @PrimaryColumn('uuid', { name: 'id', default: () => 'uuidv7()' })
  public id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: false })
  public tenantId!: string;

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  public tenant!: TenantEntity;

  @Column({ name: 'email', type: 'varchar', nullable: false })
  public email!: string;

  @Column({ name: 'full_name', type: 'varchar', nullable: false })
  public fullName!: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: StaffRole,
    enumName: 'staff_role_enum',
    default: StaffRole.STAFF,
    nullable: false,
  })
  public role!: StaffRole;

  @Column({ name: 'is_active', type: 'boolean', default: true, nullable: false })
  public isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  public createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  public updatedAt!: Date;
}

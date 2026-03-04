import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { TenantEntity } from '../../tenant/dao/tenant.entity';

@Entity({ name: 'audit_logs' })
@Index('idx_audit_logs_tenant_created_at', ['tenantId', 'createdAt'])
@Index('idx_audit_logs_action_created_at', ['action', 'createdAt'])
export class AuditLogEntity {
  @PrimaryColumn('uuid', { name: 'id', default: () => 'uuidv7()' })
  public id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  public tenantId!: string | null;

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  public tenant!: TenantEntity | null;

  @Column({ name: 'actor_type', type: 'varchar', nullable: false })
  public actorType!: string;

  @Column({ name: 'actor_id', type: 'varchar', nullable: true })
  public actorId!: string | null;

  @Column({ name: 'action', type: 'varchar', nullable: false })
  public action!: string;

  @Column({ name: 'entity_type', type: 'varchar', nullable: true })
  public entityType!: string | null;

  @Column({ name: 'entity_id', type: 'varchar', nullable: true })
  public entityId!: string | null;

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  public ipAddress!: string | null;

  @Column({ name: 'user_agent', type: 'varchar', nullable: true })
  public userAgent!: string | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: false, default: () => "'{}'::jsonb" })
  public metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  public createdAt!: Date;
}

import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { TenantEntity } from '../../tenant/dao/tenant.entity';

@Entity({ name: 'services' })
@Index('idx_services_tenant', ['tenantId'])
@Index('idx_services_tenant_active', ['tenantId', 'isActive'])
export class ServiceEntity {
  @PrimaryColumn('uuid', { name: 'id', default: () => 'uuidv7()' })
  public id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: false })
  public tenantId!: string;

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  public tenant!: TenantEntity;

  @Column({ name: 'name', type: 'varchar', nullable: false })
  public name!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  public description!: string | null;

  @Column({ name: 'price_cents', type: 'integer', nullable: false })
  public priceCents!: number;

  @Column({ name: 'duration_minutes', type: 'integer', nullable: false })
  public durationMinutes!: number;

  @Column({ name: 'buffer_before_minutes', type: 'integer', default: 0, nullable: false })
  public bufferBeforeMinutes!: number;

  @Column({ name: 'buffer_after_minutes', type: 'integer', default: 0, nullable: false })
  public bufferAfterMinutes!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true, nullable: false })
  public isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  public createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  public updatedAt!: Date;
}

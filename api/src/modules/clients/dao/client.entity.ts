import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { ClientGender, ClientSalutation } from '../../../contracts';
import { TenantEntity } from '../../tenant/dao/tenant.entity';

@Entity({ name: 'clients' })
@Index('idx_clients_tenant', ['tenantId'])
@Index('idx_clients_tenant_created_at', ['tenantId', 'createdAt'])
@Index('uq_clients_tenant_email', ['tenantId', 'email'], { unique: true })
export class ClientEntity {
  @PrimaryColumn('uuid', { name: 'id', default: () => 'uuidv7()' })
  public id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: false })
  public tenantId!: string;

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  public tenant!: TenantEntity;

  @Column({ name: 'first_name', type: 'varchar', nullable: false })
  public firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', nullable: false })
  public lastName!: string;

  @Column({
    name: 'salutation',
    type: 'enum',
    enum: ClientSalutation,
    enumName: 'client_salutation_enum',
    default: ClientSalutation.NONE,
    nullable: false,
  })
  public salutation!: ClientSalutation;

  @Column({
    name: 'gender',
    type: 'enum',
    enum: ClientGender,
    enumName: 'client_gender_enum',
    default: ClientGender.UNSPECIFIED,
    nullable: false,
  })
  public gender!: ClientGender;

  @Column({ name: 'email', type: 'varchar', nullable: false })
  public email!: string;

  @Column({ name: 'phone', type: 'varchar', nullable: true })
  public phone!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  public createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  public updatedAt!: Date;
}

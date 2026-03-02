import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tenants' })
@Index('uq_tenants_slug', ['slug'], { unique: true })
export class TenantEntity {
  @PrimaryColumn('uuid', { name: 'id', default: () => 'uuidv7()' })
  public id!: string;

  @Column({ name: 'name', type: 'varchar', nullable: false })
  public name!: string;

  @Column({ name: 'slug', type: 'varchar', nullable: false })
  public slug!: string;

  @Column({
    name: 'timezone',
    type: 'varchar',
    nullable: false,
    default: 'Europe/Berlin',
  })
  public timezone!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  public createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  public updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  public deletedAt!: Date | null;
}

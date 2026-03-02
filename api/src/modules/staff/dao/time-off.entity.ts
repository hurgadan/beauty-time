import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

import { StaffEntity } from "./staff.entity";
import { TenantEntity } from "../../tenant/dao/tenant.entity";

@Entity({ name: "time_off" })
@Index("idx_time_off_tenant", ["tenantId"])
@Index("idx_time_off_staff", ["staffId"])
@Index("idx_time_off_staff_starts_at", ["staffId", "startsAt"])
export class TimeOffEntity {
  @PrimaryColumn("uuid", { name: "id", default: () => "uuidv7()" })
  public id!: string;

  @Column({ name: "tenant_id", type: "uuid", nullable: false })
  public tenantId!: string;

  @ManyToOne(() => TenantEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  public tenant!: TenantEntity;

  @Column({ name: "staff_id", type: "uuid", nullable: false })
  public staffId!: string;

  @ManyToOne(() => StaffEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "staff_id" })
  public staff!: StaffEntity;

  @Column({ name: "starts_at", type: "timestamptz", nullable: false })
  public startsAt!: Date;

  @Column({ name: "ends_at", type: "timestamptz", nullable: false })
  public endsAt!: Date;

  @Column({ name: "reason", type: "varchar", nullable: true })
  public reason!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  public updatedAt!: Date;
}

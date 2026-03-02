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

@Entity({ name: "working_hours" })
@Index("idx_working_hours_tenant", ["tenantId"])
@Index("idx_working_hours_staff_day", ["staffId", "dayOfWeek"])
export class WorkingHoursEntity {
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

  @Column({ name: "day_of_week", type: "smallint", nullable: false })
  public dayOfWeek!: number;

  @Column({ name: "start_time", type: "time", nullable: false })
  public startTime!: string;

  @Column({ name: "end_time", type: "time", nullable: false })
  public endTime!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  public updatedAt!: Date;
}

import { AppointmentStatus } from "@contracts";
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

import { ClientEntity } from "../../clients/dao/client.entity";
import { ServiceEntity } from "../../services/dao/service.entity";
import { StaffEntity } from "../../staff/dao/staff.entity";
import { TenantEntity } from "../../tenant/dao/tenant.entity";

@Entity({ name: "appointments" })
@Index("idx_appointments_tenant", ["tenantId"])
@Index("idx_appointments_staff_starts_at", ["staffId", "startsAt"])
@Index("idx_appointments_client_starts_at", ["clientId", "startsAt"])
@Index("idx_appointments_tenant_status", ["tenantId", "status"])
export class AppointmentEntity {
  @PrimaryColumn("uuid", { name: "id", default: () => "uuidv7()" })
  public id!: string;

  @Column({ name: "tenant_id", type: "uuid", nullable: false })
  public tenantId!: string;

  @ManyToOne(() => TenantEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  public tenant!: TenantEntity;

  @Column({ name: "staff_id", type: "uuid", nullable: false })
  public staffId!: string;

  @ManyToOne(() => StaffEntity, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "staff_id" })
  public staff!: StaffEntity;

  @Column({ name: "service_id", type: "uuid", nullable: false })
  public serviceId!: string;

  @ManyToOne(() => ServiceEntity, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "service_id" })
  public service!: ServiceEntity;

  @Column({ name: "client_id", type: "uuid", nullable: false })
  public clientId!: string;

  @ManyToOne(() => ClientEntity, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "client_id" })
  public client!: ClientEntity;

  @Column({ name: "starts_at", type: "timestamptz", nullable: false })
  public startsAt!: Date;

  @Column({ name: "ends_at", type: "timestamptz", nullable: false })
  public endsAt!: Date;

  @Column({
    name: "status",
    type: "enum",
    enum: AppointmentStatus,
    enumName: "appointment_status_enum",
    default: AppointmentStatus.BOOKED,
    nullable: false,
  })
  public status!: AppointmentStatus;

  @Column({ name: "notes", type: "text", nullable: true })
  public notes!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  public updatedAt!: Date;
}

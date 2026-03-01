import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

import { ClientEntity } from "../../clients/dao/client.entity";
import { TenantEntity } from "../../tenant/dao/tenant.entity";

@Entity({ name: "otp_sessions" })
@Index("idx_otp_sessions_tenant_email", ["tenantId", "email"])
@Index("idx_otp_sessions_expires_at", ["expiresAt"])
export class OtpSessionEntity {
  @PrimaryColumn("uuid", { name: "id", default: () => "uuidv7()" })
  public id!: string;

  @Column({ name: "tenant_id", type: "uuid", nullable: false })
  public tenantId!: string;

  @ManyToOne(() => TenantEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "tenant_id" })
  public tenant!: TenantEntity;

  @Column({ name: "client_id", type: "uuid", nullable: true })
  public clientId!: string | null;

  @ManyToOne(() => ClientEntity, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "client_id" })
  public client!: ClientEntity | null;

  @Column({ name: "email", type: "varchar", nullable: false })
  public email!: string;

  @Column({ name: "otp_code_hash", type: "varchar", nullable: false })
  public otpCodeHash!: string;

  @Column({
    name: "purpose",
    type: "varchar",
    nullable: false,
    default: "booking_confirm",
  })
  public purpose!: string;

  @Column({ name: "attempts", type: "integer", nullable: false, default: 0 })
  public attempts!: number;

  @Column({ name: "expires_at", type: "timestamptz", nullable: false })
  public expiresAt!: Date;

  @Column({ name: "consumed_at", type: "timestamptz", nullable: true })
  public consumedAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  public createdAt!: Date;
}

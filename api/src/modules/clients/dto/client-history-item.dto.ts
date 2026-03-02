import type { ClientHistoryItemDto as ClientHistoryItemDtoContract } from "@contracts";
import { AppointmentStatus } from "@contracts";
import { ApiProperty } from "@nestjs/swagger";

export class ClientHistoryItemDto implements ClientHistoryItemDtoContract {
  @ApiProperty({ example: "a1234567-89ab-7def-8123-456789abcdef" })
  public appointmentId!: string;

  @ApiProperty({ example: "a1234567-89ab-7def-8123-456789abcdef" })
  public staffId!: string;

  @ApiProperty({ example: "a1234567-89ab-7def-8123-456789abcdef" })
  public serviceId!: string;

  @ApiProperty({ example: "2026-03-04T09:00:00.000Z" })
  public startsAtIso!: string;

  @ApiProperty({ example: "2026-03-04T10:00:00.000Z" })
  public endsAtIso!: string;

  @ApiProperty({ enum: AppointmentStatus, example: AppointmentStatus.BOOKED })
  public status!: AppointmentStatus;

  @ApiProperty({ nullable: true, example: "Client requested quiet service" })
  public notes!: string | null;
}

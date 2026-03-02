import type { ConfirmAppointmentResponseDto as ConfirmAppointmentResponseDtoContract } from '@contracts';
import { AppointmentStatus } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmAppointmentResponseDto implements ConfirmAppointmentResponseDtoContract {
  @ApiProperty({ example: 'appt_public_1' })
  public id!: string;

  @ApiProperty({
    enum: AppointmentStatus,
    example: AppointmentStatus.CONFIRMED_BY_REMINDER,
  })
  public status!: AppointmentStatus;
}

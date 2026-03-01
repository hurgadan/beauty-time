import { ApiProperty } from '@nestjs/swagger';
import type { CreatePublicAppointmentResponseDto as CreatePublicAppointmentResponseDtoContract } from '../../../contracts';

export class CreatePublicAppointmentResponseDto implements CreatePublicAppointmentResponseDtoContract {
  @ApiProperty({ example: 'appt_public_1' })
  public id!: string;

  @ApiProperty({ example: 'studio-berlin-mitte' })
  public bookingSlug!: string;
}

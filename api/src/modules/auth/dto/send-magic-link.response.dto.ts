import type { SendMagicLinkResponseDto as SendMagicLinkResponseDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';

export class SendMagicLinkResponseDto implements SendMagicLinkResponseDtoContract {
  @ApiProperty({ example: true })
  public sent!: boolean;

  @ApiProperty({ example: 'anna@email.de' })
  public email!: string;
}

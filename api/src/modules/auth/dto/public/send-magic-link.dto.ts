import type { SendMagicLinkDto as SendMagicLinkDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SendMagicLinkDto implements SendMagicLinkDtoContract {
  @ApiProperty({ example: 'barber-berlin' })
  @IsString()
  public tenantSlug!: string;

  @ApiProperty({ example: 'anna@email.de' })
  @IsEmail()
  public email!: string;
}

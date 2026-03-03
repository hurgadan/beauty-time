import type { SendMagicLinkDto as SendMagicLinkDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendMagicLinkDto implements SendMagicLinkDtoContract {
  @ApiProperty({ example: 'anna@email.de' })
  @IsEmail()
  public email!: string;
}

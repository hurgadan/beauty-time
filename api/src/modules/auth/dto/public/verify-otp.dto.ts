import type { VerifyOtpDto as VerifyOtpDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyOtpDto implements VerifyOtpDtoContract {
  @ApiProperty({ example: 'barber-berlin' })
  @IsString()
  public tenantSlug!: string;

  @ApiProperty({ example: 'anna@email.de' })
  @IsEmail()
  public email!: string;

  @ApiProperty({ minLength: 6, maxLength: 6, example: '174900' })
  @IsString()
  @Length(6, 6)
  public otp!: string;
}

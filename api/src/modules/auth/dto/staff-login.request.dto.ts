import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import type { StaffLoginRequestDto as StaffLoginRequestDtoContract } from '../../../contracts';

export class StaffLoginRequestDto implements StaffLoginRequestDtoContract {
  @ApiProperty({ example: 'owner@studio.de' })
  @IsEmail()
  public email!: string;

  @ApiProperty({ minLength: 8, example: 'secret-password' })
  @IsString()
  @MinLength(8)
  public password!: string;
}

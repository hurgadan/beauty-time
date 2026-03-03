import type { StaffLoginDto as StaffLoginDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class StaffLoginDto implements StaffLoginDtoContract {
  @ApiProperty({ example: 'owner@studio.de' })
  @IsEmail()
  public email!: string;

  @ApiProperty({ minLength: 8, example: 'secret-password' })
  @IsString()
  @MinLength(8)
  public password!: string;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

import type { VerifyOtpRequestDto as VerifyOtpRequestDtoContract } from "../../../contracts";

export class VerifyOtpRequestDto implements VerifyOtpRequestDtoContract {
  @ApiProperty({ example: "anna@email.de" })
  @IsEmail()
  public email!: string;

  @ApiProperty({ minLength: 6, maxLength: 6, example: "174900" })
  @IsString()
  @Length(6, 6)
  public otp!: string;
}

import { ApiProperty } from "@nestjs/swagger";

import type { VerifyOtpResponseDto as VerifyOtpResponseDtoContract } from "../../../contracts";

export class VerifyOtpResponseDto implements VerifyOtpResponseDtoContract {
  @ApiProperty({ example: true })
  public verified!: boolean;

  @ApiProperty({ example: "session_anna@email.de" })
  public token!: string;
}

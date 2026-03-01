import { ApiProperty } from "@nestjs/swagger";

import type { SendMagicLinkResponseDto as SendMagicLinkResponseDtoContract } from "../../../contracts";

export class SendMagicLinkResponseDto implements SendMagicLinkResponseDtoContract {
  @ApiProperty({ example: true })
  public sent!: boolean;

  @ApiProperty({ example: "anna@email.de" })
  public email!: string;
}

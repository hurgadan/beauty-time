import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

import type { SendMagicLinkRequestDto as SendMagicLinkRequestDtoContract } from "../../../contracts";

export class SendMagicLinkRequestDto implements SendMagicLinkRequestDtoContract {
  @ApiProperty({ example: "anna@email.de" })
  @IsEmail()
  public email!: string;
}

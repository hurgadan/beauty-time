import { ApiProperty } from "@nestjs/swagger";

import type { ClientDto as ClientDtoContract } from "../../../contracts";
import { ClientGender, ClientSalutation } from "../../../contracts";

export class ClientResponseDto implements ClientDtoContract {
  @ApiProperty({ example: "client_1" })
  public id!: string;

  @ApiProperty({ example: "tenant_1" })
  public tenantId!: string;

  @ApiProperty({ example: "Sofia" })
  public firstName!: string;

  @ApiProperty({ example: "Ludwig" })
  public lastName!: string;

  @ApiProperty({ enum: ClientSalutation, example: ClientSalutation.FRAU })
  public salutation!: ClientSalutation;

  @ApiProperty({ enum: ClientGender, example: ClientGender.FEMALE })
  public gender!: ClientGender;

  @ApiProperty({ example: "sofia@example.com" })
  public email!: string;

  @ApiProperty({ example: "+491701234567", nullable: true })
  public phone!: string | null;

  @ApiProperty({ example: true })
  public isReturningClient!: boolean;
}

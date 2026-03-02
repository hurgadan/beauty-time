import type { ClientListItemDto as ClientListItemDtoContract } from "@contracts";
import { ClientGender, ClientSalutation } from "@contracts";
import { ApiProperty } from "@nestjs/swagger";

export class ClientListItemDto implements ClientListItemDtoContract {
  @ApiProperty({ example: "a1234567-89ab-7def-8123-456789abcdef" })
  public id!: string;

  @ApiProperty({ example: "a1234567-89ab-7def-8123-456789abcdef" })
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

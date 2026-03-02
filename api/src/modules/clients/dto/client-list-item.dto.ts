import type { ClientListItemDto as ClientListItemDtoContract } from '@contracts';
import { ClientGender, ClientSalutation } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ClientListItemDto implements ClientListItemDtoContract {
  @Expose()
  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abcdef' })
  public id!: string;

  @Expose()
  @ApiProperty({ example: 'a1234567-89ab-7def-8123-456789abcdef' })
  public tenantId!: string;

  @Expose()
  @ApiProperty({ example: 'Sofia' })
  public firstName!: string;

  @Expose()
  @ApiProperty({ example: 'Ludwig' })
  public lastName!: string;

  @Expose()
  @ApiProperty({ enum: ClientSalutation, example: ClientSalutation.FRAU })
  public salutation!: ClientSalutation;

  @Expose()
  @ApiProperty({ enum: ClientGender, example: ClientGender.FEMALE })
  public gender!: ClientGender;

  @Expose()
  @ApiProperty({ example: 'sofia@example.com' })
  public email!: string;

  @Expose()
  @ApiProperty({ example: '+491701234567', nullable: true })
  public phone!: string | null;

  @Expose()
  @ApiProperty({ example: true })
  public isReturningClient!: boolean;
}

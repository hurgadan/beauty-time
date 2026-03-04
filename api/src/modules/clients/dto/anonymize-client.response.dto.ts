import type { AnonymizeClientResponseDto as AnonymizeClientResponseDtoContract } from '@contracts';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AnonymizeClientResponseDto implements AnonymizeClientResponseDtoContract {
  @Expose()
  @ApiProperty({ example: '019561d0-c8d6-75dd-a6ed-4898286a90cd' })
  public id!: string;

  @Expose()
  @ApiProperty({ example: true })
  public anonymized!: boolean;
}

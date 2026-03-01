import { ApiProperty } from "@nestjs/swagger";

import type { HealthCheckResponseDto as HealthCheckResponseDtoContract } from "../../../contracts";

export class HealthCheckResponseDto implements HealthCheckResponseDtoContract {
  @ApiProperty({ example: "ok" })
  public status!: string;

  @ApiProperty({ example: "api" })
  public service!: string;
}

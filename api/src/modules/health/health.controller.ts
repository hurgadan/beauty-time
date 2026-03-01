import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { HealthCheckResponseDto } from "./dto/health-check.response.dto";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  @ApiOperation({ summary: "Health check" })
  @ApiOkResponse({ type: HealthCheckResponseDto })
  public check(): HealthCheckResponseDto {
    return { status: "ok", service: "api" };
  }
}

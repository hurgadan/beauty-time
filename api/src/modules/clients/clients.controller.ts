import {
  Controller,
  Get,
  Param,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";

import { ClientGender, ClientSalutation } from "../../contracts";
import { ClientResponseDto } from "./dto/client.response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { RequestWithUser } from "../auth/types/request-with-user.interface";

@ApiTags("clients")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("clients")
export class ClientsController {
  @Get(":id")
  @ApiOperation({ summary: "Get client card by id" })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ type: ClientResponseDto })
  public getClient(
    @Req() request: RequestWithUser,
    @Param("id") id: string,
  ): ClientResponseDto {
    const tenantId = request.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException("Missing tenant in token");
    }

    return {
      id,
      tenantId,
      firstName: "Sofia",
      lastName: "Ludwig",
      salutation: ClientSalutation.FRAU,
      gender: ClientGender.FEMALE,
      email: "sofia@example.com",
      phone: "+491701234567",
      isReturningClient: true,
    };
  }
}

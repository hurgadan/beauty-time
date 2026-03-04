import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { StaffLoginDto } from './dto/staff-login.dto';
import { StaffLoginResponseDto } from './dto/staff-login.response.dto';
import { RateLimit } from '../../_common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../../_common/guards/rate-limit.guard';
import { AuditService } from '../audit/audit.service';
import type { RequestWithUser } from './types/request-with-user.interface';

@ApiTags('auth')
@UseGuards(RateLimitGuard)
@Controller('auth')
export class CrmAuthController {
  public constructor(
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
  ) {}

  @Post('staff/login')
  @RateLimit({ key: 'crm-auth-staff-login', maxRequests: 10, windowSeconds: 60 })
  @ApiOperation({ summary: 'Staff login' })
  @ApiBody({ type: StaffLoginDto })
  @ApiOkResponse({ type: StaffLoginResponseDto })
  public async staffLogin(
    @Req() request: RequestWithUser,
    @Body() dto: StaffLoginDto,
  ): Promise<StaffLoginResponseDto> {
    const result = this.authService.staffLogin(dto.email);
    await this.auditService.logFromRequest(request, {
      action: 'auth.crm.staff_login',
      actorType: 'crm_staff',
      actorId: dto.email.toLowerCase().trim(),
      metadata: {
        email: dto.email.toLowerCase().trim(),
      },
    });

    return result;
  }
}

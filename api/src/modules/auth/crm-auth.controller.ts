import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { StaffLoginDto } from './dto/staff-login.dto';
import { StaffLoginResponseDto } from './dto/staff-login.response.dto';

@ApiTags('auth')
@Controller('auth')
export class CrmAuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post('staff/login')
  @ApiOperation({ summary: 'Staff login' })
  @ApiBody({ type: StaffLoginDto })
  @ApiOkResponse({ type: StaffLoginResponseDto })
  public staffLogin(@Body() dto: StaffLoginDto): StaffLoginResponseDto {
    return this.authService.staffLogin(dto.email);
  }
}

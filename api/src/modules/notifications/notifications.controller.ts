import { Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ScheduleNotificationsResponseDto } from './dto/schedule-notifications.response.dto';
import { SendNotificationsResponseDto } from './dto/send-notifications.response.dto';

@ApiTags('notifications')
@Controller('internal/notifications')
export class NotificationsController {
  @Post('schedule')
  @ApiOperation({ summary: 'Schedule notifications for jobs queue' })
  @ApiOkResponse({ type: ScheduleNotificationsResponseDto })
  public schedule(): ScheduleNotificationsResponseDto {
    return { queued: true };
  }

  @Post('send')
  @ApiOperation({ summary: 'Send notifications immediately' })
  @ApiOkResponse({ type: SendNotificationsResponseDto })
  public sendNow(): SendNotificationsResponseDto {
    return { sent: true };
  }
}

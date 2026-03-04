import { Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ScheduleNotificationsResponseDto } from './dto/schedule-notifications.response.dto';
import { SendNotificationsResponseDto } from './dto/send-notifications.response.dto';
import { NotificationsProcessingService } from './notifications-processing.service';

@ApiTags('notifications')
@Controller('internal/notifications')
export class NotificationsController {
  public constructor(
    private readonly notificationsProcessingService: NotificationsProcessingService,
  ) {}

  @Post('schedule')
  @ApiOperation({ summary: 'Schedule notifications for jobs queue' })
  @ApiOkResponse({ type: ScheduleNotificationsResponseDto })
  public async schedule(): Promise<ScheduleNotificationsResponseDto> {
    const jobs = await this.notificationsProcessingService.schedulePendingNotifications();
    return { queued: true, jobs };
  }

  @Post('send')
  @ApiOperation({ summary: 'Send notifications immediately' })
  @ApiOkResponse({ type: SendNotificationsResponseDto })
  public async sendNow(): Promise<SendNotificationsResponseDto> {
    const result = await this.notificationsProcessingService.sendDueNotifications();
    return { sent: true, processed: result.processed, failed: result.failed };
  }
}

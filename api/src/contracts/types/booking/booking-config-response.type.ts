import type { PublicBookingServiceDto } from './public-booking-service.type';
import type { PublicBookingStaffDto } from './public-booking-staff.type';

export interface BookingConfigResponseDto {
  tenantSlug: string;
  timezone: string;
  reminderChannels: string[];
  services: PublicBookingServiceDto[];
  staff: PublicBookingStaffDto[];
}

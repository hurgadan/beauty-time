import { ApiProperty } from "@nestjs/swagger";

import type { BookingConfigResponseDto as BookingConfigResponseDtoContract } from "../../../contracts";

export class BookingConfigResponseDto implements BookingConfigResponseDtoContract {
  @ApiProperty({ example: "studio-berlin-mitte" })
  public bookingSlug!: string;

  @ApiProperty({ example: "Europe/Berlin" })
  public timezone!: string;

  @ApiProperty({ type: () => [String], example: ["email"] })
  public reminderChannels!: string[];
}

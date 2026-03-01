import { ApiProperty } from "@nestjs/swagger";

import { AvailabilitySlotResponseDto } from "./availability-slot.response.dto";
import type { AvailabilityQueryResponseDto as AvailabilityQueryResponseDtoContract } from "../../../contracts";

export class AvailabilityQueryResponseDto implements AvailabilityQueryResponseDtoContract {
  @ApiProperty({ example: "studio-berlin-mitte" })
  public bookingSlug!: string;

  @ApiProperty({ type: () => [AvailabilitySlotResponseDto] })
  public slots!: AvailabilitySlotResponseDto[];
}

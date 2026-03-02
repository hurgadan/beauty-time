export interface CreateServiceRequestDto {
  name: string;
  description?: string;
  priceCents: number;
  durationMinutes: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  isActive?: boolean;
}

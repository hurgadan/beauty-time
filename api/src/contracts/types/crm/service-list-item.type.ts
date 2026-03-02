export interface ServiceListItemDto {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  priceCents: number;
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  isActive: boolean;
}

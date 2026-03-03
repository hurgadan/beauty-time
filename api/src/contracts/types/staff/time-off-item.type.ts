export interface TimeOffItemDto {
  id: string;
  staffId: string;
  startsAtIso: string;
  endsAtIso: string;
  reason: string | null;
}

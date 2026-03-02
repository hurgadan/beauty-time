export interface CreateTimeOffRequestDto {
  startsAtIso: string;
  endsAtIso: string;
  reason?: string;
}

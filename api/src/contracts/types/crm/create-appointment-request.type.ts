export interface CreateAppointmentRequestDto {
  staffId: string;
  serviceId: string;
  clientId: string;
  startsAtIso: string;
  endsAtIso: string;
  notes?: string;
}

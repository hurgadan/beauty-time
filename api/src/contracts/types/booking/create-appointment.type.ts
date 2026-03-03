export interface CreateAppointmentDto {
  staffId: string;
  serviceId: string;
  clientId: string;
  startsAtIso: string;
  endsAtIso: string;
  notes?: string;
}

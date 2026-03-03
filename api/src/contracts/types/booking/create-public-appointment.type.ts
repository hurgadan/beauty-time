export interface CreatePublicAppointmentDto {
  clientName: string;
  clientEmail: string;
  serviceId: string;
  staffId?: string;
  startsAtIso: string;
}

export interface CreatePublicAppointmentRequestDto {
  clientName: string;
  clientEmail: string;
  serviceId: string;
  staffId?: string;
  startsAtIso: string;
}

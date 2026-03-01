import type { ClientGender } from "./enums/client-gender.enum";
import type { ClientSalutation } from "./enums/client-salutation.enum";

export interface ClientDto {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  salutation: ClientSalutation;
  gender: ClientGender;
  email: string;
  phone: string | null;
  isReturningClient: boolean;
}

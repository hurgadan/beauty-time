import type { ClientGender } from './enums';
import type { ClientSalutation } from './enums';

export interface Client {
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

export type ClientDto = Client;

import type { EntrepreneurDetailsDomainInterface } from './entrepreneur-details-domain.interface';

export interface EntrepreneurDomainInterface {
  username: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  birthdate: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  full_address: string;
  details: EntrepreneurDetailsDomainInterface;
}

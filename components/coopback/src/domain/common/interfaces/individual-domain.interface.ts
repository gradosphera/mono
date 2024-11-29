import type { PassportDataDomainInterface } from './passport-data-domain.interface';

export type IndividualDomainInterface = {
  username: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  birthdate: string;
  full_address: string;
  phone: string;
  email: string;
  passport?: PassportDataDomainInterface;
};

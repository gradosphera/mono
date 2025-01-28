import type { OrganizationDetailsDomainInterface } from './organization-details-domain.interface';
import type { RepresentedByDomainInterface } from './represented-by.interface';

export type OrganizationDomainInterface = {
  username: string;
  type: string;
  short_name: string;
  full_name: string;
  represented_by: RepresentedByDomainInterface;
  country: string;
  city: string;
  full_address: string;
  fact_address: string;
  phone: string;
  email: string;
  details: OrganizationDetailsDomainInterface;
};

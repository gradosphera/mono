import type { IndividualDomainInterface } from '~/domain/common/interfaces/individual-domain.interface';
import type { OrganizationDomainInterface } from '~/domain/common/interfaces/organization-domain.interface';

export type BranchDomainInterface = Omit<OrganizationDomainInterface, 'username'> & {
  braname: string; ///< имя аккаунта
  trustee: IndividualDomainInterface;
  trusted: IndividualDomainInterface[];
};

import type { IndividualDomainInterface } from '~/domain/common/interfaces/individual-domain.interface';

export interface InstallInputDomainInterface {
  soviet: {
    individual_data: Omit<IndividualDomainInterface, 'username'>;
    role: 'chairman' | 'member';
  }[];
  wif: string;
}

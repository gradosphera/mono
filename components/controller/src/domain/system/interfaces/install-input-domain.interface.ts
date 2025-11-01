import type { IndividualDomainInterface } from '~/domain/common/interfaces/individual-domain.interface';
import type { VarsDomainInterface } from './vars-domain.interface';

export interface InstallInputDomainInterface {
  soviet: {
    individual_data: Omit<IndividualDomainInterface, 'username'>;
    role: 'chairman' | 'member';
  }[];
  wif: string;
  vars: VarsDomainInterface;
}

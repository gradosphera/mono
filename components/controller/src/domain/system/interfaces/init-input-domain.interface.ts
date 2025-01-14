import type { VarsDomainInterface } from './vars-domain.interface';
import type { CreateOrganizationDataInputDomainInterface } from '~/domain/account/interfaces/create-organization-data-input-domain.interface';

export interface InitInputDomainInterface {
  organization_data: CreateOrganizationDataInputDomainInterface;
  vars: VarsDomainInterface;
}

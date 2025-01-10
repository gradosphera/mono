import type { VarsDomainInterface } from './vars-domain.interface';
import type { OrganizationDomainEntity } from '~/domain/branch/entities/organization-domain.entity';

export interface UpdateInputDomainInterface {
  organization_data?: OrganizationDomainEntity;
  vars?: VarsDomainInterface;
}

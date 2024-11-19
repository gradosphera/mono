import type { SovietContract } from 'cooptypes';
import type { OrganizationDomainInterface } from '~/domain/common/interfaces/organization-domain.interface';

export type BranchDomainInterface = Omit<OrganizationDomainInterface, 'username'> & SovietContract.Tables.Branches.IBranch;

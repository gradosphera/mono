import type { PrivateAccountDomainInterface } from '~/domain/account/interfaces/private-account-domain.interface';
import type { OrganizationDomainInterface } from '~/domain/common/interfaces/organization-domain.interface';

export interface GetInstallationStatusInputDomainInterface {
  install_code: string;
}

export interface InstallationStatusDomainInterface {
  has_private_account: boolean;
  private_account: PrivateAccountDomainInterface | null;
  init_by_server?: boolean;
  organization_data?: OrganizationDomainInterface | null;
}

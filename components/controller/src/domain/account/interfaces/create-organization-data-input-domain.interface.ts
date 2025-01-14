import type { Cooperative } from 'cooptypes';

export type CreateOrganizationDataInputDomainInterface = Omit<Cooperative.Users.IOrganizationData, 'username'> & {
  bank_account: Cooperative.Payments.IBankAccount;
};

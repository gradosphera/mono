import { Queries, Zeus } from '@coopenomics/sdk';

export type IAccount = Queries.Accounts.GetAccount.IOutput[typeof Queries.Accounts.GetAccount.name]
export type IAccounts = Queries.Accounts.GetAccounts.IOutput[typeof Queries.Accounts.GetAccounts.name]
export type IGetAccounts = {data?: Queries.Accounts.GetAccounts.IInput['data'], options?: Queries.Accounts.GetAccounts.IInput['options']}

export const AccountTypes = Zeus.AccountType

export type IIndividualData = Zeus.ModelTypes['Individual']
export type IOrganizationData = Zeus.ModelTypes['Organization']
export type IEntrepreneurData = Zeus.ModelTypes['Entrepreneur']
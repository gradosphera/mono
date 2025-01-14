import { Queries } from '@coopenomics/sdk';

export type IAccount = Queries.Accounts.GetAccount.IOutput[typeof Queries.Accounts.GetAccount.name]

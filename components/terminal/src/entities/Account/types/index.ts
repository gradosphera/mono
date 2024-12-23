import { Queries } from '@coopenomics/coopjs';

export type IAccount = Queries.Accounts.GetAccount.IOutput[typeof Queries.Accounts.GetAccount.name]

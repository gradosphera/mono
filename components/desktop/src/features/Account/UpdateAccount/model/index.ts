import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api'
import { IAccount } from 'src/entities/Account/types';

export type IUpdateAccountInput = Mutations.Accounts.UpdateAccount.IInput['data']

export function useUpdateAccount() {

  async function updateAccount(data: IUpdateAccountInput): Promise<IAccount> {
    const account = await api.updateAccount(data);

    return account;
  }

  return { updateAccount };
}

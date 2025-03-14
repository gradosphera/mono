import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api'
import { useAccountStore } from 'src/entities/Account/model';
import { IAccount } from 'src/entities/Account/types';
import { useSystemStore } from 'src/entities/System/model';

export type IUpdateAccountInput = Mutations.Accounts.UpdateAccount.IInput['data']

export function useUpdateAccount() {
  const store = useAccountStore();
  const { info } = useSystemStore()

  async function updateAccount(data: IUpdateAccountInput): Promise<IAccount> {
    console.log('%cUPDATEA CCC', 'color: green')
    const account = await api.updateAccount(data);

    return account;
  }

  return { updateAccount };
}

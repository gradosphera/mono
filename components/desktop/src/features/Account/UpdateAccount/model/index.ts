import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api'
import { useAccountStore } from 'src/entities/Account/model';
import { IAccount } from 'src/entities/Account/types';
import { useSystemStore } from 'src/entities/System/model';

export type IUpdateAccountInput = Mutations.Accounts.UpdateAccount.IInput['data']

export function useUpdateAccount() {
  const store = useAccountStore();
  const { info } = useSystemStore()

//   const initialCreateBranchInput: ICreateBranchInput = {
//     coopname: info.coopname,
//     braname: '',
//     email: '',
//     fact_address: '',
//     short_name: '',
//     full_name: '',
//     phone: '',
//     based_on: '',
//   };

//   const createBranchInput = ref<ICreateBranchInput>({
//     ...initialCreateBranchInput,
//     braname: generateUsername() // Генерация начального имени
//   });

  async function updateAccount(data: IUpdateAccountInput): Promise<IAccount> {
    console.log("%cUPDATEA CCC", 'color: green')
    const account = await api.updateAccount(data);

    return account;
  }

  return { updateAccount };
}

import { defineStore } from 'pinia'
import { ref, Ref } from 'vue'
import { api } from '../api'
import type { IAccount, IAccounts, IGetAccounts } from '../types';

const namespace = 'accountStore';

interface IAccountStore {
  account: Ref<IAccount | undefined>
  accounts: Ref<IAccounts | undefined>
  getAccount: (username: string) => Promise<IAccount | undefined>;
  getAccounts: (data?: IGetAccounts) => Promise<IAccounts>;
}

export const useAccountStore = defineStore(namespace, (): IAccountStore => {
  const account = ref<IAccount>()
  const accounts = ref<IAccounts | undefined>()

  const getAccount = async (username: string): Promise<IAccount | undefined> => {
    account.value = await api.getAccount(username);
    return account.value
  };
  
  const getAccounts = async(data?: IGetAccounts): Promise<IAccounts> => {
    accounts.value = await api.getAccounts(data);
    return accounts.value
  }

  return {
    account,
    accounts,
    getAccount,
    getAccounts
  }
})

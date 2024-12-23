import { defineStore } from 'pinia'
import { ref, Ref } from 'vue'
import { api } from '../api'
import type { IAccount } from '../types';

const namespace = 'accountStore';

interface ISystemStore {
  account: Ref<IAccount | undefined>
  getAccount: (username: string) => Promise<IAccount | undefined>;
}

export const useAccountStore = defineStore(namespace, (): ISystemStore => {
  const account = ref<IAccount>()

  const getAccount = async (username: string) => {
    account.value = await api.getAccount(username);
    return account.value
  };

  return {
    account,
    getAccount
  }
})

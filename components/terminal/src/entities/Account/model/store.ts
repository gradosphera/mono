import { defineStore } from 'pinia'
import { ref, Ref } from 'vue'
import { api } from '../api'
import { ModelTypes } from '@coopenomics/coopjs';

const namespace = 'accountStore';

interface ISystemStore {
  account: Ref<ModelTypes['Account'] | undefined>
  getAccount: (username: string) => Promise<ModelTypes['Account'] | undefined>;
}

export const useAccountStore = defineStore(namespace, (): ISystemStore => {
  const account = ref<ModelTypes['Account']>()

  const getAccount = async (username: string) => {
    account.value = await api.getAccount(username);
    console.log('getAccount: ', account.value)
    return account.value
  };

  return {
    account,
    getAccount
  }
})

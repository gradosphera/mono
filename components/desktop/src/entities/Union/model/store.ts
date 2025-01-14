import { RegistratorContract } from 'cooptypes'
import { defineStore } from 'pinia'

const namespace = 'union'

export const useUnionStore = defineStore(
  namespace,
  () => {

    const coops = [] as RegistratorContract.Tables.Cooperatives.ICooperative[]

    return {
      coops
    }
  },
  {
    persist: false
  }
  )

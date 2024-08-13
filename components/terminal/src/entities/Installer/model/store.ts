import { defineStore } from 'pinia';
import { reactive } from 'vue';

interface IInstallCooperative {
  data: {
    wif: string
  }
}

const namespace = 'install';

export const useInstallCooperativeStore = defineStore(
  namespace,
  (): IInstallCooperative => {

    const data = reactive({
      wif: ''
    })

    return {
      data
    }
  }, {
    persist: true,
  })


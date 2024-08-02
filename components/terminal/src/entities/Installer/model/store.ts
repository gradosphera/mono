import { defineStore } from 'pinia';
import { reactive } from 'vue';

interface IInstallCooperative {
  data: {
    test1: string
  }
}

const namespace = 'install';

export const useInstallCooperativeStore = defineStore(
  namespace,
  (): IInstallCooperative => {

    const data = reactive({
      test1: 'test'
    })

    return {
      data
    }
  })


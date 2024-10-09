import { defineStore } from 'pinia';
import { IIndividualData } from 'src/shared/lib/types/user/IUserData';
import { Ref, ref } from 'vue';

interface data {
  id: number,
  role: 'chairman' | 'member',
  individual_data: IIndividualData
}

interface IInstallCooperative {
  wif: Ref<string | undefined>
  is_finish: Ref<boolean>
  soviet: Ref<data[]>
}

const namespace = 'install';

export const useInstallCooperativeStore = defineStore(
  namespace,
  (): IInstallCooperative => {

    const soviet = ref([])
    const is_finish = ref(false)
    const wif = ref()

    return {
      soviet,
      is_finish,
      wif
    }
  }, {
    persist: true,
  })


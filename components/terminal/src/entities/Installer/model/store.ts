import { defineStore } from 'pinia';
import { IIndividualData } from 'src/shared/lib/types/user/IUserData';
import { Ref, ref } from 'vue';

interface data {
  id: number,
  role: string,
  type: 'individual',
  individual_data: IIndividualData
}

interface IInstallCooperative {
  is_finish: Ref<boolean>
  soviet: Ref<data[]>
}

const namespace = 'install';

export const useInstallCooperativeStore = defineStore(
  namespace,
  (): IInstallCooperative => {

    const soviet = ref([])
    const is_finish = ref(false)

    return {
      soviet,
      is_finish
    }
  }, {
    persist: true,
  })


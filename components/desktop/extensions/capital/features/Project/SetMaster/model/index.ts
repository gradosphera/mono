import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';

export type ISetMasterInput = Mutations.Capital.SetMaster.IInput['data'];

export function useSetMaster() {
  const initialSetMasterInput: ISetMasterInput = {
    coopname: '',
    master: '',
    project_hash: '',
  };

  const setMasterInput = ref<ISetMasterInput>({
    ...initialSetMasterInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(input: Ref<ISetMasterInput>, initial: ISetMasterInput) {
    Object.assign(input.value, initial);
  }

  async function setMaster(data: ISetMasterInput) {
    const transaction = await api.setMaster(data);

    // Сбрасываем setMasterInput после выполнения setMaster
    resetInput(setMasterInput, initialSetMasterInput);

    return transaction;
  }

  return { setMaster, setMasterInput };
}

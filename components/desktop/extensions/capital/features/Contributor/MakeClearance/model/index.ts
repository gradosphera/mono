import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';

export type IMakeClearanceInput =
  Mutations.Capital.MakeClearance.IInput['data'];

export function useMakeClearance() {
  const initialMakeClearanceInput: IMakeClearanceInput = {
    appendix_hash: '',
    coopname: '',
    document: {
      doc_hash: '',
      hash: '',
      meta: {
        block_num: 0,
        coopname: '',
        created_at: '',
        generator: '',
        lang: '',
        links: [],
        registry_id: 0,
        timezone: '',
        title: '',
        username: '',
        version: '',
      },
      meta_hash: '',
      signatures: [],
      version: '',
    },
    project_hash: '',
    username: '',
  };

  const makeClearanceInput = ref<IMakeClearanceInput>({
    ...initialMakeClearanceInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<IMakeClearanceInput>,
    initial: IMakeClearanceInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function makeClearance(data: IMakeClearanceInput) {
    const transaction = await api.makeClearance(data);

    // Сбрасываем makeClearanceInput после выполнения makeClearance
    resetInput(makeClearanceInput, initialMakeClearanceInput);

    return transaction;
  }

  return { makeClearance, makeClearanceInput };
}

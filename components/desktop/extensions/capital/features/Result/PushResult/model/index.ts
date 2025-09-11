import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import {
  useResultStore,
  type IPushResultOutput,
} from 'app/extensions/capital/entities/Result/model';

export type IPushResultInput = Mutations.Capital.PushResult.IInput['data'];

export function usePushResult() {
  const store = useResultStore();

  const initialPushResultInput: IPushResultInput = {
    coopname: '',
    username: '',
    result_hash: '',
    contribution_amount: '',
    debt_amount: '',
    debt_hashes: [],
    project_hash: '',
    statement: {
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
  };

  const pushResultInput = ref<IPushResultInput>({
    ...initialPushResultInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(input: Ref<IPushResultInput>, initial: IPushResultInput) {
    Object.assign(input.value, initial);
  }

  async function pushResult(
    data: IPushResultInput,
  ): Promise<IPushResultOutput> {
    const transaction = await api.pushResult(data);

    // Обновляем список результатов после добавления
    await store.loadResults({});

    // Сбрасываем pushResultInput после выполнения pushResult
    resetInput(pushResultInput, initialPushResultInput);

    return transaction;
  }

  return { pushResult, pushResultInput };
}

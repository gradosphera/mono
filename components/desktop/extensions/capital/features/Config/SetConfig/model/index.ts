import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import {
  useConfigStore,
  type ISetConfigOutput,
} from 'app/extensions/capital/entities/Config/model';

export type ISetConfigInput = Mutations.Capital.SetConfig.IInput['data'];

export function useSetConfig() {
  const store = useConfigStore();

  const initialSetConfigInput: ISetConfigInput = {
    config: {
      authors_voting_percent: 0,
      coordinator_bonus_percent: 0,
      coordinator_invite_validity_days: 0,
      creators_voting_percent: 0,
      expense_pool_percent: 0,
      voting_period_in_days: 0,
    },
    coopname: '',
  };

  const setConfigInput = ref<ISetConfigInput>({
    ...initialSetConfigInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(input: Ref<ISetConfigInput>, initial: ISetConfigInput) {
    Object.assign(input.value, initial);
  }

  async function setConfig(data: ISetConfigInput): Promise<ISetConfigOutput> {
    const transaction = await api.setConfig(data);

    // Обновляем конфигурацию после установки
    await store.loadConfig({ coopname: data.coopname });

    // Сбрасываем setConfigInput после выполнения setConfig
    resetInput(setConfigInput, initialSetConfigInput);

    return transaction;
  }

  return { setConfig, setConfigInput };
}

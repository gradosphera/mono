import { ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import {
  useConfigStore,
  type ISetConfigOutput,
} from 'app/extensions/capital/entities/Config/model';

export type ISetConfigInput = Mutations.Capital.SetConfig.IInput['data'];

export function useSetConfig() {
  const store = useConfigStore();

  const setConfigInput = ref<ISetConfigInput>({
    config: {
      authors_voting_percent: 0,
      coordinator_bonus_percent: 0,
      coordinator_invite_validity_days: 0,
      creators_voting_percent: 0,
      expense_pool_percent: 0,
      voting_period_in_days: 0,
    },
    coopname: '',
  });

  async function setConfig(data: ISetConfigInput): Promise<ISetConfigOutput> {
    const transaction = await api.setConfig(data);

    // Обновляем состояние после установки
    await store.loadState({ coopname: data.coopname });

    // НЕ сбрасываем setConfigInput автоматически - пусть компонент сам решает

    return transaction;
  }

  return { setConfig, setConfigInput };
}

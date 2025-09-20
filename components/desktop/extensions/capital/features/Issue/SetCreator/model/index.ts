import { ref } from 'vue';
import { api, type ISetCreatorsInput } from '../api';
import {
  useIssueStore,
  type IUpdateIssueOutput,
} from 'app/extensions/capital/entities/Issue/model';

export function useSetCreators() {
  const store = useIssueStore();

  const setCreatorsInput = ref<ISetCreatorsInput>({
    issue_hash: '',
    creators_hashs: [],
  });

  async function setCreators(data: ISetCreatorsInput): Promise<IUpdateIssueOutput> {
    const transaction = await api.setCreators(data);

    // Добавляем/обновляем задачу в списке
    store.addIssueToList(transaction);

    // Сбрасываем только creators_hashs, оставляем issue_hash для повторных вызовов
    setCreatorsInput.value.creators_hashs = [];

    return transaction;
  }

  return { setCreators, setCreatorsInput };
}

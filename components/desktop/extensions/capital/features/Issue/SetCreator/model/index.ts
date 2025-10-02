import { ref } from 'vue';
import { api, type ISetCreatorsInput } from '../api';
import {
  useIssueStore,
  type IIssue,
  type IUpdateIssueOutput,
} from 'app/extensions/capital/entities/Issue/model';

export function useSetCreators() {
  const store = useIssueStore();

  const setCreatorsInput = ref<ISetCreatorsInput>({
    issue_hash: '',
    creators: [],
  });

  async function setCreators(data: ISetCreatorsInput, issue: IIssue): Promise<IUpdateIssueOutput> {
    const transaction = await api.setCreators(data);

    // Добавляем/обновляем задачу в списке
    store.addIssue(issue.project_hash, transaction);

    // Сбрасываем только creators, оставляем issue_hash для повторных вызовов
    setCreatorsInput.value.creators = [];

    return transaction;
  }

  return { setCreators, setCreatorsInput };
}

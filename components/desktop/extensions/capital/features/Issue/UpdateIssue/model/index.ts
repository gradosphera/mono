import { ref, type Ref } from 'vue';
import { type Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import {
  useIssueStore,
  type IUpdateIssueOutput,
} from 'app/extensions/capital/entities/Issue/model';

export type IUpdateIssueInput = Mutations.Capital.UpdateIssue.IInput['data'];

export function useUpdateIssue() {
  const store = useIssueStore();

  const initialUpdateIssueInput: Partial<IUpdateIssueInput> = {};

  const updateIssueInput = ref<Partial<IUpdateIssueInput>>({
    ...initialUpdateIssueInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<Partial<IUpdateIssueInput>>,
    initial: Partial<IUpdateIssueInput>,
  ) {
    Object.assign(input.value, initial);
  }

  async function updateIssue(
    data: IUpdateIssueInput,
  ): Promise<IUpdateIssueOutput> {
    const transaction = await api.updateIssue(data);

    // Добавляем/обновляем задачу в списке
    store.addIssueToList(transaction);

    // Сбрасываем updateIssueInput после выполнения updateIssue
    resetInput(updateIssueInput, initialUpdateIssueInput);

    return transaction;
  }

  return { updateIssue, updateIssueInput };
}

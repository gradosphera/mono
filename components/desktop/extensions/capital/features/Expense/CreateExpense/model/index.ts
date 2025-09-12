import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import {
  useExpenseStore,
  type ICreateExpenseOutput,
} from 'app/extensions/capital/entities/Expense/model';

export type ICreateExpenseInput =
  Mutations.Capital.CreateExpense.IInput['data'];

export function useCreateExpense() {
  const store = useExpenseStore();

  const initialCreateExpenseInput: ICreateExpenseInput = {
    amount: '',
    coopname: '',
    creator: '',
    description: '',
    expense_hash: '',
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

  const createExpenseInput = ref<ICreateExpenseInput>({
    ...initialCreateExpenseInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<ICreateExpenseInput>,
    initial: ICreateExpenseInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function createExpense(
    data: ICreateExpenseInput,
  ): Promise<ICreateExpenseOutput> {
    const transaction = await api.createExpense(data);

    // Обновляем список расходов после создания
    await store.loadExpenses({});

    // Сбрасываем createExpenseInput после выполнения createExpense
    resetInput(createExpenseInput, initialCreateExpenseInput);

    return transaction;
  }

  return { createExpense, createExpenseInput };
}

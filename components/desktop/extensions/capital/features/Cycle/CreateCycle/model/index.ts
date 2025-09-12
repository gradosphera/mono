import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import {
  useCycleStore,
  type ICreateCycleOutput,
} from 'app/extensions/capital/entities/Cycle/model';

export type ICreateCycleInput = Mutations.Capital.CreateCycle.IInput['data'];

export function useCreateCycle() {
  const store = useCycleStore();

  const initialCreateCycleInput: ICreateCycleInput = {
    end_date: '',
    name: '',
    start_date: '',
  };

  const createCycleInput = ref<ICreateCycleInput>({
    ...initialCreateCycleInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<ICreateCycleInput>,
    initial: ICreateCycleInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function createCycle(
    data: ICreateCycleInput,
  ): Promise<ICreateCycleOutput> {
    const transaction = await api.createCycle(data);

    // Обновляем список циклов после создания
    await store.loadCycles({});

    // Сбрасываем createCycleInput после выполнения createCycle
    resetInput(createCycleInput, initialCreateCycleInput);

    return transaction;
  }

  return { createCycle, createCycleInput };
}

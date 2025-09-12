import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';

export type ISetPlanInput = Mutations.Capital.SetPlan.IInput['data'];

export function useSetPlan() {
  const initialSetPlanInput: ISetPlanInput = {
    coopname: '',
    master: '',
    plan_creators_hours: 0,
    plan_expenses: '',
    plan_hour_cost: '',
    project_hash: '',
  };

  const setPlanInput = ref<ISetPlanInput>({
    ...initialSetPlanInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(input: Ref<ISetPlanInput>, initial: ISetPlanInput) {
    Object.assign(input.value, initial);
  }

  async function setPlan(data: ISetPlanInput) {
    const transaction = await api.setPlan(data);

    // Сбрасываем setPlanInput после выполнения setPlan
    resetInput(setPlanInput, initialSetPlanInput);

    return transaction;
  }

  return { setPlan, setPlanInput };
}

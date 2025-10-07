import { ref, type Ref, computed } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import { useSystemStore } from 'src/entities/System/model';
import { useProjectStore } from '../../../../entities/Project/model/store';
import type { IProject } from '../../../../entities/Project/model/types';

export type ISetPlanInput = Mutations.Capital.SetPlan.IInput['data'];
export type ISetPlanOutput = IProject;

export function useSetPlan() {
  const system = useSystemStore();
  const projectStore = useProjectStore();

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

  // Информация о валюте
  const governSymbol = computed(() => system.info.symbols?.root_govern_symbol || 'RUB');
  const governPrecision = computed(() => system.info.symbols?.root_govern_precision || 4);

  // Форматирование суммы оплаты для отображения
  const formatAmount = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '0';
    return numAmount.toFixed(governPrecision.value);
  };

  // Форматирование суммы для EOSIO (в формате "0.0000 RUB")
  const formatAmountForEOSIO = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return `0.${'0'.repeat(governPrecision.value)} ${governSymbol.value}`;
    return `${numAmount.toFixed(governPrecision.value)} ${governSymbol.value}`;
  };

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(input: Ref<ISetPlanInput>, initial: ISetPlanInput) {
    Object.assign(input.value, initial);
  }

  async function setPlan(data: ISetPlanInput): Promise<ISetPlanOutput> {
    const project = await api.setPlan(data);

    // Обновляем проект в store
    projectStore.addProjectToList(project);

    // Сбрасываем setPlanInput после выполнения setPlan
    resetInput(setPlanInput, initialSetPlanInput);

    return project;
  }

  return { setPlan, setPlanInput, governSymbol, governPrecision, formatAmount, formatAmountForEOSIO };
}

import { useSystemStore } from 'src/entities/System/model';
import { topupProgramExpense } from '../api';

export function useTopupProgramExpensePool() {
  const { info } = useSystemStore();

  async function submitTopup(amount: string) {
    return topupProgramExpense({
      coopname: info.coopname,
      amount,
    });
  }

  return { submitTopup };
}

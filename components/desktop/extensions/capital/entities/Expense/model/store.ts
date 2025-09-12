import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type {
  IExpense,
  IExpensesPagination,
  IGetExpenseInput,
  IGetExpensesInput,
} from './types';

const namespace = 'expenseStore';

interface IExpenseStore {
  expenses: Ref<IExpensesPagination | null>;
  loadExpenses: (data: IGetExpensesInput) => Promise<void>;
  expense: Ref<IExpense | null>;
  loadExpense: (data: IGetExpenseInput) => Promise<void>;
}

export const useExpenseStore = defineStore(namespace, (): IExpenseStore => {
  const expenses = ref<IExpensesPagination | null>(null);
  const expense = ref<IExpense | null>(null);

  const loadExpenses = async (data: IGetExpensesInput): Promise<void> => {
    const loadedData = await api.loadExpenses(data);
    expenses.value = loadedData;
  };

  const loadExpense = async (data: IGetExpenseInput): Promise<void> => {
    const loadedData = await api.loadExpense(data);
    expense.value = loadedData;
  };

  return {
    expenses,
    expense,
    loadExpenses,
    loadExpense,
  };
});

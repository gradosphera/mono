import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type {
  IResult,
  IResultsPagination,
  IGetResultInput,
  IGetResultsInput,
} from './types';

const namespace = 'resultStore';

interface IResultStore {
  results: Ref<IResultsPagination | null>;
  loadResults: (data: IGetResultsInput) => Promise<void>;
  result: Ref<IResult | null>;
  loadResult: (data: IGetResultInput) => Promise<void>;
}

export const useResultStore = defineStore(namespace, (): IResultStore => {
  const results = ref<IResultsPagination | null>(null);
  const result = ref<IResult | null>(null);

  const loadResults = async (data: IGetResultsInput): Promise<void> => {
    const loadedData = await api.loadResults(data);
    results.value = loadedData;
  };

  const loadResult = async (data: IGetResultInput): Promise<void> => {
    const loadedData = await api.loadResult(data);
    result.value = loadedData;
  };

  return {
    results,
    result,
    loadResults,
    loadResult,
  };
});

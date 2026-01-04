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
  loadResultByFilters: (username: string, projectHash: string) => Promise<IResult | null>;
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

  const loadResultByFilters = async (username: string, projectHash: string): Promise<IResult | null> => {
    const filterData: IGetResultsInput = {
      filter: {
        username,
        projectHash,
      },
      pagination: {
        page: 1,
        limit: 1,
      },
    };

    const loadedData = await api.loadResults(filterData);

    if (loadedData.items && loadedData.items.length > 0) {
      return loadedData.items[0];
    }

    return null;
  };

  return {
    results,
    result,
    loadResults,
    loadResult,
    loadResultByFilters,
  };
});

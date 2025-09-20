import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type {
  IContributor,
  IContributorsPagination,
  IGetContributorInput,
  IGetContributorsInput,
} from './types';

const namespace = 'contributorStore';

interface IContributorStore {
  contributors: Ref<IContributorsPagination | null>;
  loadContributors: (data: IGetContributorsInput) => Promise<void>;
  contributor: Ref<IContributor | null>;
  loadContributor: (data: IGetContributorInput) => Promise<IContributor | null | undefined>;
}

export const useContributorStore = defineStore(
  namespace,
  (): IContributorStore => {
    const contributors = ref<IContributorsPagination | null>(null);
    const contributor = ref<IContributor | null>(null);

    const loadContributors = async (
      data: IGetContributorsInput,
    ): Promise<void> => {
      const loadedData = await api.loadContributors(data);
      contributors.value = loadedData;
    };

    const loadContributor = async (
      data: IGetContributorInput,
    ): Promise<IContributor> => {
      const loadedData = await api.loadContributor(data);
      contributor.value = loadedData;
      return loadedData;
    };

    return {
      contributors,
      contributor,
      loadContributors,
      loadContributor,
    };
  },
);

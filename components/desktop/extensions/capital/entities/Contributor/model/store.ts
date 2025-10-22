import { defineStore } from 'pinia';
import { ref, Ref, computed, ComputedRef } from 'vue';
import { api } from '../api';
import { useWalletStore } from 'src/entities/Wallet';
import { CapitalProgramAgreementId } from 'app/extensions/capital/shared/lib';
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
  self: Ref<IContributor | null>;
  loadSelf: (data: IGetContributorInput) => Promise<IContributor | null | undefined>;
  hasClearance: (projectHash: string) => boolean;
  isGenerationAgreementCompleted: ComputedRef<boolean>;
  isCapitalAgreementCompleted: ComputedRef<boolean>;
}

export const useContributorStore = defineStore(
  namespace,
  (): IContributorStore => {
    const contributors = ref<IContributorsPagination | null>(null);
    const contributor = ref<IContributor | null>(null);
    const self = ref<IContributor | null>(null);

    // Доступ к wallet store для проверки соглашений
    const walletStore = useWalletStore();

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

    const loadSelf = async (
      data: IGetContributorInput,
    ): Promise<IContributor> => {
      const loadedData = await api.loadContributor(data);
      self.value = loadedData;

      return loadedData;
    };

    // Проверка наличия допуска у участника по хэшу проекта
    const hasClearance = (projectHash: string): boolean => {
      if (!self.value?.appendixes) return false;
      return self.value.appendixes.includes(projectHash?.toLowerCase() ?? '');
    };

    // Вычисляемые свойства для проверки завершения шагов регистрации
    const isGenerationAgreementCompleted = computed(() => {
      return !!self.value?.contract;
    });

    const isCapitalAgreementCompleted = computed(() => {
      return walletStore.agreements.some(agreement => agreement.program_id === CapitalProgramAgreementId);
    });

    return {
      contributors,
      contributor,
      loadContributors,
      loadContributor,
      self,
      loadSelf,
      hasClearance,
      isGenerationAgreementCompleted,
      isCapitalAgreementCompleted,
    };
  },
);

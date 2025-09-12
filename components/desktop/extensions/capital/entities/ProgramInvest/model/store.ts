import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type {
  IProgramInvestsPagination,
  IGetProgramInvestsInput,
} from './types';

const namespace = 'programInvestStore';

interface IProgramInvestStore {
  programInvests: Ref<IProgramInvestsPagination | null>;
  loadProgramInvests: (data: IGetProgramInvestsInput) => Promise<void>;
}

export const useProgramInvestStore = defineStore(
  namespace,
  (): IProgramInvestStore => {
    const programInvests = ref<IProgramInvestsPagination | null>(null);

    const loadProgramInvests = async (
      data: IGetProgramInvestsInput,
    ): Promise<void> => {
      const loadedData = await api.loadProgramInvests(data);
      programInvests.value = loadedData;
    };

    return {
      programInvests,
      loadProgramInvests,
    };
  },
);

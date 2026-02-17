import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Queries } from '@coopenomics/sdk';
import { api } from '../api';

export type ICapitalCandidate = Queries.Capital.GetCapitalCandidates.IOutput[typeof Queries.Capital.GetCapitalCandidates.name]['items'][number];
export type IGetCapitalCandidatesInput = Queries.Capital.GetCapitalCandidates.IInput;

export const useCandidateStore = defineStore('capital-candidate', () => {
  const candidates = ref<ICapitalCandidate[]>([]);
  const totalCount = ref(0);
  const loading = ref(false);

  async function loadCandidates(data: IGetCapitalCandidatesInput) {
    loading.value = true;
    try {
      const output = await api.getCapitalCandidates(data);
      candidates.value = output.items;
      totalCount.value = output.totalCount;
      return output;
    } finally {
      loading.value = false;
    }
  }

  return {
    candidates,
    totalCount,
    loading,
    loadCandidates,
  };
});

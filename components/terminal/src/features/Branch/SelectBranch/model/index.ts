import type { Mutations } from '@coopenomics/coopjs';
import { ref } from 'vue';
import { api } from '../api';
export type ISelectBranchInput = Mutations.ISelectBranchInput

const isVisible = ref(false);

export function useSelectBranch() {
  const selectBranch = async (data: ISelectBranchInput): Promise<boolean> => {
    return await api.selectBranch(data)
  }

  return {
    isVisible,
    selectBranch
  };
}

import type { Mutations } from '@coopenomics/sdk';
import { ref } from 'vue';
import { api } from '../api';

export type ISelectBranchInput = Mutations.Branches.SelectBranch.IInput

const isVisible = ref(false);

export function useSelectBranch() {
  const selectBranch = async (data: ISelectBranchInput): Promise<Mutations.Branches.SelectBranch.IOutput[typeof Mutations.Branches.SelectBranch.name]> => {
    return await api.selectBranch(data)
  }

  return {
    isVisible,
    selectBranch
  };
}

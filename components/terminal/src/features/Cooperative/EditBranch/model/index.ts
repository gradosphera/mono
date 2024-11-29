import type { ModelTypes } from '@coopenomics/coopjs/index';
import { api } from '../api';
import { useBranchStore, type IBranch } from 'src/entities/Branch/model';
import { COOPNAME } from 'src/shared/config';

export type IEditBranchInput = ModelTypes['EditBranchInput']

export function useEditBranch() {
  const store = useBranchStore()

  async function editBranch(
    data: IEditBranchInput
  ): Promise<IBranch> {

    const branch = await api.editBranch(data)

    await store.loadBranches({coopname: COOPNAME})

    return branch
  }
  return { editBranch };
}

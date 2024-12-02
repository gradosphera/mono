import type { ModelTypes } from '@coopenomics/coopjs/index';
import { ref } from 'vue';
import { api } from '../api';
import { useBranchStore, type IBranch } from 'src/entities/Branch/model';
import { COOPNAME } from 'src/shared/config';
import { generateUsername } from 'src/shared/lib/utils/generateUsername';

export type ICreateBranchInput = ModelTypes['CreateBranchInput']

export function useCreateBranch() {
  const store = useBranchStore()

  const createBranchInput  = ref<ICreateBranchInput>(
  {
    braname: generateUsername(),
    coopname: COOPNAME,
    email: '',
    fact_address: '',
    short_name: '',
    full_name: '',
    phone: '',
    based_on: '',
    trustee: ''
  })

  async function createBranch(
    data: ICreateBranchInput
  ): Promise<IBranch> {

    const branch = await api.createBranch(data)

    await store.loadBranches({coopname: COOPNAME})

    return branch
  }
  return { createBranch, createBranchInput };
}

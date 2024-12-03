import { ref, type Ref } from 'vue';
import type { ModelTypes } from '@coopenomics/coopjs/index';
import { api } from '../api';
import { useBranchStore, type IBranch } from 'src/entities/Branch/model';
import { COOPNAME } from 'src/shared/config';
import { generateUsername } from 'src/shared/lib/utils/generateUsername';

export type ICreateBranchInput = ModelTypes['CreateBranchInput']

export function useCreateBranch() {
  const store = useBranchStore();

  const initialCreateBranchInput: ICreateBranchInput = {
    coopname: COOPNAME,
    braname: '',
    email: '',
    fact_address: '',
    short_name: '',
    full_name: '',
    phone: '',
    based_on: '',
    trustee: ''
  };

  const createBranchInput = ref<ICreateBranchInput>({
    ...initialCreateBranchInput,
    braname: generateUsername() // Генерация начального имени
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(input: Ref<ICreateBranchInput>, initial: ICreateBranchInput) {
    Object.assign(input.value, initial);
  }

  async function createBranch(data: ICreateBranchInput): Promise<IBranch> {
    const branch = await api.createBranch(data);

    await store.loadBranches({ coopname: COOPNAME });

    // Сбрасываем createBranchInput после выполнения createBranch
    resetInput(createBranchInput, initialCreateBranchInput);

    return branch;
  }

  return { createBranch, createBranchInput };
}

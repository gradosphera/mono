import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import { useBranchStore, type IBranch } from 'src/entities/Branch/model';
import { COOPNAME } from 'src/shared/config';
import { generateUsername } from 'src/shared/lib/utils/generateUsername';

export type ICreateBranchInput = Mutations.Branches.CreateBranch.IInput['data']

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
    input.value.braname = generateUsername()
  }

  async function createBranch(data: ICreateBranchInput): Promise<IBranch> {
    data.full_name = `Кооперативный Участок "${data.short_name}"`
    const branch = await api.createBranch(data);

    await store.loadBranches({ coopname: COOPNAME });

    // Сбрасываем createBranchInput после выполнения createBranch
    resetInput(createBranchInput, initialCreateBranchInput);

    return branch;
  }

  return { createBranch, createBranchInput };
}

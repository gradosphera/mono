import { defineStore } from 'pinia'
import { ref, Ref } from 'vue'
import { api } from '../api'
import type { IBranch, IGetBranchesInput } from './types';

const namespace = 'branchStore';

interface IBranchStore {
  branches: Ref<IBranch[]>
  loadBranches: (data: IGetBranchesInput) => Promise<void>;
}


export const useBranchStore = defineStore(namespace, (): IBranchStore => {
  const branches = ref<IBranch[]>([])

  const loadBranches = async (data: IGetBranchesInput) => {
    const loadedData = await api.loadBranches(data);
    console.log('loadedData: ', loadedData)
    branches.value = loadedData; // сохраняем преобразованные данные
  };

  return {
    branches,
    loadBranches
  }
})

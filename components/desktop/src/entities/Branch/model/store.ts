import { defineStore } from 'pinia'
import { ref, Ref } from 'vue'
import { api } from '../api'
import type { IBranch, IGetBranchesInput, IPublicBranch } from './types';

const namespace = 'branchStore';

interface IBranchStore {
  branches: Ref<IBranch[]>
  loadBranches: (data: IGetBranchesInput) => Promise<void>;
  publicBranches: Ref<IPublicBranch[]>
  loadPublicBranches: (data: IGetBranchesInput) => Promise<void>;
}


export const useBranchStore = defineStore(namespace, (): IBranchStore => {
  const branches = ref<IBranch[]>([])
  const publicBranches = ref<IPublicBranch[]>([])

  const loadBranches = async (data: IGetBranchesInput) => {
    const loadedData = await api.loadBranches(data);
    branches.value = loadedData; // сохраняем преобразованные данные
  };

  const loadPublicBranches = async (data: IGetBranchesInput) => {
    const loadedData = await api.loadPublicBranches(data);
    publicBranches.value = loadedData; // сохраняем преобразованные данные
  };

  return {
    branches,
    publicBranches,
    loadBranches,
    loadPublicBranches
  }
})

import { defineStore } from 'pinia'
import { ref, Ref } from 'vue'
import { api } from '../api'
import type { IBranch, IGetBranchesInput } from './types';
import type { Queries } from '@coopenomics/coopjs';

const namespace = 'branchStore';

interface IBranchStore {
  branches: Ref<IBranch[]>
  loadBranches: (data: IGetBranchesInput) => Promise<void>;
  publicBranches: Ref<Queries.IPublicBranch[]>
  loadPublicBranches: (data: IGetBranchesInput) => Promise<void>;
}


export const useBranchStore = defineStore(namespace, (): IBranchStore => {
  const branches = ref<IBranch[]>([])
  const publicBranches = ref<Queries.IPublicBranch[]>([])

  const loadBranches = async (data: IGetBranchesInput) => {
    const loadedData = await api.loadBranches(data);
    branches.value = loadedData; // сохраняем преобразованные данные
  };

  const loadPublicBranches = async (data: IGetBranchesInput) => {
    const loadedData = await api.loadPublicBranches(data);
    console.log('loadedData', loadedData)
    publicBranches.value = loadedData; // сохраняем преобразованные данные
  };

  return {
    branches,
    publicBranches,
    loadBranches,
    loadPublicBranches
  }
})

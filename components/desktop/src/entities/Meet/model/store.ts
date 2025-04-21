import { defineStore } from 'pinia'
import { ref, Ref } from 'vue'
import { api } from '../api'
import type { IMeet, IGetMeetsInput, IGetMeetInput } from '../types';

const namespace = 'meetStore';

interface IMeetStore {
  meets: Ref<IMeet[]>
  currentMeet: Ref<IMeet | null>
  loading: Ref<boolean>
  loadMeets: (data: IGetMeetsInput) => Promise<IMeet[]>;
  loadMeet: (data: IGetMeetInput) => Promise<IMeet>;
}

export const useMeetStore = defineStore(namespace, (): IMeetStore => {
  const meets = ref<IMeet[]>([])
  const currentMeet = ref<IMeet | null>(null)
  const loading = ref<boolean>(false)

  const loadMeets = async (data: IGetMeetsInput) => {
    loading.value = true
    try {
      const result = await api.loadMeets(data);
      meets.value = result;
      return result;
    } finally {
      loading.value = false
    }
  };

  const loadMeet = async (data: IGetMeetInput) => {
    loading.value = true
    try {
      const result = await api.loadMeet(data);
      currentMeet.value = result;
      return result;
    } finally {
      loading.value = false
    }
  };

  return {
    meets,
    currentMeet,
    loading,
    loadMeets,
    loadMeet
  }
})

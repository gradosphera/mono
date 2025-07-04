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
  setCurrentMeet: (meet: IMeet) => void;
}

export const useMeetStore = defineStore(namespace, (): IMeetStore => {
  const meets = ref<IMeet[]>([])
  const currentMeet = ref<IMeet | null>(null)
  const loading = ref<boolean>(false)

  const loadMeets = async (data: IGetMeetsInput) => {
    loading.value = true
    try {
      const result = await api.loadMeets(data);
      meets.value = result.slice().sort((a, b) => new Date(b.processing?.meet.created_at as string).getTime() - new Date(a.processing?.meet.created_at as string).getTime());
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
      console.log('result: ',result)
      return result;
    } finally {
      loading.value = false
    }
  };

  const setCurrentMeet = (meet: IMeet) => {
    currentMeet.value = meet;
  };

  return {
    meets,
    currentMeet,
    loading,
    loadMeets,
    loadMeet,
    setCurrentMeet,
  }
})

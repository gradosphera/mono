import { defineStore } from 'pinia'
import { ref, Ref } from 'vue'
import { api } from '../api'
import type { IAgenda, IGetAgendaInput } from './types';

const namespace = 'agendaStore';

interface IAgendaStore {
  agenda: Ref<IAgenda[]>
  loading: Ref<boolean>
  loadAgenda: (data: IGetAgendaInput, hidden?: boolean) => Promise<IAgenda[]>;
}

export const useAgendaStore = defineStore(namespace, (): IAgendaStore => {
  const agenda = ref<IAgenda[]>([])
  const loading = ref(false)

  const loadAgenda = async (data: IGetAgendaInput, hidden = false): Promise<IAgenda[]> => {
    try {
      loading.value = hidden ? false : true
      const loadedData = await api.loadAgenda(data);
      agenda.value = loadedData;
      loading.value = false
      return loadedData;
    } catch (error) {
      loading.value = false
      throw error;
    }
  };

  return {
    agenda,
    loading,
    loadAgenda
  }
}) 
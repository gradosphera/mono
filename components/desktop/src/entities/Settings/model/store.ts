import { defineStore } from 'pinia';
import { api } from '../api'
import { ref, type Ref } from 'vue';
import { Types } from '@coopenomics/sdk';
type ISettings = Types.Controller.ISettings;

const namespace = 'settings';

interface ISettingsStore {
  settings: Ref<ISettings | null>
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = defineStore(namespace, (): ISettingsStore => {
  const settings = ref<ISettings | null>(null)

  const loadSettings = async () => {
    settings.value = await api.loadSettings()
  }

  return {
    settings,
    loadSettings
  };
});

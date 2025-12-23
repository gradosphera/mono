import { api } from '../api'
import { useSettingsStore } from 'src/entities/Settings'
import { Types } from '@coopenomics/sdk';
type ISettings = Types.Controller.ISettings;

export const useUpdateSettings = () => {
  const store = useSettingsStore()

  async function updateSettings(data: Partial<ISettings>) {
    await api.updateSettings(data)
    await store.loadSettings()
  }

  return {
    updateSettings
  }
}

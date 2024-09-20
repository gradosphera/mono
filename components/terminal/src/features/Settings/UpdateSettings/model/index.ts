import { api } from '../api'
import { type ISettings } from 'coopback'
import { useSettingsStore } from 'src/entities/Settings'

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

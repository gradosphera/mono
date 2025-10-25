import { api } from '../api';
import type { IUpdateSettingsInput, IUpdateSettingsOutput } from '../api';
import { useSystemStore } from 'src/entities/System/model';

export function useUpdateSettings() {
  const systemStore = useSystemStore();

  const updateSettings = async (data: IUpdateSettingsInput): Promise<IUpdateSettingsOutput> => {
    const result = await api.updateSettings(data);

    // Обновляем настройки в systemStore
    if (systemStore.info?.settings && result) {
      systemStore.info.settings = result;
    }

    return result;
  };

  return { updateSettings };
}

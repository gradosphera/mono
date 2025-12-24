import { systemSettingsApi as api, type IUpdateSettingsInput, type IUpdateSettingsOutput } from 'app/extensions/chairman/shared/api';
import { useSystemStore } from 'src/entities/System/model';

export function usePaymentProvider() {
  const systemStore = useSystemStore();

  const updatePaymentProvider = async (data: Pick<IUpdateSettingsInput, 'provider_name'>): Promise<IUpdateSettingsOutput> => {
    const result = await api.updateSettings(data);

    // Обновляем настройки в systemStore
    if (systemStore.info?.settings && result) {
      systemStore.info.settings = result;
    }

    return result;
  };

  return { updatePaymentProvider };
}

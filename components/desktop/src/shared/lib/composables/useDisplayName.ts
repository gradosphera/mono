import { computed } from 'vue';
import type { IEntrepreneurData, IIndividualData, IOrganizationData } from 'src/shared/lib/types/user/IUserData';

export function useDisplayName(privateData: IEntrepreneurData | IIndividualData | IOrganizationData | null) {
  const displayName = computed(() => {
    if (!privateData) return '';

    if ('short_name' in privateData) {
      // Это организация
      return privateData.short_name;
    } else if ('first_name' in privateData && 'last_name' in privateData) {
      // Это физлицо или ИП
      return `${privateData.last_name} ${privateData.first_name} ${privateData.middle_name || ''}`.trim();
    }

    return '';
  });

  const isIP = computed(() => {
    if (!privateData) return false;

    // Проверка на предпринимателя - наличие полей details.inn и details.ogrn, но нет short_name
    return !('short_name' in privateData) &&
           'details' in privateData &&
           privateData.details &&
           'inn' in privateData.details &&
           'ogrn' in privateData.details;
  });

  return {
    displayName,
    isIP
  };
}

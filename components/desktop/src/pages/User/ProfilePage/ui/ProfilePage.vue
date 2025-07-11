<template lang="pug">
.q-pa-md
  // Единая карточка профиля
  .row
    .col-12.q-pa-sm
      q-card(flat, v-if='currentProfile')
        // Основная информация
        .profile-section
          .info-content
            .info-group
              .info-item
                .info-label {{ getUserTypeLabel() }}
                .info-value.user-display-name
                  span.q-mr-sm(v-if='isIP') ИП
                  | {{ displayName }}

              .info-item
                .info-label Роль в кооперативе
                .info-value
                  q-badge(color='primary') {{ role }}

              .info-item
                .info-label Имя аккаунта
                .info-value.username-value
                  span.username-text {{ currentUser.username || '' }}
                  q-btn.copy-btn(
                    icon='content_copy',
                    flat,
                    dense,
                    size='sm',
                    color='primary',
                    @click='copyUsername'
                  )
                    q-tooltip Скопировать имя аккаунта

        // Разделитель
        q-separator.q-my-lg

        // Личная информация
        .profile-section
          .info-content
            .info-group
              .info-item
                .info-label Email
                .info-value {{ currentProfile.email || 'Не указан' }}

              .info-item
                .info-label Телефон
                .info-value {{ currentProfile.phone || 'Не указан' }}

              .info-item(v-if='hasBirthdate')
                .info-label Дата рождения
                .info-value {{ formatDate(getBirthdate()) || 'Не указана' }}

              .info-item(v-if='currentProfile.full_address')
                .info-label Адрес
                .info-value {{ currentProfile.full_address }}

              // Специфичная информация для организаций
              .info-item(
                v-if='userType === "organization" && organizationProfile?.type'
              )
                .info-label Тип организации
                .info-value {{ getOrganizationType(organizationProfile.type) }}

              .info-item(
                v-if='userType === "organization" && organizationProfile?.short_name'
              )
                .info-label Краткое наименование
                .info-value {{ organizationProfile.short_name }}

        // Разделитель
        q-separator.q-my-lg

        // Документы и реквизиты
        .profile-section
          .info-content
            // Паспортные данные только для физических лиц
            .info-group(
              v-if='userType === "individual" && individualProfile?.passport'
            )
              .info-item
                .info-label Серия и номер паспорта
                .info-value {{ individualProfile.passport.series }} {{ individualProfile.passport.number }}

              .info-item
                .info-label Дата выдачи
                .info-value {{ formatDate(individualProfile.passport.issued_at) }}

              .info-item
                .info-label Код подразделения
                .info-value {{ individualProfile.passport.code }}

              .info-item(v-if='individualProfile.passport.issued_by')
                .info-label Кем выдан
                .info-value {{ individualProfile.passport.issued_by }}

            // Данные ИП
            .info-group(
              v-if='userType === "entrepreneur" && entrepreneurProfile?.details'
            )
              .info-item(v-if='entrepreneurProfile.details.inn')
                .info-label ИНН
                .info-value {{ entrepreneurProfile.details.inn }}

              .info-item(v-if='entrepreneurProfile.details.ogrn')
                .info-label ОГРН
                .info-value {{ entrepreneurProfile.details.ogrn }}

              .info-item(v-if='entrepreneurProfile.city')
                .info-label Город
                .info-value {{ entrepreneurProfile.city }}

            // Реквизиты организаций
            .info-group(
              v-if='userType === "organization" && organizationProfile'
            )
              .info-item(v-if='organizationProfile.details?.inn')
                .info-label ИНН
                .info-value {{ organizationProfile.details.inn }}

              .info-item(v-if='organizationProfile.details?.ogrn')
                .info-label ОГРН
                .info-value {{ organizationProfile.details.ogrn }}

              .info-item(v-if='organizationProfile.fact_address')
                .info-label Фактический адрес
                .info-value {{ organizationProfile.fact_address }}

              .info-item(v-if='organizationProfile.represented_by')
                .info-label Представитель
                .info-value {{ getRepresentativeName(organizationProfile.represented_by) }}

              .info-item(v-if='organizationProfile.represented_by?.position')
                .info-label Должность
                .info-value {{ organizationProfile.represented_by.position }}

      // Пустое состояние
      q-card.empty-card.q-pa-lg(flat, v-if='!currentProfile')
        .empty-content
          .empty-icon
            q-icon(name='info', size='48px', color='grey-5')
          .empty-text Профиль не заполнен
          .empty-subtitle Обратитесь к администратору для заполнения профиля
</template>

<script lang="ts" setup>
import { useCurrentUser } from 'src/entities/Session';
import type {
  IEntrepreneurData,
  IIndividualData,
  IOrganizationData,
} from 'src/shared/lib/types/user/IUserData';
import { computed } from 'vue';
import { useDisplayName } from 'src/shared/lib/composables/useDisplayName';
import { copyToClipboard, Notify } from 'quasar';
import 'src/shared/ui/CardStyles/index.scss';

const currentUser = useCurrentUser();

const userType = computed(() => {
  return currentUser.privateAccount.value?.type;
});

const userProfile = computed(() => {
  return (
    currentUser.privateAccount.value?.individual_data ||
    currentUser.privateAccount.value?.organization_data ||
    currentUser.privateAccount.value?.entrepreneur_data ||
    null
  );
});

const individualProfile = computed(() => {
  if (userType.value === 'individual') {
    return userProfile.value as IIndividualData;
  }
  return null;
});

const entrepreneurProfile = computed(() => {
  if (userType.value === 'entrepreneur') {
    return userProfile.value as IEntrepreneurData;
  }
  return null;
});

const organizationProfile = computed(() => {
  if (userType.value === 'organization') {
    return userProfile.value as IOrganizationData;
  }
  return null;
});

// Текущий профиль для отображения
const currentProfile = computed(() => {
  return (
    individualProfile.value ||
    entrepreneurProfile.value ||
    organizationProfile.value
  );
});

const { displayName, isIP } = useDisplayName(currentProfile.value);

const role = computed(() => {
  if (currentUser.isChairman) return 'Председатель совета';
  else if (currentUser.isMember) return 'Член совета';
  else return 'Пайщик';
});

// Проверяем наличие birthdate для типов, у которых оно есть
const hasBirthdate = computed(() => {
  return (
    (userType.value === 'individual' && individualProfile.value?.birthdate) ||
    (userType.value === 'entrepreneur' && entrepreneurProfile.value?.birthdate)
  );
});

// Получаем birthdate в зависимости от типа пользователя
const getBirthdate = () => {
  if (userType.value === 'individual' && individualProfile.value) {
    return individualProfile.value.birthdate;
  }
  if (userType.value === 'entrepreneur' && entrepreneurProfile.value) {
    return entrepreneurProfile.value.birthdate;
  }
  return undefined;
};

// Получаем лейбл типа пользователя
const getUserTypeLabel = () => {
  const labels = {
    individual: 'ФИО',
    entrepreneur: 'ФИО предпринимателя',
    organization: 'Наименование организации',
  };
  return labels[userType.value || 'individual'] || 'ФИО';
};

// Копирование имени аккаунта
const copyUsername = async () => {
  const username = currentUser.username || '';
  try {
    await copyToClipboard(username);
    Notify.create({
      message: 'Имя аккаунта скопировано в буфер обмена',
      type: 'positive',
      position: 'top',
    });
  } catch (err) {
    Notify.create({
      message: 'Ошибка при копировании',
      type: 'negative',
      position: 'top',
    });
  }
};

// Утилиты для форматирования
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU');
};

const getOrganizationType = (type: string | undefined) => {
  const types: Record<string, string> = {
    coop: 'Потребительский кооператив',
    prodcoop: 'Производственный кооператив',
    ooo: 'ООО',
  };
  return types[type || ''] || type || 'Не указан';
};

const getRepresentativeName = (representative: any) => {
  if (!representative) return '';
  const parts = [
    representative.last_name,
    representative.first_name,
    representative.middle_name,
  ].filter(Boolean);
  return parts.join(' ');
};
</script>

<style lang="scss" scoped>
// Пустое состояние
.empty-card {
  .empty-content {
    text-align: center;
    padding: 40px 20px;

    .empty-icon {
      margin-bottom: 16px;
    }

    .empty-text {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.7);

      .q-dark & {
        color: rgba(255, 255, 255, 0.7);
      }
    }

    .empty-subtitle {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.5);

      .q-dark & {
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }
}

// Адаптивность
@media (max-width: 768px) {
  .profile-card .info-value.user-display-name {
    font-size: 20px;
  }
}
</style>

<template lang="pug">
.q-pa-md
  // Кошелек и информация (доступно только полностью зарегистрированным пользователям)
  .row.q-mb-lg
    // Информация о контрибьюторе
    .col-md-12.col-xs-12.q-pa-xs
      ContributorInfoWidget
</template>

<script lang="ts" setup>
import { computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ContributorInfoWidget } from 'app/extensions/capital/widgets';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';
import { useDataPoller } from 'src/shared/lib/composables';
import { POLL_INTERVALS } from 'src/shared/lib/consts';
import { useSessionStore } from 'src/entities/Session';

const router = useRouter();
const contributorStore = useContributorStore();
const { username } = useSessionStore();

// Проверка полной регистрации (есть контракт И есть соглашение с программой)
const isFullyRegistered = computed(() => {
  return contributorStore.isGenerationAgreementCompleted && contributorStore.isCapitalAgreementCompleted;
});

// Функция перенаправления на регистрацию
const redirectToRegistration = () => {
  if (!isFullyRegistered.value) {
    router.replace({ name: 'capital-registration' });
  }
};

/**
 * Функция для перезагрузки данных профиля
 * Используется для poll обновлений
 */
const reloadProfileData = async () => {
  try {
    // Для профиля перезагружаем данные участника
    await contributorStore.loadContributor({ username });
  } catch (error) {
    console.warn('Ошибка при перезагрузке данных профиля в poll:', error);
  }
};

// Настраиваем poll обновление данных
const { start: startProfilePoll, stop: stopProfilePoll } = useDataPoller(
  reloadProfileData,
  { interval: POLL_INTERVALS.SLOW, immediate: false }
);

// Проверяем при монтировании и следим за изменениями
onMounted(() => {
  redirectToRegistration();

  // Запускаем poll обновление данных
  startProfilePoll();
});

// Останавливаем poll при уходе со страницы
onBeforeUnmount(() => {
  stopProfilePoll();
});

watch(isFullyRegistered, () => {
  redirectToRegistration();
});
</script>



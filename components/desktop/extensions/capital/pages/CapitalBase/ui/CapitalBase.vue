<template lang="pug">
div
  // Лоадер пока идет предзагрузка пользователя
  WindowLoader(v-if="isLoading", text="Загрузка данных участника...")

  // Показываем онбординг если он не завершен и пользователь председатель
  CapitalOnboardingCard(
    v-else-if="shouldShowOnboarding"
  )
  // Показываем сообщение для обычных участников если контракт не активирован
  InfoCard(
    v-else-if="shouldShowContractNotActivatedMessage"
    text="Контракт капитализации еще не активирован. Только председатель может завершить настройку системы."
  )
  // Основной контент после загрузки
  router-view(v-else)

</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { WindowLoader } from 'src/shared/ui/Loader';
import InfoCard from 'src/shared/ui/InfoCard.vue';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';
import { useConfigStore } from 'app/extensions/capital/entities/Config/model';
import { useSessionStore } from 'src/entities/Session';
import { useSystemStore } from 'src/entities/System/model';
import { CapitalOnboardingCard } from 'app/extensions/capital/features/Onboarding/ui';
import { useCapitalOnboarding } from 'app/extensions/capital/features/Onboarding/model';
const isLoading = ref(true);

const router = useRouter();
const route = useRoute();
const session = useSessionStore()
const system = useSystemStore();
const contributorStore = useContributorStore();
const configStore = useConfigStore();
const { isOnboardingCompleted, loadState } = useCapitalOnboarding();

// Проверка полной регистрации (завершенность определяется по blockchain_status)
const isFullyRegistered = computed(() => {
  return contributorStore.isGenerationContractCompleted;
});

// Проверка завершения онбординга капитализации
const isCapitalOnboardingCompleted = isOnboardingCompleted;

// Показываем онбординг если:
// 1. Пользователь аутентифицирован
// 2. Пользователь является председателем
// 3. Онбординг капитализации не завершен
// 4. Онбординг шагов не завершен
const shouldShowOnboarding = computed(() => {
  return session.isAuth &&
         session.isChairman &&
         !isCapitalOnboardingCompleted.value &&
         !isOnboardingCompleted.value
});

// Показываем сообщение для обычных участников если:
// 1. Пользователь аутентифицирован
// 2. Онбординг капитализации не завершен
// 3. Пользователь НЕ является председателем
const shouldShowContractNotActivatedMessage = computed(() => {
  return session.isAuth &&
         !isCapitalOnboardingCompleted.value &&
         !session.isChairman
});

// Функция перенаправления на регистрацию (только для аутентифицированных пользователей)
// ОСОБОЕ РЕШЕНИЕ: председателю разрешаем заходить на страницы капитализации даже без полной регистрации
const redirectToRegistration = () => {
  if (session.isAuth && !isFullyRegistered.value && route.name !== 'capital-registration' && !session.isChairman) {
    router.replace({ name: 'capital-registration' });
  }
};

onMounted(async () => {
  // Загружаем данные пользователя
  await contributorStore.loadSelf({username: session.username});

  // Загружаем конфигурацию контракта
  await configStore.loadState({coopname: system.info.coopname});

  // Загружаем состояние онбординга
  await loadState();

  // Проверяем необходимость редиректа на регистрацию
  redirectToRegistration();

  isLoading.value = false;
});

// Следим за изменениями маршрута и перенаправляем на регистрацию если необходимо
watch(() => route.name, () => {
  redirectToRegistration();
});
</script>

<template lang="pug">
div
  // Лоадер пока идет предзагрузка пользователя
  WindowLoader(v-if="isLoading", text="Загрузка данных участника...")

  // Основной контент после загрузки
  router-view(v-else)

</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { WindowLoader } from 'src/shared/ui/Loader';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';
import { useConfigStore } from 'app/extensions/capital/entities/Config/model';
import { useSessionStore } from 'src/entities/Session';
import { useSystemStore } from 'src/entities/System/model';
const isLoading = ref(true);

const router = useRouter();
const route = useRoute();
const session = useSessionStore()
const system = useSystemStore();
const contributorStore = useContributorStore();
const configStore = useConfigStore();

// Проверка полной регистрации (есть контракт И есть соглашение с программой)
const isFullyRegistered = computed(() => {
  return contributorStore.isGenerationAgreementCompleted && contributorStore.isCapitalAgreementCompleted;
});

// Функция перенаправления на регистрацию (только для аутентифицированных пользователей)
const redirectToRegistration = () => {
  if (session.isAuth && !isFullyRegistered.value && route.name !== 'capital-registration') {
    router.replace({ name: 'capital-registration' });
  }
};

onMounted(async () => {
  // Загружаем данные пользователя
  await contributorStore.loadSelf({username: session.username});

  // Загружаем конфигурацию контракта
  await configStore.loadState({coopname: system.info.coopname});

  // Проверяем необходимость редиректа на регистрацию
  redirectToRegistration();

  isLoading.value = false;
});

// Следим за изменениями маршрута и перенаправляем на регистрацию если необходимо
watch(() => route.name, () => {
  redirectToRegistration();
});
</script>

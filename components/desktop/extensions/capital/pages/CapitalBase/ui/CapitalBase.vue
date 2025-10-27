<template lang="pug">
div
  // Лоадер пока идет предзагрузка пользователя
  WindowLoader(v-if="isLoading", text="Загрузка данных участника...")

  // Основной контент после загрузки
  router-view(v-else)

</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { WindowLoader } from 'src/shared/ui/Loader';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';
import { useConfigStore } from 'app/extensions/capital/entities/Config/model';
import { useSessionStore } from 'src/entities/Session';
import { useSystemStore } from 'src/entities/System/model';
const isLoading = ref(true);

const session = useSessionStore()
const system = useSystemStore();
const contributorStore = useContributorStore();
const configStore = useConfigStore();

onMounted(async () => {
  // Загружаем данные пользователя
  await contributorStore.loadSelf({username: session.username});

  // Загружаем конфигурацию контракта
  await configStore.loadState({coopname: system.info.coopname});

  isLoading.value = false;
});
</script>

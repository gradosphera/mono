<template lang="pug">
div
  // Лоадер пока идет предзагрузка пользователя
  WindowLoader(v-if="isLoading", text="Загрузка данных вкладчика...")

  // Основной контент после загрузки
  router-view(v-else)

</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { WindowLoader } from 'src/shared/ui/Loader';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';
import { useSessionStore } from 'src/entities/Session';
const isLoading = ref(true);

const session = useSessionStore()
const contributorStore = useContributorStore();

onMounted(async () => {
  // Загружаем данные пользователя
  await contributorStore.loadSelf({username: session.username});
  isLoading.value = false;
});
</script>

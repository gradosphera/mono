<template lang="pug">
div
  // Лоадер пока получаем статус аккаунта
  WindowLoader(v-if="coopgramStore.isLoading", text="Проверка статуса аккаунта...")

  // Сообщение об ошибке
  div(v-else-if="coopgramStore.error", class="error-message")
    p {{ coopgramStore.error }}
    button(@click="retryLoadStatus", class="retry-button") Повторить попытку

  // Виджет регистрации Matrix аккаунта
  MatrixRegistration(
    v-else-if="coopgramStore.accountStatus && !coopgramStore.accountStatus.hasAccount",
    @account-created="handleAccountCreated"
  )

  // Лоадер пока загружается iframe Matrix клиента
  WindowLoader(
    v-else-if="coopgramStore.accountStatus?.iframeUrl && isIframeLoading",
    text="Загрузка Matrix клиента..."
  )

  // Iframe с Matrix клиентом после полной загрузки
  iframe(
    v-else-if="coopgramStore.accountStatus?.iframeUrl",
    v-show="!isIframeLoading",
    :src="coopgramStore.accountStatus.iframeUrl",
    class="matrix-iframe",
    frameborder="0",
    width="100%",
    :style="{ height: 'calc(100vh - 56px)' }"
    @load="onIframeLoaded"
  )
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { WindowLoader } from 'src/shared/ui/Loader';
import { useCoopgramChatStore } from '../../../entities/CoopgramChat/model';
import { MatrixRegistration } from '../../../widgets/MatrixRegistration';

const coopgramStore = useCoopgramChatStore();
const isIframeLoading = ref(true);
let iframeLoadTimeout: number | null = null;

// Сбрасываем состояние загрузки iframe при изменении URL
watch(() => coopgramStore.accountStatus?.iframeUrl, () => {
  if (coopgramStore.accountStatus?.iframeUrl) {
    isIframeLoading.value = true;

    // Очищаем предыдущий таймаут
    if (iframeLoadTimeout) {
      clearTimeout(iframeLoadTimeout);
    }

    // Устанавливаем таймаут на 5 секунд как fallback
    iframeLoadTimeout = window.setTimeout(() => {
      isIframeLoading.value = false;
    }, 5000);
  }
});

function onIframeLoaded() {
  // Очищаем таймаут, если загрузка произошла раньше
  if (iframeLoadTimeout) {
    clearTimeout(iframeLoadTimeout);
    iframeLoadTimeout = null;
  }
  isIframeLoading.value = false;
}

async function retryLoadStatus() {
  coopgramStore.clearError();
  await coopgramStore.loadAccountStatus();
}

async function handleAccountCreated() {
  // После успешного создания аккаунта перезагружаем статус
  await coopgramStore.loadAccountStatus();
}

onMounted(async () => {
  await coopgramStore.loadAccountStatus();
});
</script>

<style scoped>
.matrix-iframe {
  width: 100%;
  border: none;
  display: block;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 56px);
  text-align: center;
  padding: 2rem;
}

.error-message p {
  margin-bottom: 1rem;
  color: #dc3545;
  font-size: 1.1rem;
}

.retry-button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
}

.retry-button:hover {
  background-color: #0056b3;
}
</style>

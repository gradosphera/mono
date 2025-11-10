<template lang="pug">
.breable-text(v-if='isLoaded')
  router-view

  RequireAgreements
  SelectBranchOverlay
  NotificationPermissionDialog
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Cookies, LocalStorage } from 'quasar';
import { FailAlert } from 'src/shared/api/alerts';
import { RequireAgreements } from 'src/widgets/RequireAgreements';
import { SelectBranchOverlay } from 'src/features/Branch/SelectBranch';
import {
  NotificationPermissionDialog,
  useNotificationPermissionDialog,
} from 'src/features/NotificationPermissionDialog';
import { useSystemStore } from 'src/entities/System/model';
import { useDesktopHealthWatcherProcess } from 'src/processes/watch-desktop-health';
import 'src/shared/ui/CardStyles/index.scss';

const system = useSystemStore();
const { info } = system;
const route = useRoute();
const isLoaded = ref(false);

// Диалог разрешения уведомлений
const { showDialog } = useNotificationPermissionDialog();

onMounted(async () => {
  try {
    console.log('systemInfo', info)
    // Проверяем, нужно ли корректировать URL для hash роутера
    // Выполняем только в клиентском режиме с hash роутером
    const isClientMode = process.env.CLIENT === 'true';
    const isHashRouter = process.env.VUE_ROUTER_MODE === 'hash';
    const isNotSSR = process.env.SERVER !== 'true';
    const hasWindow = typeof window !== 'undefined';

    const shouldCorrectHashUrl =
      isClientMode &&
      isHashRouter &&
      isNotSSR &&
      hasWindow &&
      window.location.pathname !== '/' &&
      (!window.location.hash || !window.location.hash.includes(window.location.pathname));

    if (shouldCorrectHashUrl) {
      console.log('URL needs hash correction for hash router mode');
      const newUrl = window.location.origin + '/#' + window.location.pathname + window.location.search;
      console.log('Redirecting to:', newUrl);
      window.location.replace(newUrl);
      return; // Прерываем выполнение, так как будет редирект
    }

    // Запускаем процесс мониторинга "технического обслуживания" после монтирования
    useDesktopHealthWatcherProcess();

    removeLoader();
    isLoaded.value = true;

    const ref = Cookies.get('referer') || String(route.query.r || '');
    if (ref) {
      LocalStorage.setItem(`${info.coopname}:referer`, ref);
    }

    // Показываем диалог разрешения уведомлений после загрузки
    setTimeout(() => {
      showDialog();
    }, 1000);
  } catch (e) {
    console.error(e);
    FailAlert(e);
    isLoaded.value = true;
    removeLoader();
  }
});

onUnmounted(() => {
  // Останавливаем мониторинг системной информации при размонтировании
  system.stopSystemMonitoring();
});

function removeLoader() {
  const loaderContainer = document.querySelector('.loader-container');
  if (loaderContainer) {
    loaderContainer.remove();
  } else {
    FailAlert('Возникла ошибка при загрузке сайта :(');
  }
}
</script>
<style>
.q-loading__backdrop {
  /* стиль полного оверлея технического обслуживания */
  opacity: 1 !important;
}
</style>

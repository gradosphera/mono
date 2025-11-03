// processes/watch-desktop-health/index.ts
import { watch, computed } from 'vue';
import { QSpinnerGears, useQuasar } from 'quasar';
import { useSystemStore } from 'src/entities/System/model';
import { Zeus } from '@coopenomics/sdk';

export function useDesktopHealthWatcherProcess() {
  const $q = useQuasar();
  const systemStore = useSystemStore();


  // Создаем computed для лучшей реактивности
  const systemStatus = computed(() => systemStore.info.system_status);

  const enableLoading = () => {
    $q.loading.show({
      spinner: QSpinnerGears,
      message: 'Техническое обслуживание..',
      spinnerSize: 50,
    });
  };

  const disableLoading = () => {
    $q.loading.hide();
  };

  const check = () => {
    if (systemStatus.value === 'maintenance') {
      enableLoading();
    } else {
      disableLoading();
    }
  };

  // Первоначальная проверка
  check();

  watch(
    systemStatus,
    (newSystemStatus, oldSystemStatus) => {

      // Если состояние изменилось с maintenance на active (выход из технического обслуживания)
      if (
        oldSystemStatus === Zeus.SystemStatus.maintenance &&
        (newSystemStatus === Zeus.SystemStatus.active ||
          newSystemStatus === Zeus.SystemStatus.install)
      ) {
        // Перезагружаем страницу
        if (process.env.CLIENT) {
          window.location.reload();
        }
        return;
      }

      // Обычная логика проверки
      check();
    },
    {
      flush: 'sync', // Синхронное срабатывание для немедленной реакции
    },
  );

  // Дополнительная проверка через небольшую задержку на случай если статус изменился ДО регистрации watch
  setTimeout(() => {
    check();
  }, 100);

  // Следим за счетчиком maintenance для принудительной проверки
  watch(
    () => systemStore.maintenanceCounter,
    () => {
      check();
    },
  );
}

// processes/watch-desktop-health/index.ts
import { watch } from 'vue';
import { QSpinnerGears, useQuasar } from 'quasar';
import { useSystemStore } from 'src/entities/System/model';

export function useDesktopHealthWatcherProcess() {
  const $q = useQuasar();
  const { info } = useSystemStore();

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
    if (info.system_status === 'maintenance') {
      enableLoading();
    } else {
      disableLoading();
    }
  };

  check();

  watch(
    () => info.system_status,
    (newSystemStatus, oldSystemStatus) => {
      // Если состояние изменилось с maintenance на active (выход из технического обслуживания)
      if (oldSystemStatus === 'maintenance' && newSystemStatus === 'active') {
        // Перезагружаем страницу
        if (process.env.CLIENT) {
          window.location.reload();
        }
        return;
      }

      // Обычная логика проверки
      check();
    },
  );
}

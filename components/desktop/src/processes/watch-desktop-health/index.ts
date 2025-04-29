// processes/watch-desktop-health/index.ts
import { watch } from 'vue'
import { QSpinnerGears, useQuasar } from 'quasar'
import { useDesktopStore } from 'src/entities/Desktop/model'

export function useDesktopHealthWatcherProcess() {
  const $q = useQuasar()
  const desktop = useDesktopStore()

  const enableLoading = () => {
    $q.loading.show({
      spinner: QSpinnerGears,
      message: 'Техническое обслуживание..',
      spinnerSize: 50,
    })
  }

  const disableLoading = () => {
    $q.loading.hide()
  }

  const check = () => {
    if (desktop.online === false) {
      enableLoading()
    } else {
      disableLoading()
    }
  }

  check()

  watch(() => desktop.online, check)
}

<template lang='pug'>
div(v-if="isLoaded").breable-text
  router-view
  RequireAgreements
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { FailAlert } from 'src/shared/api/alerts'
import { handleException } from 'src/shared/api';
import { useRoute } from 'vue-router'
import 'src/app/styles/quasar-variables.sass'
import { useDesktopStore } from 'src/entities/Desktop/model';
import { Cookies, LocalStorage, QSpinnerGears, useQuasar } from 'quasar';
import { COOPNAME } from 'src/shared/config';

import { RequireAgreements } from 'src/widgets/Agreementer/RequireAgreements/ui';

const $q = useQuasar()

const route = useRoute()
const desktop = useDesktopStore()

const isLoaded = ref(false)

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

const onlineCheck = () => {
  if (desktop.online === false) {
    enableLoading()
  } else {
    disableLoading()
  }
}

onlineCheck()

// Watch the online status
watch(() => desktop.online, () => onlineCheck())

onMounted(async () => {
  try {
    removeLoader()
    isLoaded.value = true

    const ref = Cookies.get('referer') || String(route.query.r || '')

    if (ref) {
      LocalStorage.setItem(`${COOPNAME}:referer`, ref)
    }
  } catch (e: unknown) {

    console.error(e)
    handleException(e)
    // router.push({ name: 'somethingBad' })
    isLoaded.value = true
    removeLoader()
  }

})

function removeLoader() {
  const loaderContainer = document.querySelector('.loader-container')
  if (loaderContainer) {
    loaderContainer.remove()
  } else {
    FailAlert('Возникла ошибка при загрузке сайта :(')
  }
}
</script>
<style>
.q-loading__backdrop {
  opacity: 1 !important
}
</style>

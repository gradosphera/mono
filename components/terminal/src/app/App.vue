<template lang='pug'>
router-view(v-if="isLoaded")
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { FailAlert } from 'src/shared/api/alerts'
import { handleException } from 'src/shared/api';
import { useRoute, useRouter } from 'vue-router'
import 'src/app/styles/quasar-variables.sass'
import { useDesktopStore } from 'src/entities/Desktop/model';
import { Cookies, LocalStorage, QSpinner, useQuasar } from 'quasar';
import { COOPNAME } from 'src/shared/config';
import { useCardStore } from './providers/card/store';

const $q = useQuasar()

const router = useRouter()
const route = useRoute()
const desktop = useDesktopStore()
const card = useCardStore()

const isLoaded = ref(false)

const enableLoading = () => {
  $q.loading.show({
    spinner: QSpinner,
    message: 'Цифровой Кооператив ушел оффлайн, но обещал вернуться. Пожалуйста, проверьте ваше интернет-соединение. А мы попытаемся его восстановить.',
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
    card.initWallet()
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
    router.push({ name: 'somethingBad' })
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

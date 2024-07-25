<template lang='pug'>
router-view(v-if="isLoaded")
</template>

<script setup lang="ts">
console.log('on start')

import { onMounted, ref } from 'vue'
import { FailAlert } from 'src/shared/api/alerts'
import { handleException } from 'src/shared/api';
import { useRouter } from 'vue-router'
import 'src/app/styles/quasar-variables.sass'

const router = useRouter()

const isLoaded = ref(false)

onMounted(async () => {
  try {

    removeLoader()
    isLoaded.value = true

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

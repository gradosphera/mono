<template lang='pug'>
router-view(v-if="isLoaded")
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { FailAlert } from 'src/shared/api/alerts'
import { useMenuStore } from 'src/entities/Menu'
import { routes } from './providers/routes'
import { handleException } from 'src/shared/api';
import { useSessionStore } from 'src/entities/Session';
import { useCurrentUserStore } from 'src/entities/User';
import {useRouter} from 'vue-router'
import { COOPNAME } from 'src/shared/config';
import 'src/app/styles/quasar-variables.sass'

const router = useRouter()
const menuStore = useMenuStore()

menuStore.setRoutes(routes)

const isLoaded = ref(false)

onMounted(async () => {
  try {
    const session = useSessionStore();
    const currentUser = useCurrentUserStore();

    await session.init();

    if (session.isAuth) {
      await currentUser.loadProfile(session.username, COOPNAME);
      console.log('authored and loaded');
      // Пользователь авторизован
    } else {
      console.log('not authored');
      // Пользователь не авторизован
    }

    const menuStore = useMenuStore();
    menuStore.setRoutes(routes);
    removeLoader()
    isLoaded.value = true
  } catch (e: unknown) {
    console.error(e)
    handleException(e)
    router.push({name: 'somethingBad'})
    isLoaded.value = true
    removeLoader()
    //TODO push to Error
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

<template lang="pug">
form(@submit.prevent="submit").full-width
  q-input(
    v-model="email"
    label="Введите электронную почту"
    color="primary"
    hint=""
    standout="bg-teal text-white"
    class="full-width"
    autocorrect="off"
    autocapitalize="off"
    autocomplete="off"
    spellcheck="false"
  ).q-mt-lg

  q-input(
    v-model="privateKey"
    label="Введите ключ доступа"
    color="primary"
    hint=""
    standout="bg-teal text-white"
    class="full-width"
    type="password"
    autocorrect="off"
    autocapitalize="off"
    autocomplete="on"
    spellcheck="false")

  q-btn(
    type="submit"
    label="Войти"
    class="full-width"
    color="primary"
    :loading="loading"
    :disable="!privateKey")

</template>
<script lang="ts" setup>
import { useCurrentUserStore } from 'src/entities/User';
import { useLoginUser } from 'src/features/User/LoginUser';
import { FailAlert } from 'src/shared/api';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDesktopStore } from 'src/entities/Desktop/model';
import { LocalStorage } from 'quasar';

const router = useRouter()

const email = ref('')
const privateKey = ref('')
const loading = ref(false)
const currentUser = useCurrentUserStore()

/**
 * Функция для перехода по сохраненному URL после успешного входа
 */
function navigateToSavedUrl() {
  if (process.env.CLIENT) {
    // Проверяем наличие сохраненного URL для редиректа
    const redirectUrl = LocalStorage.getItem('redirectAfterLogin') as string
    console.log('login form redirect url', redirectUrl)

    if (redirectUrl) {
      // Удаляем сохраненный URL
      LocalStorage.remove('redirectAfterLogin')

      try {
        // Пытаемся использовать router для навигации
        const url = new URL(redirectUrl)
        const path = url.pathname + url.search
        console.log('Navigating with router to', path)
        router.push(path)
      } catch (e) {
        console.error('Error parsing URL, using direct navigation', e)
        window.location.href = redirectUrl
      }

      return true
    }
  }
  return false
}

const submit = async () => {
  loading.value = true
  try {
    const { login } = useLoginUser()
    await login(email.value, privateKey.value)

    if (!currentUser.isRegistrationComplete) {
      router.push({ name: 'signup' })
    } else {
      // Пробуем перейти по сохраненному URL
      if (!navigateToSavedUrl()) {
        // Если сохраненного URL нет, переходим на страницу по умолчанию
        const desktops = useDesktopStore()
        desktops.selectDefaultWorkspace()
        desktops.goToDefaultPage(router)
      }
    }

    loading.value = false

  } catch (e: any) {
    console.error(e)
    loading.value = false
    FailAlert(e.message)
  }

}
</script>

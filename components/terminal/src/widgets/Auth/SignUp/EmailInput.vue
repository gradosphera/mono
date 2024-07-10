<template lang='pug'>
div
  q-step(:name='1', title='Введите электронную почту', :done='step > 1')
    p Добро пожаловать в {{ COOP_SHORT_NAME }}! Для начала регистрации, пожалуйста, введите вашу электронную почту:

    q-input.q-mt-lg(
      v-model.trim='email',
      outlined,
      type='email',
      label='Введите email',
      :readonly='inLoading',
      color='primary',
      :rules='[validateEmail, validateExists]',
      @keypress.enter='setEmail'
    )

    q-btn.q-mt-lg.q-mb-lg(
      color='primary',
      label='Продолжить',
      :disable='!isValidEmail',
      :loading='inLoading',
      @click='setEmail'
    )
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useCreateUser } from 'src/features/User/CreateUser'
import { debounce } from 'quasar'
import { COOP_SHORT_NAME } from 'src/shared/config'
import { createUserStore as store } from 'src/features/User/CreateUser'

const api = useCreateUser()

watch(() => store.email, () => email.value = store.email)

const email = ref(store.email)
const step = computed(() => store.step)

const inLoading = ref(false)
const isEmailExist = ref(false)

const isValidEmail = computed(() => api.emailIsValid(email.value))

const validateEmail = () => {
  return isValidEmail.value || 'Введите корректный email'
}

const validateExists = () => {
  return !isEmailExist.value || 'Пользователь с таким email уже существует. Войдите.'
}

const checkEmailExists = debounce(async () => {
  inLoading.value = true
  isEmailExist.value = await api.emailIsExist(email.value)
  inLoading.value = false
}, 500) // 500ms delay

watch(email, checkEmailExists)

const setEmail = () => {
  if (isValidEmail.value && !isEmailExist.value) {
    store.email = email.value
    store.userData.individual_data.email = email.value
    store.userData.organization_data.email = email.value
    store.userData.entrepreneur_data.email = email.value

    store.step = step.value + 1
  }
}
</script>

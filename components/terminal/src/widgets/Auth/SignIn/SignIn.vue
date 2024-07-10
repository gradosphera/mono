<template lang='pug'>
q-card.bordered.q-pa-md.signup(flat)
  p.text-h6.text-center.q-mb-md ВХОД ДЛЯ ПАЙЩИКОВ
  form(@submit.prevent="submit").full-width

    q-input(
      v-model="username"
      label="Введите имя аккаунта"
      color="primary"
      hint=""
      outlined
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
      outlined
      class="full-width"
      type="password"
      autocorrect="off"
      autocapitalize="off"
      autocomplete="off"
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
import { COOPNAME } from 'src/shared/config';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()

const username = ref('')
const privateKey = ref('')
const loading = ref(false)
const currentUser = useCurrentUserStore()

const submit = async () => {
  loading.value = true
  try {
    const { login } = useLoginUser()
    await login(username.value, privateKey.value)
    await currentUser.loadProfile(username.value, COOPNAME)

    if (!currentUser.isRegistrationComplete) {
      router.push({ name: 'signup' })
    } else {
      router.push({ name: 'index' })
    }

    loading.value = false

  } catch (e: any) {
    loading.value = false
    FailAlert(e.message)
  }

}
</script>

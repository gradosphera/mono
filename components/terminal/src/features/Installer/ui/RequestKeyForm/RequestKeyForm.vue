<template lang="pug">
form(@submit.prevent="submit").full-width
  q-input(
    v-model="email"
    label="Введите электронную почту"
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
  import { useInstallCooperativeStore } from 'src/entities/Installer/model';
  import { useCurrentUserStore } from 'src/entities/User';
  import { useLoginUser } from 'src/features/Registrator/LoginUser';
  import { FailAlert } from 'src/shared/api';
  import { COOPNAME } from 'src/shared/config';
  import { useGlobalStore } from 'src/shared/store';
  import { ref } from 'vue';

  const email = ref('')
  const privateKey = ref('')
  const loading = ref(false)
  const currentUser = useCurrentUserStore()
  const globalStore = useGlobalStore()

  const submit = async () => {
    loading.value = true
    try {
      const { login } = useLoginUser()
      await login(email.value, privateKey.value)
      await currentUser.loadProfile(globalStore.username, COOPNAME)

      loading.value = false

    } catch (e: any) {
      loading.value = false
      FailAlert(e.message)
    }

  }
  </script>

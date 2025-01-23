<template lang="pug">
form(@submit.prevent="submit").full-width
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
  import { FailAlert, isValidWif } from 'src/shared/api';
  import { ref } from 'vue';
  import { useSystemStore } from 'src/entities/System/model';
  const { info } = useSystemStore()


  const privateKey = ref('')
  const loading = ref(false)

  const installStore = useInstallCooperativeStore()

  const submit = async () => {
    loading.value = true
    try {
      const isValid = await isValidWif(info.coopname, privateKey.value, 'active')

      if (!isValid) {
        loading.value = false
        FailAlert('Неверный ключ доступа')
        return
      }

      installStore.wif = privateKey.value

      loading.value = false

    } catch (e: any) {
      loading.value = false
      FailAlert(e.message)
    }

  }
  </script>

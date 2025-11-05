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
  import { FailAlert } from 'src/shared/api';
  import { ref } from 'vue';
  import { useInstallCooperative } from '../../model';
  import { useSystemStore } from 'src/entities/System/model';

  const privateKey = ref('')
  const loading = ref(false)

  const installStore = useInstallCooperativeStore()
  const systemStore = useSystemStore()
  const { startInstall } = useInstallCooperative()

  const submit = async () => {
    loading.value = true
    try {
      await startInstall(privateKey.value)
      installStore.wif = privateKey.value

      // Обновляем информацию о системе после установки ключа
      await systemStore.loadSystemInfo()

      // Всегда переходим к шагу init - там логика определит, показывать readonly или форму редактирования
      installStore.current_step = 'init'

      loading.value = false

    } catch (e: any) {
      loading.value = false
      FailAlert(e.message || 'Ошибка установки ключа')
    }

  }
  </script>

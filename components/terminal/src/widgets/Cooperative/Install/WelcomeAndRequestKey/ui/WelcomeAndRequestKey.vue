<template lang="pug">
div
  p.text-h6.full-width.text-center Установка
  div.q-mt-md
    div(v-if="!isEntered")
      span Установщик настроит параметры работы Вашего Цифрового Кооператива. Для продолжения введите ключ Кооператива, который был выдан Вам при подключении:
      RequestKeyForm
    div(v-else)
      span Добавьте персональные данные председателя и членов совета для завершения установки.
      SetSovietForm.q-mt-lg
</template>
<script setup lang="ts">
import { useCurrentUserStore } from 'src/entities/User';
import { RequestKeyForm } from 'src/features/Installer';
import { SetSovietForm } from 'src/features/Installer';

import { computed } from 'vue';

const currentUser = useCurrentUserStore()

const isEntered = computed(() => currentUser?.userAccount?.username)

</script>

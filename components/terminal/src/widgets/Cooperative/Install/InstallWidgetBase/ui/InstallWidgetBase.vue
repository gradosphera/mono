<template lang="pug">
div
  q-card(flat bordered).q-pa-md.q-mb-lg
    div(v-if="!installStore.is_finish")
      p.text-h6.full-width.text-center Установка
      div.q-mt-md
        div(v-if="!isEntered")
          span Для начала установки введите ключ аккаунта Кооператива, который был выдан Вам при регистрации:
          RequestKeyForm.q-mt-md
        div(v-else)
          span Добавьте персональные данные председателя и членов совета для завершения установки.
          SetSovietForm.q-mt-md
    div(v-else)
      p.text-h6.full-width.text-center Установка завершена
      p Установка завершена успешно. Всем членам совета отправлены приглашения на электронные почты со ссылками для генерации цифровой подписи. Перейдите по ссылке из письма, получите ключ, и используйте его для входа. Эту страницу можно закрыть.


</template>
<script setup lang="ts">
import { useInstallCooperativeStore } from 'src/entities/Installer/model';
import { RequestKeyForm } from 'src/features/Installer';
import { SetSovietForm } from 'src/features/Installer';

import { computed } from 'vue';

const installStore = useInstallCooperativeStore()

const isEntered = computed(() => installStore.wif)
</script>

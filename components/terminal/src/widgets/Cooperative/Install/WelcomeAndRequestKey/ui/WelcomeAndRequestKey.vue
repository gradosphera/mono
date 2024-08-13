<template lang="pug">
div
  p.text-h6.full-width.text-center Установка
  div.q-mt-md
    span Установщик настроит параметры работы Вашего Цифрового Кооператива. Для продолжения введите ключ Кооператива, который был выдан Вам при подключении:
    q-input(filled label="Ключ Кооператива" v-model="wif" type="password" autocomplete="off").q-mt-md
  SetInstallKeyButton

</template>
<script setup lang="ts">

import { useInstallCooperativeStore } from 'src/entities/Installer/model';
import { SetInstallKeyButton } from 'src/features/Install';

import { ref, watch } from 'vue';

const wif = ref('')

const install = useInstallCooperativeStore()
watch(wif, (newValue: string) => install.data.wif = newValue)

install.data.wif = ''

</script>

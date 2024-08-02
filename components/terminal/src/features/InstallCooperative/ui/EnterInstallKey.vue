<template lang="pug">
div
  p Введите приватный ключ кооператива, выданный при регистрации в ПК ВОСХОД.
  q-input(label="Приватный ключ кооператива" v-model="key")

</template>
<script lang="ts" setup>
import { useInstallCooperative } from 'src/features/InstallCooperative/model';
import { ref } from 'vue';
const key = ref('')

// const {authorizeKey} = useInstallCooperative()


</script>

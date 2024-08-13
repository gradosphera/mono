<template lang="pug">
q-btn(@click="next" color="primary" :disabled="!wif").q-mt-md продолжить
</template>
<script lang="ts" setup>

import { useInstallCooperativeStore } from 'src/entities/Installer/model';
import { computed } from 'vue';
const install = useInstallCooperativeStore()

const wif = computed(() => install.data.wif)

const next = () => {
  console.log('on next feature')
}

</script>

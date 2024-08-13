<template lang="pug">
div
  q-card().q-pa-md
    WelcomeAndRequestKeyOnInstallWidget

</template>
<script lang="ts" setup>

import { useInstallCooperativeStore } from 'src/entities/Installer/model';
import { WelcomeAndRequestKeyOnInstallWidget } from '../../WelcomeAndRequestKey';
const install = useInstallCooperativeStore()


</script>

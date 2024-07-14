<template lang="pug">
.row.justify-center.q-mt-lg.q-pa-sm
  .col-md-6.col-sm-8.col-xs-12
    SignUp(v-if="!registeredAndloggedIn").q-pt-lg
    AlreadyRegistered(v-else).q-pt-lg
</template>
<script lang="ts" setup>
import { useSessionStore } from 'src/entities/Session';
import { useCurrentUserStore } from 'src/entities/User';
import { SignUp } from 'src/widgets/Auth/SignUp'
import { computed } from 'vue'
import { AlreadyRegistered } from 'src/widgets/Auth/AlreadyRegistered'
import { createUserStore as store } from 'src/features/User/CreateUser'

const registeredAndloggedIn = computed(() => {
  return useCurrentUserStore().isRegistrationComplete && useSessionStore().isAuth && store.step == 1
})
</script>

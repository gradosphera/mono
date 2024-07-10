<template lang="pug">
.row.justify-center
  .col-md-4.col-sm-6.col-xs-12
    SignIn(v-if="!registeredAndloggedIn").q-mt-lg
    AlreadyRegistered(v-else).q-mt-lg
</template>
<script lang="ts" setup>
import { useSessionStore } from 'src/entities/Session';
import { useCurrentUserStore } from 'src/entities/User';
import { SignIn } from 'src/widgets/Auth/SignIn'
import { computed } from 'vue'
import { AlreadyRegistered } from 'src/widgets/Auth/AlreadyRegistered'
import { createUserStore as store } from 'src/features/User/CreateUser'

const registeredAndloggedIn = computed(() => {
  return useCurrentUserStore().isRegistrationComplete && useSessionStore().isAuth && store.step == 1
})
</script>

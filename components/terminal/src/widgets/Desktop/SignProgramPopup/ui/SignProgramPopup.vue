<template lang="pug">
div
  p has_requirements {{ required }}
  p programs {{ coop_programs }}
  p user_programs {{ user_programs }}


</template>

<script lang="ts" setup>
import { useCooperativeStore } from 'src/entities/Cooperative';
import { useSessionStore } from 'src/entities/Session';
import { useWalletStore } from 'src/entities/Wallet';
import { COOPNAME } from 'src/shared/config';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute()
const session = useSessionStore()
const wallet = useWalletStore()
const coop = useCooperativeStore()

const required = computed(() => (route.meta?.programs))
const coop_programs = computed(() => coop.programs)
const user_programs = computed(() => wallet.program_wallets)

const loadCoopPrograms = async () => {
  await coop.loadPrograms({
    coopname: COOPNAME
  })
}

const loadUserPrograms = async () => {

  if (session.username)
    wallet.loadUserWalet({
      coopname: COOPNAME,
      username: session.username
    })


}

loadCoopPrograms()
loadUserPrograms()


</script>

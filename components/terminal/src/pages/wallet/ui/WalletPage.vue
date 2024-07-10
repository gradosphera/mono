<template lang="pug">
div(v-if="hasAuth").padding-top
  div.row.justify-center
    div(style="z-index: 2;").col-lg-4.col-md-6.col-sm-8.col-xs-12.q-pl-sm.q-pr-sm
      PersonalCard(:username="username")

      q-btn(v-if="!showWallet" size="sm" color="grey" flat @click="showWallet = !showWallet")
        q-icon(name="fas fa-chevron-circle-down")
        span.q-ml-xs кошелёк

  div.row.justify-center
    div(style="z-index: 1;").col-lg-4.col-md-6.col-sm-8.col-xs-12.q-pl-sm.q-pr-sm
      transition(
        enter-active-class="animate__animated animate__fadeInDown"
        leave-active-class="animate__animated animate__fadeOutUp"
      )


        q-card(v-if="showWallet")
          WalletCard(:username="username")


      q-btn(v-if="showWallet" size="sm" color="grey" flat @click="showWallet = !showWallet")
        q-icon(name="fas fa-chevron-circle-up")
        span.q-ml-xs кошелёк

</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { PersonalCard } from 'src/widgets/PersonalCard/ui'
import { WalletCard } from 'src/widgets/Wallet/WalletCard'
import { useSessionStore } from 'src/entities/Session'
const showWallet = ref(true)

const session = useSessionStore()
const username = computed(() => session.username)
const hasAuth = computed(() => session.isAuth)

</script>


<style>
.inputclass .q-field__label {
  font-size: 10px;
}

.inputclass {
  color: white;
  font-size: 10px;
}

.sign {
  font-size: 10px;
  color: white;
}

.inputclass .q-field__append {
  align-items: stretch;
}

.slide-down-enter-active,
.slide-up-leave-active {
  transition: transform 0.5s;
}

.slide-down-enter,
.slide-up-leave-to {
  transform: translateY(-100%);
}
</style>

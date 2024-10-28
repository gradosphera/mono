<template lang="pug">
div.row
  div.col-md-12.col-xs-12
    q-btn-toggle(
      v-if="isChairman"
      size="sm"
      v-model="settingsType"
      spread
      toggle-color="teal"
      color="white"
      text-color="black"
      :options="[{label: 'Пользователь', value: 'user'}, {label: 'Кооператив', value: 'cooperative'}]"
    ).full-width

    div(v-if="settingsType == 'user'").q-pa-md
      PaymentMethodsCard(:username="session.username").q-pb-lg
      LogoutCard.q-pb-lg

    div(v-else).q-pa-md
      ChangeCooperativeFunds(v-if="isChairman").q-pb-lg

      ChangeCooperativeContributions(v-if="isChairman").q-pb-lg

      ChangeCooperativeContacts(v-if="isChairman").q-pb-lg


    //- ExitCard.q-mt-lg

</template>
<script lang="ts" setup>
import { LogoutCard } from 'src/widgets/User/LogoutCard';
import { ChangeCooperativeContacts } from 'src/widgets/Cooperative/Contacts';
import { PaymentMethodsCard } from 'src/widgets/User/PaymentMethods';
import { useSessionStore } from 'src/entities/Session';
import { ChangeCooperativeContributions } from 'src/widgets/Cooperative/Contributions';
import { ChangeCooperativeFunds } from 'src/widgets/Cooperative/Funds';
import { useCurrentUserStore } from 'src/entities/User';
import { computed, ref } from 'vue';

const session = useSessionStore()
const currentUser = useCurrentUserStore()
const isMember = computed(() => currentUser.userAccount?.role === 'member')
const isChairman = computed(() => currentUser.userAccount?.role === 'chairman')

const settingsType = ref('user')
// import { ExitCard } from 'src/widgets/Cooperative/Participants/ExitCard';
</script>

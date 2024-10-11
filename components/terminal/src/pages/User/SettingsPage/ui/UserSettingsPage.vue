<template lang="pug">
div.row
  div.col-md-12.col-xs-12
    PaymentMethodsCard(:username="session.username")
    hr
    ChangeCooperativeFunds(v-if="isChairman")
    hr
    ChangeCooperativeContributions(v-if="isChairman")
    hr
    ChangeCooperativeContacts(v-if="isChairman")
    hr
    LogoutCard
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
import { computed } from 'vue';

const session = useSessionStore()
const currentUser = useCurrentUserStore()
const isMember = computed(() => currentUser.userAccount?.role === 'member')
const isChairman = computed(() => currentUser.userAccount?.role === 'chairman')

// import { ExitCard } from 'src/widgets/Cooperative/Participants/ExitCard';
</script>

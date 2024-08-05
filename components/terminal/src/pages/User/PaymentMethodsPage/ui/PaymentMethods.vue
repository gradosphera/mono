<template lang="pug">
PaymentMethodsCard(:username="username")

</template>
<script lang="ts" setup>
import { PaymentMethodsCard } from 'src/widgets/User/PaymentMethods';

import { computed } from 'vue';
import { useCurrentUserStore } from 'src/entities/User';

const currentUser = useCurrentUserStore()

const username = computed(() => currentUser.username)

</script>

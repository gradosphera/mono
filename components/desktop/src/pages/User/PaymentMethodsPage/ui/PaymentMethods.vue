<template lang="pug">
PaymentMethodsCard(:username='username')
</template>
<script lang="ts" setup>
import { PaymentMethodsCard } from 'src/widgets/User/PaymentMethods';

import { computed } from 'vue';
import { useCurrentUser } from 'src/entities/Session';

const currentUser = useCurrentUser();

const username = computed(() => currentUser.username);
</script>

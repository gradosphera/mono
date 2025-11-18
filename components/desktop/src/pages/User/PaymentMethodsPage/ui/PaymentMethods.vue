<template lang="pug">
PaymentMethodsCard(:username='username')
</template>

<script lang="ts" setup>
import { PaymentMethodsCard } from 'src/widgets/User/PaymentMethods';
import { AddPaymentButton } from 'src/features/PaymentMethod/AddPaymentMethod';
import { computed, onMounted } from 'vue';
import { useSessionStore } from 'src/entities/Session';
import { useHeaderActions } from 'src/shared/hooks';

const session = useSessionStore();
const username = computed(() => session.username);

// Инжектим кнопку добавления реквизитов в заголовок
const { registerAction } = useHeaderActions();

onMounted(() => {
  registerAction({
    id: 'add-payment-method',
    component: AddPaymentButton,
    props: {
      username: username.value,
    },
    order: 1,
  });
});
</script>

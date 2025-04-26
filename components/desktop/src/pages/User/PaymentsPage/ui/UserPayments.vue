<template lang="pug">
ListOfPaymentsWidget(:username="username" :hideActions="true")
</template>

<script lang="ts" setup>
import { ListOfPaymentsWidget } from 'src/widgets/Cooperative/Payments';
import { useSessionStore } from 'src/entities/Session';

const session = useSessionStore();
const username = session.username;
</script>

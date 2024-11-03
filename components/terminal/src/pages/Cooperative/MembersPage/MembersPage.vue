<template lang="pug">
div
  div.q-pa-md
    p(style="max-width: 500px;") Члены совета принимают участие в голосованиях по повестке кооператива. Добавление в совет временно осуществляется по идентификатору аккаунта, который можно найти в разделе "Пайщики".
  CooperativeMembers
</template>
<script lang="ts" setup>
import { CooperativeMembers } from 'src/widgets/Cooperative/Members';

</script>

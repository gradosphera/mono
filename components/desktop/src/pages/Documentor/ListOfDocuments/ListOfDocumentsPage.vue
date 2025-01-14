<template lang="pug">
ListOfDocumentsWidget(:showFilter="true" :filter="{receiver: coopname}")
</template>
<script setup lang="ts">
import { ListOfDocumentsWidget } from 'src/widgets/Cooperative/Documents/ListOfDocuments';
import { COOPNAME } from 'src/shared/config';
import { computed } from 'vue';

const coopname = computed(() => COOPNAME)
</script>

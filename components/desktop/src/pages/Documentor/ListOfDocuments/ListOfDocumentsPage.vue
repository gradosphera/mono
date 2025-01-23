<template lang="pug">
ListOfDocumentsWidget(:showFilter="true" :filter="{receiver: coopname}")
</template>
<script setup lang="ts">
import { ListOfDocumentsWidget } from 'src/widgets/Cooperative/Documents/ListOfDocuments';
import { useSystemStore } from 'src/entities/System/model';
const { info } = useSystemStore()

import { computed } from 'vue';

const coopname = computed(() => info.coopname)
</script>

<template lang="pug">
div.row
  div(v-for="extension in extStore.extensions" v-bind:key="extension.name").col-md-3.col-sm-6.col-xs-12
    ExtensionCard(:extension="extension")

</template>
<script lang="ts" setup>
import { useExtensionStore } from 'src/entities/Extension/model';
import { onMounted } from 'vue';
import { ExtensionCard } from 'src/widgets/ExtensionCard';

const extStore = useExtensionStore()

onMounted(async () => {
  extStore.loadExtensions()
})

</script>

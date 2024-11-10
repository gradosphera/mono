<template lang="pug">
div all apps
</template>
<script lang="ts" setup>
import { getExtensions } from '@coopenomics/coopjs/selectors/getExtensions';
import { client } from 'src/shared/api/client';
import { onMounted } from 'vue';

onMounted(async () => {
  const { getExtensions: data } = await client.Query({getExtensions})
  console.log(data)
})

</script>

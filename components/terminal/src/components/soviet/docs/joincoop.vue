<template lang="pug">
.row.justify-center
  div.col-md-8.col-xs-12
    doc(:doc="complexDocument.statement.document" :action="complexDocument.statement.action" style="margin-bottom: 50px;")
    doc(v-if="complexDocument.decision.document" :doc="complexDocument.decision.document" :action="complexDocument.decision.action")

</template>

<script setup lang="ts">
import { computed } from 'vue'
import doc from './../doc.vue'
import { Cooperative } from 'cooptypes'

const props = defineProps({
  documents: {
    type: Object as () => Cooperative.Documents.IComplexDocument,
    required: true
  },
})

const complexDocument = computed(() => props.documents)

</script>

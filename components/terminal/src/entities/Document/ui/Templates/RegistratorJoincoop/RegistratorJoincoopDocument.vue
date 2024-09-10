<template lang="pug">
.row.justify-center
  div.documents-gap.col-md-8.col-xs-12
    BaseDocument(:doc="complexDocument.statement.document" :action="complexDocument.statement.action")
    BaseDocument(v-if="complexDocument.decision.document" :doc="complexDocument.decision.document" :action="complexDocument.decision.action")

    BaseDocument(:doc="complexDocument.links[0]" :action="complexDocument.statement.action")

    //- p links {{complexDocument.links}}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseDocument } from '../../BaseDocument';
import { Cooperative } from 'cooptypes'

const props = defineProps({
  documents: {
    type: Object as () => Cooperative.Document.IComplexDocument,
    required: true
  },
})

const complexDocument = computed(() => props.documents)

</script>
